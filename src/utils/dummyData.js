export const DEPARTMENTS = [
  'Engineering',
  'Product Management',
  'Sales & Marketing',
  'Human Resources',
  'Finance',
  'Customer Success'
];

export const DESIGNATIONS = {
  'Engineering': ['Software Engineer', 'Senior Engineer', 'Lead Architect', 'QA Engineer'],
  'Product Management': ['Product Associate', 'Product Manager', 'Director of Product'],
  'Sales & Marketing': ['Marketing Specialist', 'Sales Representative', 'Sales Manager'],
  'Human Resources': ['HR Coordinator', 'HR Manager', 'Talent Acquisition'],
  'Finance': ['Financial Analyst', 'Finance Manager', 'Accountant'],
  'Customer Success': ['CS Representative', 'CS Lead', 'Support Specialist']
};

export const INITIAL_EMPLOYEES = [
  {
    id: 'emp-1',
    name: 'Vedant Pawar',
    email: 'vedant@payroll.com',
    department: 'Engineering',
    designation: 'Lead Architect',
    salary: 125000,
    joiningDate: '2023-01-15',
    status: 'Active'
  },
  {
    id: 'emp-2',
    name: 'Sarah Connor',
    email: 'sarah.c@payroll.com',
    department: 'Engineering',
    designation: 'Senior Engineer',
    salary: 98000,
    joiningDate: '2023-06-10',
    status: 'Active'
  },
  {
    id: 'emp-3',
    name: 'John Doe',
    email: 'john.d@payroll.com',
    department: 'Sales & Marketing',
    designation: 'Sales Manager',
    salary: 82000,
    joiningDate: '2024-02-01',
    status: 'Active'
  },
  {
    id: 'emp-4',
    name: 'Jane Smith',
    email: 'jane.s@payroll.com',
    department: 'Human Resources',
    designation: 'HR Manager',
    salary: 75000,
    joiningDate: '2022-11-20',
    status: 'Active'
  },
  {
    id: 'emp-5',
    name: 'Alice Johnson',
    email: 'alice.j@payroll.com',
    department: 'Product Management',
    designation: 'Product Manager',
    salary: 95000,
    joiningDate: '2023-08-15',
    status: 'Active'
  },
  {
    id: 'emp-6',
    name: 'Bob Miller',
    email: 'bob.m@payroll.com',
    department: 'Finance',
    designation: 'Financial Analyst',
    salary: 70000,
    joiningDate: '2024-01-10',
    status: 'Active'
  },
  {
    id: 'emp-7',
    name: 'Clarissa Vance',
    email: 'clarissa.v@payroll.com',
    department: 'Customer Success',
    designation: 'CS Lead',
    salary: 65000,
    joiningDate: '2023-03-05',
    status: 'Active'
  },
  {
    id: 'emp-8',
    name: 'David Wright',
    email: 'david.w@payroll.com',
    department: 'Engineering',
    designation: 'Software Engineer',
    salary: 85000,
    joiningDate: '2024-04-12',
    status: 'Active'
  },
  {
    id: 'emp-9',
    name: 'Elena Rostova',
    email: 'elena.r@payroll.com',
    department: 'Sales & Marketing',
    designation: 'Marketing Specialist',
    salary: 60000,
    joiningDate: '2024-05-01',
    status: 'Active'
  },
  {
    id: 'emp-10',
    name: 'Frank Castle',
    email: 'frank.c@payroll.com',
    department: 'Customer Success',
    designation: 'CS Representative',
    salary: 50000,
    joiningDate: '2023-10-15',
    status: 'Inactive'
  }
];

export const INITIAL_PAYROLLS = [
  // 2026-03 Payrolls
  {
    id: 'pay-1',
    employeeId: 'emp-1',
    employeeName: 'Vedant Pawar',
    month: '2026-03',
    salary: 125000,
    bonus: 10000,
    deductions: 5000,
    netSalary: 130000,
    status: 'Paid'
  },
  {
    id: 'pay-2',
    employeeId: 'emp-2',
    employeeName: 'Sarah Connor',
    month: '2026-03',
    salary: 98000,
    bonus: 5000,
    deductions: 4000,
    netSalary: 99000,
    status: 'Paid'
  },
  {
    id: 'pay-3',
    employeeId: 'emp-3',
    employeeName: 'John Doe',
    month: '2026-03',
    salary: 82000,
    bonus: 8000,
    deductions: 3500,
    netSalary: 86500,
    status: 'Paid'
  },
  {
    id: 'pay-4',
    employeeId: 'emp-4',
    employeeName: 'Jane Smith',
    month: '2026-03',
    salary: 75000,
    bonus: 0,
    deductions: 3000,
    netSalary: 72000,
    status: 'Paid'
  },
  {
    id: 'pay-5',
    employeeId: 'emp-5',
    employeeName: 'Alice Johnson',
    month: '2026-03',
    salary: 95000,
    bonus: 4000,
    deductions: 3800,
    netSalary: 95200,
    status: 'Paid'
  },
  // 2026-04 Payrolls
  {
    id: 'pay-6',
    employeeId: 'emp-1',
    employeeName: 'Vedant Pawar',
    month: '2026-04',
    salary: 125000,
    bonus: 12000,
    deductions: 5000,
    netSalary: 132000,
    status: 'Paid'
  },
  {
    id: 'pay-7',
    employeeId: 'emp-2',
    employeeName: 'Sarah Connor',
    month: '2026-04',
    salary: 98000,
    bonus: 6000,
    deductions: 4000,
    netSalary: 100000,
    status: 'Paid'
  },
  {
    id: 'pay-8',
    employeeId: 'emp-3',
    employeeName: 'John Doe',
    month: '2026-04',
    salary: 82000,
    bonus: 15000,
    deductions: 3500,
    netSalary: 93500,
    status: 'Paid'
  },
  {
    id: 'pay-9',
    employeeId: 'emp-4',
    employeeName: 'Jane Smith',
    month: '2026-04',
    salary: 75000,
    bonus: 2000,
    deductions: 3000,
    netSalary: 74000,
    status: 'Paid'
  },
  {
    id: 'pay-10',
    employeeId: 'emp-5',
    employeeName: 'Alice Johnson',
    month: '2026-04',
    salary: 95000,
    bonus: 5000,
    deductions: 3800,
    netSalary: 96200,
    status: 'Pending'
  },
  // 2026-05 Payrolls (Current Month)
  {
    id: 'pay-11',
    employeeId: 'emp-1',
    employeeName: 'Vedant Pawar',
    month: '2026-05',
    salary: 125000,
    bonus: 15000,
    deductions: 5500,
    netSalary: 134500,
    status: 'Paid'
  },
  {
    id: 'pay-12',
    employeeId: 'emp-2',
    employeeName: 'Sarah Connor',
    month: '2026-05',
    salary: 98000,
    bonus: 8000,
    deductions: 4500,
    netSalary: 101500,
    status: 'Pending'
  },
  {
    id: 'pay-13',
    employeeId: 'emp-3',
    employeeName: 'John Doe',
    month: '2026-05',
    salary: 82000,
    bonus: 12000,
    deductions: 3500,
    netSalary: 90500,
    status: 'Paid'
  },
  {
    id: 'pay-14',
    employeeId: 'emp-5',
    employeeName: 'Alice Johnson',
    month: '2026-05',
    salary: 95000,
    bonus: 6000,
    deductions: 4000,
    netSalary: 97000,
    status: 'Pending'
  }
];
