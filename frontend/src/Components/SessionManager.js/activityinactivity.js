import { useEffect, useCallback } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const SessionManager = () => {
  const navigate = useNavigate();

  // Token validity check
  const checkTokenValidity = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/'); 
      }
    }
  };

  useEffect(() => {
    checkTokenValidity();
    const intervalId = setInterval(() => {
      checkTokenValidity();
    }, 60000); 

    return () => clearInterval(intervalId); 
  }, [navigate]);

  // Logout function due to inactivity
  const logOutUser = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/'); 
  }, [navigate]);

  useEffect(() => {
    let logoutTimer;

    const resetTimer = () => {
      clearTimeout(logoutTimer); 
      logoutTimer = setTimeout(logOutUser, 300000); 
    };

    const activityEvents = ['mousemove', 'mousedown','mouseup',  'keypress','keydown', 'keyup', 'scroll', 'touchstart','touchmove','touchend', 'wheel','resize',];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); 

    return () => {
      clearTimeout(logoutTimer); 
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [logOutUser]);

  return null; 
};

export default SessionManager;
