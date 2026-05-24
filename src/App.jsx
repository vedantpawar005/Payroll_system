import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4f46e5',           // Premium Indigo
          colorSuccess: '#10b981',           // Mint Green
          colorWarning: '#f59e0b',           // Amber Gold
          colorError: '#ef4444',             // Electric Crimson
          fontFamily: 'var(--font-body)',
          borderRadius: 8,
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f8fafc'
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            bodyBg: '#f8fafc'
          },
          Menu: {
            darkItemBg: 'transparent',
            darkItemSelectedBg: '#4f46e5',
            darkItemSelectedColor: '#ffffff',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.05)'
          },
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#64748b'
          }
        }
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
