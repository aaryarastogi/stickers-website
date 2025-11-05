import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ExpandedSearchBar from "../Components/ExpandedSearchBar";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

function Navbar(){
    const[searchValue , setSearchValue] = useState("");
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
      const checkUser = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (e) {
            console.error('Error parsing user data:', e);
            setUser(null);
          }
        } else {
          setUser(null);
        }
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

  return (
    <nav className="bg-white h-24 py-4 top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop View */}
        <div className="hidden lg:flex justify-between h-16 items-center">
          {/* Logo - Left */}
          <div 
            className="shrink-0 text-2xl font-bold text-gray-800 cursor-pointer"
            onClick={()=> navigate('/')}>
            Sticker<span className="text-yellow-400">2</span>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 flex justify-center px-8">
            <ExpandedSearchBar/>
          </div>

          {/* Auth Buttons / User Menu - Right */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div 
                className="relative"
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                <div className="flex items-center gap-2 cursor-pointer">
                  <span className="text-gray-700 font-medium">Welcome,</span>
                  <span className="text-buttonColorend font-semibold">
                    {user.name?.split(' ')[0] || user.name}
                  </span>
                </div>
                {/* Dropdown on hover */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button 
                      className="w-full text-left px-4 py-2 text-buttonColorend hover:bg-gray-100 font-semibold transition-colors"
                      onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
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

        {/* Mobile View - When User is Logged In */}
        {user ? (
          <div className="lg:hidden flex justify-between h-16 items-center gap-2 relative">
            {/* Logo - Left */}
            <div 
              className="shrink-0 text-2xl font-bold text-gray-800 cursor-pointer z-10"
              onClick={()=> navigate('/')}>
              Sticker<span className="text-yellow-400">2</span>
            </div>

            {/* Search Bar - Center (expands left) */}
            <div className="flex-1 flex justify-start px-2 min-w-0">
              <ExpandedSearchBar/>
            </div>

            {/* User Name with Dropdown - Right (always visible) */}
            <div 
              className="relative shrink-0 z-10 bg-white pl-2"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <span className="text-buttonColorend font-semibold text-sm cursor-pointer whitespace-nowrap">
                {user.name?.split(' ')[0] || user.name}
              </span>
              {/* Dropdown on tap */}
              {isUserDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
                    <button 
                      className="w-full text-left px-4 py-2 text-buttonColorend hover:bg-gray-100 font-semibold transition-colors"
                      onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Mobile View - When User is NOT Logged In */
          <>
            <div className="lg:hidden flex justify-between h-16 items-center gap-2">
              {/* Logo - Left */}
              <div 
                className="shrink-0 text-2xl font-bold text-gray-800 cursor-pointer"
                onClick={()=> navigate('/')}>
                Sticker<span className="text-yellow-400">2</span>
              </div>

              {/* Search Bar - Center */}
              <div className="flex-1 flex justify-center px-2">
                <ExpandedSearchBar/>
              </div>

              {/* Hamburger Menu - Right */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-buttonColorend transition-colors shrink-0"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>

            {/* Mobile Menu Dropdown - Only shown when NOT logged in */}
            {isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="lg:hidden fixed inset-0 bg-black/20 z-30"
                  onClick={closeMobileMenu}
                />
                {/* Menu Panel */}
                <div className="lg:hidden fixed inset-0 top-24 bg-white z-40 shadow-lg animate-slideDown overflow-y-auto">
                  <div className="flex flex-col items-center py-8 px-4 space-y-6 min-h-full">
                    {/* Auth Buttons */}
                    <div className="w-full max-w-md space-y-4">
                      <button 
                        className="w-full bg-linear-to-r from-buttonColorst to-buttonColorend border-0 hover:border-2 hover:border-buttonColorst hover:bg-none hover:text-buttonColorend hover:shadow-md px-6 py-4 rounded-full text-white font-semibold cursor-pointer transition-all text-lg" 
                        onClick={()=> {
                          navigate('/signup');
                          closeMobileMenu();
                        }}>
                        Sign Up
                      </button>
                      <button 
                        className="w-full bg-transparent border-2 border-buttonColorst text-buttonColorend hover:border-0 hover:text-white hover:bg-linear-to-r from-buttonColorst to-buttonColorend px-6 py-4 rounded-full font-semibold cursor-pointer transition-all text-lg" 
                        onClick={()=> {
                          navigate('/login');
                          closeMobileMenu();
                        }}>
                        Login
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;