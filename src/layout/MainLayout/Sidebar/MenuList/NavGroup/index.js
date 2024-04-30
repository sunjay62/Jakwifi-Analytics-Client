import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Divider, List, Typography } from '@mui/material';
import jwt_decode from 'jwt-decode';

// project imports
import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';

// ==============================|| SIDEBAR MENU LIST GROUP ||============================== //

const NavGroup = ({ item }) => {
  const theme = useTheme();
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');

    if (accessToken) {
      const tokenData = jwt_decode(accessToken);
      setDecodedToken(tokenData);
      console.log(tokenData);
    }
  }, []);

  // menu list collapse & items
  const items = item.children?.map((menu) => {
    switch (menu.type) {
      case 'collapse':
        if (
          (menu.title === 'Account' && decodedToken && !decodedToken.perm_admin) ||
          (menu.title === 'All Sites' && decodedToken && !decodedToken.perm_admin) ||
          (menu.title === 'Active Sites' && decodedToken && !decodedToken.perm_admin) ||
          (menu.title === 'Custom Prefix' && decodedToken && !decodedToken.perm_prefix) ||
          (menu.title === 'AS Number' && decodedToken && !decodedToken.perm_prefix) ||
          (menu.title === 'List Prefix' && decodedToken && !decodedToken.perm_prefix) ||
          (menu.title === 'Group Prefix' && decodedToken && !decodedToken.perm_groupname)
        ) {
          return null; // Hide menu item if user doesn't have permission
        }

        return <NavCollapse key={menu.id} menu={menu} level={1} />;
      case 'item':
        // Conditionally render the menu item based on permissions
        if (
          (menu.title === 'Account' && decodedToken && !decodedToken.perm_admin) ||
          (menu.title === 'All Sites' && decodedToken && !decodedToken.perm_admin) ||
          (menu.title === 'Active Sites' && decodedToken && !decodedToken.perm_admin) ||
          (menu.title === 'Custom Prefix' && decodedToken && !decodedToken.perm_prefix) ||
          (menu.title === 'AS Number' && decodedToken && !decodedToken.perm_prefix) ||
          (menu.title === 'List Prefix' && decodedToken && !decodedToken.perm_prefix) ||
          (menu.title === 'Group Prefix' && decodedToken && !decodedToken.perm_groupname)
        ) {
          return null; // Hide menu item if user doesn't have permission
        }
        return <NavItem key={menu.id} item={menu} level={1} />;
      default:
        return (
          <Typography key={menu.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return (
    <>
      <List
        subheader={
          item.title && (
            <Typography variant="caption" sx={{ ...theme.typography.menuCaption }} display="block" gutterBottom>
              {item.title}
              {item.caption && (
                <Typography variant="caption" sx={{ ...theme.typography.subMenuCaption }} display="block" gutterBottom>
                  {item.caption}
                </Typography>
              )}
            </Typography>
          )
        }
      >
        {items}
      </List>

      {/* group divider */}
      <Divider sx={{ mt: 0.25, mb: 1.25 }} />
    </>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object
};

export default NavGroup;
