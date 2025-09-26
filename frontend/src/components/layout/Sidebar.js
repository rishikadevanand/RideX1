import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard,
  BookOnline,
  History,
  TrendingUp,
  Person
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const drawerWidth = 240;

  const userMenuItems = [
    {
      text: t('navigation.dashboard'),
      icon: <Dashboard />,
      path: '/'
    },
    {
      text: t('navigation.booking'),
      icon: <BookOnline />,
      path: '/booking'
    },
    {
      text: t('navigation.bookingHistory'),
      icon: <History />,
      path: '/booking-history'
    },
    {
      text: t('navigation.forecast'),
      icon: <TrendingUp />,
      path: '/forecast'
    },
    {
      text: t('navigation.profile'),
      icon: <Person />,
      path: '/profile'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" noWrap>
          Smart Ticket
        </Typography>
      </Box>
      <Divider />
      
      <List>
        {userMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      open={true}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;