import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { DatePicker, Space, Select, Dropdown } from 'antd';
import axiosNew from '../../../api/axiosNew';
import { pdf, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { Image as PDFImage } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';
import MainCard from 'ui-component/cards/MainCard';
import { toast } from 'react-toastify';
import './usage.scss';
import { FileImageOutlined, FilePdfOutlined, FileExcelOutlined, FileZipOutlined } from '@ant-design/icons';
import XLSX from 'xlsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import DataDeviceSection from './components/DataDeviceSection';
import DataSection from './components/DataSection';
import DeviceSection from './components/DeviceSection';

// Register the UTC plugin
dayjs.extend(utc);

const SitesDev = () => {
  const { RangePicker } = DatePicker;
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedRange, setSelectedRange] = useState([]);
  const [sites, setSites] = useState([]);
  const [dataTraffic, setDataTraffic] = useState([]);
  const [dataMonthly, setDataMonthly] = useState([]);
  const [dataDevice, setDataDevice] = useState([]);
  const [siteName, setSiteName] = useState('');
  const [sitePublicIP, setSitePublicIP] = useState('');

  const onChangeRange = (dates, dateStrings) => {
    if (!dates) {
      setSelectedRange([]);
      return;
    }

    // Use both dateStrings properly
    const startDate = dateStrings[0];
    const endDate = dateStrings[1]; // Changed from dateStrings[0] to dateStrings[1]

    setSelectedRange([startDate, endDate]);
  };

  const handleLoading = () => {
    toast.promise(() => new Promise((resolve) => setTimeout(resolve, 3000)), {
      pending: 'Downloading ...',
      success: 'Download Successfuly!',
      error: 'Download Failed, Please Try Again!'
    });
  };

  //Handle Download Chart PDF Excel CSV

  const formatDataUsage = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} TB`;
    } else {
      return `${value} GB`;
    }
  };

  const downloadChart = () => {
    const chartElement = document.getElementById('chartContainer');

    html2canvas(chartElement)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${siteName}.png`;
        link.click();
        toast.success('Download Successfully!');
      })
      .catch((error) => {
        console.log(error);
        toast.error('Failed to download Chart. Please try again.');
      });
  };

  const downloadPDF = async () => {
    const chartElement = document.querySelector('#chartContainer');
    const canvas = await html2canvas(chartElement);
    const imgData = canvas.toDataURL();
    const startData = selectedRange[0];
    const endData = selectedRange[1];
    const requestData = {
      start_data: `${startData}/01`,
      end_data: `${endData}/01`,
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
      const deviceData = responseData.data.find((item) => item.name === 'device');

      const updatedDataTraffic = trafficData.data.map((item, index) => ({
        month: item.month,
        bwUsage: item.data,
        device: deviceData.data[index]?.data || 'N/A'
      }));

      const tableData = [
        [
          { text: 'Months', style: 'tableHeader', width: '33.33%' },
          { text: 'BW Usages', style: 'tableHeader', width: '33.33%' },
          { text: 'Devices', style: 'tableHeader', width: '33.33%' }
        ]
      ];

      updatedDataTraffic.forEach((item) => {
        const dataValue = formatDataUsage(item.bwUsage);
        tableData.push([
          { text: item.month, style: 'tableCell' },
          { text: dataValue, style: 'tableCell' },
          { text: `${item.device} Device`, style: 'tableCell' }
        ]);
      });

      const MyDocument = ({ tableData }) => {
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
            fontSize: 12,
            borderBottom: '2px solid grey',
            paddingBottom: 18
          },
          containerText: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: 10
          },
          logoText2: {
            width: '75%'
          },
          logoImage: {
            width: 175,
            height: 100
          },
          tableContainer: {
            display: 'table',
            width: '100%',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRightWidth: 0,
            borderBottomWidth: 0,
            marginBottom: 20,
            fontSize: 12
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
            width: '33.33%',
            padding: 5
          },
          tableCell: {
            borderStyle: 'solid',
            borderBottomWidth: 1,
            borderRightWidth: 1,
            textAlign: 'center',
            width: '33.33%',
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
                    <View style={styles.containerText}>
                      <Text style={styles.logoText1}>Nama Site </Text>
                      <Text>:</Text>
                      <Text style={styles.logoText2}>{siteName}</Text>
                    </View>
                    <View style={styles.containerText}>
                      <Text style={styles.logoText1}>IP Publik</Text>
                      <Text>&nbsp;&nbsp;&nbsp;&nbsp;:</Text>
                      <Text style={styles.logoText2}>{sitePublicIP}</Text>
                    </View>
                    <View style={styles.containerText}>
                      <Text style={styles.logoText1}>Tanggal</Text>
                      <Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</Text>
                      <Text style={styles.logoText2}>{new Date().toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <PDFImage style={[styles.logoImage, { width: '35%' }]} src={require('../../../assets/images/logotachyon-new.png')} />
                </View>
              </View>
              <View style={styles.tableContainer}>
                {tableData.map((rowData, rowIndex) => (
                  <View style={styles.tableRow} key={rowIndex}>
                    {rowData.map((cellData, cellIndex) => (
                      <View style={[styles.tableCell, rowIndex === 0 && styles.tableCellHeader, { width: cellData.width }]} key={cellIndex}>
                        <Text>{cellData.text}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
              <View style={styles.chartContainer}>
                <PDFImage src={imgData} />
              </View>
            </Page>
          </Document>
        );
      };

      pdf(<MyDocument tableData={tableData} />)
        .toBlob()
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${siteName}.pdf`;
          link.click();
        })
        .catch((error) => {
          console.error(error);
          toast.error('Failed to generate the PDF. Please try again.');
        });
    } catch (error) {
      console.error(error);
      toast.error('Failed to download PDF. Please try again.');
    }
  };

  const downloadCSV = async () => {
    const startData = selectedRange[0];
    const endData = selectedRange[1];
    const requestData = {
      start_data: `${startData}/01`,
      end_data: `${endData}/01`,
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
      const deviceData = responseData.data.find((item) => item.name === 'device');

      const updatedDataTraffic = trafficData.data.map((item, index) => ({
        No: index + 1,
        Months: item.month,
        'BW Usages': item.data >= 1000 ? `${(item.data / 1000).toFixed(2)} TB` : `${item.data} GB`,
        'Device Connected': `${deviceData.data[index]?.data || 'N/A'} Device`
      }));

      const csvContent = [
        ['Nama Site:', siteName],
        ['IP Publik:', sitePublicIP],
        ['Tanggal:', new Date().toLocaleDateString()],
        [], // Empty row for spacing
        ['No', 'Months', 'BW Usages', 'Device Connected'],
        ...updatedDataTraffic.map((row) => [row.No, row.Months, row['BW Usages'], row['Device Connected']])
      ].map((row) => row.join(','));

      const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent.join('\n'));

      const link = document.createElement('a');
      link.href = csvData;
      link.download = `${siteName}.csv`;
      link.click();
      toast.success('Download Successfully!');
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        toast.error('Please Input Site and Date Range!');
      } else {
        toast.error('Failed to download CSV file. Please try again.');
        console.log(error);
      }
    }
  };

  const downloadExcel = async () => {
    const startData = selectedRange[0];
    const endData = selectedRange[1];
    const requestData = {
      start_data: `${startData}/01`,
      end_data: `${endData}/01`,
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
      const deviceData = responseData.data.find((item) => item.name === 'device');

      const updatedDataTraffic = trafficData.data.map((item, index) => ({
        No: index + 1,
        Months: item.month,
        'BW Usages': item.data >= 1000 ? `${(item.data / 1000).toFixed(2)} TB` : `${item.data} GB`,
        'Device Connected': `${deviceData.data[index]?.data || 'N/A'} Device`
      }));

      const worksheet = XLSX.utils.json_to_sheet(updatedDataTraffic, {
        origin: 'A5' // Set the origin to row 6
      });

      // Add header data to the worksheet
      const headerData = [
        ['', 'Nama Site :', siteName],
        ['', 'IP Publik :', sitePublicIP],
        ['', 'Tanggal :', new Date().toLocaleDateString()]
      ];

      for (let i = 0; i < headerData.length; i++) {
        worksheet[XLSX.utils.encode_cell({ r: i, c: 1 })] = { t: 's', v: headerData[i][1] };
        worksheet[XLSX.utils.encode_cell({ r: i, c: 2 })] = { t: 's', v: headerData[i][2] };
      }

      // Set column widths
      const columnWidths = [{ wch: 3 }, { wch: 13 }, { wch: 15 }, { wch: 30 }];
      worksheet['!cols'] = columnWidths;

      // Apply bold font style to header cells
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.t === 's' && cell.v) {
          const boldFontStyle = { bold: true };
          const font = cell.s ? { ...cell.s.font, ...boldFontStyle } : boldFontStyle;
          cell.s = { font };
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Site');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${siteName}.xlsx`;
      link.click();
      toast.success('Download Successfully!');
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        toast.error('Please Input Site and Date Range!');
      } else {
        toast.error('Failed to download Excel file. Please try again.');
        console.log(error);
      }
    }
  };

  //Handle Download Chart PDF Excel CSV

  const onMenuClick = async (e) => {
    const { key } = e;

    switch (key) {
      case '1':
        downloadChart();
        break;
      case '2':
        handleLoading();
        await downloadPDF();
        break;
      case '3':
        downloadExcel();
        break;
      case '4':
        downloadCSV();
        break;
      default:
        break;
    }
  };

  const items = [
    {
      key: '1',
      label: 'Chart',
      icon: <FileImageOutlined />
    },
    {
      key: '2',
      label: 'PDF',
      icon: <FilePdfOutlined />
    },
    {
      key: '3',
      label: 'Excel',
      icon: <FileExcelOutlined />
    },
    {
      key: '4',
      label: 'CSV',
      icon: <FileZipOutlined />
    }
  ];

  //start handle untuk select site

  const onChangeSite = (value) => {
    setSelectedSite(value);

    // Get selected site name and public IP
    const selectedOption = sites.find((site) => site.value === value);
    if (selectedOption) {
      setSiteName(selectedOption.label);
      setSitePublicIP(selectedOption.publicIP);
    }
  };

  // get data
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

  //end handle untuk select site

  // API UNTUK MELAKUKAN GET DATA JIKA SITE DAN RANGE SUDAH DIPILIH

  const onSearch = async () => {
    // Only proceed if we have both dates
    if (selectedRange.length !== 2) {
      return;
    }

    const startData = selectedRange[0];
    const endData = selectedRange[1]; // Changed from selectedRange[0] to selectedRange[1]

    const requestData = {
      start_data: `${startData}/01`,
      end_data: `${endData}/01`,
      site_id: selectedSite
    };

    console.log(requestData);

    // Wrap the API call with toast.promise for loading indicator
    const searchPromise = axiosNew.post('/monthly', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    try {
      const response = await toast.promise(searchPromise, {
        pending: 'Loading data...',
        success: 'Data loaded successfully!',
        error: {
          render: ({ data }) => {
            // Handle different error scenarios
            if (data?.response?.status === 422) {
              return 'Please select both site and date range!';
            }
            return 'Failed to load data. Please try again.';
          }
        }
      });

      const responseData = response.data;
      console.log(responseData);

      // Set complete monthly data including data_per_month, total_device, and total_usage_gb
      setDataMonthly({
        data_per_month: responseData.data_per_month || [],
        total_device: responseData.total_device || 0,
        total_usage_gb: responseData.total_usage_gb || 0,
        site_info: {
          id: responseData.id || '',
          name: responseData.name || ''
        }
      });

      // setTableData(responseData.data);

      // Update dataTraffic
      const trafficData = responseData.data.find((item) => item.name === 'BW usage per GB');
      const updatedDataTraffic = trafficData.data.map((item) => ({
        month: item.month,
        data: item.data
        // totalDevices: item.totalDevices
      }));

      // Update dataDevice
      const deviceData = responseData.data.find((item) => item.name === 'device');
      const updatedDataDevice = deviceData.data.map((item) => ({
        month: item.month,
        data: item.data
        // totalDevices: item.totalDevices
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

  useEffect(() => {
    // Check if both start and end dates are selected
    if (selectedRange.length === 2) {
      // Perform the search automatically
      onSearch();
    }
  }, [selectedRange]);

  useEffect(() => {
    // Check if selectedSite has a value
    if (selectedSite !== null) {
      // Perform the search automatically
      onSearch();
    }
  }, [selectedSite]);

  // API UNTUK MELAKUKAN GET DATA JIKA SITE DAN RANGE SUDAH DIPILIH

  // API UNTUK MELAKUKAN SEARCH DATA DEFAULT

  // const handleSearchOnLoad = async () => {
  //   const requestData = {
  //     start_data: '2025/08/01',
  //     end_data: '2025/09/01',
  //     site_id: 'TCF-11083'
  //   };

  //   // console.log(requestData);

  //   try {
  //     const response = await axiosNew.post('/monthly', requestData, {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     const responseData = response.data;
  //     // console.log(response);
  //     // setTableData(responseData.data);

  //     // Update dataTraffic
  //     const trafficData = responseData.data.find((item) => item.name === 'BW usage per GB');
  //     const updatedDataTraffic = trafficData.data.map((item) => ({
  //       month: item.month,
  //       data: item.data
  //       // totalDevices: item.totalDevices
  //     }));

  //     // Update dataDevice
  //     const deviceData = responseData.data.find((item) => item.name === 'device');
  //     const updatedDataDevice = deviceData.data.map((item) => ({
  //       month: item.month,
  //       data: item.data
  //       // totalDevices: item.totalDevices
  //     }));

  //     setDataTraffic(updatedDataTraffic);
  //     setDataDevice(updatedDataDevice);
  //     // console.log(updatedDataTraffic);
  //     // console.log(updatedDataDevice);

  //     // Update site name and public IP based on selected site
  //     const selectedOption = sites.find((site) => site.value === selectedSite);
  //     if (selectedOption) {
  //       setSiteName(selectedOption.label);
  //       setSitePublicIP(selectedOption.publicIP);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    // handleSearchOnLoad(); // disable auto search on load biar tidak terllau banyak hit api
  }, []);

  // API UNTUK MELAKUKAN SEARCH DATA DEFAULT

  return (
    <div>
      <MainCard>
        <Grid item xs={12} className="gridButton">
          <div className="containerHeadSites">
            <h2>JakWifi Usage</h2>
          </div>
        </Grid>
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
          <Space size={12} className="dateRight">
            <RangePicker picker="month" onChange={onChangeRange} format="YYYY/MM" className="rangePicker" />
          </Space>
        </div>
        <DataDeviceSection dataTraffic={dataTraffic} dataDevice={dataDevice} dataMonthly={dataMonthly} />

        <DataSection
          dataTraffic={dataTraffic}
          siteName={siteName}
          selectedRange={selectedRange}
          selectedSite={selectedSite}
          dataMonthly={dataMonthly}
        />

        <DeviceSection
          dataDevice={dataDevice}
          siteName={siteName}
          selectedRange={selectedRange}
          selectedSite={selectedSite}
          dataMonthly={dataMonthly}
        />
      </MainCard>
    </div>
  );
};

export default SitesDev;
