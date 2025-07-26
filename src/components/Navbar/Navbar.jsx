import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Badge, Avatar, Box, Button } from '@mui/material';
import { Notifications as NotificationsIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '../SidebarContext';
import { ApiService } from '../../api/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isSidebarOpen } = useSidebar();
  const [user, setUser] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Read encoded role and permissions from localStorage
    const roleNameEnc = localStorage.getItem("roleNameEnc");
    const permissionsEnc = localStorage.getItem("permissionsEnc");
    let decodedRole = "";
    let decodedPermissions = {};
    if (roleNameEnc) {
      try {
        decodedRole = decodeURIComponent(escape(atob(roleNameEnc)));
        setRoleName(decodedRole);
      } catch (e) {
        setRoleName("");
      }
    }
    if (permissionsEnc) {
      try {
        decodedPermissions = JSON.parse(decodeURIComponent(escape(atob(permissionsEnc))));
        // You can use decodedPermissions if needed
      } catch (e) {
        // ignore
      }
    }
    // User info
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        setUser(JSON.parse(storedUserData));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = localStorage.getItem("userid");
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedUserData = localStorage.getItem("user");

      // Avval localStorage dagi user ma'lumotlarini tekshiramiz
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          setUser(parsedUserData);

          // GET ROLE NAME
          if (parsedUserData.role) {
            // Get role data from API if needed
            // or save it to localStorage
            try {
              const roleData = await ApiService.getData(`/auth/role/${parsedUserData.role}/`);
              setRoleName(roleData.name);
              localStorage.setItem("roleName", roleData.name);
              // New: get permissions using permission_id
              if (parsedUserData.permission_id) {
                const permissionData = await ApiService.getData(`/auth/permission/${parsedUserData.permission_id}/`);
                localStorage.setItem("permissions", JSON.stringify(permissionData));
              }
            } catch (roleError) {
              // Check previously stored role name in localStorage
              const storedRoleName = localStorage.getItem("roleName");
              if (storedRoleName) {
                setRoleName(storedRoleName);
              } else {
                setRoleName('');
              }
            }
          }
        } catch (parseError) {
          // If parsing fails, fetch from API
          console.error("Error parsing stored user data:", parseError);
          fetchFromAPI();
        }
      } else if (storedUserId && storedAccessToken) {
        // If user data doesn't exist in localStorage, fetch from API
        fetchFromAPI();
      }
    };

    // Separate function to fetch data from API
    const fetchFromAPI = async () => {
      const storedUserId = localStorage.getItem("userid");
      const storedAccessToken = localStorage.getItem("accessToken");

      if (storedUserId && storedAccessToken) {
        try {
          const data = await ApiService.getData(`/auth/users/${storedUserId}/`);
          setUser(data);
          // Save fetched data to localStorage
          localStorage.setItem("user", JSON.stringify(data));

          // GET ROLE NAME
          if (data.role) {
            try {
              const roleData = await ApiService.getData(`/auth/role/${data.role}/`);
              setRoleName(roleData.name);
              localStorage.setItem("roleName", roleData.name);
              // New: get permissions using permission_id
              if (data.permission_id) {
                const permissionData = await ApiService.getData(`/auth/permission/${data.permission_id}/`);
                localStorage.setItem("permissions", JSON.stringify(permissionData));
              }
            } catch (roleError) {
              setRoleName('');
            }
          }
        } catch (error) {
          setUser(null);
          if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userid");
            localStorage.removeItem("user");
            localStorage.removeItem("roleName");
            navigate('/login');
          }
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fallback uchun avatar harfi
  const getAvatarLetter = () => {
    if (user) {
      if (user.first_name) return user.first_name[0].toUpperCase();
      if (user.email) return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Format profile photo URL to use production API
  const getFormattedProfilePhotoUrl = (url) => {
    if (!url) return "";
    return url.replace('https://0.0.0.0:8000/', 'https://nnt.nntexpressinc.com/');
  };

  // Foydalanuvchi to'liq ismi yoki emaili
  const getUserFullName = () => {
    if (!user) return "Loading...";
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email || "No name";
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: 1201,
        width: isSidebarOpen ? 'calc(100% - 250px)' : 'calc(100% - 60px)',
        ml: isSidebarOpen ? '250px' : '60px',
        transition: 'all 0.3s ease',
        backgroundColor: '#0093E9',
        backgroundImage: 'linear-gradient(160deg, #0093E9 0%, #772a9a 100%)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        height: '64px'
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: '64px !important',
          height: '64px',
          px: 3 
        }}
      >
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '1.25rem'
          }}
        >
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2
        }}>
          <IconButton 
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              },
              color: '#ffffff',
              borderRadius: '12px',
              padding: '8px'
            }}
          >
            <Badge badgeContent={notifications.length} sx={{ 
              '& .MuiBadge-badge': {
                backgroundColor: '#ef4444',
                color: 'white'
              }
            }}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button
            variant="text"
            startIcon={<SettingsIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff'
              }
            }}
          >
            {t('Settings')}
          </Button>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              padding: '6px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <Avatar 
              alt="User Profile" 
              src={user?.profile_photo ? getFormattedProfilePhotoUrl(user.profile_photo) : ""}
              sx={{ 
                width: 36,
                height: 36,
                border: '2px solid rgba(255, 255, 255, 0.2)',
                bgcolor: '#888'
              }}
            >
              {!user?.profile_photo && getAvatarLetter()}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography sx={{ 
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#ffffff'
              }}>
                {getUserFullName()}
              </Typography>
              <Typography sx={{ 
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                {user ? (roleName || "Loading...") : "Loading..."}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
