import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosNgasal from 'api/axiosNgasal';
// material-ui
// import { useTheme } from '@mui/material/styles';
import { Button, CardActions, CardContent, Divider, Grid, Typography } from '@mui/material';

// project imports
// import BajajAreaChartCard from './BajajAreaChartCard';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';

// assets
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
// import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
// import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
// import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

// ==============================|| DASHBOARD DEFAULT - POPULAR CARD ||============================== //

const PopularCard = ({ isLoading }) => {
  // const theme = useTheme();

  // const [anchorEl, setAnchorEl] = useState(null);

  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  const [top5Results, setTop5Results] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosNgasal.get(`/ngasal/report/monthly/08/2023/darat/raw/`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Parse the bandwidth values and filter the data
        const data = response.data;
        const filteredData = data
          .map((item) => ({
            ...item,
            bandwidthValue: parseFloat(item.bandwidth.replace(/[^\d.]/g, '')) // Convert bandwidth to a numerical value
          }))
          .filter((item) => {
            const bandwidthValue = item.bandwidthValue;
            return bandwidthValue > 1 && bandwidthValue > 0.01; // Filter out invalid values
          })
          .sort((a, b) => {
            // Custom sorting function based on the presence of "T," "G," and "M" in bandwidth values
            const bandwidthA = a.bandwidth;
            const bandwidthB = b.bandwidth;

            if (bandwidthA.includes('T') && !bandwidthB.includes('T')) {
              return -1; // "T" comes before anything else
            } else if (!bandwidthA.includes('T') && bandwidthB.includes('T')) {
              return 1; // "T" comes before anything else
            } else if (bandwidthA.includes('G') && !bandwidthB.includes('G')) {
              return -1; // "G" comes before anything else except "T"
            } else if (!bandwidthA.includes('G') && bandwidthB.includes('G')) {
              return 1; // "G" comes before anything else except "T"
            } else if (bandwidthA.includes('M') && !bandwidthB.includes('M')) {
              return -1; // "M" comes before anything else except "T" and "G"
            } else if (!bandwidthA.includes('M') && bandwidthB.includes('M')) {
              return 1; // "M" comes before anything else except "T" and "G"
            } else {
              // If none of the conditions apply, compare numerical values
              return b.bandwidthValue - a.bandwidthValue; // Sort in descending order of bandwidthValue
            }
          });

        // Extract "TCF-" and 5 digits from the site property
        const extractedData = filteredData.map((item) => {
          const matchResult = item.site.match(/TCF-\d{5}/);
          return {
            ...item,
            site: matchResult ? matchResult[0] : item.site // Use the match result if available, otherwise use the original site value
          };
        });

        // Display the top 5 results
        const top5Results = extractedData.slice(0, 7);
        // console.log(top5Results);
        setTop5Results(top5Results);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Grid container spacing={gridSpacing}>
              <Grid item xs={12}>
                <Grid container alignContent="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h4">Most BW Usage</Typography>
                  </Grid>
                </Grid>
              </Grid>
              {/* <Grid item xs={12} sx={{ pt: '16px !important' }}>
                <BajajAreaChartCard />
              </Grid> */}
              <Grid item xs={12}>
                <Grid container direction="column">
                  {top5Results.map((result, index) => (
                    <Grid item key={index}>
                      <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item>
                          <Typography variant="subtitle1" color="inherit">
                            Site : {result.site}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                              <Typography variant="subtitle1" color="inherit">
                                Bandwidth : {result.bandwidth}
                              </Typography>
                            </Grid>
                            {/* <Grid item>
                              <Avatar
                                variant="rounded"
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '5px',
                                  backgroundColor: theme.palette.success.light,
                                  color: theme.palette.success.dark,
                                  ml: 2
                                }}
                              >
                                <KeyboardArrowUpOutlinedIcon fontSize="small" color="inherit" />
                              </Avatar>
                            </Grid> */}
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <Typography variant="subtitle2" sx={{ color: 'success.dark' }}>
                          {result.device} Device
                        </Typography>
                      </Grid>
                      <Divider sx={{ my: 1.5 }} />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ p: 1.25, pt: 0, justifyContent: 'center' }}>
            <Link to="/jakwifi/allusage/darat" style={{ textDecoration: 'none' }}>
              <Button size="small" disableElevation>
                View All
                <ChevronRightOutlinedIcon />
              </Button>
            </Link>
          </CardActions>
        </MainCard>
      )}
    </>
  );
};

PopularCard.propTypes = {
  isLoading: PropTypes.bool
};

export default PopularCard;
