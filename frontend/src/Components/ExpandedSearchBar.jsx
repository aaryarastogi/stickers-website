import React, { useState, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

function ExpandedSearchBar(){
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleExpand = () => {
    if (!isMobile) {
      setIsExpanded(true);
    }
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setSearchValue("");
  };

  return (
  <div className={`relative w-full flex ${isMobile ? 'justify-start' : 'justify-end'}`}>
    <div
      className={`
        relative z-50 transition-all duration-500 ease-in-out
        ${isExpanded && !isMobile ? 'w-[44rem]' : 'w-40'}
      `}
      style={!isMobile ? { right: 0 } : {}}
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
    {isExpanded && searchValue && (
      <div className="fixed inset-0 bg-background/50 backdrop-blur-md z-50 p-6 overflow-auto">
      <div
          className="bg-card rounded-xl shadow-lg max-w-lg w-full p-6 mx-auto"
          onClick={(e) => e.stopPropagation()} 
      >
          <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={handleCollapse}
          >
          <CloseIcon/>
          </button>
          <p className="text-muted-foreground">
              Search results for: <span className="text-foreground font-medium">{searchValue}</span>
          </p>
          {/* Your search results list can go here */}
          </div>
      </div>
    )}
    </div>
  </div>
  )
};

export default ExpandedSearchBar;
