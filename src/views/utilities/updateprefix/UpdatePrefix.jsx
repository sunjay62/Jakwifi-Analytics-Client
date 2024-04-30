import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './updateprefix.scss';
import MainCard from 'ui-component/cards/MainCard';
import useAxiosPrivate from 'hooks/useAxiosPrivate';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { Button, Form, Input } from 'antd';
import { BackwardOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { toast } from 'react-toastify';

const UpdatePrefix = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asn, setAsn] = useState('');
  const [countryId, setCountryId] = useState('');
  const [countryName, setCountryName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [city, setCity] = useState('');
  const [ipRef, setIpRef] = useState('');
  const [ipRev, setIprev] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [name, setName] = useState('');
  const [network, setNetwork] = useState('');
  const [organization, setOrganization] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [regionName, setRegionName] = useState('');
  const [version, setVersion] = useState('');
  const [sites, setSites] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  const handleBack = () => {
    navigate(`/custom-prefix/list-prefix`);
  };

  // API GET DATA SITE
  useEffect(() => {
    const fetchData = async () => {
      const postData = { id: id };
      const accessToken = localStorage.getItem('access_token');
      try {
        const response = await axiosPrivate.post('/netflow-ui/prefix/info', postData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken
          }
        });
        setAsn(response.data.as_number);
        setCountryId(response.data.country_id);
        setCity(response.data.city);
        setCountryName(response.data.country_name);
        setGroupId(response.data.group_id);
        setIpRef(response.data.ip_ref);
        setIprev(response.data.ip_ref_reverse);
        setLatitude(response.data.latitude);
        setLongitude(response.data.longitude);
        setName(response.data.name);
        setNetwork(response.data.network);
        setOrganization(response.data.organization_name);
        setRegionCode(response.data.region_code);
        setRegionName(response.data.region_name);
        setVersion(response.data.version);
        // console.log(response);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

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

  const handleGroupChange = (value) => {
    setGroupId(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');

    const updatedPrefixData = {
      as_number: asn,
      city: city,
      group_id: groupId,
      id: id,
      ip_ref: ipRef,
      ip_ref_reverse: ipRev,
      latitude: latitude,
      longitude: longitude,
      network: network,
      region_code: regionCode,
      region_name: regionName,
      version: version
    };

    // Remove properties with null values
    const filteredPrefixData = {};
    for (const key in updatedPrefixData) {
      if (updatedPrefixData[key] !== null) {
        filteredPrefixData[key] = updatedPrefixData[key];
      }
    }

    axiosPrivate
      .put('/netflow-ui/prefix', filteredPrefixData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken
        }
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success('Updated Successfully.');
        } else {
          setError('Failed to update, please try again.');
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <div className="containerHeadEditPrefix">
            <h2>Detail Prefix Info</h2>
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
                  <label htmlFor="id">AS Number:</label>
                  <Input id="id" value={asn} disabled />
                </div>
                <div className="input">
                  <label htmlFor="name">Current Name :</label>
                  <Input value={name} id="name" />
                </div>
                <div className="input">
                  <label htmlFor="country_name">Country Name :</label>
                  <Input value={countryName} id="country_name" />
                </div>
                <div className="input">
                  <label htmlFor="city">City :</label>
                  <Input value={city} id="city" />
                </div>
                <div className="input">
                  <label htmlFor="country_id">Country ID :</label>
                  <Input value={countryId} id="country_id" />
                </div>
                <div className="input">
                  <label htmlFor="group_id">Group Prefix :</label>
                  <Select
                    className="selectSites"
                    showSearch
                    placeholder="Select Group"
                    optionFilterProp="children"
                    onChange={handleGroupChange}
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    options={sites}
                  />
                </div>
                <div className="input">
                  <label htmlFor="ip_ref">IP Reference :</label>
                  <Input value={ipRef} id="ip_ref" />
                </div>
                <div className="input">
                  <label htmlFor="ip_rev">IP Reverse :</label>
                  <Input value={ipRev} id="ip_rev" />
                </div>
                <div className="input">
                  <label htmlFor="latitude">Latitude :</label>
                  <Input value={latitude} id="latitude" />
                </div>
                <div className="input">
                  <label htmlFor="longitude">Longitude :</label>
                  <Input value={longitude} id="longitude" />
                </div>
                <div className="input">
                  <label htmlFor="network">Network :</label>
                  <Input value={network} id="network" />
                </div>
                <div className="input">
                  <label htmlFor="organization">Organization Name :</label>
                  <Input value={organization} id="organization" />
                </div>
                <div className="input">
                  <label htmlFor="region_code">Region Code :</label>
                  <Input value={regionCode} id="region_code" />
                </div>
                <div className="input">
                  <label htmlFor="region_name">Region Name :</label>
                  <Input value={regionName} id="region_name" />
                </div>
                <div className="submitBtn">
                  <Button onClick={handleSubmit}>Update Prefix</Button>
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

export default UpdatePrefix;
