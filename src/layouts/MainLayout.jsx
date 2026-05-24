import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Tooltip, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  DollarOutlined,
  LogoutOutlined,
  CloudOutlined,
  WarningOutlined,
  UserOutlined as ProfileIcon
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Dropdown profile menu
  const profileMenuItems = [
    {
      key: 'profile-info',
      label: (
        <div style={{ padding: '4px 12px' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.name || 'Admin User'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
        </div>
      ),
      type: 'group'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Top Banner if in Demo mode */}
      {isDemo && (
        <div className="demo-banner">
          <WarningOutlined />
          <span>
            Running in <strong>Demo Mode (Local Storage)</strong>. Configure your environment variables in `.env` to connect Appwrite cloud database.
          </span>
        </div>
      )}

      <Layout>
        {/* Sidebar */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={260}
          className="sidebar-glass"
          breakpoint="lg"
          onCollapse={(value) => setCollapsed(value)}
        >
          <div className="logo-container">
            <span className="logo-text">
              {collapsed ? 'RP' : 'RedNote Payroll'}
            </span>
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            style={{
              background: 'transparent',
              padding: '16px 8px',
              fontFamily: 'var(--font-heading)'
            }}
            items={[
              {
                key: '/',
                icon: <DashboardOutlined style={{ fontSize: 18 }} />,
                label: 'Dashboard',
                style: { borderRadius: '8px', marginBottom: '8px' }
              },
              {
                key: '/employees',
                icon: <UserOutlined style={{ fontSize: 18 }} />,
                label: 'Employees',
                style: { borderRadius: '8px', marginBottom: '8px' }
              },
              {
                key: '/payroll',
                icon: <DollarOutlined style={{ fontSize: 18 }} />,
                label: 'Payroll Ledger',
                style: { borderRadius: '8px', marginBottom: '8px' }
              }
            ]}
          />
        </Sider>

        <Layout style={{ background: 'var(--bg-app)' }}>
          {/* Header */}
          <Header className="top-navbar">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
                color: 'var(--text-main)'
              }}
            />

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Connection Status Indicator */}
              <Tooltip title={isDemo ? "Running locally" : "Securely connected to Appwrite DB"}>
                <Badge status={isDemo ? "warning" : "success"} text={
                  <Space style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {isDemo ? <WarningOutlined style={{ color: '#f59e0b' }} /> : <CloudOutlined style={{ color: '#10b981' }} />}
                    <span style={{ display: 'inline-block' }}>
                      {isDemo ? 'Local Storage' : 'Appwrite Cloud'}
                    </span>
                  </Space>
                } />
              </Tooltip>

              {/* Profile Avatar Trigger */}
              <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" trigger={['click']}>
                <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.2s' }} className="avatar-hover">
                  <Avatar style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }} icon={<ProfileIcon />} />
                  <span style={{ fontWeight: 500, color: 'var(--text-main)', display: 'inline-block' }}>
                    {user?.name || 'Admin'}
                  </span>
                </Space>
              </Dropdown>
            </div>
          </Header>

          {/* Content Wrapper */}
          <Content
            style={{
              margin: '24px',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
