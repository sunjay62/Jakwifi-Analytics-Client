import React, { useState, useEffect, useRef } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Spin, Space } from 'antd';
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
import axiosNew from '../../../api/axiosNew';
import './site.scss';

const Sites = () => {
  const [name, setName] = useState('');
  const [idData, setIdData] = useState('');
  const [ip, setIp] = useState('');
  const [nameEdit, setNameEdit] = useState('');
  const [id, setId] = useState('');
  const [ipEdit, setIpEdit] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const formRef = useRef(null); // Buat referensi untuk form instance
  const [idDataValid, setIdDataValid] = useState(false);
  const [nameValid, setNameValid] = useState(false);
  const [ipValid, setIpValid] = useState(false);
  const [loading, setLoading] = useState(true);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (!idDataValid || !nameValid || !ipValid || !name || !idData || !ip) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (formRef.current) {
      formRef.current.submit();
    }

    handleSubmit();
    setIsModalOpen(false);
  };

  const handleIdChange = (event) => {
    const value = event.target.value;
    setIdData(value);
    setIdDataValid(!!value); // Set status validasi menjadi true jika value tidak kosong
  };

  const handleNameChange = (event) => {
    const value = event.target.value;
    setName(value);
    setNameValid(!!value); // Set status validasi menjadi true jika value tidak kosong
  };

  // Fungsi untuk memeriksa apakah nilai IP valid sebagai alamat IPv4
  const isIPv4Valid = (value) => {
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    return ipPattern.test(value);
  };

  const handleIpChange = (event) => {
    const value = event.target.value;
    setIp(value);
    setIpValid(isIPv4Valid(value));
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setName('');
    setIdData('');
    setIp('');
  };

  //INI UNTUK MODAL EDIT TEMPLATE
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

  const showModalEdit = (id) => {
    setId(id);
    setIsModalOpenEdit(true);
  };

  const handleOkEdit = () => {
    setIsModalOpenEdit(false);
  };

  const handleCancelEdit = () => {
    setIsModalOpenEdit(false);
  };

  const handleIdChangeEdit = (event) => {
    setId(event.target.value);
  };
  const handleNameChangeEdit = (event) => {
    setNameEdit(event.target.value);
  };
  const handleIpChangeEdit = (event) => {
    setIpEdit(event.target.value);
  };

  // INI UNTUK GET DATA UPDATE

  useEffect(() => {
    axiosNew
      .get(`/site/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        console.log(res.data);
        setLoading(false);
        setId(res.data.id);
        setNameEdit(res.data.name);
        setIpEdit(res.data.public_ip);
      })
      .catch((err) => console.log(err));
  }, [id]);

  const handleSubmitUpdate = (event) => {
    event.preventDefault();

    const updatedUserData = {
      id,
      name: nameEdit,
      public_ip: ipEdit
    };
    axiosNew
      .put(`/site`, updatedUserData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success('Updated Successfully.');
          setLoading(false);
          getApi();
          handleOkEdit();
        } else {
          setError('Failed to update, please try again.');
        }
      })
      .catch((err) => console.log(err));
  };

  // FUNGSI UNTUK UPDATE DATA SETELAH ACTION

  function getApi() {
    const accessToken = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `${accessToken}`
    };
    const fetchAllUsers = async () => {
      try {
        // console.log(token);

        const res = await axiosNew.get('/site', {
          headers
        });
        setLoading(false);
        setUsers(res.data.data);
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    };
    fetchAllUsers();
  }

  // INI API UNTUK CREATE NEW SITE

  const handleSubmit = async () => {
    // Jika validasi sukses, lanjutkan dengan menyimpan data
    const postData = { name: name, id: idData, public_ip: ip };
    try {
      const response = await axiosNew.post('/site', postData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      //   console.log(response.status);

      if (response.status === 200) {
        setName('');
        setIdData('');
        setLoading(false);
        setIp('');
        toast.success('Registered Successfully.');
        getApi();
      } else if (response.status === 409) {
        toast.error('User already exists.');
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
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'name', headerName: 'Site Name', flex: 3 },
    { field: 'public_ip', headerName: 'IP Public', flex: 1 }

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
      const token = localStorage.getItem('access_token');

      const res = await axiosNew.delete('/site', {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosNew.get('/site', {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // console.log(response.data);
        setLoading(false);
        setUsers(response.data.data);
        // isMounted && setUsers(response.data.data);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    fetchData();
  }, []);

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
      <Modal title="Edit JakWiFi Site" centered open={isModalOpenEdit} onOk={handleSubmitUpdate} onCancel={handleCancelEdit}>
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
            <Input type="text" value={id} onChange={handleIdChangeEdit} />
          </Form.Item>
          <Form.Item
            label="Name Site"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input type="text" value={nameEdit} onChange={handleNameChangeEdit} />
          </Form.Item>
          <Form.Item
            label="IP Public"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input type="text" value={ipEdit} onChange={handleIpChangeEdit} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Input New Site" centered onOk={handleOk} onCancel={handleCancel} open={isModalOpen}>
        <Form
          {...layout}
          name="nest-messages"
          ref={formRef} // Menghubungkan formRef dengan Form instance
          style={{
            maxWidth: 600,
            marginTop: 25
          }}
        >
          <Form.Item
            label="ID Site"
            rules={[
              {
                required: true,
                message: 'Please input the ID Site!'
              }
            ]}
            validateStatus={!idDataValid ? 'error' : ''}
            help={!idDataValid ? 'ID Site is required!' : ''}
          >
            <Input value={idData} onChange={handleIdChange} />
          </Form.Item>
          <Form.Item
            label="Name Site"
            rules={[
              {
                required: true,
                message: 'Please input the Name Site!'
              }
            ]}
            validateStatus={!nameValid ? 'error' : ''}
            help={!nameValid ? 'Name Site is required!' : ''}
          >
            <Input value={name} onChange={handleNameChange} />
          </Form.Item>
          <Form.Item
            label="IP Public"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  if (isIPv4Valid(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Please input a valid IPv4 address!'));
                }
              }
            ]}
            validateStatus={!ipValid ? 'error' : ''}
            help={!ipValid ? 'IP Public is required and must be a valid IPv4 address!' : ''}
          >
            <Input style={{ width: '50%' }} value={ip} onChange={handleIpChange} />
          </Form.Item>
        </Form>
      </Modal>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHead">
            <h2>JakWifi All Sites</h2>
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

export default Sites;
