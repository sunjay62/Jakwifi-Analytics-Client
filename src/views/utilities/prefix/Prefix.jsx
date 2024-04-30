import React, { useState, useEffect, useRef } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Spin, Space } from 'antd';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { DataGrid } from '@mui/x-data-grid';
import { Tooltip } from '@material-ui/core';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Popconfirm } from 'antd';
import './prefix.scss';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from 'hooks/useAxiosPrivate';

const Prefix = () => {
  const [name, setName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const formRef = useRef(null);
  const [nameEdit, setNameEdit] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState('');
  const [editedRowData, setEditedRowData] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    handleSubmit();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const viewSite = (id) => {
    navigate(`/custom-prefix/group-prefix/viewprefix/${id}`);
  };

  const handleNameChange = (event) => {
    const value = event.target.value;
    setName(value);
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
        const res = await axiosPrivate.get('/netflow-ui/prefix/groupname', {
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

  // INI API UNTUK CREATE AS NUMBER
  const handleSubmit = async () => {
    const postData = { name: name };
    const accessToken = localStorage.getItem('access_token');

    try {
      const response = await axiosPrivate.post('/netflow-ui/prefix/groupname', postData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        }
      });

      if (response.status === 200) {
        setName('');
        setLoading(false);
        toast.success('Created Successfully.');
        getApi();
        setIsModalOpen(false);
      } else if (response.status === 409) {
        toast.error('AS Number already exists.');
      } else {
        setError('Failed to register, please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      setError('Failed to register, please try again.');
    }
  };

  const columnSites = [
    {
      field: 'no',
      headerName: 'No',
      width: 70
    },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'prefix_registerd', headerName: 'Prefix Registered', flex: 1 }
  ];

  // API DELETE DATA SITE
  const deleteAccount = async (id) => {
    try {
      const accessToken = localStorage.getItem('access_token');

      const res = await axiosPrivate.delete('/netflow-ui/prefix/groupname', {
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

        const response = await axiosPrivate.get('/netflow-ui/prefix/groupname', {
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

  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

  const showModalEdit = (rowData) => {
    setEditedRowData(rowData);
    setId(rowData.id); // Memperbarui ID saat modal edit ditampilkan
    setIsModalOpenEdit(true);
  };

  const handleOkEdit = () => {
    setIsModalOpenEdit(false);
    setNameEdit('');
  };

  const handleCancelEdit = () => {
    setIsModalOpenEdit(false);
    setNameEdit('');
  };

  const handleIdChangeEdit = (event) => {
    setId(event.target.value);
  };

  const handleNameChangeEdit = (event) => {
    const newName = event.target.value;
    setNameEdit(newName);
  };

  // INI UNTUK GET DATA UPDATE
  useEffect(() => {
    if (editedRowData) {
      const accessToken = localStorage.getItem('access_token');

      axiosPrivate
        .get(`/netflow-ui/prefix/groupname`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        })
        .then((res) => {
          setLoading(false);
          const dataArray = res.data.data;
          const editedItem = dataArray.find((item) => item.id === editedRowData.id); // Menemukan baris yang sesuai dengan editedRowData
          setId(editedItem.id); // Memperbarui ID dengan ID yang sesuai
          setNameEdit(editedItem.name); // Memperbarui nameEdit dengan name yang sesuai
        })
        .catch((err) => console.log(err));
    }
  }, [editedRowData]);

  const updatePrefixName = async (id, newName) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axiosPrivate.put(
        `/netflow-ui/prefix/groupname`,
        {
          id,
          name: newName
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        }
      );

      if (response.status === 200) {
        toast.success('Updated Successfully.');
        setLoading(false);
        getApi();
        handleOkEdit();
        setNameEdit('');
      } else {
        toast.error('Failed to update, please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error('Failed to update, please try again.');
    }
  };

  const handleSubmitUpdate = (event) => {
    event.preventDefault();

    // console.log('Submitting with NameEdit:', nameEdit);
    // console.log('Updating ID:', id);

    updatePrefixName(id, nameEdit);
  };

  const actionColumn = [
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (rowData) => {
        // console.log(rowData);
        return (
          <>
            <div className="cellAction">
              <Tooltip title="Edit" arrow>
                <div className="editButtonOperator">
                  <DriveFileRenameOutlineIcon className="editIcon" onClick={() => showModalEdit(rowData.row)} />
                </div>
              </Tooltip>
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
    return array.map((item, index) => {
      item.no = index + 1;
      return item;
    });
  };

  // Layout Form Input

  const layout = {
    labelCol: {
      span: 5,
      style: {
        textAlign: 'left'
      }
    },
    wrapperCol: {
      span: 18
    }
  };

  return (
    <MainCard>
      <ToastContainer />
      <Modal
        centered
        onOk={handleOk}
        onCancel={handleCancel}
        open={isModalOpen}
        width={700}
        className="containerModal"
        style={{
          left: 120,
          top: 40
        }}
      >
        <h2>Input New Group Name</h2>
        <Form {...layout} name="nest-messages" ref={formRef}>
          <Form.Item
            label="Prefix Name"
            rules={[
              {
                required: true,
                message: 'Please input the AS Number!'
              }
            ]}
          >
            <Input value={name} onChange={handleNameChange} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Awal untuk modal edit */}

      <Modal title="Edit Group Prefix" centered open={isModalOpenEdit} onOk={handleSubmitUpdate} onCancel={handleCancelEdit}>
        <Form
          {...layout}
          name="nest-messages"
          style={{
            maxWidth: 600,
            marginTop: 25
          }}
        >
          <Form.Item
            label="ID Site"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input type="text" value={editedRowData ? editedRowData.id : ''} onChange={handleIdChangeEdit} disabled />
          </Form.Item>
          <Form.Item
            label="Current Name"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input type="text" value={editedRowData ? editedRowData.name : ''} onChange={handleNameChangeEdit} disabled />
          </Form.Item>
          <Form.Item
            label="Change Name"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input type="text" value={nameEdit} onChange={handleNameChangeEdit} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Akhir untuk modal edit */}

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} className="gridButton">
          <div className="containerHeadAccount">
            <h2>Group Name List</h2>
            <Button type="primary" icon={<PlusCircleOutlined />} onClick={showModal}>
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

export default Prefix;
