import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Avatar, Box, Button, Grid, Typography } from '@mui/material';

// third-party
import Chart from 'react-apexcharts';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonTotalOrderCard from 'ui-component/cards/Skeleton/EarningCard';

import ChartDataMonth from './chart-data/total-order-month-line-chart';
import ChartDataYear from './chart-data/total-order-year-line-chart';
import axiosNgasal from 'api/axiosNgasal';
// assets
import DataUsageTwoToneIcon from '@mui/icons-material/DataUsageTwoTone';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: '#fff',
  overflow: 'hidden',
  position: 'relative',
  '&>div': {
    position: 'relative',
    zIndex: 5
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.primary[800],
    borderRadius: '50%',
    zIndex: 1,
    top: -85,
    right: -95,
    [theme.breakpoints.down('sm')]: {
      top: -105,
      right: -140
    }
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    zIndex: 1,
    width: 210,
    height: 210,
    background: theme.palette.primary[800],
    borderRadius: '50%',
    top: -125,
    right: -15,
    opacity: 0.5,
    [theme.breakpoints.down('sm')]: {
      top: -155,
      right: -70
    }
  }
}));

// ==============================|| DASHBOARD - TOTAL ORDER LINE CHART CARD ||============================== //

const TotalOrderLineChartCard = ({ isLoading }) => {
  const theme = useTheme();
  const [dataMonth, setDataMonth] = useState(null);
  const [dataYear, setDataYear] = useState(null);
  const [timeValue, setTimeValue] = useState(false);
  const handleChangeTime = (event, newValue) => {
    setTimeValue(newValue);
  };

  const formatBandwidth = (value) => {
    const units = ['T', 'P', 'E'];
    let formattedValue = value;
    let unitIndex = 0;

    while (formattedValue >= 1024 && unitIndex < units.length) {
      formattedValue /= 1024;
      unitIndex++;
    }

    return Math.floor(formattedValue) + ' ' + units[unitIndex];
  };

  const convertBandwidthToNumber = (bandwidth) => {
    const [value, unit] = bandwidth.split(' ');
    if (unit === 'G') {
      return parseFloat(value);
    } else if (unit === 'T') {
      return parseFloat(value) * 1024;
    }
    return 0;
  };

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const endpoint = `/ngasal/report/monthly/${currentMonth}/${currentYear}/darat/raw/`;

    const fetchData = async () => {
      try {
        const response = await axiosNgasal.get(endpoint, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const totalBandwidth = response.data.reduce((total, item) => total + convertBandwidthToNumber(item.bandwidth), 0);
        // console.log(formatBandwidth(totalBandwidth));
        setDataMonth(formatBandwidth(totalBandwidth));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchDataForMonthYear = async (month, year) => {
      const endpoint = `/ngasal/report/monthly/${month}/${year}/darat/raw/`;

      try {
        const response = await axiosNgasal.get(endpoint, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const totalBandwidth = response.data.reduce((total, item) => total + convertBandwidthToNumber(item.bandwidth), 0);
        return totalBandwidth;
      } catch (error) {
        console.error(`Error fetching data for ${year}-${month}:`, error);
        return 0;
      }
    };

    const fetchDataForLast12Months = async () => {
      const currentDate = new Date();
      let currentMonth = currentDate.getMonth() + 1;
      let currentYear = currentDate.getFullYear();

      const totalBandwidths = [];
      for (let i = 0; i < 12; i++) {
        if (currentMonth === 0) {
          currentMonth = 12;
          currentYear--;
        }

        const totalBandwidth = await fetchDataForMonthYear(currentMonth, currentYear);
        totalBandwidths.push(totalBandwidth);

        // console.log(`${getMonthName(currentMonth)} ${currentYear}`);

        currentMonth--;
      }

      const grandTotalBandwidth = totalBandwidths.reduce((total, bandwidth) => total + bandwidth, 0);
      // console.log(`Total bandwidth for the last 12 months: ${formatBandwidth(grandTotalBandwidth)}`);
      setDataYear(`${formatBandwidth(grandTotalBandwidth)}`);
    };

    fetchDataForLast12Months();
  }, []);

  // Helper function to get month name
  // const getMonthName = (month) => {
  //   const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  //   return monthNames[month - 1];
  // };

  return (
    <>
      {isLoading ? (
        <SkeletonTotalOrderCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box sx={{ p: 2.25 }}>
            <Grid container direction="column">
              <Grid item>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Link to="/jakwifi/allusage" style={{ textDecoration: 'none' }}>
                      <Avatar
                        variant="rounded"
                        sx={{
                          ...theme.typography.commonAvatar,
                          ...theme.typography.largeAvatar,
                          backgroundColor: theme.palette.primary[800],
                          color: '#fff',
                          mt: 1
                        }}
                      >
                        <DataUsageTwoToneIcon fontSize="inherit" />
                      </Avatar>
                    </Link>
                  </Grid>
                  <Grid item>
                    <Button
                      disableElevation
                      variant={timeValue ? 'contained' : 'text'}
                      size="small"
                      sx={{ color: 'inherit' }}
                      onClick={(e) => handleChangeTime(e, true)}
                    >
                      Year
                    </Button>
                    <Button
                      disableElevation
                      variant={!timeValue ? 'contained' : 'text'}
                      size="small"
                      sx={{ color: 'inherit' }}
                      onClick={(e) => handleChangeTime(e, false)}
                    >
                      Month
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sx={{ mb: 0.75 }}>
                <Grid container alignItems="center">
                  <Grid item xs={6}>
                    <Grid container alignItems="center">
                      <Grid item>
                        {timeValue ? (
                          <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>{dataYear}</Typography>
                        ) : (
                          <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>{dataMonth}</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Typography
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: theme.palette.primary[200]
                          }}
                        >
                          Total BW Usage
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    {timeValue ? <Chart {...ChartDataMonth} /> : <Chart {...ChartDataYear} />}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

TotalOrderLineChartCard.propTypes = {
  isLoading: PropTypes.bool
};

export default TotalOrderLineChartCard;
