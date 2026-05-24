import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Button, Space, Skeleton, message } from 'antd';
import {
  UserOutlined,
  DollarCircleOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { payrollService } from '../services/payrollService';
import { formatCurrency, formatDate } from '../utils/formatters';

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

  // Compute Statistics
  const totalEmployeesCount = employees.length;
  
  const uniqueDepartments = [...new Set(employees.map(emp => emp.department))].length;

  // Let's find the current active payroll month. E.g. "2026-05" is the latest month present in dummyData.
  const allMonths = [...new Set(payrolls.map(p => p.month))].sort();
  const currentMonth = allMonths[allMonths.length - 1] || 'N/A';

  const currentMonthPayrolls = payrolls.filter(p => p.month === currentMonth);
  const monthlyPayrollSum = currentMonthPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

  const pendingPaymentsCount = currentMonthPayrolls.filter(p => p.status === 'Pending').length;

  // Recharts Chart Formatting
  // Format aggregated payroll details per month:
  const chartData = allMonths.map(month => {
    const monthPayrolls = payrolls.filter(p => p.month === month);
    const netSalaryTotal = monthPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const baseSalaryTotal = monthPayrolls.reduce((sum, p) => sum + p.salary, 0);
    const bonusTotal = monthPayrolls.reduce((sum, p) => sum + p.bonus, 0);
    const deductionsTotal = monthPayrolls.reduce((sum, p) => sum + p.deductions, 0);
    
    // Convert YYYY-MM to readable month (e.g. "2026-05" -> "May 2026")
    const date = new Date(month + '-02'); // Add buffer day to avoid timezone offsets
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
        <Space direction="vertical" size={0}>
          <Text style={{ fontWeight: 600 }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
        </Space>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => <Tag color="blue">{dept}</Tag>
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    }
  ];

  const recentEmployeesList = employees.slice(0, 5);

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
            fontWeight: 500
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

      {/* Analytics Chart & Recent Employees */}
      <Row gutter={[24, 24]}>
        {/* Recharts Area Chart */}
        <Col xs={24} xl={16}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
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
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
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

        {/* Recent Employees Table */}
        <Col xs={24} xl={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
              height: '100%'
            }}
            title={
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Recent Hires</span>
            }
            extra={
              <Button type="link" onClick={() => navigate('/employees')} style={{ paddingRight: 0 }}>
                View All
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
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
