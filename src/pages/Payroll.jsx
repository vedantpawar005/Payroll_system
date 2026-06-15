import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Select,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  message,
  Card,
  Row,
  Col,
  Typography,
  Tooltip,
  Popconfirm,
  Empty
} from 'antd';
import {
  PlusCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined as EmployeeIcon,
  ExportOutlined
} from '@ant-design/icons';
import { payrollService } from '../services/payrollService';
import { employeeService } from '../services/employeeService';
import { formatCurrency, getLastMonths } from '../utils/formatters';

const { Title, Text } = Typography;
const { Option } = Select;

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date & Filter states
  const availableMonths = getLastMonths(8); // last 8 months
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0]); // Default to latest month
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Watch fields in Form to calculate live Net Salary
  const watchedSalary = Form.useWatch('salary', form) || 0;
  const watchedBonus = Form.useWatch('bonus', form) || 0;
  const watchedDeductions = Form.useWatch('deductions', form) || 0;
  const computedNetSalary = watchedSalary + watchedBonus - watchedDeductions;

  const loadData = async () => {
    try {
      setLoading(true);
      const [payList, empList] = await Promise.all([
        payrollService.getPayrolls(),
        employeeService.getEmployees()
      ]);
      setPayrolls(payList);
      setEmployees(empList);
    } catch (error) {
      console.error('Error loading payroll records:', error);
      message.error('Failed to retrieve payroll history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    form.resetFields();
    form.setFieldsValue({
      month: selectedMonth || availableMonths[0],
      bonus: 0,
      deductions: 0,
      status: 'Pending'
    });
    setModalOpen(true);
  };

  const handleEmployeeChange = (employeeId) => {
    const selectedEmp = employees.find(emp => emp.id === employeeId);
    if (selectedEmp) {
      form.setFieldsValue({
        salary: selectedEmp.salary
      });
      message.info(`Preloaded base salary: ${formatCurrency(selectedEmp.salary)}`);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const selectedEmp = employees.find(emp => emp.id === values.employeeId);
      if (!selectedEmp) throw new Error('Invalid employee selected.');

      const payrollPayload = {
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
        month: values.month,
        salary: values.salary,
        bonus: values.bonus,
        deductions: values.deductions,
        status: values.status
      };

      await payrollService.createPayroll(payrollPayload);
      message.success(`Payroll generated successfully for ${selectedEmp.name} for ${values.month}.`);
      setModalOpen(false);
      await loadData();
    } catch (error) {
      if (error?.message) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (record) => {
    try {
      setLoading(true);
      const nextStatus = record.status === 'Paid' ? 'Pending' : 'Paid';
      await payrollService.updatePayrollStatus(record.id, nextStatus);
      message.success(`Distribution status updated for ${record.employeeName}.`);
      await loadData();
    } catch (error) {
      console.error('Error toggling status:', error);
      message.error(error.message || 'Failed to update payroll status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayroll = async (id, employeeName) => {
    try {
      setLoading(true);
      await payrollService.deletePayroll(id);
      message.success(`Payroll entry for "${employeeName}" deleted.`);
      await loadData();
    } catch (error) {
      console.error('Error deleting payroll entry:', error);
      message.error(error.message || 'Failed to delete payroll entry.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredPayrolls.length === 0) {
      message.warning('No payroll records available to export.');
      return;
    }
    const headers = ['Employee Name', 'Month', 'Base Salary', 'Bonus', 'Deductions', 'Net Salary', 'Status'];
    const rows = filteredPayrolls.map(p => [
      `"${p.employeeName}"`,
      p.month,
      p.salary,
      p.bonus,
      p.deductions,
      p.netSalary,
      p.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payroll_ledger_${selectedMonth || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Payroll ledger exported successfully as CSV.');
  };

  // Only list Active employees in selection modal
  const activeEmployees = employees.filter(emp => emp.status === 'Active');

  // Filter records based on UI picks
  const filteredPayrolls = payrolls.filter(p => {
    const matchesMonth = !selectedMonth || p.month === selectedMonth;
    const matchesSearch = p.employeeName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesMonth && matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Employee Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text) => (
        <Space>
          <AvatarStyle>{text[0]}</AvatarStyle>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{text}</span>
        </Space>
      )
    },
    {
      title: 'Ledger Month',
      dataIndex: 'month',
      key: 'month',
      render: (val) => {
        const date = new Date(val + '-02');
        return isNaN(date.getTime()) ? val : date.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
    },
    {
      title: 'Base Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (val) => formatCurrency(val)
    },
    {
      title: 'Bonus Allocation',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (val) => <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>+ {formatCurrency(val)}</span>
    },
    {
      title: 'Deductions (Taxes/Fees)',
      dataIndex: 'deductions',
      key: 'deductions',
      render: (val) => <span style={{ color: 'var(--danger-color)', fontWeight: 600 }}>- {formatCurrency(val)}</span>
    },
    {
      title: 'Net Salary',
      dataIndex: 'netSalary',
      key: 'netSalary',
      sorter: (a, b) => a.netSalary - b.netSalary,
      render: (val) => <span style={{ fontWeight: 700, color: '#111827' }}>{formatCurrency(val)}</span>
    },
    {
      title: 'Distribution Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => (
        <Tag color={status === 'Paid' ? 'green' : 'amber'} style={{ borderRadius: '4px', fontWeight: 600 }}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Quick Controls',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'Pending' ? (
            <Tooltip title="Mark as Paid">
              <Button
                type="text"
                icon={<CheckCircleOutlined style={{ color: 'var(--success-color)' }} />}
                onClick={() => handleToggleStatus(record)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Mark as Pending">
              <Button
                type="text"
                icon={<CloseCircleOutlined style={{ color: 'var(--warning-color)' }} />}
                onClick={() => handleToggleStatus(record)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Delete Payroll Record?"
            description={`Are you sure you want to delete the payroll entry for ${record.employeeName} for ${record.month}?`}
            onConfirm={() => handleDeletePayroll(record.id, record.employeeName)}
            okText="Delete Ledger"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: '#ef4444' }} />}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Helper avatar styling for employee row representation
  const AvatarStyle = ({ children }) => (
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: 'var(--primary-light)',
      color: 'var(--primary-color)',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontFamily: 'var(--font-heading)'
    }}>
      {children}
    </div>
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
            Payroll Ledger Sheets
          </Title>
          <Text type="secondary">
            Process monthly payroll distributions, calculate net salary payouts, track payment statuses, and compile auditing reports.
          </Text>
        </div>
        <Space size="middle">
          <Button
            icon={<ExportOutlined />}
            onClick={handleExportCSV}
            style={{
              height: '40px',
              borderRadius: '8px',
              fontWeight: 500
            }}
          >
            Export Ledger
          </Button>
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleOpenModal}
            style={{
              height: '40px',
              borderRadius: '8px',
              background: 'var(--primary-color)',
              borderColor: 'var(--primary-color)',
              fontWeight: 500,
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
            }}
          >
            Generate Payroll
          </Button>
        </Space>
      </div>

      {/* Filters Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          {/* Month & Status Filter Picker */}
          <Col xs={24} md={12}>
            <Space wrap size="middle">
              <Space>
                <CalendarOutlined style={{ color: 'var(--text-muted)' }} />
                <Select
                  value={selectedMonth}
                  onChange={(val) => setSelectedMonth(val)}
                  style={{ width: '200px' }}
                  dropdownStyle={{ fontFamily: 'var(--font-body)' }}
                >
                  <Option value="">All Historical Ledgers</Option>
                  {availableMonths.map((m) => {
                    const date = new Date(m + '-02');
                    const label = isNaN(date.getTime()) ? m : date.toLocaleString('default', { month: 'long', year: 'numeric' });
                    return <Option key={m} value={m}>{label}</Option>;
                  })}
                </Select>
              </Space>

              <Space>
                <FilterOutlined style={{ color: 'var(--text-muted)' }} />
                <Select
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  style={{ width: '150px' }}
                  dropdownStyle={{ fontFamily: 'var(--font-body)' }}
                >
                  <Option value="All">All Statuses</Option>
                  <Option value="Paid">Paid Only</Option>
                  <Option value="Pending">Pending Only</Option>
                </Select>
              </Space>
            </Space>
          </Col>

          {/* Employee name search */}
          <Col xs={24} md={12}>
            <Input
              placeholder="Search payroll records by employee name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: '8px', maxWidth: '340px', float: 'right' }}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* Ledger Table */}
      <Card
        bordered={false}
        style={{
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
        }}
        bodyStyle={{ padding: '0px' }}
      >
        <Table
          columns={columns}
          dataSource={filteredPayrolls}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} payroll runs`,
            style: { padding: '16px' }
          }}
          style={{ fontFamily: 'var(--font-body)' }}
          locale={{ emptyText: <Empty description="No payroll records found matching the filters." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        />
      </Card>

      {/* Generate Payroll Modal */}
      <Modal
        title={
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700 }}>
            Generate Monthly Payroll Run
          </span>
        }
        open={modalOpen}
        onOk={handleGeneratePayroll}
        onCancel={() => setModalOpen(false)}
        okText="Generate Ledger Run"
        cancelText="Cancel"
        confirmLoading={loading}
        destroyOnClose
        style={{ borderRadius: '12px' }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px', fontFamily: 'var(--font-body)' }}
        >
          {/* Target Month */}
          <Form.Item
            name="month"
            label={<span style={{ fontWeight: 500 }}>Target Ledger Month</span>}
            rules={[{ required: true, message: 'Please select target month!' }]}
          >
            <Select style={{ width: '100%' }}>
              {availableMonths.map((m) => {
                const date = new Date(m + '-02');
                const label = isNaN(date.getTime()) ? m : date.toLocaleString('default', { month: 'long', year: 'numeric' });
                return <Option key={m} value={m}>{label}</Option>;
              })}
            </Select>
          </Form.Item>

          {/* Employee Dropdown Selection */}
          <Form.Item
            name="employeeId"
            label={<span style={{ fontWeight: 500 }}>Select Active Employee</span>}
            rules={[{ required: true, message: 'Please choose an employee!' }]}
          >
            <Select
              placeholder="Search or select employee"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={handleEmployeeChange}
              style={{ width: '100%' }}
            >
              {activeEmployees.map((emp) => (
                <Option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            {/* Base Salary */}
            <Col span={24}>
              <Form.Item
                name="salary"
                label={<span style={{ fontWeight: 500 }}>Base Salary (Preloaded)</span>}
                rules={[{ required: true, message: 'Base salary is required!' }]}
              >
                <InputNumber
                  style={{ width: '100%', borderRadius: '6px' }}
                  disabled
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* Bonus */}
            <Col span={12}>
              <Form.Item
                name="bonus"
                label={<span style={{ fontWeight: 500 }}>Bonus Allocation</span>}
                rules={[{ required: true, message: 'Please enter bonus amount!' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%', borderRadius: '6px' }}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>

            {/* Deductions */}
            <Col span={12}>
              <Form.Item
                name="deductions"
                label={<span style={{ fontWeight: 500 }}>Deductions Offset</span>}
                rules={[{ required: true, message: 'Please enter deductions amount!' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%', borderRadius: '6px' }}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Payment Status */}
          <Form.Item
            name="status"
            label={<span style={{ fontWeight: 500 }}>Initial Payment Status</span>}
            rules={[{ required: true, message: 'Please choose payment status!' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="Paid">Paid</Option>
              <Option value="Pending">Pending</Option>
            </Select>
          </Form.Item>

          {/* Premium Net Salary Computation Banner */}
          <div style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Computed Net Salary Payout
            </div>
            <div style={{
              fontSize: '26px',
              fontWeight: 800,
              color: computedNetSalary < 0 ? 'var(--danger-color)' : 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              margin: '8px 0'
            }}>
              {formatCurrency(computedNetSalary)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Formula: Base Salary ({formatCurrency(watchedSalary)}) + Bonus ({formatCurrency(watchedBonus)}) - Deductions ({formatCurrency(watchedDeductions)})
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Payroll;
