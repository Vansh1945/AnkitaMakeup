import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_settings');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(!settings);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/website-settings');
      if (res.success && res.data) {
        setSettings(res.data);
        localStorage.setItem('cached_settings', JSON.stringify(res.data));
        
        // Dynamically update favicon if it exists in settings
        if (res.data.favicon) {
          const faviconLink = document.getElementById('favicon');
          if (faviconLink) {
            faviconLink.href = res.data.favicon;
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => {
    fetchSettings();
  };

  const value = {
    settings,
    loading,
    error,
    refreshSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
