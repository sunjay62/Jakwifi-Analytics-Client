import React, { useState } from 'react';
import {
  Avatar,
  Menu,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';
import html2canvas from 'html2canvas';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';
import { toast } from 'react-toastify';
import GetAppTwoToneIcon from '@mui/icons-material/GetAppOutlined';
import ArchiveTwoToneIcon from '@mui/icons-material/ArchiveOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import '../usage.scss';
import ReactApexChart from 'react-apexcharts';
import XLSX from 'xlsx';
import dayjs from 'dayjs';
import axiosNew from 'api/axiosNew';
import { useTheme } from '@mui/material/styles';

const DataSection = ({ dataTraffic, siteName, selectedRange, selectedSite, dataMonthly }) => {
  const theme = useTheme();
  const [anchorElTraffic, setAnchorElTraffic] = useState(null);

  // Function to generate daily data points for multiple months
  const generateDailyData = (data) => {
    if (data.length === 0) return [];

    const result = [];

    data.forEach((monthData, index) => {
      const currentDate = dayjs(monthData.month, 'YYYY/MM/DD');
      const daysInMonth = currentDate.daysInMonth();

      // Original logic with adding 1 month (commented out)
      // const nextMonth = index < data.length - 1 ? dayjs(data[index + 1].month, 'YYYY/MM/DD') : currentDate.add(1, 'month');

      // New logic: for last month, only generate until end of that month
      if (index < data.length - 1) {
        // Not the last month - generate until next month starts
        const nextMonth = dayjs(data[index + 1].month, 'YYYY/MM/DD');
        for (let i = 0; i < daysInMonth; i++) {
          const pointDate = currentDate.add(i, 'day');
          if (pointDate.isBefore(nextMonth)) {
            result.push({
              x: pointDate.valueOf(),
              y: monthData.data
            });
          }
        }
      } else {
        // Last month - only generate for days within this month (i starts from 0, so i < daysInMonth is correct)
        for (let i = 0; i < daysInMonth; i++) {
          const pointDate = currentDate.add(i, 'day');
          // Double check: make sure the point is still in the same month
          if (pointDate.month() === currentDate.month()) {
            result.push({
              x: pointDate.valueOf(),
              y: monthData.data
            });
          }
        }
      }
    });

    return result;
  };

  // Function to format usage display
  const formatUsage = (usageGb) => {
    if (usageGb >= 1000) {
      return `${(usageGb / 1000).toFixed(2)} TB`;
    }
    return `${usageGb.toFixed(2)} GB`;
  };

  // Function to format month display
  const formatMonth = (monthStr) => {
    return dayjs(monthStr, 'YYYY/MM').format('MMMM YYYY');
  };

  const handleClickTraffic = (event) => {
    setAnchorElTraffic(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElTraffic(null);
  };

  const handleDownloadExcelTraffic = async () => {
    const startData = selectedRange[0];
    const endData = selectedRange[1];
    handleClose();
    const requestData = {
      start_data: startData,
      end_data: endData,
      site_id: selectedSite
    };

    try {
      const response = await axiosNew.post('/monthly', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseData = response.data;
      const trafficData = responseData.data.find((item) => item.name === 'BW usage per GB');
      const updatedDataTraffic = trafficData.data.map((item) => ({
        month: item.month,
        data: item.data
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(updatedDataTraffic);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'BW Usage Daily');
      const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${siteName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (response.status === 200) {
        toast.success('Download Successfully!');
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        toast.error('Please Input Site and Date Range!');
      } else {
        console.log(error);
        toast.error('Failed to download, please try again.');
      }
    }
  };

  const downloadChartBW = () => {
    const chartElement = document.getElementById('bwContainer');

    html2canvas(chartElement)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${siteName}.png`;
        link.click();
      })
      .catch((error) => {
        console.log(error);
        toast.error('Failed to download chart, please try again.');
      });
  };

  // Area Chart options
  const areaLineOptions = {
    series: [
      {
        name: 'BW Usage Daily',
        data: generateDailyData(dataTraffic)
      }
    ],
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: true
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      type: 'datetime',
      tickPlacement: 'on',
      labels: {
        datetimeUTC: false,
        format: 'dd/MM/yyyy'
      }
    },
    yaxis: {
      title: {
        text: 'Bandwidth Usage Daily'
      },
      forceNiceScale: true,
      labels: {
        formatter: function (value) {
          if (value >= 1000) {
            return `${(value / 1000).toFixed(2)} TB`;
          } else {
            return `${value.toFixed(2)} GB`;
          }
        }
      }
    },
    tooltip: {
      x: {
        format: 'dd/MM/yyyy',
        formatter: function (value) {
          return dayjs(value).format('DD/MM/YYYY');
        }
      },
      y: {
        formatter: function (value) {
          if (value >= 1000) {
            return `${(value / 1000).toFixed(2)} TB`;
          } else {
            return `${value.toFixed(2)} GB`;
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    }
  };

  return (
    <div>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} id="bwContainer">
          <SubCard>
            <div className="cardHeader">
              <h3>BW Usage Daily</h3>
              <div className="btnMenu">
                <Avatar
                  variant="rounded"
                  aria-controls="menu-traffic-card"
                  aria-haspopup="true"
                  onClick={handleClickTraffic}
                  sx={{
                    ...theme.typography.commonAvatar,
                    ...theme.typography.mediumAvatar,
                    transition: 'all .2s ease-in-out',
                    background: theme.palette.secondary.light,
                    color: theme.palette.secondary.dark,
                    '&:hover': {
                      background: theme.palette.secondary.dark,
                      color: theme.palette.secondary.light
                    }
                  }}
                >
                  <MoreHorizIcon fontSize="inherit" />
                </Avatar>
                <Menu
                  id="menu-traffic-card"
                  anchorEl={anchorElTraffic}
                  keepMounted
                  open={Boolean(anchorElTraffic)}
                  onClose={handleClose}
                  variant="selectedMenu"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                >
                  <MenuItem onClick={downloadChartBW}>
                    <GetAppTwoToneIcon sx={{ mr: 1.75 }} /> Download Chart
                  </MenuItem>
                  <MenuItem onClick={handleDownloadExcelTraffic}>
                    <ArchiveTwoToneIcon sx={{ mr: 1.75 }} /> Download Excel
                  </MenuItem>
                </Menu>
              </div>
            </div>
            <div id="chart-traffic">
              <ReactApexChart options={areaLineOptions} series={areaLineOptions.series} type="area" height={350} />
            </div>

            {/* Usage Statistics Table */}
            {dataMonthly && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Usage Statistics
                </Typography>

                {/* Total Usage Card */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                        {formatUsage(dataMonthly.total_usage_gb || 0)}
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary">
                        Total Bandwidth Usage
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                      <Typography variant="h4" color="secondary" sx={{ fontWeight: 'bold' }}>
                        {dataMonthly.data_per_month?.length || 0}
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary">
                        Months Tracked
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Monthly Usage Breakdown Table */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Monthly Usage Breakdown
                </Typography>

                <TableContainer component={Paper} elevation={2}>
                  <Table sx={{ minWidth: 400 }} aria-label="monthly usage table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Month</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          Usage
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataMonthly.data_per_month?.map((monthData, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { backgroundColor: '#fafafa' }
                          }}
                        >
                          <TableCell component="th" scope="row" sx={{ fontSize: '0.95rem' }}>
                            {formatMonth(monthData.month)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.95rem', fontWeight: '500' }}>
                            {formatUsage(monthData.usage_gb || 0)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={index === dataMonthly.data_per_month.length - 1 ? 'Current' : 'Completed'}
                              color={index === dataMonthly.data_per_month.length - 1 ? 'primary' : 'success'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Total Row */}
                      <TableRow sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          Total
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          {formatUsage(dataMonthly.total_usage_gb || 0)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label="Summary" color="info" size="small" variant="filled" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Site Info */}
                {dataMonthly.site_info && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Site: <strong>{dataMonthly.site_info.name}</strong> (ID: {dataMonthly.site_info.id})
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </SubCard>
        </Grid>
      </Grid>
    </div>
  );
};

export default DataSection;
