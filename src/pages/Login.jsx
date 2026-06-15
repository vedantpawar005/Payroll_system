import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, KeyOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect directly to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values) => {
    setBtnLoading(true);
    try {
      await login(values.email, values.password);
      message.success({
        content: 'Access granted! Welcome to RedNote Payroll Admin Panel.',
        duration: 3
      });
      navigate('/', { replace: true });
    } catch (error) {
      message.error({
        content: error.message || 'Login failed. Please check your credentials.',
        duration: 4
      });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleQuickFill = () => {
    form.setFieldsValue({
      email: 'payroll@gmail.com',
      password: 'payroll@gmail.com'
    });
    message.info('Demo credentials prefilled! Click "Access Panel".');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
      padding: '24px'
    }}>
      {/* Background Decorative Blobs */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'rgba(79, 70, 229, 0.25)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        top: '10%',
        left: '15%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'rgba(217, 70, 239, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        bottom: '15%',
        right: '15%',
        pointerEvents: 'none'
      }} />

      <Card
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        {/* Branding header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Space align="center" style={{ marginBottom: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a5b4fc 100%)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}>
              <DashboardOutlined style={{ fontSize: '24px', color: '#fff' }} />
            </div>
            <Title level={3} style={{ margin: 0, color: '#fff', letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
              RedNote Payroll
            </Title>
          </Space>
          <div>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              High-Fidelity HRMS & Payroll Controller
            </Text>
          </div>
        </div>

        {/* Form */}
        <Form
          form={form}
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your administrator email!' },
              { type: 'email', message: 'Please supply a valid email format!' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />}
              placeholder="Administrator Email"
              size="large"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '8px'
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            style={{ marginBottom: '24px' }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />}
              placeholder="Secret Password"
              size="large"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '8px'
              }}
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: '20px' }}>
            <Checkbox style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'var(--font-body)' }}>
              Remember my session
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={btnLoading}
              block
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
              }}
            >
              Access Panel
            </Button>
          </Form.Item>
        </Form>

        {/* Demo Credentials Auto Fill Banner */}
        <div
          onClick={handleQuickFill}
          style={{
            marginTop: '24px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px dashed rgba(245, 158, 11, 0.4)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s, border-color 0.2s'
          }}
          className="demo-credentials-btn"
        >
          <Space>
            <KeyOutlined style={{ color: '#fbbf24' }} />
            <Text style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 600 }}>
              Use Demo Credentials (Click to prefill)
            </Text>
          </Space>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
            admin@payroll.com / admin@payroll.com
          </div>
        </div>
      </Card>
      
      {/* CSS overlay to style text/inputs in dark card */}
      <style>{`
        .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper-focused {
          border-color: rgba(99, 102, 241, 0.8) !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .ant-input {
          color: white !important;
        }
        .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.35) !important;
        }
        .demo-credentials-btn:hover {
          background: rgba(245, 158, 11, 0.25) !important;
          border-color: rgba(245, 158, 11, 0.6) !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
