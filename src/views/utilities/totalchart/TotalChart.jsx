import React, { useEffect, useState } from 'react';
import { Avatar, Menu, MenuItem, Grid } from '@mui/material';
import { DatePicker, Space, Select, Button, Dropdown } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import './totalchart.scss';
import axiosNew from '../../../api/axiosNew';
import ApexCharts from 'apexcharts';
import { SearchOutlined } from '@ant-design/icons';
// project imports
import SubCard from 'ui-component/cards/SubCard';
import MainCard from 'ui-component/cards/MainCard';
// import SecondaryAction from 'ui-component/cards/CardSecondaryAction';
import { gridSpacing } from 'store/constant';
import GetAppTwoToneIcon from '@mui/icons-material/GetAppOutlined';
import PictureAsPdfTwoToneIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ArchiveTwoToneIcon from '@mui/icons-material/ArchiveOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { pdf, Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

const Sites = () => {
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedRange, setSelectedRange] = useState([]);

  const onChangeSite = (value) => {
    setSelectedSite(value);

    // Get selected site name and public IP
    const selectedOption = sites.find((site) => site.value === value);
    if (selectedOption) {
      setSiteName(selectedOption.label);
      setSitePublicIP(selectedOption.publicIP);
    }
  };

  const onChangeRange = (dates, dateStrings) => {
    setSelectedRange(dateStrings);
  };

  const onMenuClick = (e) => {
    console.log('click', e);
  };
  const items = [
    {
      key: '1',
      label: 'Chart'
    },
    {
      key: '2',
      label: 'PDF'
    },
    {
      key: '3',
      label: 'Excel'
    }
  ];

  const onSearch = async () => {
    const startData = selectedRange[0];
    const endData = selectedRange[1];

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
      console.log(response);
      // Update dataTraffic
      const trafficData = responseData.data.find((item) => item.name === 'BW usage per GB');
      const updatedDataTraffic = trafficData.data.map((item) => ({
        month: item.month,
        data: item.data
      }));

      // Update dataDevice
      const deviceData = responseData.data.find((item) => item.name === 'device');
      const updatedDataDevice = deviceData.data.map((item) => ({
        month: item.month,
        data: item.data
      }));

      setDataTraffic(updatedDataTraffic);
      setDataDevice(updatedDataDevice);

      // Update site name and public IP based on selected site
      const selectedOption = sites.find((site) => site.value === selectedSite);
      if (selectedOption) {
        setSiteName(selectedOption.label);
        setSitePublicIP(selectedOption.publicIP);
      }
    } catch (error) {
      console.log(error);
    }
  };

  dayjs.extend(customParseFormat);
  const { RangePicker } = DatePicker;

  const [dataTraffic, setDataTraffic] = useState([]);
  const [dataDevice, setDataDevice] = useState([]);
  const data = [
    { name: 'Group A', value: 100 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 }
  ];
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f'];

  // API GET LIST DATA SITES
  const [sites, setSites] = useState([]);
  const [siteName, setSiteName] = useState('');
  const [sitePublicIP, setSitePublicIP] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('access_token');

      try {
        const response = await axiosNew.get('/site', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        });

        // console.log(response);
        const data = response.data.data;
        const siteOptions = data.map((item) => ({
          value: item.id,
          label: item.name,
          publicIP: item.public_ip
        }));
        setSites(siteOptions);
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, []);

  const [anchorElTraffic, setAnchorElTraffic] = useState(null);
  const [anchorElDevice, setAnchorElDevice] = useState(null);
  const [anchorElUptime, setAnchorElUptime] = useState(null);

  const handleClickTraffic = (event) => {
    setAnchorElTraffic(event.currentTarget);
  };

  const handleClickDevice = (event) => {
    setAnchorElDevice(event.currentTarget);
  };

  const handleClickUptime = (event) => {
    setAnchorElUptime(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElTraffic(null);
    setAnchorElDevice(null);
    setAnchorElUptime(null);
  };

  const handleDownloadChartTraffic = () => {
    handleClose();

    // Mendapatkan referensi elemen AreaChart
    const chartElement = document.querySelector('.recharts-wrapper');
    // Membuat screenshot dari elemen AreaChart menggunakan html2canvas
    html2canvas(chartElement).then((canvas) => {
      // Mengonversi screenshot menjadi file gambar dalam format PNG
      canvas.toBlob((blob) => {
        // Mengunduh file gambar
        saveAs(blob, `${siteName}.png`);
      });
    });

    toast.success('Download Successfully.');
  };

  const handleDownloadPDF = () => {
    // Implement download PDF logic here
    console.log('Download PDF success');
  };

  const handleDownloadPdfDevice = () => {
    // Implement download PDF logic here
    console.log('Download PDF success');
  };

  const AreaChartPDF = ({ tableData, chartData }) => {
    const styles = StyleSheet.create({
      page: {
        fontFamily: 'Helvetica',
        padding: 20
      },
      logoContainer: {
        display: 'flex',
        width: '100%',
        alignItems: 'right',
        justifyContent: 'flex-end',
        marginBottom: 25,
        fontSize: 12
      },
      logoText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10
      },
      logoImage: {
        width: 175,
        height: 100
      },
      table: {
        display: 'table',
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 20
      },
      tableRow: {
        flexDirection: 'row'
      },
      tableCellHeader: {
        backgroundColor: '#007bff',
        color: '#ffffff',
        fontWeight: 'bold',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        textAlign: 'center',
        width: '50%',
        padding: 5
      },
      tableCell: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        textAlign: 'center',
        width: '50%',
        padding: 5
      },
      chartContainer: {
        width: '100%',
        height: 300
      },
      headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.logoContainer}>
            <View style={styles.headerContainer}>
              <View style={{ width: '60%' }}>
                <Text style={[styles.logoText, { marginBottom: 5 }]}>Nama Site : {siteName}</Text>
                <Text style={[styles.logoText, { marginBottom: 5 }]}>IP Public : {sitePublicIP}</Text>
                <Text style={[styles.logoText]}>Tanggal : {new Date().toLocaleDateString()}</Text>
              </View>
              <Image style={[styles.logoImage, { width: '35%' }]} src={require('../../../assets/images/logotachyon-new.png')} />
            </View>
          </View>
          <View style={styles.table}>
            {tableData.map((rowData, rowIndex) => (
              <View style={styles.tableRow} key={rowIndex}>
                {rowData.map((cellData, cellIndex) => (
                  <View
                    style={[
                      styles.tableCell,
                      rowIndex === 0 && styles.tableCellHeader,
                      { width: cellData.width } // Add width style
                    ]}
                    key={cellIndex}
                  >
                    <Text>{cellData.text}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0
              }}
            >
              <XAxis dataKey="month" stroke="#8884d8" />
              <YAxis />
              <Legend
                width={100}
                wrapperStyle={{
                  top: 40,
                  right: 20,
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #d5d5d5',
                  borderRadius: 3,
                  lineHeight: '1px'
                }}
              />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <Bar dataKey="data" fill="#8884d8" barSize={30} />
            </BarChart>
          </View>
        </Page>
      </Document>
    );
  };

  const handleDownloadPdfTraffic = async () => {
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

      // Mengambil data dari respons
      // console.log(response);
      const responseData = response.data;

      // Update dataTraffic
      const trafficData = responseData.data.find((item) => item.name === 'BW usage per GB');
      const updatedDataTraffic = trafficData.data.map((item) => ({
        month: item.month,
        data: item.data
      }));

      // Membuat data untuk tabel
      const tableData = [
        [
          { text: 'Month', style: 'tableHeader', width: '50%' },
          { text: 'Data', style: 'tableHeader', width: '50%' }
        ]
      ];

      // Menambahkan data ke tabel
      updatedDataTraffic.forEach((item) => {
        const dataValue = `${item.data} GB`;
        tableData.push([
          { text: item.month, style: 'tableCell' },
          { text: dataValue, style: 'tableCell' }
        ]);
      });

      // Membuat data untuk chart
      const chartData = trafficData.data.map((item) => ({
        month: item.month,
        data: item.data
      }));

      // Generate the PDF
      const pdfBlob = await pdf(<AreaChartPDF tableData={tableData} chartData={chartData} />).toBlob();
      saveAs(pdfBlob, `${siteName}.pdf`);

      if (response.status === 200) {
        toast.success('Download Successfully.');
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        toast.error('Please Input Site and Date Range!');
      } else {
        toast.error('Failed to download PDF. Please try again.'); // Display error message using toast or any other mechanism
        console.log(error);
      }
    }
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

      // Mengambil data dari respons
      // const responseStatus = response;
      const responseData = response.data;
      // console.log(responseStatus);

      // Update dataTraffic
      const trafficData = responseData.data.find((item) => item.name === 'BW usage per GB');
      const updatedDataTraffic = trafficData.data.map((item) => ({
        month: item.month,
        data: item.data
      }));

      // Membuat workbook baru
      const workbook = XLSX.utils.book_new();

      // Membuat worksheet baru
      const worksheet = XLSX.utils.json_to_sheet(updatedDataTraffic);

      // Menambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Mengubah workbook menjadi file Excel
      const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

      // Membuat blob dari array buffer
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Membuat URL objek dari blob
      const url = URL.createObjectURL(blob);

      // Membuat link untuk mengunduh file
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${siteName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Merelease objek URL
      URL.revokeObjectURL(url);

      if (response.status === 200) {
        toast.success('Download Successfully.');
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        toast.error('Please Input Site and Date Range!');
      } else {
        setError('Failed to register, please try again.');
        console.log(error);
      }
    }
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

      // Mengambil data dari respons

      const responseData = response.data;
      // console.log(responseData);

      // Update dataDevice
      const deviceData = responseData.data.find((item) => item.name === 'device');
      const updatedDataDevice = deviceData.data.map((item) => ({
        month: item.month,
        data: item.data
      }));

      // Membuat workbook baru
      const workbook = XLSX.utils.book_new();

      // Membuat worksheet baru
      const worksheet = XLSX.utils.json_to_sheet(updatedDataDevice);

      // Menambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Mengubah workbook menjadi file Excel
      const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

      // Membuat blob dari array buffer
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Membuat URL objek dari blob
      const url = URL.createObjectURL(blob);

      // Membuat link untuk mengunduh file
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Merelease objek URL
      URL.revokeObjectURL(url);
      if (response.status === 200) {
        toast.success('Download Successfully.');
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        toast.error('Please Input Site and Date Range!');
      } else {
        setError('Failed to register, please try again.');
        console.log(error);
      }
    }
  };

  // double chart for traffic and device

  useEffect(() => {
    const options = {
      series: [
        {
          name: 'BW Usage',
          data: dataTraffic.map((item) => ({
            x: dayjs(item.month, 'MM/YYYY').valueOf(),
            y: item.data
          }))
        },
        {
          name: 'Device',
          data: dataDevice.map((item) => ({
            x: dayjs(item.month, 'MM/YYYY').valueOf(),
            y: item.data
          }))
        }
      ],
      chart: {
        height: 350,
        type: 'area'
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      xaxis: {
        type: 'datetime'
      },
      yaxis: {
        labels: {
          formatter: function (value) {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(2)} TB/Device`;
            } else {
              return `${value} GB/Device`;
            }
          }
        }
      },
      tooltip: {
        x: {
          format: 'MM/yyyy'
        },
        y: {
          formatter: function (value, { seriesIndex }) {
            if (seriesIndex === 0) {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(2)} TB`;
              } else {
                return `${value} GB`;
              }
            } else {
              return `${value} Device`;
            }
          }
        }
      }
    };

    const chart = new ApexCharts(document.querySelector('#chart'), options);
    chart.render();

    // Cleanup chart on unmount
    return () => {
      chart.destroy();
    };
  }, [dataTraffic, dataDevice]);

  return (
    <>
      <MainCard title="Jakwifi Analysis">
        <ToastContainer />
        <div className="dateContainer">
          <div className="dateLeft">
            <Select
              className="selectSites"
              showSearch
              placeholder="Select Site"
              optionFilterProp="children"
              onChange={onChangeSite}
              onSearch={onSearch}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={sites}
            />
            <Space direction="vertical">
              <Dropdown.Button
                menu={{
                  items,
                  onClick: onMenuClick
                }}
              >
                Downloads
              </Dropdown.Button>
            </Space>
          </div>
          <Space size={12}>
            <RangePicker picker="month" onChange={onChangeRange} format="MM/YYYY" />
            <Button type="primary" shape="circle" icon={<SearchOutlined />} onClick={onSearch} />
          </Space>
        </div>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <SubCard>
              <div className="cardHeader">
                <h3>BW Usage & Device Connected</h3>
                <div className="btnMenu">
                  <Avatar variant="rounded" aria-controls="menu-traffic-card" aria-haspopup="true" onClick={handleClickTraffic}>
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
                    <MenuItem onClick={handleDownloadChartTraffic}>
                      <GetAppTwoToneIcon sx={{ mr: 1.75 }} /> Download Chart
                    </MenuItem>
                    <MenuItem onClick={handleDownloadPdfTraffic}>
                      <PictureAsPdfTwoToneIcon sx={{ mr: 1.75 }} /> Download PDF
                    </MenuItem>
                    <MenuItem onClick={handleDownloadExcelTraffic}>
                      <ArchiveTwoToneIcon sx={{ mr: 1.75 }} /> Download Excel
                    </MenuItem>
                  </Menu>
                </div>
              </div>
              <div>
                <div id="chart"></div>
              </div>
            </SubCard>
          </Grid>
          <Grid item xs={12}>
            <SubCard>
              <div className="cardHeader">
                <h3>BW Usage</h3>
                <div className="btnMenu">
                  <Avatar variant="rounded" aria-controls="menu-traffic-card" aria-haspopup="true" onClick={handleClickTraffic}>
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
                    <MenuItem onClick={handleDownloadChartTraffic}>
                      <GetAppTwoToneIcon sx={{ mr: 1.75 }} /> Download Chart
                    </MenuItem>
                    <MenuItem onClick={handleDownloadPdfTraffic}>
                      <PictureAsPdfTwoToneIcon sx={{ mr: 1.75 }} /> Download PDF
                    </MenuItem>
                    <MenuItem onClick={handleDownloadExcelTraffic}>
                      <ArchiveTwoToneIcon sx={{ mr: 1.75 }} /> Download Excel
                    </MenuItem>
                  </Menu>
                </div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart
                    className="recharts-wrapper"
                    data={dataTraffic}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0
                    }}
                  >
                    <Area type="monotone" dataKey="data" stroke="#8884d8" fill="#8884d8" />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} GB`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SubCard>
          </Grid>
          <Grid item xs={12}>
            <SubCard>
              <div className="cardHeader">
                <h3>Device Connected</h3>
                <div className="btnMenu">
                  <Avatar variant="rounded" aria-controls="menu-device-card" aria-haspopup="true" onClick={handleClickDevice}>
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
                    <MenuItem>
                      <GetAppTwoToneIcon sx={{ mr: 1.75 }} /> Download Chart
                    </MenuItem>
                    <MenuItem onClick={handleDownloadPdfDevice}>
                      <PictureAsPdfTwoToneIcon sx={{ mr: 1.75 }} /> Download PDF
                    </MenuItem>
                    <MenuItem onClick={handleDownloadExcelDevice}>
                      <ArchiveTwoToneIcon sx={{ mr: 1.75 }} /> Download Excel
                    </MenuItem>
                  </Menu>
                </div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={dataDevice}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0
                    }}
                  >
                    <XAxis dataKey="month" stroke="#8884d8" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} Device`} />
                    <Legend
                      width={100}
                      wrapperStyle={{
                        top: 40,
                        right: 20,
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #d5d5d5',
                        borderRadius: 3,
                        lineHeight: '1px'
                      }}
                    />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <Bar dataKey="data" fill="#8884d8" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SubCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SubCard>
              <div className="cardHeader">
                <h3>Uptime</h3>
                <div className="btnMenu">
                  <Avatar variant="rounded" aria-controls="menu-uptime-card" aria-haspopup="true" onClick={handleClickUptime}>
                    <MoreHorizIcon fontSize="inherit" />
                  </Avatar>
                  <Menu
                    id="menu-uptime-card"
                    anchorEl={anchorElUptime}
                    keepMounted
                    open={Boolean(anchorElUptime)}
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
                    <MenuItem>
                      <GetAppTwoToneIcon sx={{ mr: 1.75 }} /> Download Chart
                    </MenuItem>
                    <MenuItem onClick={handleDownloadPDF}>
                      <PictureAsPdfTwoToneIcon sx={{ mr: 1.75 }} /> Download PDF
                    </MenuItem>
                    <MenuItem>
                      <ArchiveTwoToneIcon sx={{ mr: 1.75 }} /> Download Excel
                    </MenuItem>
                  </Menu>
                </div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie dataKey="value" data={data} label outerRadius={100} fill="#8884d8">
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SubCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SubCard>
              <div className="cardHeader">
                <h3>Package</h3>
                <div className="btnMenu">
                  <Avatar variant="rounded" aria-controls="menu-uptime-card" aria-haspopup="true" onClick={handleClickUptime}>
                    <MoreHorizIcon fontSize="inherit" />
                  </Avatar>
                  <Menu
                    id="menu-uptime-card"
                    anchorEl={anchorElUptime}
                    keepMounted
                    open={Boolean(anchorElUptime)}
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
                    <MenuItem>
                      <GetAppTwoToneIcon sx={{ mr: 1.75 }} /> Download Chart
                    </MenuItem>
                    <MenuItem onClick={handleDownloadPDF}>
                      <PictureAsPdfTwoToneIcon sx={{ mr: 1.75 }} /> Download PDF
                    </MenuItem>
                    <MenuItem>
                      <ArchiveTwoToneIcon sx={{ mr: 1.75 }} /> Download Excel
                    </MenuItem>
                  </Menu>
                </div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie dataKey="value" data={data} label outerRadius={100} fill="#8884d8">
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SubCard>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default Sites;
