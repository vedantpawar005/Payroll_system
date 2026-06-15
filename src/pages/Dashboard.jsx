import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Typography,
  Button,
  Space,
  Skeleton,
  message,
  Progress,
  List,
  Avatar,
  Empty
} from 'antd';
import {
  UserOutlined,
  DollarCircleOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  LineChartOutlined,
  CalendarOutlined,
  ProfileOutlined
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { payrollService } from '../services/payrollService';
import { formatCurrency } from '../utils/formatters';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empList, payList] = await Promise.all([
          employeeService.getEmployees(),
          payrollService.getPayrolls()
        ]);
        setEmployees(empList);
        setPayrolls(payList);
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        message.error('Failed to retrieve dashboard analytical data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute Core Statistics
  const totalEmployeesCount = employees.length;
  const uniqueDepartments = [...new Set(employees.map(emp => emp.department))].length;

  const activeCount = employees.filter(e => e.status === 'Active').length;
  const inactiveCount = employees.filter(e => e.status === 'Inactive').length;
  const activeRatio = totalEmployeesCount > 0 ? Math.round((activeCount / totalEmployeesCount) * 100) : 0;

  // Find the current active payroll month (latest month present in data)
  const allMonths = [...new Set(payrolls.map(p => p.month))].sort();
  const currentMonth = allMonths[allMonths.length - 1] || 'N/A';

  const currentMonthPayrolls = payrolls.filter(p => p.month === currentMonth);
  const monthlyPayrollSum = currentMonthPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const pendingPaymentsCount = currentMonthPayrolls.filter(p => p.status === 'Pending').length;

  // Distribution Ratios for current month
  const totalCurrentPayments = currentMonthPayrolls.length;
  const paidCurrentPayments = currentMonthPayrolls.filter(p => p.status === 'Paid').length;
  const paidRatio = totalCurrentPayments > 0 ? Math.round((paidCurrentPayments / totalCurrentPayments) * 100) : 0;

  // Recharts Chart Formatting
  const chartData = allMonths.map(month => {
    const monthPayrolls = payrolls.filter(p => p.month === month);
    const netSalaryTotal = monthPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const baseSalaryTotal = monthPayrolls.reduce((sum, p) => sum + p.salary, 0);
    const bonusTotal = monthPayrolls.reduce((sum, p) => sum + p.bonus, 0);
    const deductionsTotal = monthPayrolls.reduce((sum, p) => sum + p.deductions, 0);
    
    const date = new Date(month + '-02');
    const monthLabel = isNaN(date.getTime()) 
      ? month 
      : date.toLocaleString('default', { month: 'short', year: 'numeric' });

    return {
      month: monthLabel,
      'Net Salary': netSalaryTotal,
      'Base Salary': baseSalaryTotal,
      'Bonuses': bonusTotal,
      'Deductions': deductionsTotal
    };
  });

  // Recent Employees table layout
  const recentEmployeesColumns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space size="middle">
          <Avatar style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontWeight: 600 }}>
            {text[0]}
          </Avatar>
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{text}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{record.email}</span>
          </Space>
        </Space>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => <Tag color="indigo" style={{ borderRadius: '4px' }}>{dept}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'} style={{ borderRadius: '4px', fontWeight: 500 }}>
          {status}
        </Tag>
      )
    }
  ];

  const recentEmployeesList = employees.slice(0, 4);

  const customTooltipFormatter = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '12px 16px',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color, margin: '4px 0', fontSize: '13px' }}>
              <span style={{ fontWeight: 500 }}>{item.name}:</span> {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
            System Controller
          </Title>
          <Text type="secondary">
            Enterprise oversight, automated payroll distributions, and employee telemetry metrics.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate('/payroll')}
          style={{
            height: '40px',
            borderRadius: '8px',
            background: 'var(--primary-color)',
            borderColor: 'var(--primary-color)',
            fontWeight: 500,
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
          }}
        >
          Distribute Salaries
        </Button>
      </div>

      {/* Stats Cards Section */}
      <Row gutter={[24, 24]}>
        {/* Total Employees */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card" bordered={false}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>Total Employees</Text>
                  <Title level={2} style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-heading)' }}>
                    {totalEmployeesCount}
                  </Title>
                </div>
                <div className="card-icon-wrapper" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                  <UserOutlined />
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Monthly Payroll */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card" bordered={false}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Monthly Payroll ({currentMonth})
                  </Text>
                  <Title level={2} style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-heading)' }}>
                    {formatCurrency(monthlyPayrollSum)}
                  </Title>
                </div>
                <div className="card-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <DollarCircleOutlined />
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Active Departments */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card" bordered={false}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>Departments</Text>
                  <Title level={2} style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-heading)' }}>
                    {uniqueDepartments}
                  </Title>
                </div>
                <div className="card-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <ApartmentOutlined />
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Pending Payments */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card" bordered={false}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Pending Distributions
                  </Text>
                  <Title level={2} style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-heading)' }}>
                    {pendingPaymentsCount}
                  </Title>
                </div>
                <div className="card-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
                  <ClockCircleOutlined />
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Row 2: Analytics Chart (Col 16) & Distributions/Roster Widgets (Col 8) */}
      <Row gutter={[24, 24]}>
        {/* Recharts Area Chart */}
        <Col xs={24} xl={16}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
              height: '100%'
            }}
            title={
              <Space>
                <LineChartOutlined style={{ color: 'var(--primary-color)', fontSize: '18px' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Payroll Expenditure Trends</span>
              </Space>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorNetSalary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'var(--font-body)' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v / 1000}k`}
                      tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'var(--font-body)' }}
                    />
                    <Tooltip content={customTooltipFormatter} />
                    <Area
                      type="monotone"
                      dataKey="Net Salary"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorNetSalary)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* Small Analytics Side Column */}
        <Col xs={24} xl={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'space-between' }}>
            {/* Upcoming Salary Distribution Progress Widget */}
            <Card
              bordered={false}
              style={{
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
                flex: 1
              }}
              title={
                <Space>
                  <CalendarOutlined style={{ color: 'var(--success-color)' }} />
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '15px' }}>Upcoming Distribution</span>
                </Space>
              }
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '13px' }}>Current Month Runs</Text>
                    <Text style={{ fontWeight: 600, fontSize: '13px', color: 'var(--success-color)' }}>{paidRatio}% Disbursed</Text>
                  </div>
                  <Progress percent={paidRatio} strokeColor="var(--success-color)" showInfo={false} strokeWidth={8} style={{ margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <Text type="secondary">Status: <strong>{paidCurrentPayments}/{totalCurrentPayments}</strong> Paid</Text>
                    <Text type="secondary">Pending: <strong>{pendingPaymentsCount}</strong> Runs</Text>
                  </div>
                </div>
              )}
            </Card>

            {/* Active Employees Ratio widget */}
            <Card
              bordered={false}
              style={{
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
                flex: 1
              }}
              title={
                <Space>
                  <ProfileOutlined style={{ color: 'var(--primary-color)' }} />
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '15px' }}>Active Roster Summary</span>
                </Space>
              }
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '13px' }}>Operational Roster Ratio</Text>
                    <Text style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary-color)' }}>{activeRatio}% Active</Text>
                  </div>
                  <Progress percent={activeRatio} strokeColor="var(--primary-color)" trailColor="#ef4444" showInfo={false} strokeWidth={8} style={{ margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <Text type="secondary">Active: <strong>{activeCount}</strong> Employees</Text>
                    <Text type="secondary">Inactive: <strong>{inactiveCount}</strong> Staff</Text>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </Col>
      </Row>

      {/* Row 3: Recent Activity (Col 12) & Recent Hires (Col 12) */}
      <Row gutter={[24, 24]}>
        {/* Recent Payroll Activity Widget */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
              minHeight: '340px'
            }}
            title={
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Recent Payroll Activity</span>
            }
            extra={
              <Button type="link" onClick={() => navigate('/payroll')} style={{ paddingRight: 0 }}>
                View Ledger
              </Button>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <List
                dataSource={payrolls.slice(0, 4)}
                renderItem={(item) => (
                  <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontWeight: 600 }}>
                          {item.employeeName[0]}
                        </Avatar>
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.employeeName}</span>
                          <span style={{ fontWeight: 700, color: '#111827' }}>{formatCurrency(item.netSalary)}</span>
                        </div>
                      }
                      description={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '12px' }}>Ledger Month: {item.month}</span>
                          <Tag color={item.status === 'Paid' ? 'green' : 'amber'} style={{ margin: 0, borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                            {item.status.toUpperCase()}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: <Empty description="No payroll distributions recorded." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              />
            )}
          </Card>
        </Col>

        {/* Recent Hires Table Widget */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
              minHeight: '340px'
            }}
            title={
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Recent Hires</span>
            }
            extra={
              <Button type="link" onClick={() => navigate('/employees')} style={{ paddingRight: 0 }}>
                View Roster
              </Button>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <Table
                columns={recentEmployeesColumns}
                dataSource={recentEmployeesList}
                rowKey="id"
                pagination={false}
                size="small"
                style={{ fontFamily: 'var(--font-body)' }}
                locale={{ emptyText: <Empty description="No employee profiles created." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
