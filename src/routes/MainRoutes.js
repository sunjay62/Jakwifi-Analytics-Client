import { lazy } from 'react';
import { Outlet } from 'react-router-dom';
import PrivateRoutes from './Privateroutes';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import Profile from 'views/utilities/profile/Profile';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
// const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/TablerIcons')));
// const UtilsUsage = Loadable(lazy(() => import('views/utilities/usages/Usage')));
const UtilsUsageDev = Loadable(lazy(() => import('views/utilities/usagesnew/Usage')));

const UtilsAllUsagePulau = Loadable(lazy(() => import('views/utilities/allusagespulau/AllUsagePulau')));
const UtilsAllUsage = Loadable(lazy(() => import('views/utilities/allusages/AllUsage')));
const TotalChart = Loadable(lazy(() => import('views/utilities/totalchart/TotalChart')));
const UtilsViewSite = Loadable(lazy(() => import('views/utilities/viewsites/ViewSite')));
const Analytics = Loadable(lazy(() => import('views/utilities/analytics/Analytics')));
const EditProfile = Loadable(lazy(() => import('views/utilities/editprofile/EditProfile')));
const Login = Loadable(lazy(() => import('views/pages/login/Login')));
const NotFound = Loadable(lazy(() => import('views/pages/notfound/Notfound')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <Outlet />, // Use Outlet as the root element
  children: [
    {
      path: '',
      element: <Login />
    },
    {
      path: '',
      element: <PrivateRoutes />, // Use PrivateRoutes component here
      children: [
        {
          path: '',
          element: <MainLayout />,
          children: [
            {
              path: 'home',
              element: <DashboardDefault />
            },
            {
              path: 'jakwifi',
              children: [
                {
                  path: 'usage',
                  element: <UtilsUsageDev />
                },
                // {
                //   path: 'usage-dev',
                //   element: <UtilsUsageDev />
                // },
                {
                  path: 'allusage/darat',
                  element: <UtilsAllUsage />
                },
                {
                  path: 'allusage/pulau',
                  element: <UtilsAllUsagePulau />
                },
                {
                  path: 'totalchart',
                  element: <TotalChart />
                },
                {
                  path: 'analytics',
                  element: <Analytics />
                },
                {
                  path: 'analytics/viewsite/:id',
                  element: <UtilsViewSite />
                }
              ]
            },

            {
              path: 'setting',
              children: [
                {
                  path: 'profile',
                  element: <Profile />
                }
              ]
            },
            {
              path: 'edit/profile',
              children: [
                {
                  path: ':id',
                  element: <EditProfile />
                }
              ]
            },
            {
              path: 'utils',
              children: [
                {
                  path: 'util-color',
                  element: <UtilsColor />
                },
                {
                  path: 'util-shadow',
                  element: <UtilsShadow />
                }
              ]
            },
            {
              path: 'icons',
              children: [
                {
                  path: 'tabler-icons',
                  element: <UtilsTablerIcons />
                },
                {
                  path: 'material-icons',
                  element: <UtilsMaterialIcons />
                }
              ]
            }
          ]
        }
      ]
    },
    {
      path: '*',
      element: <NotFound />
    }
  ]
};

export default MainRoutes;
