import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RxHamburgerMenu } from 'react-icons/rx';

export default function LogOutComponent() {
  const [sidebar, setSidebar] = useState(true);
  const navigate = useNavigate();

  const handleClick = () => {
    const newState = !sidebar;
    setSidebar(newState);
    try {
      if (!newState) {
        document.body.classList.add('sidebar-visible');
      } else {
        document.body.classList.remove('sidebar-visible');
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  };

  const handleLogOut = () => {
    // Reset sidebar to closed state (original position)
    setSidebar(true);
    // Remove sidebar-visible class to reset body and content positioning
    try {
      document.body.classList.remove('sidebar-visible');
    } catch (e) {
      // ignore in non-browser environments
    }
    // Clear auth tokens and navigate to home
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div>
      {/* Toggle button - fixed position, does not translate */}
      <div
        onClick={handleClick}
        style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'fixed',
          top: '10px',
          left: '10px',
          padding: '6px',
          zIndex: 1100,
          backgroundColor: '#0a64d6',
          color:  '#fff',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
        aria-label="Toggle sidebar"
      >
        <RxHamburgerMenu />
      </div>

      {/* Sidebar content - fixed and compact when visible */}
      <div
        style={{
          width: sidebar ? 0 : '400px',
          minWidth: sidebar ? 0 : '200px',
          maxWidth: sidebar ? 0 : '90px',
          backgroundColor: '#fff',
          height: '100vh',
          position: 'fixed',
          margin: 0,
          left: 0,
          top: 0,
          display: sidebar ? 'none' : 'block',
          overflow: 'hidden',
          zIndex: 1000,
          textAlign: 'center',
          borderRight: '1px solid #e0e0e0',
        }}
      >
        <button
          onClick={handleLogOut}
          style={{
            marginTop: '15px',
            display: 'block',
            marginLeft: '60px',
            marginRight: 'auto',
            backgroundColor: '#1ed1cbff',
          }}
        >
          LogOut
        </button>
      </div>
    </div>
  );
}
