import { Client, Account, Databases } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || '';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';

// Determine if we have valid Appwrite credentials.
// If VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID are missing or are placeholder values,
// the services will fallback to the LocalStorage Demo Mode.
const isAppwriteConfigured = 
  !!endpoint && 
  !!projectId && 
  endpoint !== 'YOUR_APPWRITE_ENDPOINT' && 
  projectId !== 'YOUR_APPWRITE_PROJECT_ID';

const client = new Client();

if (isAppwriteConfigured) {
  client
    .setEndpoint(endpoint)
    .setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export { client };

export const APPWRITE_CONFIG = {
  isConfigured: isAppwriteConfigured,
  databaseId: databaseId || 'payroll_db',
  collections: {
    employees: import.meta.env.VITE_APPWRITE_EMPLOYEES_COLLECTION_ID || 'employees',
    payrolls: import.meta.env.VITE_APPWRITE_PAYROLLS_COLLECTION_ID || 'payrolls'
  }
};
