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

const DeviceSection = ({ dataDevice, siteName, selectedRange, selectedSite }) => {
  const theme = useTheme();
  const [anchorElDevice, setAnchorElDevice] = useState(null);

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

  const handleClickDevice = (event) => {
    setAnchorElDevice(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElDevice(null);
  };

  const handleDownloadExcelDevice = async () => {
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
      const deviceData = responseData.data.find((item) => item.name === 'device');
      const updatedDataDevice = deviceData.data.map((item) => ({
        month: item.month,
        data: item.data
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(updatedDataDevice);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Device Connected');
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

  const downloadChartDevice = () => {
    const chartElement = document.getElementById('deviceContainer');

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

  // Area Chart options for Device section
  const deviceOptions = {
    series: [
      {
        name: 'Devices',
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
    yaxis: {
      title: {
        text: 'Connected Devices'
      },
      forceNiceScale: true,
      labels: {
        formatter: function (value) {
          return `${parseInt(value)} Unit`;
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
          return `${parseInt(value)} Unit`;
        }
      }
    },
    colors: ['#65e454'],
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
        <Grid item xs={12} id="deviceContainer">
          <SubCard>
            <div className="cardHeader">
              <h3>Device Connected</h3>
              <div className="btnMenu">
                <Avatar
                  variant="rounded"
                  aria-controls="menu-device-card"
                  aria-haspopup="true"
                  onClick={handleClickDevice}
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
                  id="menu-device-card"
                  anchorEl={anchorElDevice}
                  keepMounted
                  open={Boolean(anchorElDevice)}
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
                  <MenuItem onClick={downloadChartDevice}>
                    <GetAppTwoToneIcon sx={{ mr: 1.75 }} /> Download Chart
                  </MenuItem>
                  <MenuItem onClick={handleDownloadExcelDevice}>
                    <ArchiveTwoToneIcon sx={{ mr: 1.75 }} /> Download Excel
                  </MenuItem>
                </Menu>
              </div>
            </div>
            <div id="chart-device">
              <ReactApexChart options={deviceOptions} series={deviceOptions.series} type="area" height={350} />
            </div>
          </SubCard>
        </Grid>
      </Grid>
    </div>
  );
};

export default DeviceSection;
