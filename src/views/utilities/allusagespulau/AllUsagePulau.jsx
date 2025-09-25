import { DatePicker, Space, Dropdown, AutoComplete, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Tooltip } from '@material-ui/core';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import './allusagepulau.scss';
import { FilePdfOutlined, FileExcelOutlined, FileZipOutlined } from '@ant-design/icons';
import { gridSpacing } from 'store/constant';
import { Popconfirm } from 'antd';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { QuestionCircleOutlined } from '@ant-design/icons';
import axiosNgasal from 'api/axiosNgasal';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { toast } from 'react-toastify';
import { pdf, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { Image as PDFImage } from '@react-pdf/renderer';
import XLSX from 'xlsx';
dayjs.extend(customParseFormat);

const AllUsagePulau = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState('');

  const handleSearch = (value) => {
    // Check if the search value is "0" or null
    if (value === '' || value === null) {
      // Display all data when search value is "0" or null
      setFilteredUsers(users);
    } else {
      // Filter the rows based on the search value
      const filtered = users.filter((user) => user.site.toLowerCase().includes(value.toLowerCase()));
      setFilteredUsers(filtered);
    }
  };

  const onSelect = (value) => {
    // Check if the selected value exists in the DataGrid rows
    const selectedUser = users.find((user) => user.site.toLowerCase() === value.toLowerCase());

    // Set filteredUsers to an empty array if no matching row is found
    setFilteredUsers(selectedUser ? [selectedUser] : []);
  };

  // download pdf
  const downloadPDF = async () => {
    const { month, year } = selectedDate;
    try {
      const response = await axiosNgasal.get(`/ngasal/report/monthly/${month}/${year}/pulau/raw/`);
      const responseData = response.data;

      const tableData = [
        [
          { text: 'No', style: { fontSize: 16 } },
          { text: 'Nama Site', style: { fontSize: 16 } },
          { text: 'BW Usage Monthly', style: { fontSize: 16 } },
          { text: 'Devices', style: { fontSize: 16 } }
        ]
      ];

      // console.log(response.data);

      responseData.forEach((item, index) => {
        tableData.push([{ text: (index + 1).toString() }, { text: item.site }, { text: item.bandwidth }, { text: item.device }]);
      });

      const MyDocument = ({ tableData }) => {
        const stylesPdf = StyleSheet.create({
          page: {
            fontFamily: 'Helvetica',
            padding: 30
          },
          headerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
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
            marginBottom: 20
          },
          tableRow: {
            flexDirection: 'row'
          },
          tableCell: {
            display: 'table-cell',
            padding: 5,
            borderBottomWidth: 1,
            borderRightWidth: 1
          },
          tableCellHeader: {
            backgroundColor: '#007bff',
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
            padding: 7,
            borderStyle: 'solid',
            borderBottomWidth: 1,
            borderRightWidth: 1,
            textAlign: 'center',
            width: '50%'
          },
          cellNameSite: {
            width: '60%',
            padding: 5,
            fontSize: 9
          },
          cellNo: {
            width: '6%',
            padding: 5,
            fontSize: 9,
            textAlign: 'center'
          },
          cellBandwidth: {
            width: '17%',
            padding: 5,
            fontSize: 9,
            textAlign: 'center'
          },
          cellDevice: {
            width: '17%',
            padding: 5,
            fontSize: 9,
            textAlign: 'center'
          }
        });

        return (
          <Document>
            <Page size="A4" style={stylesPdf.page}>
              <View style={stylesPdf.logoContainer}>
                <View style={stylesPdf.headerContainer}>
                  <View style={{ width: '60%' }}>
                    <View style={stylesPdf.containerText}>
                      <Text style={stylesPdf.logoText1}>JakWiFi All Site</Text>
                    </View>
                    <View style={stylesPdf.containerText}>
                      <Text style={stylesPdf.logoText1}>Report</Text>
                      <Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</Text>
                      <Text style={stylesPdf.logoText2}>{selectedMonthYear}</Text>
                    </View>
                    <View style={stylesPdf.containerText}>
                      <Text style={stylesPdf.logoText1}>Download</Text>
                      <Text>:</Text>
                      <Text style={stylesPdf.logoText2}>{dayjs().format('DD MMMM YYYY')}</Text>
                    </View>
                  </View>
                  <PDFImage style={[stylesPdf.logoImage, { width: '35%' }]} src={require('../../../assets/images/logotachyon-new.png')} />
                </View>
              </View>
              <View style={stylesPdf.tableContainer}>
                {tableData.map((rowData, rowIndex) => (
                  <View style={stylesPdf.tableRow} key={rowIndex}>
                    {rowData.map((cellData, cellIndex) => (
                      <View
                        style={[
                          stylesPdf.tableCell,
                          rowIndex === 0 && stylesPdf.tableCellHeader,
                          cellIndex === 0 && stylesPdf.cellNo,
                          cellIndex === 1 && stylesPdf.cellNameSite,
                          cellIndex === 2 && stylesPdf.cellBandwidth,
                          cellIndex === 3 && stylesPdf.cellDevice
                        ]}
                        key={cellIndex}
                      >
                        <Text>{cellData.text}</Text>
                      </View>
                    ))}
                  </View>
                ))}
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
          link.download = `Tachyon UniFiApp.pdf`;
          link.click();

          // Returning a message will be shown on successful resolution of the promise
        })
        .catch((error) => {
          console.error(error);
          throw new Error('Failed to generate the PDF. Please try again.');
        });
    } catch (error) {
      console.error(error);
      toast.error('Failed to download PDF. Please try again.');
    }
  };

  // download excel

  const downloadExcel = async () => {
    const { month, year } = selectedDate;
    try {
      const response = await axiosNgasal.get(`/ngasal/report/monthly/${month}/${year}/pulau/raw/`);
      const responseData = response.data;

      // Header and Table data
      const headerTableData = [
        ['', 'JakWIFI All Site'],
        ['', `Report : ${selectedMonthYear}`],
        ['', `Download : ${dayjs().format('DD MMMM YYYY')}`],
        // Empty row for spacing
        [],
        // Header row for the table
        ['No', 'Nama Site', 'BW Usage Monthly', 'Devices'],
        // Table data rows
        ...responseData.map((item, index) => [(index + 1).toString(), item.site, item.bandwidth, item.device])
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(headerTableData);

      // Specify the column widths
      const columnWidths = [4, 70, 13, 13];

      // Apply column widths to the worksheet
      worksheet['!cols'] = columnWidths.map((width) => ({ wch: width }));

      // Center the content in the 'No', 'Bandwidth', and 'Device' columns
      const centerCellStyle = { alignment: { horizontal: 'center', vertical: 'center' } };
      const cellIndexesToCenter = [0, 2, 3]; // Indexes of 'No', 'Bandwidth', and 'Device' columns

      cellIndexesToCenter.forEach((cellIndex) => {
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let row = range.s.r + 1; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: cellIndex });
          const cell = worksheet[cellAddress];
          if (cell) {
            cell.s = centerCellStyle;
          }
        }
      });

      // Center the entire table
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          if (cell) {
            cell.s = centerCellStyle;
          }
        }
      }

      // Convert the worksheet to a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tachyon UniFiApp');

      // Convert the workbook to an Excel buffer and create a Blob
      const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create a download link and trigger the download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Tachyon_UniFiApp.xlsx`;
      link.click();

      // Show success toast
      toast.success('Download Successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download Excel file. Please try again.');
    }
  };

  // download csv

  const downloadCSV = async () => {
    const { month, year } = selectedDate;
    try {
      const response = await axiosNgasal.get(`/ngasal/report/monthly/${month}/${year}/pulau/raw/`);
      const responseData = response.data;

      // Create the CSV content
      const csvContent = [
        ['', 'JakWIFI All Site'],
        ['', `Report : ${selectedMonthYear}`],
        ['', `Download : ${dayjs().format('DD MMMM YYYY')}`],
        [],
        ['No', 'Nama Site', 'BW Usage Monthly', 'Devices'],
        ...responseData.map((item, index) => [(index + 1).toString(), item.site, item.bandwidth, item.device])
      ]
        .map((row) => row.join(',')) // Convert each row to a comma-separated string
        .join('\n'); // Join all rows with newlines

      // Convert the CSV content to a Blob
      const blob = new Blob([csvContent], { type: 'text/csv' });

      // Create a download link and trigger the download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Tachyon_UniFiApp.csv`;
      link.click();

      // Show success toast
      toast.success('Download Successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download CSV file. Please try again.');
    }
  };

  const onMenuClick = async (e) => {
    const { key } = e;

    switch (key) {
      case '1':
        handleLoading();
        await downloadPDF();
        break;
      case '2':
        downloadExcel();
        break;
      case '3':
        downloadCSV();
        break;
      default:
        break;
    }
  };

  const handleLoading = () => {
    toast.promise(
      // Fungsi yang akan dijalankan untuk promise
      () => new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        pending: 'Downloading ...', // Pesan yang ditampilkan ketika promise sedang berjalan
        success: 'Download Successfuly!', // Pesan yang ditampilkan ketika promise berhasil diselesaikan
        error: 'Download Failed, Please Try Again!' // Pesan yang ditampilkan ketika promise gagal
      }
    );
  };

  const items = [
    {
      key: '1',
      label: 'PDF',
      icon: <FilePdfOutlined />
    },
    {
      key: '2',
      label: 'Excel',
      icon: <FileExcelOutlined />
    },
    {
      key: '3',
      label: 'CSV',
      icon: <FileZipOutlined />
    }
  ];

  // API DELETE DATA SITE

  const deleteAccount = async (id) => {
    try {
      const token = localStorage.getItem('access_token');

      const res = await axiosNgasal.delete('/site', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        data: {
          id: `${id}`
        }
      });

      //   console.log('deleted clicked');
      if (res.status === 200) {
        toast.success('Deleted Successfuly.');
        getApi();
      } else {
        toast.error('Failed to delete user, please try again.');
      }
    } catch (err) {
      console.log(err);
    }
  };

  // API GET DATA SITE
  const fetchData = async (selectedDate) => {
    const { year, month } = selectedDate;
    try {
      const response = await axiosNgasal.get(`/ngasal/report/monthly/${month}/${year}/pulau/raw/`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Add a unique 'id' property to each row using uuid
      const usersWithIds = response.data.map((user) => ({
        ...user,
        id: uuidv4() // Generate a unique id using uuid
      }));

      // console.log(usersWithIds);
      setUsers(usersWithIds);
      setLoading(false); // Set loading to false when data fetching is complete

      // Display all data initially if filteredUsers is empty
      if (filteredUsers.length === 0) {
        setFilteredUsers(usersWithIds);
      }

      setDataLoaded(true); // Set dataLoaded to true when data fetching is complete
    } catch (error) {
      console.log(error);
      setLoading(false); // Set loading to false even if an error occurs
    }
  };

  useEffect(() => {
    if (selectedDate) {
      // Fetch data when the selectedDate is available (not null)
      fetchData(selectedDate);
    }
  }, [selectedDate]);

  const handleDatePickerChange = async (date, dateString) => {
    const [month, year] = dateString.split('/');
    const formattedDate = dayjs(`${year}-${month}-01`, 'YYYY-MM-DD').format('MMMM YYYY');
    setSelectedMonthYear(formattedDate);

    try {
      setLoading(true); // Set loading to true before fetching new data
      const response = await axiosNgasal.get(`/ngasal/report/monthly/${month}/${year}/pulau/raw/`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Add a unique 'id' property to each row using uuid
      const usersWithIds = response.data.map((user) => ({
        ...user,
        id: uuidv4() // Generate a unique id using uuid
      }));

      // console.log(usersWithIds);
      setUsers(usersWithIds);
      setFilteredUsers(usersWithIds); // Update filteredUsers with the new data
      setLoading(false); // Set loading to false when data fetching is complete
      setDataLoaded(true); // Set dataLoaded to true when data fetching is complete
      setSelectedDate({ month, year }); // Update the selectedDate state
    } catch (error) {
      console.log(error);
      setLoading(false); // Set loading to false even if an error occurs
    }
  };

  useEffect(() => {
    // Fetch data initially when the component mounts
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const selectedDate = { month, year };
    setSelectedDate(selectedDate); // Set the selectedDate state initially
  }, []);

  const columnSites = [
    {
      field: 'no',
      headerName: 'No',
      width: 70
    },
    { field: 'site', headerName: 'Name Site', flex: 3 },
    { field: 'bandwidth', headerName: 'BW Usage Monthly', flex: 1 },
    { field: 'device', headerName: 'Device Connected', flex: 1 }
  ];

  const actionColumn = [
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (rowData) => {
        return (
          <>
            <div className="cellAction">
              <Tooltip title="Edit" arrow>
                <div className="viewButtonOperator">
                  <DriveFileRenameOutlineIcon className="viewIcon" onClick={() => showModalEdit(rowData.id)} />
                </div>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <div>
                  <Popconfirm
                    className="cellAction"
                    title="Delete Site"
                    description="Are you sure to delete this site?"
                    onConfirm={() => deleteAccount(rowData.id)}
                    icon={
                      <QuestionCircleOutlined
                        style={{
                          color: 'red'
                        }}
                      />
                    }
                  >
                    <div className="deleteButtonOperator">
                      <DeleteForeverOutlinedIcon />
                    </div>
                  </Popconfirm>
                </div>
              </Tooltip>
            </div>
          </>
        );
      }
    }
  ];

  // INI UNTUK PEMBUATAN NOMOR URUT SECARA OTOMATIS
  const addIndex = (array) => {
    if (!Array.isArray(array)) {
      return [];
    }

    return array.map((item, index) => {
      item.no = index + 1;
      return item;
    });
  };

  return (
    <>
      <MainCard>
        <Grid item xs={12} className="gridButton">
          <div className="containerHeadSites">
            <h2>JakWifi All Usage Pulau</h2>
          </div>
        </Grid>
        <div className="dateContainer">
          <div className="dateLeft">
            <Space direction="vertical">
              <DatePicker picker="month" format="MM/YYYY" onChange={handleDatePickerChange} />
            </Space>
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
          <AutoComplete style={{ width: 250 }} placeholder="Search" onSelect={onSelect} onSearch={handleSearch} />
        </div>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12} id="chartContainer">
            {loading ? (
              <div className="loadingContainer">
                <Space
                  direction="vertical"
                  style={{
                    width: '100%'
                  }}
                >
                  <Spin tip="Loading" size="large">
                    <div className="content" />
                  </Spin>
                </Space>
              </div>
            ) : (
              dataLoaded && (
                <DataGrid
                  columns={columnSites.concat(actionColumn)}
                  rows={addIndex(filteredUsers)}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 }
                    }
                  }}
                  pageSizeOptions={[5, 10, 50, 100]}
                />
              )
            )}
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default AllUsagePulau;
