import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useCurrency } from '../context/CurrencyContext';

function ExpandedSearchBar(){
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchResults, setSearchResults] = useState({ stickers: [], templates: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setSearchValue("");
    setSearchResults({ stickers: [], templates: [] });
  };

  // Debounced search function
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchValue.trim().length === 0) {
      setSearchResults({ stickers: [], templates: [], users: [] });
      setIsSearching(false);
      return;
    }

    if (searchValue.trim().length < 2) {
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/templates/search?q=${encodeURIComponent(searchValue)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({ stickers: [], templates: [], users: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue]);

  const handleStickerClick = (sticker) => {
    // Use sticker_type from backend, fallback to checking template_id for backward compatibility
    const stickerType = sticker.sticker_type || (sticker.template_id ? 'template' : 'user_created')
    navigate(`/sticker/${stickerType}/${sticker.id}`)
    handleCollapse()
  };

  const handleTemplateClick = (template) => {
    navigate('/stickers', { state: { templateTitle: template.title } });
    handleCollapse();
  };

  const handleUserClick = (user) => {
    if (user.username) {
      navigate(`/profile/${user.username}`);
    }
    handleCollapse();
  };

  return (
  <div className={`relative w-full flex ${isMobile ? 'justify-start' : 'justify-end'}`}>
    <div
      className={`
        relative z-50 transition-all duration-500 ease-in-out
        ${isExpanded && !isMobile ? 'w-[44rem]' : 'w-40'}
      `}
      style={!isMobile ? { right: 0 } : {}}
      onClick={(e) => e.stopPropagation()}
    >
    {isExpanded && !isMobile && (
      <div
        className="fixed inset-0 bg-background/50 z-40 transition-opacity duration-300"
        onClick={handleCollapse}
      />
    )}

    <div className="relative">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 ${
          isExpanded && !isMobile ? 'w-6 h-6' : 'w-5 h-5'
        }`}>
        <SearchIcon/>
      </div>

      <input
        type="text"
        className={`
          shadow-md border-none focus:outline-none transition-all duration-500
          ${isExpanded && !isMobile
            ? 'w-full h-14 pl-14 pr-14 text-base rounded-xl bg-card'
            : 'w-40 h-12 pl-12 pr-4 rounded-full bg-card'}
        `}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onClick={handleExpand}
        onFocus={handleExpand}
        placeholder="Search"
        autoFocus={isExpanded && !isMobile}
      />

      {/* Close Button - Only show on desktop when expanded */}
      {isExpanded && !isMobile && (
        <button
          onClick={handleCollapse}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
        >
          <CloseIcon/>
        </button>
      )}
    </div>
    {/* Search Results Dropdown */}
    {searchValue.trim().length >= 2 && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-[60] max-h-96 overflow-y-auto">
        {isSearching ? (
          <div className="p-4 text-center text-gray-500">Searching...</div>
        ) : (
          <>
            {/* Users Results */}
            {searchResults.users && searchResults.users.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Users</div>
                {searchResults.users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {user.profile_image_url ? (
                        <img
                          src={user.profile_image_url}
                          alt={user.name || user.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${user.profile_image_url ? 'hidden' : ''} text-white font-semibold text-lg`} style={{ backgroundColor: '#F456D5' }}>
                        {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{user.name || user.username}</div>
                      {user.username && (
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Templates Results */}
            {searchResults.templates && searchResults.templates.length > 0 && (
              <div className={`p-2 ${searchResults.users && searchResults.users.length > 0 ? 'border-t border-gray-200' : ''}`}>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Templates</div>
                {searchResults.templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                  >
                    <img
                      src={template.image_url}
                      alt={template.title}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGNUY1RjUiLz48L3N2Zz4='
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{template.title}</div>
                      {template.category_name && (
                        <div className="text-sm text-gray-500">{template.category_name}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stickers Results */}
            {searchResults.stickers && searchResults.stickers.length > 0 && (
              <div className={`p-2 border-t border-gray-200`}>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Stickers</div>
                {searchResults.stickers.map((sticker) => (
                  <div
                    key={sticker.id}
                    onClick={() => handleStickerClick(sticker)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                  >
                    <img
                      src={sticker.image_url}
                      alt={sticker.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGNUY1RjUiLz48L3N2Zz4='
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{sticker.name}</div>
                      <div className="text-sm text-gray-500">{formatPrice(parseFloat(sticker.price))} • {sticker.template_title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {(!searchResults.users || searchResults.users.length === 0) && 
             (!searchResults.stickers || searchResults.stickers.length === 0) && 
             (!searchResults.templates || searchResults.templates.length === 0) && 
             searchValue.trim().length >= 2 && (
              <div className="p-4 text-center text-gray-500">
                No results found for "{searchValue}"
              </div>
            )}
          </>
        )}
      </div>
    )}
    </div>
  </div>
  )
};

export default ExpandedSearchBar;
