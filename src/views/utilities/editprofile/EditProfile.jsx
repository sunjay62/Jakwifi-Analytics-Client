import React, { useState, useEffect } from 'react';
import './editprofile.scss';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { Button, Checkbox, Form, Input, Select } from 'antd';
import useAxiosPrivate from 'hooks/useAxiosPrivate';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

const EditProfile = () => {
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
  const { id } = useParams();
  const [componentDisabled, setComponentDisabled] = useState(false);
  const [passwordDisabled, setPasswordDisabled] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { Option } = Select;
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordDisabled, setShowPasswordDisabled] = useState(true);

  useEffect(() => {
    setShowPasswordDisabled(passwordDisabled);
  }, [passwordDisabled]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // GET DATA
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    axiosPrivate
      .get(`/admin?id=${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        }
      })
      .then((res) => {
        // console.log(res.data);
        setFullname(res.data.fullname);
        setEmail(res.data.email);
        setPassword(res.data.password);
        setActive(res.data.active);
        setStatusValue(res.data.active ? 'Active' : 'Disable');
        setPerm_Admin(res.data.perm_admin);
        setPerm_AdminValue(res.data.perm_admin ? 'Active' : 'Disable');
        setPerm_Data(res.data.perm_data);
        setPerm_DataValue(res.data.perm_data ? 'Active' : 'Disable');
        setPerm_Groupname(res.data.perm_groupname);
        setPerm_GroupnameValue(res.data.perm_groupname ? 'Active' : 'Disable');
        setPerm_Prefix(res.data.perm_prefix);
        setPerm_PrefixValue(res.data.perm_prefix ? 'Active' : 'Disable');
        setPerm_Sites(res.data.perm_sites);
        setPerm_SitesValue(res.data.perm_sites ? 'Active' : 'Disable');
      })
      .catch((err) => console.log(err));
  }, [id]);

  // UPDATE DATA
  const handleSubmit = (event) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');

    const updatedPassword = (password && password.trim()) || '';

    let updatedFullname = fullname && fullname.trim();
    let updatedEmail = email && email.trim();

    // Cek apakah ada perubahan pada fullname dan email
    const isFullnameChanged = updatedFullname !== fullname;
    const isEmailChanged = updatedEmail !== email;

    // Jika tidak ada perubahan pada fullname, atur menjadi null
    if (!isFullnameChanged) {
      updatedFullname = '';
    }

    // Jika tidak ada perubahan pada email, atur menjadi null
    if (!isEmailChanged) {
      updatedEmail = '';
    }

    const updatedUserData = {
      id,
      fullname: updatedFullname,
      email: updatedEmail,
      password: updatedPassword,
      active,
      perm_admin,
      perm_groupname,
      perm_prefix,
      perm_sites,
      perm_data
    };

    console.log('Data being sent:', updatedUserData);

    axiosPrivate
      .put(`/admin`, updatedUserData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        }
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success('Updated Successfully.');
          setTimeout(() => {
            navigate(`/account/list-account`);
          }, 1000);
        } else {
          setError('Failed to update, please try again.');
        }
      })
      .catch((err) => console.log(err));
  };

  const handleNameChange = (event) => {
    setFullname(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
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
          <div className="containerHeadEditProfile">
            <h2>Edit Profile</h2>
            <Button type="primary" onClick={toListAccount}>
              Back
            </Button>
          </div>
        </Grid>
        <Grid item xs={12} className="containerBottomEditProfile">
          <div className="EditProfileRight">
            <div className="rightMiddle">
              <div className="rightTop">
                <h3>
                  <Checkbox checked={componentDisabled} onChange={(e) => setComponentDisabled(e.target.checked)}>
                    Edit Profile
                  </Checkbox>
                </h3>
              </div>
              <Form disabled={!componentDisabled}>
                <div className="input">
                  <label htmlFor="id">ID :</label>
                  <Input id="id" value={id} disabled />
                </div>
                <div className="input">
                  <label htmlFor="fullname">Full Name :</label>
                  <Input id="fullname" value={fullname} onChange={handleNameChange} />
                </div>
                <div className="input">
                  <label htmlFor="email">Email :</label>
                  <Input id="email" value={email} onChange={handleEmailChange} />
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
                <div className="input">
                  <Checkbox checked={passwordDisabled} onChange={(e) => setPasswordDisabled(e.target.checked)}>
                    Edit Password :
                  </Checkbox>
                  <Input.Password
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={!showPasswordDisabled}
                    iconRender={(visible) =>
                      visible ? (
                        <EyeOutlined onClick={togglePasswordVisibility} />
                      ) : (
                        <EyeInvisibleOutlined onClick={togglePasswordVisibility} />
                      )
                    }
                  />
                </div>
                <div className="submitBtn">
                  <Button onClick={handleSubmit}>Save Profile</Button>
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

export default EditProfile;
