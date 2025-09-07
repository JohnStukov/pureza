// Debug configuration to check environment variables
export const debugConfig = {
  appwriteEndpoint: process.env.REACT_APP_APPWRITE_ENDPOINT,
  appwriteProjectId: process.env.REACT_APP_APPWRITE_PROJECT_ID,
  manageUsersFunctionId: process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID,
  
  // Check if variables are properly set
  isConfigured: {
    endpoint: !!process.env.REACT_APP_APPWRITE_ENDPOINT,
    projectId: !!process.env.REACT_APP_APPWRITE_PROJECT_ID,
    functionId: !!process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID,
  },
  
  // Log configuration
  logConfig() {
    console.log('=== Appwrite Configuration Debug ===');
    console.log('Endpoint:', this.appwriteEndpoint);
    console.log('Project ID:', this.appwriteProjectId);
    console.log('Function ID:', this.manageUsersFunctionId);
    console.log('Is Configured:', this.isConfigured);
    console.log('=====================================');
  }
};

// Auto-log configuration on import
debugConfig.logConfig();

