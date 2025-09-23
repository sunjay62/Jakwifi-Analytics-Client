import React, { useEffect, useState } from 'react';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip } from '@mui/material';
import SubCard from 'ui-component/cards/SubCard';
import '../usage.scss';
import ReactApexChart from 'react-apexcharts';
import dayjs from 'dayjs';

const DataDeviceSection = ({ dataTraffic, dataDevice, dataMonthly }) => {
  console.log('DataDeviceSection - dataMonthly:', dataMonthly);

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
        // Last month - only generate for days within this month
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

  const [chartOptions, setChartOptions] = useState({
    series: [
      {
        name: 'BW Usage',
        data: generateDailyData(dataTraffic)
      },
      {
        name: 'Device',
        data: generateDailyData(dataDevice)
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
    yaxis: [
      {
        title: {
          text: 'BW Usage (GB/TB)'
        },
        forceNiceScale: true,
        labels: {
          formatter: function (value) {
            return parseInt(value);
          }
        }
      },
      {
        opposite: true,
        title: {
          text: 'Devices'
        },
        forceNiceScale: true,
        labels: {
          formatter: function (value) {
            return parseInt(value);
          }
        }
      }
    ],
    tooltip: {
      x: {
        format: 'dd/MM/yyyy',
        formatter: function (value) {
          return dayjs(value).format('DD/MM/YYYY');
        }
      },
      shared: true,
      y: {
        formatter: function (value, { seriesIndex }) {
          if (seriesIndex === 0) {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(2)} TB`;
            } else {
              return `${value.toFixed(2)} GB`;
            }
          } else {
            return `${value} Device`;
          }
        }
      }
    }
  });

  useEffect(() => {
    setChartOptions((prevOptions) => ({
      ...prevOptions,
      series: [
        {
          name: 'BW Usage',
          data: generateDailyData(dataTraffic)
        },
        {
          name: 'Device',
          data: generateDailyData(dataDevice)
        }
      ]
    }));
  }, [dataTraffic, dataDevice]);

  return (
    <Grid item xs={12}>
      <SubCard title="BW Usage & Devices Connected">
        <ReactApexChart options={chartOptions} series={chartOptions.series} type="area" height={350} />

        {/* Summary Statistics */}
        {dataMonthly && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Summary Statistics
            </Typography>

            {/* Total Statistics Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {dataMonthly.total_device?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Total Devices
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h4" color="secondary" sx={{ fontWeight: 'bold' }}>
                    {formatUsage(dataMonthly.total_usage_gb || 0)}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Total Usage
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Monthly Data Table */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Monthly Breakdown
            </Typography>

            <TableContainer component={Paper} elevation={2}>
              <Table sx={{ minWidth: 400 }} aria-label="monthly data table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Month</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      Devices
                    </TableCell>
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
                        {monthData.device?.toLocaleString() || 0}
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
                      {dataMonthly.total_device?.toLocaleString() || 0}
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
  );
};

export default DataDeviceSection;
