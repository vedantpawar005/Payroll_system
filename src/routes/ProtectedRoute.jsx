import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f8fafc'
      }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#4f46e5' }} spin />} />
        <span style={{ marginTop: 16, color: '#64748b', fontSize: 15, fontFamily: 'var(--font-heading)' }}>
          Loading system secure session...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
