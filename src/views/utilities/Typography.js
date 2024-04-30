import { Grid } from '@mui/material';
import MuiTypography from '@mui/material/Typography';
import { DatePicker, Space, Select } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

// project imports
import SubCard from 'ui-component/cards/SubCard';
import MainCard from 'ui-component/cards/MainCard';
import SecondaryAction from 'ui-component/cards/CardSecondaryAction';
import { gridSpacing } from 'store/constant';

// ==============================|| TYPOGRAPHY ||============================== //

const Typography = () => {
  const onChange = (value) => {
    console.log(`selected ${value}`);
  };
  const onSearch = (value) => {
    console.log('search:', value);
  };

  dayjs.extend(customParseFormat);
  const { RangePicker } = DatePicker;

  const data = [
    { name: '2010', count: 400, pv: 2400, amt: 2400 },
    { name: '2011', count: 300, pv: 2400, amt: 2400 },
    { name: '2012', count: 200, pv: 2400, amt: 2400 },
    { name: '2013', count: 500, pv: 2400, amt: 2400 }
    // Tambahkan data lainnya di sini sesuai kebutuhan
  ];
  return (
    <>
      <MainCard title="Jakwifi Sites" secondary={<SecondaryAction link="https://next.material-ui.com/system/typography/" />}>
        <div className="dateContainer">
          <Select
            showSearch
            placeholder="Select Site"
            optionFilterProp="children"
            onChange={onChange}
            onSearch={onSearch}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            options={[
              {
                value: 'jack',
                label: 'Jack'
              },
              {
                value: 'lucy',
                label: 'Lucy'
              },
              {
                value: 'tom',
                label: 'Tom'
              }
            ]}
          />
          <Space size={12}>
            <RangePicker picker="month" />
          </Space>
        </div>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12} sm={6}>
            <SubCard title="Traffic">
              <LineChart width={400} height={231} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </SubCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SubCard title="Device">
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <MuiTypography variant="h1" gutterBottom>
                    h1. Heading
                  </MuiTypography>
                </Grid>
                <Grid item>
                  <MuiTypography variant="h2" gutterBottom>
                    h2. Heading
                  </MuiTypography>
                </Grid>
                <Grid item>
                  <MuiTypography variant="h3" gutterBottom>
                    h3. Heading
                  </MuiTypography>
                </Grid>
                <Grid item>
                  <MuiTypography variant="h4" gutterBottom>
                    h4. Heading
                  </MuiTypography>
                </Grid>
                <Grid item>
                  <MuiTypography variant="h5" gutterBottom>
                    h5. Heading
                  </MuiTypography>
                </Grid>
                <Grid item>
                  <MuiTypography variant="h6" gutterBottom>
                    h6. Heading
                  </MuiTypography>
                </Grid>
              </Grid>
            </SubCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SubCard title="Uptime">
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <MuiTypography variant="h1" gutterBottom>
                    h1. Heading
                  </MuiTypography>
                </Grid>
                <Grid item>
                  <MuiTypography variant="h2" gutterBottom>
                    h2. Heading
                  </MuiTypography>
                </Grid>
                <Grid item>
                  <MuiTypography variant="h3" gutterBottom>
                    h3. Heading
                  </MuiTypography>
                </Grid>
                <Grid item>
                  <MuiTypography variant="h4" gutterBottom>
                    h4. Heading
                  </MuiTypography>
                </Grid>
                <Grid item>
                  <MuiTypography variant="h5" gutterBottom>
                    h5. Heading
                  </MuiTypography>
                </Grid>
                <Grid item>
                  <MuiTypography variant="h6" gutterBottom>
                    h6. Heading
                  </MuiTypography>
                </Grid>
              </Grid>
            </SubCard>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default Typography;
