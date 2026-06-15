import { account, APPWRITE_CONFIG } from './appwrite';

const DEMO_USER_KEY = 'payroll_demo_user';
const DEFAULT_DEMO_USER = {
  $id: 'demo-admin-1',
  name: 'Payroll Admin',
  email: 'payroll@gmail.com',
  registration: new Date().toISOString(),
  status: true
};

export const authService = {
  /**
   * Checks if running in demo mode.
   * @returns {boolean}
   */
  isDemoMode() {
    return !APPWRITE_CONFIG.isConfigured;
  },

  /**
   * Logs in a user.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    if (this.isDemoMode()) {
      // Simulate authentication with standard admin credentials
      if (email === 'payroll@gmail.com' && password === 'payroll123') {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
        return DEFAULT_DEMO_USER;
      }
      throw new Error('Invalid email or password. Use: payroll@gmail.com / payroll123');
    } else {
      // Create session in Appwrite
      await account.createEmailPasswordSession(email, password);
      return await account.get();
    }
  },

  /**
   * Logs out the current session.
   */
  async logout() {
    if (this.isDemoMode()) {
      localStorage.removeItem(DEMO_USER_KEY);
      return true;
    } else {
      await account.deleteSession('current');
      return true;
    }
  },

  /**
   * Fetches the current logged in user session.
   */
  async getCurrentUser() {
    if (this.isDemoMode()) {
      const userJSON = localStorage.getItem(DEMO_USER_KEY);
      if (userJSON) {
        return JSON.parse(userJSON);
      }
      return null;
    } else {
      try {
        return await account.get();
      } catch (error) {
        // Safe check if no session exists in Appwrite
        console.warn('Appwrite session lookup failed:', error.message);
        return null;
      }
    }
  }
};
