import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import './viewsite.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { Dropdown, Button, Spin, Space, Select, AutoComplete } from 'antd';
import axiosNew from 'api/axiosNew';
import useAxiosPrivate from 'hooks/useAxiosPrivate';
import dayjs from 'dayjs';
import { BackwardOutlined } from '@ant-design/icons';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DatePicker } from 'antd';
import { FileImageOutlined, FilePdfOutlined, FileExcelOutlined, FileZipOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { pdf, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { Image as PDFImage } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';
import XLSX from 'xlsx';
import ReactECharts from 'echarts-for-react';

const { RangePicker } = DatePicker;
dayjs.extend(customParseFormat);

const ViewSite = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [category, setCategory] = useState('internet');
  const [rows, setRows] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  const handleBack = () => {
    navigate(`/jakwifi/analytics`);
  };

  useEffect(() => {
    // Get the current date, month, and year
    const currentDate = dayjs();
    const startDateTime = currentDate.startOf('day').format('YYYY-MM-DD');
    const endDateTime = currentDate.endOf('day').format('YYYY-MM-DD');

    setStartDate(startDateTime);
    setEndDate(endDateTime);
    setLoading(true);
    axiosNew
      .get(`site/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        setName(res.data.name);
        setIp(res.data.public_ip);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!category) {
        toast.error('Please Input Category!');
        return;
      }

      setLoading(true);
      try {
        const apiUrl = '/netflow-ui/data/statistic/daily';
        const requestBody = {
          category: category,
          end_datetime: endDate,
          src_ip_address: ip,
          start_datetime: startDate
        };
        // console.log('Request Body:', requestBody);
        const response = await axiosPrivate.post(apiUrl, requestBody);
        const dataArray = response.data.data;
        setLastUpdate(response.data.last_update);
        // console.log(dataArray);

        const processedDataArray = dataArray.map((item) => {
          if (item.application === null) {
            return { ...item, application: 'No Name' };
          }
          return item;
        });

        const combinedApplications = processedDataArray.reduce((accumulator, item) => {
          const existingItem = accumulator.find((accItem) => accItem.application === item.application);
          if (existingItem) {
            existingItem.data.push({
              download: item.download,
              upload: item.upload,
              total: item.total,
              dst_as_name: item.dst_as_name,
              dst_as_number: item.dst_as_number,
              dst_city: item.dst_city,
              packet_total: item.packet_total,
              ip_dst_address: item.ip_dst_address,
              ip_src_address: item.ip_src_address,
              protocol_service_name: item.protocol_service_name
            });
            // Update the totals for existing application
            existingItem.total_download += item.download;
            existingItem.total_upload += item.upload;
            existingItem.total_bandwidth += item.total;
            existingItem.all_packets += item.packet_total;
          } else {
            accumulator.push({
              application: item.application,
              total_download: item.download,
              total_upload: item.upload,
              total_bandwidth: item.total,
              all_packets: item.packet_total,
              data: [
                {
                  download: item.download,
                  upload: item.upload,
                  total: item.total,
                  dst_as_name: item.dst_as_name,
                  dst_as_number: item.dst_as_number,
                  dst_city: item.dst_city,
                  packet_total: item.packet_total,
                  ip_dst_address: item.ip_dst_address,
                  ip_src_address: item.ip_src_address,
                  protocol_service_name: item.protocol_service_name
                }
              ]
            });
          }
          return accumulator;
        }, []);

        // console.log('Combined Applications:', combinedApplications);

        const processedRows = combinedApplications.map((item) => {
          return createData(
            item.application,
            item.total_download,
            item.total_upload,
            item.total_bandwidth,
            item.all_packets,
            item.data.map((detailItem) => detailItem.ip_dst_address),
            item.data.map((detailItem) => detailItem.ip_src_address),
            item.data.map((detailItem) => detailItem.protocol_service_name),
            item.data.map((detailItem) => detailItem.download),
            item.data.map((detailItem) => detailItem.upload),
            item.data.map((detailItem) => detailItem.dst_city)
          );
        });

        setRows(processedRows);
        // console.log(processedRows);

        // Combine data based on application and sum up totals
        const combinedData = processedDataArray.reduce((accumulator, item) => {
          const existingItem = accumulator.find((accItem) => accItem.application === item.application);
          if (existingItem) {
            existingItem.total += item.total;
          } else {
            accumulator.push({ application: item.application, total: item.total });
          }
          return accumulator;
        }, []);

        // Log the combined data
        // console.log('Combined Data:', combinedData);

        combinedData.sort((a, b) => b.total - a.total);

        // Take the top 10 applications and their corresponding totals
        const topApplications = combinedData.slice(0, 10);
        const extractedApplications = topApplications.map((item) => item.application);
        const extractedTotals = topApplications.map((item) => item.total);

        // console.log(extractedTotals);

        // let sum = 0;

        // for (let i = 0; i < extractedTotals.length; i++) {
        //   // console.log(`${i}: ${extractedTotals[i]}`);
        //   sum += extractedTotals[i];
        // }

        // console.log('Sum:', formatBytes(sum));

        // Update state for optionUsage and SeriesUsage

        setBwUsageEchart((prevOptions) => ({
          ...prevOptions,
          legend: {
            ...prevOptions.legend,
            data: extractedApplications
          },
          series: [
            {
              ...prevOptions.series[0],
              data: extractedTotals.map((value, index) => ({
                name: extractedApplications[index],
                value
              }))
            }
          ]
        }));

        // Log top 10 applications and their counts
        // console.log('Top 10 Applications:', extractedApplications);
        // console.log('Total Counts for Top 10 Applications:', extractedTotals);

        // Add this console log to extract dst_country values
        const extractedDstCountries = processedDataArray.map((item) => item.dst_country);
        // console.log('Extracted Destination Countries:', extractedDstCountries);
        const extractedProtocol = processedDataArray.map((item) => item.protocol_service_name);
        // console.log('Extracted Protocol:', extractedProtocol);

        // Map values to corresponding names
        const nameMappings = {
          ID: 'IIX',
          SG: 'IIX'
        };

        // Combine and sum up totals
        const valueTotals = extractedDstCountries.reduce((totals, value) => {
          const normalizedValue = nameMappings[value] || 'INTL';

          if (!totals[normalizedValue]) {
            totals[normalizedValue] = 1;
          } else {
            totals[normalizedValue]++;
          }

          return totals;
        }, {});

        // Process and display the results
        const combinedResults = Object.entries(valueTotals).map(([value, count]) => ({
          value,
          name: value === 'ID' ? 'IIX' : value === 'SG' ? 'IIX' : value, // Update this line
          count
        }));

        // console.log(combinedResults);

        const extractedNames = combinedResults.map((result) => result.name);
        const extractedCounts = combinedResults.map((result) => result.count);

        setDestinationEchart((prevOptions) => ({
          ...prevOptions,
          legend: {
            ...prevOptions.legend,
            data: extractedNames
          },
          series: [
            {
              ...prevOptions.series[0],
              data: extractedCounts.map((value, index) => ({
                name: extractedNames[index],
                value
              }))
            }
          ]
        }));

        // Define protocolNameMappings
        const protocolNameMappings = {
          'TCP/443(http)': 'TCP/443',
          'TCP/80(http)': 'TCP/80',
          'UDP/443(https)': 'UDP/443',
          'TCP/443(https)': 'TCP/443'
          // Add more mappings as needed
        };

        // Create an object to store combined protocol data
        const combinedProtocolData = {};

        // Loop through extractedProtocol array
        extractedProtocol.forEach((protocol) => {
          // Check if the protocol exists in the combinedProtocolData object
          if (combinedProtocolData[protocol]) {
            // If it exists, increment the count
            combinedProtocolData[protocol].count += 1;
          } else {
            // If it doesn't exist, add it with a count of 1
            combinedProtocolData[protocol] = {
              protocol,
              name: protocolNameMappings[protocol] || protocol,
              count: 1
            };
          }
        });

        // Convert the combinedProtocolData object into an array
        const combinedProtocolResults = Object.values(combinedProtocolData);

        // Sort data berdasarkan jumlah (count) dari yang tertinggi ke terendah
        combinedProtocolResults.sort((a, b) => b.count - a.count);

        // Ambil 10 data pertama
        const top10Results = combinedProtocolResults.slice(0, 10);

        // Ambil legendData dan seriesData dari 10 data teratas
        const legendData = top10Results.map((result) => result.protocol);
        const seriesData = top10Results.map((result) => result.count);

        // console.log(seriesData);

        const legendFormattedData = legendData.map((name) => {
          return `${name}`;
        });

        // console.log(legendFormattedData);

        setServiceEchart((prevOptions) => ({
          ...prevOptions,
          legend: {
            ...prevOptions.legend,
            data: legendFormattedData
          },
          series: [
            {
              ...prevOptions.series[0],
              data: seriesData.map((value, index) => ({
                name: legendFormattedData[index],
                value
              }))
            }
          ]
        }));

        // console.log('Combined Protocol Results:', combinedProtocolResults);

        // After fetching the data and before processing it
        const applicationCounts = {};

        processedDataArray.forEach((item) => {
          const { application } = item;
          if (applicationCounts[application]) {
            applicationCounts[application] += 1;
          } else {
            applicationCounts[application] = 1;
          }
        });

        // Create an array of objects with application and count properties
        const applicationCountsArray = Object.entries(applicationCounts).map(([application, count]) => ({
          application,
          count
        }));

        // Sort the array in descending order based on count
        applicationCountsArray.sort((a, b) => b.count - a.count);

        // Take the top 10 applications and their counts
        const topApplicationsWithCounts = applicationCountsArray.slice(0, 10);

        const extractedAppNames = topApplicationsWithCounts.map((item) => item.application);
        const extractedAppCounts = topApplicationsWithCounts.map((item) => item.count);

        setApplicationEchart((prevOptions) => ({
          ...prevOptions,
          legend: {
            ...prevOptions.legend,
            data: extractedAppNames
          },
          series: [
            {
              ...prevOptions.series[0],
              data: extractedAppCounts.map((value, index) => ({
                name: extractedAppNames[index],
                value
              }))
            }
          ]
        }));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ip, endDate, startDate, category]);

  const formatBytes = (bytes) => {
    if (bytes < 1024) {
      return bytes + ' Bytes';
    } else if (bytes < 1024 ** 2) {
      const kbValue = (bytes / 1024).toFixed(2);
      return kbValue % 1 === 0 ? parseInt(kbValue) + ' KB' : kbValue + ' KB';
    } else if (bytes < 1024 ** 3) {
      const mbValue = (bytes / 1024 ** 2).toFixed(2);
      return mbValue % 1 === 0 ? parseInt(mbValue) + ' MB' : mbValue + ' MB';
    } else if (bytes < 1024 ** 4) {
      const gbValue = (bytes / 1024 ** 3).toFixed(2);
      return gbValue % 1 === 0 ? parseInt(gbValue) + ' GB' : gbValue + ' GB';
    } else {
      const tbValue = (bytes / 1024 ** 4).toFixed(2);
      return tbValue % 1 === 0 ? parseInt(tbValue) + ' TB' : tbValue + ' TB';
    }
  };

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      const startDateTime = dates[0].startOf('day').format('YYYY-MM-DD');
      const endDateTime = dates[1].endOf('day').format('YYYY-MM-DD');

      setStartDate(startDateTime);
      setEndDate(endDateTime);
    }
  };

  const handleCategory = (value) => {
    console.log(`selected ${value}`);
    setCategory(value);
  };

  const downloadPDF = async () => {
    try {
      toast.promise(
        async () => {
          const dataElement = document.querySelector('#dataContainer');
          const datasite = await html2canvas(dataElement);
          const imgData = datasite.toDataURL();
          const rangeElement = document.querySelector('#rangeContainer');
          const rangesite = await html2canvas(rangeElement);
          const imgRange = rangesite.toDataURL();
          const chartElement = document.querySelector('#chartContainer');
          const chartSite = await html2canvas(chartElement);
          const imgChart = chartSite.toDataURL();
          const apiUrlPdf = '/netflow-ui/data/statistic/daily';
          const requestBody = {
            category: category,
            end_datetime: endDate,
            src_ip_address: ip,
            start_datetime: startDate
          };

          const response = await axiosPrivate.post(apiUrlPdf, requestBody);
          const responseData = response.data.data;
          // console.log(responseData);

          const processedDataArray = responseData.map((item) => {
            if (item.application === null) {
              return { ...item, application: 'No Name' };
            }
            return item;
          });

          const tableData = [
            [
              { text: 'No', style: 'tableHeader', width: '5%' },
              { text: 'Application', style: 'tableHeader', width: '20%' },
              { text: 'Src Address', style: 'tableHeader', width: '20%' },
              { text: 'Dst Address', style: 'tableHeader', width: '20%' },
              { text: 'Port Service', style: 'tableHeader', width: '17%' },
              { text: 'Download', style: 'tableHeader', width: '13%' },
              { text: 'Upload', style: 'tableHeader', width: '13%' },
              { text: 'Total BW', style: 'tableHeader', width: '13%' }
            ]
          ];

          processedDataArray.forEach((item, index) => {
            tableData.push([
              { text: (index + 1).toString(), style: 'tableCell', width: '5%' },
              { text: item.application, style: 'tableCell', width: '20%' },
              { text: item.ip_src_address, style: 'tableCell', width: '20%' },
              { text: item.ip_dst_address, style: 'tableCell', width: '20%' },
              { text: item.protocol_service_name, style: 'tableCell', width: '17%' },
              { text: formatBytes(item.download), style: 'tableCell', width: '13%' },
              { text: formatBytes(item.upload), style: 'tableCell', width: '13%' },
              { text: formatBytes(item.total), style: 'tableCell', width: '13%' }
            ]);
          });

          const MyDocument = ({ tableData }) => {
            const styles = StyleSheet.create({
              page: {
                fontFamily: 'Helvetica',
                padding: 25,
                paddingTop: 30,
                paddingBottom: 50
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
                fontSize: 12,
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
                fontSize: 7
              },
              tableRow: {
                flexDirection: 'row'
              },
              tableCellHeader: {
                backgroundColor: '#419dff',
                color: '#ffffff',
                fontWeight: 'bold',
                borderStyle: 'solid',
                borderBottomWidth: 1,
                borderRightWidth: 1,
                textAlign: 'center',
                padding: 5
              },
              tableCell: {
                borderStyle: 'solid',
                borderBottomWidth: 1,
                borderRightWidth: 1,
                textAlign: 'center',
                padding: 5
              },
              chartContainer: {
                width: '100%'
              },
              headerContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              },
              footer: {
                position: 'absolute',
                bottom: 15,
                left: 10,
                right: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 10,
                paddingTop: 10,
                paddingHorizontal: 10,
                borderTopWidth: 1,
                borderColor: 'grey'
              }
            });

            return (
              <Document>
                <Page size="A4" style={styles.page}>
                  <View style={styles.logoContainer}>
                    <View style={styles.headerContainer}>
                      <View style={{ width: '60%' }}>
                        <PDFImage src={imgData} />
                        <PDFImage src={imgRange} />
                      </View>
                      <PDFImage style={[styles.logoImage, { width: '35%' }]} src={require('../../../assets/images/logotachyon-new.png')} />
                    </View>
                  </View>
                  <View style={styles.tableContainer} repeat>
                    <View style={styles.tableRow}>
                      {tableData[0].map((cellData, cellIndex) => (
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: cellData.width }]} key={cellIndex}>
                          <Text>{cellData.text}</Text>
                        </View>
                      ))}
                    </View>
                    {tableData.slice(1).map((rowData, rowIndex) => (
                      <View style={styles.tableRow} key={rowIndex}>
                        {rowData.map((cellData, cellIndex) => (
                          <View style={[styles.tableCell, { width: cellData.width }]} key={cellIndex}>
                            <Text>{cellData.text}</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                  <View style={styles.chartContainer}>
                    <PDFImage src={imgChart} />
                  </View>
                  <View style={styles.footer} fixed>
                    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                    <Text>{`Copryright Ω ${new Date().getFullYear()}    Remala Abadi`}</Text>
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
              link.download = `${name}.pdf`;
              link.click();
            })
            .catch((error) => {
              console.error(error);
            });
        },

        {
          pending: 'Downloading PDF ...',
          success: 'Downloaded Successfully!',
          error: 'Failed to Download PDF, Please Try Again!'
        }
      );
    } catch (error) {
      console.error(error);

      toast.error('An Error Occurred, Please Try Again!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000
      });
    }
  };

  const downloadExcel = async () => {
    try {
      toast.promise(
        async () => {
          const apiUrlExcel = '/netflow-ui/data/statistic/daily';
          const requestBody = {
            category: category,
            end_datetime: endDate,
            src_ip_address: ip,
            start_datetime: startDate
          };

          const response = await axiosPrivate.post(apiUrlExcel, requestBody);
          const responseData = response.data.data;

          const processedDataArray = responseData.map((item) => {
            if (item.application === null) {
              return { ...item, application: 'No Name' };
            }

            if (item.application !== undefined) {
              item['Applications'] = item.application;
              delete item.application;
            }
            if (item.download !== undefined) {
              item['Downloads'] = item.download;
              delete item.download;
            }
            if (item.dst_as_name !== undefined) {
              item['AS Name'] = item.dst_as_name;
              delete item.dst_as_name;
            }
            if (item.dst_as_number !== undefined) {
              item['AS Number'] = item.dst_as_number;
              delete item.dst_as_number;
            }
            if (item.dst_city !== undefined) {
              item['Destination City'] = item.dst_city;
              delete item.dst_city;
            }
            if (item.dst_country !== undefined) {
              item['Destination Country'] = item.dst_country;
              delete item.dst_country;
            }
            if (item.ip_dst_address !== undefined) {
              item['Dst Address'] = item.ip_dst_address;
              delete item.ip_dst_address;
            }
            if (item.ip_src_address !== undefined) {
              item['Src Address'] = item.ip_src_address;
              delete item.ip_src_address;
            }
            if (item.packet_download !== undefined) {
              item['Packet Download'] = item.packet_download;
              delete item.packet_download;
            }
            if (item.packet_total !== undefined) {
              item['Packet Total'] = item.packet_total;
              delete item.packet_total;
            }
            if (item.packet_upload !== undefined) {
              item['Packet Upload'] = item.packet_upload;
              delete item.packet_upload;
            }
            if (item.protocol_service_name !== undefined) {
              item['Service Protocol'] = item.protocol_service_name;
              delete item.protocol_service_name;
            }
            if (item.src_as_name !== undefined) {
              item['Src AS Name'] = item.src_as_name;
              delete item.src_as_name;
            }
            if (item.src_as_number !== undefined) {
              item['Src AS Number'] = item.src_as_number;
              delete item.src_as_number;
            }
            if (item.src_city !== undefined) {
              item['Src Citu'] = item.src_city;
              delete item.src_city;
            }
            if (item.src_country !== undefined) {
              item['Src Country'] = item.src_country;
              delete item.src_country;
            }
            if (item.total !== undefined) {
              item['Total Bandwidth'] = item.total;
              delete item.total;
            }
            if (item.upload !== undefined) {
              item['Upload'] = item.upload;
              delete item.upload;
            }

            return item;
          });

          // console.log(processedDataArray);

          const worksheet = XLSX.utils.json_to_sheet(processedDataArray, {
            origin: 'A5' // Set the origin to row 6
          });

          // Set column widths
          const columnWidths = [
            { wch: 27 },
            { wch: 13 },
            { wch: 27 },
            { wch: 13 },
            { wch: 13 },
            { wch: 15 },
            { wch: 13 },
            { wch: 13 },
            { wch: 13 },
            { wch: 18 },
            { wch: 27 },
            { wch: 13 },
            { wch: 13 },
            { wch: 13 },
            { wch: 13 },
            { wch: 13 },
            { wch: 13 },
            { wch: 13 }
          ];
          worksheet['!cols'] = columnWidths;

          // Add header data to the worksheet
          const headerData = [[`Name Site : ${name}`], [`IP Public : ${ip}`], [`Tanggal : ${new Date().toLocaleDateString()}`]];

          // Merge header cells
          const headerRange = { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }; // Example: Merging cells A1 and B1
          worksheet['!merges'] = [headerRange];

          for (let i = 0; i < headerData.length; i++) {
            worksheet[XLSX.utils.encode_cell({ r: i, c: 0 })] = { t: 's', v: headerData[i][0] };
          }

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Site');

          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

          const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${name}.xlsx`;
          link.click();
        },

        {
          pending: 'Downloading Excel ...',
          success: 'Downloaded Successfully!',
          error: 'Failed to Download Excel, Please Try Again!'
        }
      );
    } catch (error) {
      console.error(error);

      toast.error('An Error Occurred, Please Try Again!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000
      });
    }
  };

  const downloadCSV = async () => {
    try {
      toast.promise(
        async () => {
          const apiUrlCSV = '/netflow-ui/data/statistic/daily';
          const requestBody = {
            category: category,
            end_datetime: endDate,
            src_ip_address: ip,
            start_datetime: startDate
          };

          const response = await axiosPrivate.post(apiUrlCSV, requestBody);
          const responseData = response.data.data;
          // console.log(responseData);

          const processedDataArray = responseData.map((item) => {
            if (item.application === null) {
              return { ...item, application: 'No Name' };
            }

            // Ubah field 'dst_city' menjadi 'Destination City'
            if (item.dst_city !== undefined) {
              item['Destination City'] = item.dst_city;
              delete item.dst_city;
            }

            // Ubah field 'ip_dst_address' menjadi 'Dst Address'
            if (item.ip_dst_address !== undefined) {
              item['Dst Address'] = item.ip_dst_address;
              delete item.ip_dst_address;
            }

            return item;
          });

          // console.log(processedDataArray);

          // Membuat string CSV dari data yang telah diproses
          const csvData = processedDataArray
            .map((item) => {
              return Object.values(item)
                .map((value) => {
                  // Escape karakter khusus dalam CSV, misalnya tanda koma
                  if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                  }
                  return value;
                })
                .join(',');
            })
            .join('\n');

          const blob = new Blob([csvData], { type: 'text/csv' });
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${name}.csv`;
          link.click();
        },

        {
          pending: 'Downloading CSV ...',
          success: 'Downloaded Successfully!',
          error: 'Failed to Download CSV, Please Try Again!'
        }
      );
    } catch (error) {
      console.error(error);
      toast.error('An Error Occurred, Please Try Again!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000
      });
    }
  };

  const downloadChart = () => {
    toast.promise(
      () =>
        html2canvas(document.getElementById('chartContainer'))
          .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = imgData;
            link.download = `${name}.png`;
            link.click();
          })
          .catch((error) => {
            console.error(error);
            throw error;
          }),

      {
        pending: 'Downloading Chart...',
        success: 'Downloaded Successfully!',
        error: 'Failed to Download Chart, Please Try Again!'
      }
    );
  };

  const onMenuClick = async (e) => {
    const { key } = e;

    switch (key) {
      case '1':
        downloadChart();
        break;
      case '2':
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

  // awal code table

  const createData = (
    application,
    total_download,
    total_upload,
    total_bandwidth,
    packet_total,
    ip_dst_addresses,
    ip_src_addresses,
    protocol_service_names,
    downloads,
    uploads,
    dst_cities
  ) => ({
    application,
    total_download,
    total_upload,
    total_bandwidth,
    packet_total,
    detail: ip_dst_addresses.map((ip_dst_address, index) => ({
      ip_dst_address,
      ip_src_address: ip_src_addresses[index],
      protocol_service_name: protocol_service_names[index],
      download: downloads[index],
      upload: uploads[index],
      dst_city: dst_cities[index]
    }))
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const Row = (props) => {
    const { row, index } = props;
    const [open, setOpen] = useState(false);

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{row.application}</TableCell>
          <TableCell align="center">{formatBytes(row.total_download)}</TableCell>
          <TableCell align="center">{formatBytes(row.total_upload)}</TableCell>
          <TableCell align="center">{formatBytes(row.total_bandwidth)}</TableCell>
          <TableCell align="center">{row.packet_total}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h4" gutterBottom component="div">
                  Detail
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Dst Address</TableCell>
                      <TableCell align="center">Src Address</TableCell>
                      <TableCell align="center">Service Protocol</TableCell>
                      <TableCell align="center">Download</TableCell>
                      <TableCell align="center">Upload</TableCell>
                      <TableCell align="center">Destination City</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.detail.map((detailRow, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row" align="center">
                          {detailRow.ip_dst_address}
                        </TableCell>
                        <TableCell align="center">{detailRow.ip_src_address}</TableCell>
                        <TableCell align="center">{detailRow.protocol_service_name}</TableCell>
                        <TableCell align="center">{formatBytes(detailRow.download)}</TableCell>
                        <TableCell align="center">{formatBytes(detailRow.upload)}</TableCell>
                        <TableCell align="center">{detailRow.dst_city}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  // awal fungsi autocomplete filter

  const [searchValue, setSearchValue] = useState('');
  const filteredRows = rows.filter((row) => {
    const application = row.application || '';
    const lowerCasedSearchValue = searchValue?.toLowerCase() || '';

    return application.toLowerCase().includes(lowerCasedSearchValue);
  });

  // akhir fungsi autocomplete filter

  // awal js chart echart js

  const [serviceEchart, setServiceEchart] = useState({
    title: {
      text: 'Top Port Service',
      x: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: []
    },
    series: [
      {
        name: 'Total',
        type: 'pie',
        radius: '55%',
        center: ['50%', '40%'],
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{d}% / {b}'
        }
      }
    ]
  });

  const [destinationEchart, setDestinationEchart] = useState({
    title: {
      text: 'Top Destination',
      x: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: []
    },
    series: [
      {
        name: 'Total',
        type: 'pie',
        radius: '55%',
        center: ['50%', '40%'],
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{d}% / {b}'
        }
      }
    ]
  });

  const [bwUsageEchart, setBwUsageEchart] = useState({
    title: {
      text: 'Top 10 BW Usage',
      x: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const formattedValue = formatBytes(params.value);
        return `${params.name} : ${formattedValue} (${params.percent}%)`;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: []
    },
    series: [
      {
        name: 'Total',
        type: 'pie',
        radius: '55%',
        center: ['50%', '40%'],
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{d}% / {b}'
        }
      }
    ]
  });

  const [applicationEchart, setApplicationEchart] = useState({
    title: {
      text: 'Top 10 Application',
      x: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: []
    },
    series: [
      {
        name: 'Total',
        type: 'pie',
        radius: '55%',
        center: ['50%', '40%'],
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{d}% / {b}'
        }
      }
    ]
  });

  // akhir js chart echart js

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHead">
            <h2>JakWifi Analytics</h2>
            <Button type="primary" onClick={handleBack}>
              <BackwardOutlined />
              Back
            </Button>
          </div>
        </Grid>
        <Grid item xs={12} className="containerData">
          <table className="dataPelanggan" id="dataContainer">
            <tbody>
              <tr>
                <th>ID</th>
                <td>{id}</td>
              </tr>
              <tr>
                <th>Name Site</th>
                <td>{name}</td>
              </tr>
              <tr>
                <th>IP Public</th>
                <td>{ip}</td>
              </tr>
            </tbody>
          </table>
          <div className="containerSelectRange">
            <Space className="containerRangeDate">
              <p>Range Date :</p>
              <RangePicker
                onChange={handleDateChange}
                format="DD-MM-YYYY"
                showTime={{
                  hideDisabledOptions: true
                }}
              />
            </Space>
            <Space className="containerCategory">
              <p>Category :</p>
              <Select
                showSearch
                placeholder="Select Category"
                optionFilterProp="children"
                className="selectCategory"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                onChange={handleCategory}
                value={category}
                options={[
                  {
                    value: 'internet',
                    label: 'Internet'
                  },
                  {
                    value: 'workstation',
                    label: 'Workstation'
                  },
                  {
                    value: 'both',
                    label: 'Both'
                  }
                ]}
              />
            </Space>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div className="containerTable">
            <div className="dataDateNew" id="rangeContainer">
              <table>
                <tbody>
                  <tr>
                    <th>Range Date</th>
                    <td>
                      From : {startDate} To : {endDate}
                    </td>
                  </tr>
                  <tr>
                    <th>Last Update</th>
                    <td>{lastUpdate}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="containerReport">
              <div className="containerDownloads">
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
                <AutoComplete
                  className="autocomplete"
                  style={{ width: 260 }}
                  placeholder="Search"
                  value={searchValue}
                  onChange={(value) => setSearchValue(value)}
                />
              </div>
            </div>
          </div>

          <Grid item xs={12}>
            {loading ? (
              <div className="loadingContainer">
                <Space
                  direction="vertical"
                  style={{
                    width: '100%'
                  }}
                >
                  <Spin tip="Loading..." size="large">
                    <div className="content" />
                  </Spin>
                </Space>
              </div>
            ) : (
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                  <TableHead className="containerTableHead">
                    <TableRow>
                      <TableCell className="tableCell">No</TableCell>
                      <TableCell />
                      <TableCell className="tableCell">Applications</TableCell>
                      <TableCell className="tableCell" align="center">
                        Downloads
                      </TableCell>
                      <TableCell className="tableCell" align="center">
                        Uploads
                      </TableCell>
                      <TableCell className="tableCell" align="center">
                        Total Bandwidths
                      </TableCell>
                      <TableCell className="tableCell" align="center">
                        Total Packets
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <Row key={index} row={row} index={index + page * rowsPerPage} />
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={rows.length}
                  page={page}
                  onPageChange={(event, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                />
              </TableContainer>
            )}
          </Grid>

          <Grid item xs={12}>
            <div className="mainContainerChart" id="chartContainer">
              <h3>Chart List</h3>
              <div className="containerChart">
                <div id="chart" className="containerDonut">
                  {loading ? (
                    <div className="loadingContainer">
                      <Space
                        direction="vertical"
                        style={{
                          width: '100%'
                        }}
                      >
                        <Spin size="large">
                          <div className="content" />
                        </Spin>
                      </Space>
                    </div>
                  ) : (
                    <div className="echartContainer">
                      <ReactECharts option={bwUsageEchart} style={{ height: 500 }} />
                    </div>
                  )}
                </div>
                <div id="chart" className="containerDonut">
                  {loading ? (
                    <div className="loadingContainer">
                      <Space
                        direction="vertical"
                        style={{
                          width: '100%'
                        }}
                      >
                        <Spin size="large">
                          <div className="content" />
                        </Spin>
                      </Space>
                    </div>
                  ) : (
                    <div className="echartContainer">
                      <ReactECharts option={applicationEchart} style={{ height: 500 }} />
                    </div>
                  )}
                </div>
                <div id="chart" className="containerDonut">
                  {loading ? (
                    <div className="loadingContainer">
                      <Space
                        direction="vertical"
                        style={{
                          width: '100%'
                        }}
                      >
                        <Spin size="large">
                          <div className="content" />
                        </Spin>
                      </Space>
                    </div>
                  ) : (
                    <div className="echartContainer">
                      <ReactECharts option={destinationEchart} style={{ height: 500 }} />
                    </div>
                  )}
                </div>
                <div id="chart" className="containerDonut">
                  {loading ? (
                    <div className="loadingContainer">
                      <Space
                        direction="vertical"
                        style={{
                          width: '100%'
                        }}
                      >
                        <Spin size="large">
                          <div className="content" />
                        </Spin>
                      </Space>
                    </div>
                  ) : (
                    <div className="echartContainer">
                      <ReactECharts option={serviceEchart} style={{ height: 500 }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ViewSite;
