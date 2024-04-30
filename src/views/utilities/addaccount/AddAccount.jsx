import React, { useState } from 'react';
import './addaccount.scss';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { Button, Form, Input, Select } from 'antd';
import useAxiosPrivate from 'hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

const AddAccount = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(false);
  const [statusValue, setStatusValue] = useState(active ? 'Active' : 'Disable');
  const [perm_admin, setPerm_Admin] = useState(false);
  const [perm_adminValue, setPerm_AdminValue] = useState(perm_admin ? 'Active' : 'Disable');
  const [perm_data, setPerm_Data] = useState(false);
  const [perm_dataValue, setPerm_DataValue] = useState(perm_data ? 'Active' : 'Disable');
  const [perm_groupname, setPerm_Groupname] = useState(false);
  const [perm_groupnameValue, setPerm_GroupnameValue] = useState(perm_groupname ? 'Active' : 'Disable');
  const [perm_prefix, setPerm_Prefix] = useState(false);
  const [perm_prefixValue, setPerm_PrefixValue] = useState(perm_prefix ? 'Active' : 'Disable');
  const [perm_sites, setPerm_Sites] = useState(false);
  const [perm_sitesValue, setPerm_SitesValue] = useState(perm_sites ? 'Active' : 'Disable');

  const { Option } = Select;
  const [showPassword, setShowPassword] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');
    const addUserData = { fullname, email, password, active, perm_admin, perm_data, perm_groupname, perm_prefix, perm_sites };
    console.log('Data being sent:', addUserData);
    axiosPrivate
      .post(`/admin`, addUserData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        }
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success('Created Successfully.');
          setTimeout(() => {
            navigate(`/account/list-account`);
          }, 1000);
        } else {
          setError('Failed to update, please try again.');
        }
      })
      .catch((err) => console.log(err));
  };

  const handleName = (event) => {
    setFullname(event.target.value);
  };

  const handleEmail = (event) => {
    setEmail(event.target.value);
  };

  const handlePassword = (event) => {
    setPassword(event.target.value);
  };

  const handleStatus = (value) => {
    setStatusValue(value);
    setActive(value === true);
  };

  const handleAdmin = (value) => {
    setPerm_AdminValue(value);
    setPerm_Admin(value === true);
  };

  const handleData = (value) => {
    setPerm_DataValue(value);
    setPerm_Data(value === true);
  };

  const handleGroupname = (value) => {
    setPerm_GroupnameValue(value);
    setPerm_Groupname(value === true);
  };

  const handlePrefix = (value) => {
    setPerm_PrefixValue(value);
    setPerm_Prefix(value === true);
  };

  const handleSites = (value) => {
    setPerm_SitesValue(value);
    setPerm_Sites(value === true);
  };

  const toListAccount = () => {
    navigate('/account/list-account');
  };

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHeadCreateAccount">
            <h2>Create Account</h2>
            <h3>
              <Button type="primary" onClick={toListAccount}>
                Back
              </Button>
            </h3>
          </div>
        </Grid>
        <Grid item xs={12} className="containerCreateAccount">
          <div className="EditProfileRight">
            <div className="rightTop"></div>
            <div className="rightMiddle">
              <Form>
                <div className="input">
                  <label htmlFor="fullname">Full Name :</label>
                  <Input id="fullname" value={fullname} onChange={handleName} />
                </div>
                <div className="input">
                  <label htmlFor="email">Email :</label>
                  <Input id="email" value={email} onChange={handleEmail} />
                </div>
                <div className="input">
                  <label htmlFor="password">Password :</label>
                  <Input.Password
                    id="password"
                    value={password}
                    onChange={handlePassword}
                    iconRender={(visible) =>
                      visible ? (
                        <EyeOutlined onClick={togglePasswordVisibility} />
                      ) : (
                        <EyeInvisibleOutlined onClick={togglePasswordVisibility} />
                      )
                    }
                  />
                </div>
                <div className="input">
                  <label htmlFor="status">Status :</label>
                  <Select id="status" value={statusValue} onChange={handleStatus}>
                    <Option value={true}>Active</Option>
                    <Option value={false}>Disable</Option>
                  </Select>
                </div>
                <div className="input">
                  <label htmlFor="status">Administrator :</label>
                  <Select id="status" value={perm_adminValue} onChange={handleAdmin}>
                    <Option value={true}>Active</Option>
                    <Option value={false}>Disable</Option>
                  </Select>
                </div>
                <div className="input">
                  <label htmlFor="status">Data Access :</label>
                  <Select id="status" value={perm_dataValue} onChange={handleData}>
                    <Option value={true}>Active</Option>
                    <Option value={false}>Disable</Option>
                  </Select>
                </div>
                <div className="input">
                  <label htmlFor="status">Group Name Access :</label>
                  <Select id="status" value={perm_groupnameValue} onChange={handleGroupname}>
                    <Option value={true}>Active</Option>
                    <Option value={false}>Disable</Option>
                  </Select>
                </div>
                <div className="input">
                  <label htmlFor="status">Prefix Access :</label>
                  <Select id="status" value={perm_prefixValue} onChange={handlePrefix}>
                    <Option value={true}>Active</Option>
                    <Option value={false}>Disable</Option>
                  </Select>
                </div>
                <div className="input">
                  <label htmlFor="status">Sites Access :</label>
                  <Select id="status" value={perm_sitesValue} onChange={handleSites}>
                    <Option value={true}>Active</Option>
                    <Option value={false}>Disable</Option>
                  </Select>
                </div>
                <div className="submitBtn">
                  <Button onClick={handleSubmit}>Create Account</Button>
                </div>
              </Form>
            </div>
            <div className="rightBottom"></div>
          </div>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default AddAccount;
