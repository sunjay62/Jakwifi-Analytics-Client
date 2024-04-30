import React, { useState, useEffect } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Spin, Space } from 'antd';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { DataGrid } from '@mui/x-data-grid';
import { Tooltip } from '@material-ui/core';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Popconfirm } from 'antd';
import './listprefix.scss';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from 'hooks/useAxiosPrivate';

const ListPrefix = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  const viewSite = (id) => {
    navigate(`/custom-prefix/list-prefix/update-prefix/${id}`);
  };

  const handleAdd = () => {
    navigate(`/custom-prefix/group-prefix/add-prefix`);
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
        const res = await axiosPrivate.get('/netflow-ui/prefix', {
          headers
        });
        setLoading(false);
        setUsers(res.data.data);
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
      width: 50
    },
    { field: 'as_number', headerName: 'AS Number', flex: 0.8 },
    { field: 'name', headerName: 'Name', flex: 1.1 },
    { field: 'network', headerName: 'Network', flex: 1 },
    { field: 'region_name', headerName: 'Region Name', flex: 1 },
    { field: 'ip_ref', headerName: 'IP Reference', flex: 1 },
    { field: 'ip_ref_reverse', headerName: 'IP Reverse', flex: 1 }
  ];

  // API DELETE DATA SITE
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

      if (res.status === 200) {
        toast.success('Deleted Successfully.');
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

        const response = await axiosPrivate.get('/netflow-ui/prefix', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        });
        setLoading(false);
        setUsers(response.data.data);
        // console.log(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const actionColumn = [
    {
      field: 'action',
      headerName: 'Action',
      width: 100,
      renderCell: (rowData) => {
        // console.log(rowData);
        return (
          <>
            <div className="cellAction">
              <Tooltip title="View" arrow>
                <div className="viewButtonOperator">
                  <PageviewOutlinedIcon className="viewIcon" onClick={() => viewSite(rowData.id)} />
                </div>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <div>
                  <Popconfirm
                    className="cellAction"
                    title="Delete Account"
                    description={`Are you sure to delete AS Number: ${rowData.id}?`}
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

  // INI UNTUK PEMBUATAN NOMOR URUT SECARA OTOMATIS
  const addIndex = (array) => {
    return array.map((item, index) => {
      item.no = index + 1;
      return item;
    });
  };

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} className="gridButton">
          <div className="containerHeadAccount">
            <h2>Table Prefix List</h2>
            <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleAdd}>
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
              getRowId={(row) => row.id}
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

export default ListPrefix;
