import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import SubCard from 'ui-component/cards/SubCard';
import '../usage.scss';
import ReactApexChart from 'react-apexcharts';
import dayjs from 'dayjs';

const DataDeviceSection = ({ dataTraffic, dataDevice }) => {
  // Function to generate daily data points for multiple months
  const generateDailyData = (data) => {
    if (data.length === 0) return [];

    const result = [];

    data.forEach((monthData, index) => {
      const currentDate = dayjs(monthData.month, 'YYYY/MM/DD');
      const daysInMonth = currentDate.daysInMonth();

      // If it's not the last month in the array, generate points until the start of next month
      const nextMonth = index < data.length - 1 ? dayjs(data[index + 1].month, 'YYYY/MM/DD') : currentDate.add(1, 'month');

      // Generate daily points for current month
      for (let i = 0; i < daysInMonth; i++) {
        const pointDate = currentDate.add(i, 'day');
        // Only add points up to the start of next month
        if (pointDate.isBefore(nextMonth)) {
          result.push({
            x: pointDate.valueOf(),
            y: monthData.data
          });
        }
      }
    });

    return result;
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
      </SubCard>
    </Grid>
  );
};

export default DataDeviceSection;
