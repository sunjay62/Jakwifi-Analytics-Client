// assets
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
// constant
const icons = { DashboardOutlinedIcon };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Dashboard',
      type: 'item',
      url: '/home',
      icon: icons.DashboardOutlinedIcon,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
