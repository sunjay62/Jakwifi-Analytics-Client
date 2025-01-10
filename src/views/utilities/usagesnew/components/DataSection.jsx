import React, { useState } from 'react';
import { Avatar, Menu, MenuItem, Grid } from '@mui/material';
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

const DataSection = ({ dataTraffic, siteName, selectedRange, selectedSite }) => {
  const theme = useTheme();
  const [anchorElTraffic, setAnchorElTraffic] = useState(null);

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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'BW Usage');
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
        name: 'BW Usage',
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
        text: 'Bandwidth Usage'
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
              <h3>BW Usage</h3>
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
          </SubCard>
        </Grid>
      </Grid>
    </div>
  );
};

export default DataSection;
