import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import { Grid, Typography } from '@mui/material';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { Space, Spin } from 'antd';
import axiosNgasal from 'api/axiosNgasal';

// Chart data

const TotalGrowthBarChart = ({ isLoading }) => {
  const [bwUsageData, setBWUsageData] = useState([]);
  const [dataDevice, setDataDevice] = useState([]);
  const [monthYearData, setMonthYearData] = useState([]);
  const [loading, setLoading] = useState(true);

  const series = [
    {
      name: 'BW Usage ',
      data: bwUsageData
    },
    {
      name: 'Device Connected ',
      data: dataDevice
    }
  ];

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false // Menghilangkan toolbar yang berisi menu download
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: monthYearData
    },
    fill: {
      opacity: 1
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return Math.round(val);
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex }) {
          if (seriesIndex === 0) {
            if (typeof val === 'string' && val.includes('P')) {
              return val;
            }
            return val + ' P';
          } else if (seriesIndex === 1) {
            return val + ' Device';
          }
          return val;
        }
      }
    }
  };

  // Fungsi utilitas untuk mengonversi bandwidth ke bilangan (dalam Gigabyte atau Terabyte)
  const formatBandwidth = (value) => {
    const units = ['T', 'P', 'E'];
    let formattedValue = value;
    let unitIndex = 0;

    while (formattedValue >= 1024 && unitIndex < units.length) {
      formattedValue /= 1024;
      unitIndex++;
    }

    return formattedValue.toFixed(1) + ' ' + units[unitIndex];
  };

  const convertBandwidthToNumber = (bandwidth) => {
    const [value, unit] = bandwidth.split(' ');
    if (unit === 'G') {
      return parseFloat(value);
    } else if (unit === 'T') {
      return parseFloat(value) * 1024; // 1 Terabyte = 1024 Gigabyte
    }
    return 0;
  };

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
      const monthYearStrings = [];

      for (let i = 0; i < 12; i++) {
        if (currentMonth === 0) {
          currentMonth = 12;
          currentYear--;
        }

        const totalBandwidth = await fetchDataForMonthYear(currentMonth, currentYear);
        totalBandwidths.unshift(totalBandwidth);

        // console.log(`${getMonthName(currentMonth)} ${currentYear}`);
        monthYearStrings.unshift(`${getMonthName(currentMonth)} ${currentYear}`);

        currentMonth--;
      }
      setMonthYearData(monthYearStrings);
      const formattedData = totalBandwidths.map((bw) => formatBandwidth(bw));
      setLoading(false);
      setBWUsageData(formattedData);
    };

    fetchDataForLast12Months();
  }, []);

  const getMonthName = (month) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[month - 1];
  };

  useEffect(() => {
    const fetchDataForMonthYear = async (month, year) => {
      const endpoint = `/ngasal/report/monthly/${month}/${year}/darat/raw/`;

      try {
        const response = await axiosNgasal.get(endpoint, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const totalDataDevice = response.data.reduce((total, item) => total + item.device, 0);
        return totalDataDevice;
      } catch (error) {
        console.error(`Error fetching data for ${year}-${month}:`, error);
        return 0;
      }
    };

    // const formatValue = (value) => {
    //   if (value >= 1e9) {
    //     return (value / 1e9).toFixed(3) + ' RB';
    //   } else {
    //     const stringValue = value.toLocaleString('en-US', { minimumFractionDigits: 0 });
    //     const formattedValue = stringValue.slice(0, -3);
    //     return formattedValue;
    //   }
    // };

    const fetchDataForLast12Months = async () => {
      const currentDate = new Date();
      let currentMonth = currentDate.getMonth() + 1;
      let currentYear = currentDate.getFullYear();

      const totalDataDevices = [];
      for (let i = 0; i < 12; i++) {
        if (currentMonth === 0) {
          currentMonth = 12;
          currentYear--;
        }

        const totalDataDevice = await fetchDataForMonthYear(currentMonth, currentYear);
        totalDataDevices.unshift(totalDataDevice);

        // console.log(`${formatValue(totalDataDevice)}`);

        currentMonth--;
      }
      setLoading(false);
      setDataDevice(totalDataDevices);
    };

    fetchDataForLast12Months();
  }, []);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
              <Typography variant="h4">Total BW Usage & Device Connected</Typography>
            </Grid>
            <Grid item xs={12}>
              {loading ? (
                <div className="loadingContainer">
                  <Space
                    direction="vertical"
                    style={{
                      width: '100%',
                      height: '50vh',
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <Spin tip="Loading" size="large">
                      <div className="content" />
                    </Spin>
                  </Space>
                </div>
              ) : (
                <div id="chart">
                  <ReactApexChart options={options} series={series} type="bar" height={520} />
                </div>
              )}
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool
};

export default TotalGrowthBarChart;
