import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Typography,
  Empty,
  Avatar
} from 'antd';
import {
  UserAddOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { employeeService } from '../services/employeeService';
import { DEPARTMENTS, DESIGNATIONS } from '../utils/dummyData';
import { formatCurrency, formatDate } from '../utils/formatters';

const { Title, Text } = Typography;
const { Option } = Select;

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();
  
  // Watch department in modal form to dynamically filter designations
  const [selectedDeptInForm, setSelectedDeptInForm] = useState('');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      message.error('Failed to load employee records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setSelectedDeptInForm('');
    form.resetFields();
    form.setFieldsValue({
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (employee) => {
    setEditingEmployee(employee);
    setSelectedDeptInForm(employee.department);
    form.resetFields();
    form.setFieldsValue({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      salary: employee.salary,
      joiningDate: employee.joiningDate,
      status: employee.status
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (editingEmployee) {
        // Edit flow
        const updated = await employeeService.updateEmployee(editingEmployee.id, values);
        message.success(`Employee profile for "${updated.name}" updated successfully.`);
      } else {
        // Add flow
        const created = await employeeService.createEmployee(values);
        message.success(`New employee "${created.name}" created successfully.`);
      }
      
      setModalOpen(false);
      await fetchEmployees();
    } catch (error) {
      // ValidateFields rejection doesn't need message, only service errors
      if (error?.message) {
        message.error(error.message || 'Operation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    try {
      setLoading(true);
      await employeeService.deleteEmployee(id);
      message.success(`Employee profile for "${name}" has been deleted.`);
      await fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      message.error(error.message || 'Failed to delete employee profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setDeptFilter('All');
    setStatusFilter('All');
  };

  // Dynamic Designation filtering in modal form
  const handleDepartmentChange = (value) => {
    setSelectedDeptInForm(value);
    // Reset designation selection when department changes to prevent misalignment
    form.setFieldsValue({ designation: undefined });
  };

  // Filter and search logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchText.toLowerCase());

    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const columns = [
    {
      title: 'Employee Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Space size="middle">
          <Avatar style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontWeight: 600 }}>
            {text[0]}
          </Avatar>
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{text}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{record.email}</span>
          </Space>
        </Space>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      filters: DEPARTMENTS.map(d => ({ text: d, value: d })),
      onFilter: (value, record) => record.department === value,
      render: (dept) => <Tag color="indigo" style={{ borderRadius: '4px' }}>{dept}</Tag>
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation'
    },
    {
      title: 'Base Salary',
      dataIndex: 'salary',
      key: 'salary',
      sorter: (a, b) => a.salary - b.salary,
      render: (val) => <span style={{ fontWeight: 500 }}>{formatCurrency(val)}</span>
    },
    {
      title: 'Joining Date',
      dataIndex: 'joiningDate',
      key: 'joiningDate',
      sorter: (a, b) => new Date(a.joiningDate) - new Date(b.joiningDate),
      render: (val) => formatDate(val)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'} style={{ borderRadius: '4px', fontWeight: 600 }}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#4f46e5' }} />}
            onClick={() => handleOpenEditModal(record)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
          <Popconfirm
            title="Delete Staff Record?"
            description={`Are you absolutely sure you want to delete the profile for "${record.name}"? This action cannot be undone.`}
            onConfirm={() => handleDeleteEmployee(record.id, record.name)}
            okText="Delete Profile"
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

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
            Employee Management
          </Title>
          <Text type="secondary">
            Maintain employee rosters, allocate departments, baseline base salaries, and customize designations.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleOpenAddModal}
          style={{
            height: '40px',
            borderRadius: '8px',
            background: 'var(--primary-color)',
            borderColor: 'var(--primary-color)',
            fontWeight: 500
          }}
        >
          Add Employee
        </Button>
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
          {/* Search bar */}
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by name, email, or designation..."
              prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: '8px' }}
              allowClear
            />
          </Col>
          
          {/* Department Filter */}
          <Col xs={12} md={6}>
            <Select
              style={{ width: '100%', borderRadius: '8px' }}
              value={deptFilter}
              onChange={(v) => setDeptFilter(v)}
            >
              <Option value="All">All Departments</Option>
              {DEPARTMENTS.map((dept) => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Col>

          {/* Status Filter */}
          <Col xs={12} md={6}>
            <Select
              style={{ width: '100%', borderRadius: '8px' }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
            >
              <Option value="All">All Statuses</Option>
              <Option value="Active">Active Only</Option>
              <Option value="Inactive">Inactive Only</Option>
            </Select>
          </Col>

          {/* Clear Filters */}
          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
              style={{
                width: '100%',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table Card */}
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
          dataSource={filteredEmployees}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
            style: { padding: '16px' }
          }}
          style={{ fontFamily: 'var(--font-body)' }}
          locale={{
            emptyText: <Empty description="No employees found matching the filters." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          }}
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700 }}>
            {editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}
          </span>
        }
        open={modalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingEmployee ? 'Save Changes' : 'Create Profile'}
        cancelText="Cancel"
        confirmLoading={loading}
        destroyOnClose
        style={{ borderRadius: '12px', overflow: 'hidden' }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px', fontFamily: 'var(--font-body)' }}
        >
          {/* Employee Name */}
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 500 }}>Full Name</span>}
            rules={[{ required: true, message: 'Please input employee full name!' }]}
          >
            <Input placeholder="E.g., John Doe" style={{ borderRadius: '6px' }} />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 500 }}>Email Address</span>}
            rules={[
              { required: true, message: 'Please input corporate email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="john.doe@payroll.com" style={{ borderRadius: '6px' }} />
          </Form.Item>

          {/* Department */}
          <Form.Item
            name="department"
            label={<span style={{ fontWeight: 500 }}>Department</span>}
            rules={[{ required: true, message: 'Please select a department!' }]}
          >
            <Select
              placeholder="Select department"
              onChange={handleDepartmentChange}
              style={{ width: '100%', borderRadius: '6px' }}
            >
              {DEPARTMENTS.map((dept) => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* Designation (Dynamically computed based on selected department) */}
          <Form.Item
            name="designation"
            label={<span style={{ fontWeight: 500 }}>Designation</span>}
            rules={[{ required: true, message: 'Please choose or type designation!' }]}
          >
            <Select
              placeholder={selectedDeptInForm ? "Select designation" : "Please select department first"}
              disabled={!selectedDeptInForm}
              style={{ width: '100%' }}
            >
              {selectedDeptInForm && DESIGNATIONS[selectedDeptInForm]?.map((title) => (
                <Option key={title} value={title}>{title}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* Base Salary */}
          <Form.Item
            name="salary"
            label={<span style={{ fontWeight: 500 }}>Base Salary (Monthly)</span>}
            rules={[
              { required: true, message: 'Please enter base salary!' },
              { type: 'number', min: 0, message: 'Salary must be a positive number!' }
            ]}
          >
            <InputNumber
              placeholder="Enter monthly base salary"
              style={{ width: '100%', borderRadius: '6px' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          {/* Joining Date */}
          <Form.Item
            name="joiningDate"
            label={<span style={{ fontWeight: 500 }}>Joining Date</span>}
            rules={[{ required: true, message: 'Please input joining date!' }]}
          >
            <Input type="date" style={{ borderRadius: '6px' }} />
          </Form.Item>

          {/* Status */}
          <Form.Item
            name="status"
            label={<span style={{ fontWeight: 500 }}>Employment Status</span>}
            rules={[{ required: true, message: 'Please select employment status!' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Employees;
