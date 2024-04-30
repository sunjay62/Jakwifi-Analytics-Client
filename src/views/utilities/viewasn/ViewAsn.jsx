import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { gridSpacing } from 'store/constant';
import './viewasn.scss';
import { Dropdown, Button, Spin, Space } from 'antd';
import { BackwardOutlined } from '@ant-design/icons';
import { FileImageOutlined, FilePdfOutlined, FileExcelOutlined, FileZipOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import useAxiosPrivate from 'hooks/useAxiosPrivate';
import { Tooltip } from '@material-ui/core';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';

const ViewAsn = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { asn } = useParams();
  const [asNumber, setAsNumber] = useState('');
  const [countryId, setCountryId] = useState('');
  const [countryName, setCountryName] = useState('');
  const [organization, setOrganization] = useState('');
  const [tableData, setTableData] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  const viewPrefix = (id) => {
    navigate(`/custom-prefix/asnumber/editprefix/${id}`);
  };

  const columns = [
    {
      field: 'no',
      headerName: 'No',
      width: 40
    },
    {
      headerName: 'Network',
      field: 'network',
      flex: 1.3
    },
    {
      headerName: 'City',
      field: 'city',
      flex: 1
    },
    {
      headerName: 'IP Reference',
      field: 'ip_ref',
      flex: 1.2
    },
    {
      headerName: 'IP Reverse',
      field: 'ip_ref_reverse',
      flex: 1.2
    },
    {
      headerName: 'Region Name',
      field: 'region_name',
      flex: 1.3
    },
    {
      headerName: 'Name',
      field: 'name',
      flex: 1
    }
  ];

  const handleBack = () => {
    navigate(`/custom-prefix/asnumber`);
  };

  // API GET DATA SITE
  useEffect(() => {
    const fetchData = async () => {
      const postData = { asn: asn };
      const accessToken = localStorage.getItem('access_token');
      try {
        const response = await axiosPrivate.post('/netflow-ui/asn/info', postData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        });

        setLoading(false);
        // console.log(response.data.asn_info);
        setAsNumber(response.data.asn_info.asn);
        setCountryId(response.data.asn_info.country_id);
        setCountryName(response.data.asn_info.country_name);
        setOrganization(response.data.asn_info.organization_name);
        // console.log(response.data.prefix_list);
        setTableData(response.data.prefix_list);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  // API DELETE PREFIX
  const deletePrefix = async (id) => {
    try {
      const accessToken = localStorage.getItem('access_token');

      const res = await axiosPrivate.delete('/netflow-ui/prefix', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        },
        data: {
          id: `${id}`
        }
      });

      // console.log('deleted clicked');
      if (res.status === 200) {
        toast.success('Deleted Successfuly.');
        setLoading(false);
        fetchData();
      } else {
        toast.error('Failed to delete user, please try again.');
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  // INI UNTUK PEMBUATAN NOMOR URUT SECARA OTOMATIS
  const addIndex = (array) => {
    return array.map((item, index) => {
      item.no = index + 1;
      return item;
    });
  };

  const downloadPDF = () => {
    // console.log('Download PDF');
    toast.error('PDF is not ready.');
  };
  const downloadExcel = () => {
    // console.log('Download Excel');
    toast.error('Excel is not ready.');
  };
  const downloadCSV = () => {
    // console.log('Download CSV');
    toast.error('CSV is not ready.');
  };
  const downloadChart = () => {
    // console.log('Download Chart');
    toast.error('Chart is not ready.');
  };

  const onMenuClick = async (e) => {
    const { key } = e;

    switch (key) {
      case '1':
        downloadChart();
        break;
      case '2':
        downloadPDF();
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

  const actionColumn = [
    {
      field: 'action',
      headerName: 'Action',
      width: 100,
      renderCell: (rowData) => {
        return (
          <>
            <div className="cellAction">
              <Tooltip title="Edit" arrow>
                <div className="viewButtonOperator">
                  <DriveFileRenameOutlineIcon className="viewIcon" onClick={() => viewPrefix(rowData.id)} />
                </div>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <div>
                  <Popconfirm
                    className="cellAction"
                    title="Delete Account"
                    description="Are you sure to delete this Prefix?"
                    onConfirm={() => deletePrefix(rowData.id)}
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

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHead">
            <h2>AS Number Info</h2>
            <Button type="primary" onClick={handleBack}>
              <BackwardOutlined />
              Back
            </Button>
          </div>
        </Grid>
        <Grid item xs={12} className="containerData">
          <table className="dataAsnumber">
            <tbody>
              <tr>
                <th>AS Number</th>
                <td>{asNumber}</td>
              </tr>
              <tr>
                <th>Country ID</th>
                <td>{countryId}</td>
              </tr>
              <tr>
                <th>County Name</th>
                <td>{countryName}</td>
              </tr>
              <tr>
                <th>Organization</th>
                <td>{organization}</td>
              </tr>
            </tbody>
          </table>
        </Grid>
        <Grid item xs={12}>
          <div className="containerTable">
            <h3>Table Prefix List</h3>
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
              <DataGrid
                columns={columns.concat(actionColumn)}
                rows={addIndex(tableData)}
                getRowId={(row) => row.id}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 }
                  }
                }}
                pageSizeOptions={[5, 10, 50, 100]}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ViewAsn;
