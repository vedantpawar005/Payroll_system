import { databases, APPWRITE_CONFIG } from './appwrite';
import { ID, Query } from 'appwrite';
import { INITIAL_PAYROLLS } from '../utils/dummyData';

const PAYROLLS_STORAGE_KEY = 'payroll_records';

// Helper to load/initialize local storage payrolls
const getLocalPayrolls = () => {
  const data = localStorage.getItem(PAYROLLS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(PAYROLLS_STORAGE_KEY, JSON.stringify(INITIAL_PAYROLLS));
    return INITIAL_PAYROLLS;
  }
  return JSON.parse(data);
};

const saveLocalPayrolls = (payrolls) => {
  localStorage.setItem(PAYROLLS_STORAGE_KEY, JSON.stringify(payrolls));
};

export const payrollService = {
  isDemoMode() {
    return !APPWRITE_CONFIG.isConfigured;
  },

  /**
   * Fetch all payrolls. Optionally filter by month (format YYYY-MM).
   * @param {string} [monthFilter]
   */
  async getPayrolls(monthFilter) {
    if (this.isDemoMode()) {
      const payrolls = getLocalPayrolls();
      if (monthFilter) {
        return payrolls.filter(p => p.month === monthFilter);
      }
      return payrolls;
    } else {
      const queries = [Query.orderDesc('$createdAt'), Query.limit(100)];
      if (monthFilter) {
        queries.push(Query.equal('month', monthFilter));
      }
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.payrolls,
        queries
      );
      return response.documents.map(doc => ({
        id: doc.$id,
        employeeId: doc.employeeId,
        employeeName: doc.employeeName,
        month: doc.month,
        salary: doc.salary,
        bonus: doc.bonus,
        deductions: doc.deductions,
        netSalary: doc.netSalary,
        status: doc.status
      }));
    }
  },

  /**
   * Generates a new payroll entry.
   * @param {Object} payrollData
   */
  async createPayroll(payrollData) {
    const salary = Number(payrollData.salary);
    const bonus = Number(payrollData.bonus || 0);
    const deductions = Number(payrollData.deductions || 0);
    // Net Salary = Salary + Bonus - Deductions
    const netSalary = salary + bonus - deductions;

    if (this.isDemoMode()) {
      const payrolls = getLocalPayrolls();
      
      // Prevent duplicate monthly entry for the same employee
      const duplicate = payrolls.find(
        p => p.employeeId === payrollData.employeeId && p.month === payrollData.month
      );
      if (duplicate) {
        throw new Error(`Payroll for ${payrollData.employeeName} has already been generated for ${payrollData.month}.`);
      }

      const newPayroll = {
        id: `pay-${Date.now()}`,
        employeeId: payrollData.employeeId,
        employeeName: payrollData.employeeName,
        month: payrollData.month,
        salary,
        bonus,
        deductions,
        netSalary,
        status: payrollData.status || 'Pending'
      };
      payrolls.unshift(newPayroll);
      saveLocalPayrolls(payrolls);
      return newPayroll;
    } else {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.payrolls,
        ID.unique(),
        {
          employeeId: payrollData.employeeId,
          employeeName: payrollData.employeeName,
          month: payrollData.month,
          salary,
          bonus,
          deductions,
          netSalary,
          status: payrollData.status || 'Pending'
        }
      );
      return {
        id: response.$id,
        employeeId: payrollData.employeeId,
        employeeName: payrollData.employeeName,
        month: payrollData.month,
        salary,
        bonus,
        deductions,
        netSalary,
        status: payrollData.status || 'Pending'
      };
    }
  },

  /**
   * Update the payment status (Paid/Pending) of a payroll record.
   * @param {string} id
   * @param {string} status 'Paid' | 'Pending'
   */
  async updatePayrollStatus(id, status) {
    if (this.isDemoMode()) {
      const payrolls = getLocalPayrolls();
      const index = payrolls.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Payroll entry not found');
      
      payrolls[index].status = status;
      saveLocalPayrolls(payrolls);
      return payrolls[index];
    } else {
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.payrolls,
        id,
        { status }
      );
      return response;
    }
  },

  /**
   * Delete a payroll entry.
   * @param {string} id
   */
  async deletePayroll(id) {
    if (this.isDemoMode()) {
      const payrolls = getLocalPayrolls();
      const filtered = payrolls.filter(p => p.id !== id);
      saveLocalPayrolls(filtered);
      return true;
    } else {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.payrolls,
        id
      );
      return true;
    }
  }
};
