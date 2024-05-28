// assets
import { IconTypography, IconPalette, IconShadow, IconWindmill } from '@tabler/icons';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import MobiledataOffOutlinedIcon from '@mui/icons-material/MobiledataOffOutlined';

const icons = {
  IconTypography,
  IconPalette,
  IconShadow,
  IconWindmill,
  SettingsOutlinedIcon,
  LanguageOutlinedIcon,
  ManageAccountsOutlinedIcon,
  MobiledataOffOutlinedIcon
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  title: 'JakWifi Menu',
  type: 'group',
  children: [
    {
      id: 'util-typography',
      title: 'JakWifi',
      type: 'collapse',
      icon: icons.LanguageOutlinedIcon,
      children: [
        {
          id: 'util-site',
          title: 'Usage',
          type: 'item',
          url: '/jakwifi/usage',
          breadcrumbs: true
        },
        {
          id: 'util-allsites-darat',
          title: 'All Usage Darat',
          type: 'item',
          url: '/jakwifi/allusage/darat',
          breadcrumbs: true
        },
        {
          id: 'util-allsites-pulau',
          title: 'All Usage Pulau',
          type: 'item',
          url: '/jakwifi/allusage/pulau',
          breadcrumbs: true
        },
        {
          id: 'util-web-analytics',
          title: 'Web Analytics',
          type: 'item',
          url: '/jakwifi/analytics',
          breadcrumbs: true
        }
      ]
    }

    // {
    //   id: 'util-color',
    //   title: 'Setting',
    //   type: 'item',
    //   url: '/setting/profile',
    //   icon: icons.SettingsOutlinedIcon,
    //   breadcrumbs: false
    // }
    // {
    //   id: 'util-color',
    //   title: 'Setting',
    //   type: 'item',
    //   url: '/utils/util-color',
    //   icon: icons.SettingsOutlinedIcon,
    //   breadcrumbs: false
    // }
    // {
    //   id: 'util-shadow',
    //   title: 'Shadow',
    //   type: 'item',
    //   url: '/utils/util-shadow',
    //   icon: icons.IconShadow,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'icons',
    //   title: 'Icons',
    //   type: 'collapse',
    //   icon: icons.IconWindmill,
    //   children: [
    //     {
    //       id: 'tabler-icons',
    //       title: 'Tabler Icons',
    //       type: 'item',
    //       url: '/icons/tabler-icons',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'material-icons',
    //       title: 'Material Icons',
    //       type: 'item',
    //       external: true,
    //       target: '_blank',
    //       url: 'https://mui.com/material-ui/material-icons/',
    //       breadcrumbs: false
    //     }
    //   ]
    // }
  ]
};

export default utilities;
