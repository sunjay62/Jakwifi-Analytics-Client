import React, { useState, useEffect } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Spin, Space } from 'antd';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { DataGrid } from '@mui/x-data-grid';
import { Tooltip } from '@material-ui/core';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Popconfirm } from 'antd';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import './account.scss';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const [users, setUsers] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const Edit = (id) => {
    navigate(`/edit/profile/${id}`);
  };

  const CreateAccount = () => {
    navigate(`/account/create-account`);
  };

  // FUNGSI UNTUK UPDATE DATA SETELAH ACTION
  function getApi() {
    const accessToken = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: accessToken
    };
    const fetchAllUsers = async () => {
      try {
        const res = await axiosPrivate.get('/admin', {
          headers
        });
        setLoading(false);
        setUsers(res.data);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchAllUsers();
  }

  const columnSites = [
    {
      field: 'no',
      headerName: 'No',
      width: 70
    },
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'fullname', headerName: 'Full Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.3 },
    {
      field: 'active',
      headerName: 'Status',
      flex: 0.7,
      valueGetter: (params) => (params.value ? 'Active' : 'Disable')
    }

    // ini contoh kalo pengen dapetin value dari 2 row di jadikan satu
    // {
    //   field: 'fullName',
    //   headerName: 'Full name',
    //   description: 'This column has a value getter and is not sortable.',
    //   sortable: false,
    //   width: 160,
    //   valueGetter: (params) => `${params.row.name || ''} ${params.row.lastName || ''}`
    // }
  ];

  // API DELETE DATA SITE
  const deleteAccount = async (id) => {
    try {
      const accessToken = localStorage.getItem('access_token');

      const res = await axiosPrivate.delete('/admin', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        },
        data: {
          id: `${id}`
        }
      });

      if (res.status === 200) {
        toast.success('Deleted Successfuly.');
        setLoading(false);
        getApi();
      } else {
        toast.error('Failed to delete user, please try again.');
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  // API GET DATA SITE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');

        const response = await axiosPrivate.get('/admin', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        });

        setLoading(false);
        setUsers(response.data);
        // console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  // INI UNTUK UPDATE DATA
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
                  <DriveFileRenameOutlineIcon className="viewIcon" onClick={() => Edit(rowData.id)} />
                </div>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <div>
                  <Popconfirm
                    className="cellAction"
                    title="Delete Account"
                    description="Are you sure to delete this Account?"
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
    return (array || []).map((item, index) => {
      item.no = index + 1;
      return item;
    });
  };

  return (
    <MainCard>
      <ToastContainer />
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} className="gridButton">
          <div className="containerHeadAccount">
            <h2>List Account</h2>
            <Button type="primary" icon={<PlusCircleOutlined />} onClick={CreateAccount}>
              Add New
            </Button>
          </div>
        </Grid>
        <Grid item xs={12}>
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
            <DataGrid
              columns={columnSites.concat(actionColumn)}
              rows={addIndex(users)}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 }
                }
              }}
              pageSizeOptions={[5, 10, 50, 100]}
            />
          )}
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Account;
