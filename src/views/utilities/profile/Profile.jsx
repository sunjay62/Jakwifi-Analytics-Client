import React, { useState, useEffect, useRef } from 'react';
import './profile.scss';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { Button, Checkbox, Form, Input } from 'antd';
import useAxiosPrivate from 'hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import jwt_decode from 'jwt-decode';

const Profile = () => {
  const [componentDisabled, setComponentDisabled] = useState(false);
  const [passwordDisabled, setPasswordDisabled] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [active, setActive] = useState('');
  const [password, setPassword] = useState('');
  const userRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordDisabled, setShowPasswordDisabled] = useState(true);

  useEffect(() => {
    setShowPasswordDisabled(passwordDisabled);
  }, [passwordDisabled]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');

    if (accessToken) {
      const decodedToken = jwt_decode(accessToken);
      setActive(decodedToken.active);
      setEmail(decodedToken.email);
      setFullname(decodedToken.fullname);
      setId(decodedToken.id);
    }
  }, []);

  // UPDATE DATA
  const handleSubmit = (event) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');
    const updatedUserData = { id, fullname, email, password };
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
          userRef.current = updatedUserData;
          setEmail(updatedUserData.email);
          setFullname(updatedUserData.fullname);
          setId(updatedUserData.id);
          setActive(updatedUserData.active);
          localStorage.setItem('user', JSON.stringify(response.data));
        } else {
          toast.error('Failed to update, please try again.');
        }
      })
      .catch((err) => {
        toast.error('Failed to update, please try again.');
        console.log(err);
      });
  };

  const handleNameChangeEdit = (event) => {
    setFullname(event.target.value);
  };

  const handleEmailChangeEdit = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChangeEdit = (event) => {
    setPassword(event.target.value);
  };

  const toHome = () => {
    navigate('/home');
  };

  return (
    <MainCard>
      <ToastContainer />
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHeadProfile">
            <h2>Setting Profile</h2>
          </div>
        </Grid>

        <Grid item xs={12} className="containerBottomProfile">
          <div className="profileLeft">
            <div className="imgContainer"></div>
            <p>{fullname}</p>
            <p>{id}</p>
          </div>
          <div className="profileRight">
            <div className="rightTop">
              <h3>
                <button onClick={toHome}>
                  <KeyboardBackspaceIcon />
                  <span>Back to Home</span>
                </button>
              </h3>
              <h3>
                <Checkbox checked={componentDisabled} onChange={(e) => setComponentDisabled(e.target.checked)}>
                  Edit Profile
                </Checkbox>
              </h3>
            </div>
            <div className="rightMiddle">
              <Form disabled={!componentDisabled}>
                <div className="input">
                  <label htmlFor="id">ID :</label>
                  <Input id="id" value={id} disabled />
                </div>
                <div className="input">
                  <label htmlFor="fullname">Full Name :</label>
                  <Input id="fullname" value={fullname} onChange={handleNameChangeEdit} />
                </div>
                <div className="input">
                  <label htmlFor="email">Email :</label>
                  <Input id="email" value={email} onChange={handleEmailChangeEdit} />
                </div>
                <div className="input">
                  <label htmlFor="status">Status :</label>
                  <Input id="status" value={active ? 'Active' : 'Disable'} disabled />
                </div>
                <div className="input">
                  <Checkbox checked={passwordDisabled} onChange={(e) => setPasswordDisabled(e.target.checked)}>
                    Edit Password :
                  </Checkbox>
                  <Input.Password
                    id="password"
                    value={password}
                    onChange={handlePasswordChangeEdit}
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

export default Profile;
