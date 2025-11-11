import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ExpandedSearchBar from "../Components/ExpandedSearchBar";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useCart } from '../context/CartContext';
import { getUserFromStorage } from '../utils/storageUtils';

function Navbar(){
    const[searchValue , setSearchValue] = useState("");
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { openCart } = useCart();
    useEffect(() => {
      const checkUser = () => {
        const user = getUserFromStorage();
        setUser(user);
      };
      
      checkUser();
      const handleStorageChange = (e) => {
        if (e.key === 'user' || e.key === 'token') {
          checkUser();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('userLogin', checkUser);
      window.addEventListener('userLogout', checkUser);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('userLogin', checkUser);
        window.removeEventListener('userLogout', checkUser);
      };
    }, [location.pathname]);
    
    // Fetch notifications
    useEffect(() => {
      if (user) {
        fetchNotifications();
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
          fetchUnreadCount();
          if (isNotificationOpen) {
            fetchNotifications();
          }
        }, 30000);
        return () => clearInterval(interval);
      }
    }, [user, isNotificationOpen]);
    
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    const fetchUnreadCount = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/notifications/unread/count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    const markNotificationAsRead = async (notificationId) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          fetchNotifications();
          fetchUnreadCount();
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }; 
    
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsMobileMenuOpen(false);
      setIsUserDropdownOpen(false);
      window.dispatchEvent(new Event('userLogout'))
      navigate('/');
    };

    const closeMobileMenu = () => {
      setIsMobileMenuOpen(false);
    };

    // Close mobile menu and user dropdown when route changes
    useEffect(() => {
      setIsMobileMenuOpen(false);
      setIsUserDropdownOpen(false);
    }, [location.pathname]);

    // Close dropdown when clicking outside (desktop)
    useEffect(() => {
      const handleClickOutside = (event) => {
        const dropdown = event.target.closest('[data-user-dropdown]');
        const trigger = event.target.closest('[data-user-trigger]');
        
        if (isUserDropdownOpen && !dropdown && !trigger) {
          setIsUserDropdownOpen(false);
        }
      };
      
      if (isUserDropdownOpen) {
        // Small delay to allow click events to process first
        setTimeout(() => {
          document.addEventListener('click', handleClickOutside);
        }, 0);
      }
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, [isUserDropdownOpen]);

  return (
    <nav className="bg-white h-24 py-4 top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop View */}
        <div className="hidden lg:flex justify-between h-16 items-center">
          {/* Logo - Left */}
          <div 
            className="shrink-0 text-2xl font-bold text-gray-800 cursor-pointer"
            onClick={()=> navigate('/')}>
            Stickkery
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 flex justify-center px-8">
            <ExpandedSearchBar/>
          </div>

                  {/* Auth Buttons / User Menu - Right */}
                  <div className="flex items-center space-x-4">
                    {user ? (
                      <>
                        {/* Notification Icon */}
                        <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotificationOpen(!isNotificationOpen);
                      if (!isNotificationOpen) {
                        fetchNotifications();
                      }
                    }}
                    className="relative p-2 text-gray-600 hover:text-buttonColorend transition-colors"
                  >
                    {unreadCount > 0 ? (
                      <NotificationsIcon className="text-buttonColorend" />
                    ) : (
                      <NotificationsNoneIcon />
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {isNotificationOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-30"
                        onClick={() => setIsNotificationOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  await fetch('/api/notifications/read-all', {
                                    method: 'PUT',
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  });
                                  fetchNotifications();
                                  fetchUnreadCount();
                                } catch (error) {
                                  console.error('Error marking all as read:', error);
                                }
                              }}
                              className="text-xs text-buttonColorend hover:underline"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                  !notification.is_read ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => {
                                  if (!notification.is_read) {
                                    markNotificationAsRead(notification.id);
                                  }
                                  setIsNotificationOpen(false);
                                }}
                              >
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No notifications
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* User Menu */}
                <div className="relative" data-user-dropdown>
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  data-user-trigger
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsUserDropdownOpen(!isUserDropdownOpen)
                  }}
                  onMouseEnter={() => setIsUserDropdownOpen(true)}
                >
                  <span className="text-gray-700 font-medium">Welcome,</span>
                  <span className="text-buttonColorend font-semibold">
                    {user.username || user.name?.split(' ')[0] || user.name}
                  </span>
                </div>
                {/* Dropdown on hover or click */}
                {isUserDropdownOpen && (
                  <>
                    {/* Invisible area to keep dropdown open when moving mouse */}
                    <div 
                      className="absolute right-0 top-full h-2 w-40"
                      onMouseEnter={() => setIsUserDropdownOpen(true)}
                      data-user-dropdown
                    />
                    <div 
                      className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      data-user-dropdown
                      onMouseEnter={() => setIsUserDropdownOpen(true)}
                      onMouseLeave={() => setIsUserDropdownOpen(false)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          navigate('/profile');
                          setIsUserDropdownOpen(false);
                        }}>
                        Profile
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          navigate('/my-orders');
                          setIsUserDropdownOpen(false);
                        }}>
                        My Orders
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          openCart();
                          setIsUserDropdownOpen(false);
                        }}>
                        View Cart
                      </button>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button 
                        className="w-full text-left px-4 py-2 text-purple-600 hover:bg-purple-50 transition-colors font-medium"
                        onClick={() => {
                          navigate('/publish-sticker');
                          setIsUserDropdownOpen(false);
                        }}>
                        Publish Sticker
                      </button>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button 
                        className="w-full text-left px-4 py-2 text-buttonColorend hover:bg-gray-100 font-semibold transition-colors"
                        onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </>
                )}
                </div>
              </>
            ) : (
              <div className="space-x-2 flex flex-row">
                <button 
                  className="bg-linear-to-r from-buttonColorst to-buttonColorend border-0 hover:border-2 hover:border-buttonColorst hover:bg-none hover:text-buttonColorend hover:shadow-md min-w-32 p-2 rounded-full text-white font-semibold cursor-pointer transition-all" 
                  onClick={()=> navigate('/signup')}>
                  Sign Up
                </button>
                <button 
                  className="bg-transparent border-2 border-buttonColorst text-buttonColorend hover:border-0 hover:text-white hover:bg-linear-to-r from-buttonColorst to-buttonColorend min-w-32 p-2 rounded-full font-semibold cursor-pointer transition-all" 
                  onClick={()=> navigate('/login')}>
                  Login
                </button>
                      </div>
                    )}
                  </div>
                </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="flex justify-between items-center h-16 gap-2">
          {/* Logo */}
          <div 
            className="shrink-0 text-2xl font-bold text-gray-800 cursor-pointer"
            onClick={()=> navigate('/')}>
            Stickkery
          </div>

            {/* Search Bar */}
            <div className="flex-1 flex justify-center px-2 min-w-0">
              <ExpandedSearchBar/>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Notification Icon for Mobile */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsNotificationOpen(!isNotificationOpen);
                        if (!isNotificationOpen) {
                          fetchNotifications();
                        }
                      }}
                      className="relative p-1 text-gray-600 hover:text-buttonColorend transition-colors"
                      data-notification-trigger
                    >
                      {unreadCount > 0 ? (
                        <NotificationsIcon className="text-buttonColorend" fontSize="small" />
                      ) : (
                        <NotificationsNoneIcon fontSize="small" />
                      )}
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    {/* Notifications Dropdown (mobile) */}
                    {isNotificationOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setIsNotificationOpen(false)}
                        />
                        <div
                          className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto"
                          data-notification-dropdown
                        >
                          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <button
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem('token');
                                    await fetch('/api/notifications/read-all', {
                                      method: 'PUT',
                                      headers: {
                                        'Authorization': `Bearer ${token}`
                                      }
                                    });
                                    fetchNotifications();
                                    fetchUnreadCount();
                                  } catch (error) {
                                    console.error('Error marking all as read:', error);
                                  }
                                }}
                                className="text-xs text-buttonColorend hover:underline"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                    !notification.is_read ? 'bg-blue-50' : ''
                                  }`}
                                  onClick={() => {
                                    if (!notification.is_read) {
                                      markNotificationAsRead(notification.id);
                                    }
                                    setIsNotificationOpen(false);
                                  }}
                                >
                                  <p className="text-sm text-gray-900">{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(notification.created_at).toLocaleString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                No notifications
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* User Name with Dropdown */}
                  <div 
                    className="relative shrink-0 z-10 bg-white pl-2"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <span className="text-buttonColorend font-semibold text-sm cursor-pointer whitespace-nowrap">
                      {user.username || user.name?.split(' ')[0] || user.name}
                    </span>
                    {/* Dropdown on tap */}
                    {isUserDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setIsUserDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
                          <button
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => {
                              navigate('/profile');
                              setIsUserDropdownOpen(false);
                            }}>
                            Profile
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => {
                              navigate('/my-orders');
                              setIsUserDropdownOpen(false);
                            }}>
                            My Orders
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => {
                              openCart();
                              setIsUserDropdownOpen(false);
                            }}>
                            View Cart
                          </button>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            className="w-full text-left px-4 py-2 text-purple-600 hover:bg-purple-50 transition-colors font-medium"
                            onClick={() => {
                              navigate('/publish-sticker');
                              setIsUserDropdownOpen(false);
                            }}>
                            Publish Sticker
                          </button>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            className="w-full text-left px-4 py-2 text-buttonColorend hover:bg-gray-100 font-semibold transition-colors"
                            onClick={handleLogout}>
                            Logout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    className="bg-linear-to-r from-buttonColorst to-buttonColorend border-0 hover:border-2 hover:border-buttonColorst hover:bg-none hover:text-buttonColorend hover:shadow-md min-w-24 p-2 rounded-full text-white font-semibold cursor-pointer text-sm transition-all"
                    onClick={()=> navigate('/signup')}>
                    Sign Up
                  </button>
                  <button
                    className="bg-white border-2 border-buttonColorst text-buttonColorend hover:bg-buttonColorst hover:text-white hover:shadow-md min-w-24 p-2 rounded-full font-semibold cursor-pointer text-sm transition-all"
                    onClick={()=> navigate('/login')}>
                    Login
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;