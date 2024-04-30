import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './prefixnew.scss';
import MainCard from 'ui-component/cards/MainCard';
import useAxiosPrivate from 'hooks/useAxiosPrivate';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { Button, Form, Input } from 'antd';
import { BackwardOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { toast } from 'react-toastify';
import { SearchOutlined } from '@ant-design/icons';

const PrefixNew = () => {
  const navigate = useNavigate();
  const [asn, setAsn] = useState('');
  const [groupId, setGroupId] = useState('');
  const [city, setCity] = useState('');
  const [ipRef, setIpRef] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [network, setNetwork] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [regionName, setRegionName] = useState('');
  const [version, setVersion] = useState('');
  const [sites, setSites] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  const handleBack = () => {
    navigate(`/custom-prefix/list-prefix`);
  };

  // get data
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('access_token');

      try {
        const response = await axiosPrivate.get('/netflow-ui/prefix/groupname', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        });

        const data = response.data.data;
        // console.log(data);
        const siteOptions = data.map((item) => ({
          value: item.id,
          label: item.name
        }));
        setSites(siteOptions);
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');

    const postData = {
      as_number: asn,
      city: city,
      group_id: groupId,
      ip_ref: ipRef,
      latitude: latitude,
      longitude: longitude,
      network: network,
      region_code: regionCode,
      region_name: regionName,
      version: version
    };

    // Remove properties with null values
    const filteredPrefixData = {};
    for (const key in postData) {
      if (postData[key] !== null) {
        filteredPrefixData[key] = postData[key];
      }
    }

    axiosPrivate
      .post('/netflow-ui/prefix', filteredPrefixData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        }
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success('Created Successfully.');
        } else {
          setError('Failed to update, please try again.');
        }
      })
      .catch((err) => console.log(err));
  };

  const handleAsn = (event) => {
    const value = event.target.value;
    setAsn(value);
  };
  const handleCity = (event) => {
    const value = event.target.value;
    setCity(value);
  };

  const handleGroup = (value) => {
    setGroupId(value);
  };
  const handleIpRef = (event) => {
    const value = event.target.value;
    setIpRef(value);
  };
  const handleLatitude = (event) => {
    const value = event.target.value;
    setLatitude(value);
  };
  const handleLongitude = (event) => {
    const value = event.target.value;
    setLongitude(value);
  };
  const handleNetwork = (event) => {
    const value = event.target.value;
    setNetwork(value);
  };
  const handleRegionCode = (event) => {
    const value = event.target.value;
    setRegionCode(value);
  };
  const handleRegionName = (event) => {
    const value = event.target.value;
    setRegionName(value);
  };
  const handleVersion = (event) => {
    const value = event.target.value;
    setVersion(value);
  };

  // INI API UNTUK AUTO FILL CREATE PREFIX
  const handleAutoFill = async () => {
    const postData = { network: network };
    try {
      const response = await axiosPrivate.post('/netflow-ui/prefix/info/network', postData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        toast.success('Auto Fill Successfully.');
      }

      //   console.log(response);
      setAsn(response.data.as_number);
      setCity(response.data.city);
      setIpRef(response.data.ip_ref);
      setLatitude(response.data.latitude);
      setLongitude(response.data.longitude);
      setRegionCode(response.data.region_code);
      setRegionName(response.data.region_name);
      setVersion(response.data.version);
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 409) {
          toast.error('AS Number already exists.');
        } else if (statusCode === 422) {
          toast.error('Please Input AS Number.');
        } else {
          toast.error('Failed to register, please try again.');
        }
      } else {
        toast.error('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHeadEditPrefix">
            <h2>Create New Prefix</h2>
            <Button type="primary" onClick={handleBack}>
              <BackwardOutlined />
              Back
            </Button>
          </div>
        </Grid>
        <Grid item xs={12} className="containerBottomEditPrefix">
          <div className="EditPrefixRight">
            <div className="rightMiddle">
              <Form>
                <div className="input">
                  <label htmlFor="network">Network :</label>
                  <div className="autoFillContainer">
                    <Input value={network} id="network" onChange={handleNetwork} />
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleAutoFill}>
                      Auto Fill
                    </Button>
                  </div>
                </div>
                <div className="input">
                  <label htmlFor="id">AS Number:</label>
                  <Input id="id" value={asn} onChange={handleAsn} />
                </div>

                <div className="input">
                  <label htmlFor="city">City :</label>
                  <Input value={city} id="city" onChange={handleCity} />
                </div>
                <div className="input">
                  <label htmlFor="group_id">Group Prefix :</label>
                  <Select
                    className="selectSites"
                    showSearch
                    placeholder="Select Group"
                    optionFilterProp="children"
                    onChange={handleGroup}
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    options={sites}
                  />
                </div>
                <div className="input">
                  <label htmlFor="latitude">Latitude :</label>
                  <Input value={latitude} id="latitude" onChange={handleLatitude} />
                </div>
                <div className="input">
                  <label htmlFor="longitude">Longitude :</label>
                  <Input value={longitude} id="longitude" onChange={handleLongitude} />
                </div>
                <div className="input">
                  <label htmlFor="region_code">Region Code :</label>
                  <Input value={regionCode} id="region_code" onChange={handleRegionCode} />
                </div>
                <div className="input">
                  <label htmlFor="region_name">Region Name :</label>
                  <Input value={regionName} id="region_name" onChange={handleRegionName} />
                </div>
                <div className="input">
                  <label htmlFor="ip_ref">IP Reference :</label>
                  <Input value={ipRef} id="ip_ref" onChange={handleIpRef} />
                </div>
                <div className="input">
                  <label htmlFor="region_name">Version :</label>
                  <Input value={version} id="region_name" onChange={handleVersion} />
                </div>
                <div className="submitBtn">
                  <Button onClick={handleSubmit}>Create Prefix</Button>
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

export default PrefixNew;
