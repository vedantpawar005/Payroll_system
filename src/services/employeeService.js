import { databases, APPWRITE_CONFIG } from './appwrite';
import { ID, Query } from 'appwrite';
import { INITIAL_EMPLOYEES } from '../utils/dummyData';

const EMPLOYEES_STORAGE_KEY = 'payroll_employees';

// Helper to load/initialize local storage employees
const getLocalEmployees = () => {
  const data = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
    return INITIAL_EMPLOYEES;
  }
  return JSON.parse(data);
};

const saveLocalEmployees = (employees) => {
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
};

export const employeeService = {
  isDemoMode() {
    return !APPWRITE_CONFIG.isConfigured;
  },

  /**
   * Fetch all employees.
   */
  async getEmployees() {
    if (this.isDemoMode()) {
      return getLocalEmployees();
    } else {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.employees,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
      );
      // Map Appwrite document properties to local naming standard
      return response.documents.map(doc => ({
        id: doc.$id,
        name: doc.name,
        email: doc.email,
        department: doc.department,
        designation: doc.designation,
        salary: doc.salary,
        joiningDate: doc.joiningDate,
        status: doc.status
      }));
    }
  },

  /**
   * Create a new employee.
   * @param {Object} employeeData
   */
  async createEmployee(employeeData) {
    if (this.isDemoMode()) {
      const employees = getLocalEmployees();
      const newEmployee = {
        id: `emp-${Date.now()}`,
        ...employeeData,
        salary: Number(employeeData.salary)
      };
      employees.unshift(newEmployee);
      saveLocalEmployees(employees);
      return newEmployee;
    } else {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.employees,
        ID.unique(),
        {
          name: employeeData.name,
          email: employeeData.email,
          department: employeeData.department,
          designation: employeeData.designation,
          salary: Number(employeeData.salary),
          joiningDate: employeeData.joiningDate,
          status: employeeData.status
        }
      );
      return {
        id: response.$id,
        ...employeeData,
        salary: Number(employeeData.salary)
      };
    }
  },

  /**
   * Update an employee.
   * @param {string} id
   * @param {Object} employeeData
   */
  async updateEmployee(id, employeeData) {
    if (this.isDemoMode()) {
      const employees = getLocalEmployees();
      const index = employees.findIndex(emp => emp.id === id);
      if (index === -1) throw new Error('Employee not found');

      const updated = {
        ...employees[index],
        ...employeeData,
        salary: Number(employeeData.salary)
      };
      employees[index] = updated;
      saveLocalEmployees(employees);
      return updated;
    } else {
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.employees,
        id,
        {
          name: employeeData.name,
          email: employeeData.email,
          department: employeeData.department,
          designation: employeeData.designation,
          salary: Number(employeeData.salary),
          joiningDate: employeeData.joiningDate,
          status: employeeData.status
        }
      );
      return {
        id: response.$id,
        ...employeeData,
        salary: Number(employeeData.salary)
      };
    }
  },

  /**
   * Delete an employee.
   * @param {string} id
   */
  async deleteEmployee(id) {
    if (this.isDemoMode()) {
      const employees = getLocalEmployees();
      const filtered = employees.filter(emp => emp.id !== id);
      saveLocalEmployees(filtered);
      return true;
    } else {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.employees,
        id
      );
      return true;
    }
  }
};
