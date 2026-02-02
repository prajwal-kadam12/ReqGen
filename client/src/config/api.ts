/**
 * API Configuration
 * 
 * For XAMPP/PHP Backend:
 * - Make sure your project is in C:\xampp\htdocs\reqgen (Windows)
 * - Or /Applications/XAMPP/htdocs/reqgen (Mac)
 * - The PHP backend will be accessible at http://localhost/reqgen/api
 * 
 * For Node.js Backend (original):
 * - Set USE_PHP_BACKEND to false
 */

// Use PHP backend on XAMPP
export const USE_PHP_BACKEND = false;

// XAMPP PHP API base URL
// Update 'reqgen' to match your XAMPP htdocs folder name
export const PHP_API_BASE_URL = 'http://localhost/reqgen/api';

// Node.js API base URL (original backend)
export const NODEJS_API_BASE_URL = '/api';

// Active API base URL (automatically selected based on USE_PHP_BACKEND)
export const API_BASE_URL = USE_PHP_BACKEND ? PHP_API_BASE_URL : NODEJS_API_BASE_URL;

/**
 * Endpoint mapping from Node.js routes to PHP files
 * Note: Endpoints are passed WITHOUT the /api/ prefix after queryClient processes them
 */
const endpointMapping: Record<string, string> = {
  // Authentication (without /api/ prefix)
  'login': 'auth/login.php',
  'logout': 'auth/logout.php',
  'user': 'auth/check.php',
  
  // Documents
  'documents': 'documents/list.php',
  'documents/create': 'documents/create.php',
  
  // Settings
  'settings': 'settings/get.php',
  'settings/update': 'settings/update.php',
  
  // Email
  'send-email': 'email/send.php',
  
  // AI Features
  'transcribe': 'transcribe/transcribe.php',
  'refine': 'refine/refine.php',
};

// Map HTTP methods to PHP endpoints for dynamic routes
export function getApiUrlWithMethod(endpoint: string, method: string): string {
  // If not using PHP backend, return the endpoint as-is for Node.js
  if (!USE_PHP_BACKEND) {
    return endpoint.startsWith('/api/') ? endpoint : '/api/' + endpoint;
  }
  
  const cleanEndpoint = endpoint.replace(/^\/api\//, '').replace(/^\//, '');
  
  // Handle document routes with methods (PHP backend only)
  // Match both numeric IDs and UUIDs
  const docMatch = cleanEndpoint.match(/^documents\/([a-zA-Z0-9-]+)$/);
  if (docMatch) {
    const id = docMatch[1];
    if (method === 'GET') {
      // Use list.php with ID parameter for single document retrieval
      return `${PHP_API_BASE_URL}/documents/list.php?id=${id}`;
    } else if (method === 'DELETE') {
      return `${PHP_API_BASE_URL}/documents/delete.php?id=${id}`;
    } else if (method === 'PATCH' || method === 'PUT') {
      return `${PHP_API_BASE_URL}/documents/update.php?id=${id}`;
    }
  }
  
  // Fallback to regular mapping
  return getApiUrl(endpoint);
}

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  if (!USE_PHP_BACKEND) {
    // Node.js backend - return as is (add /api/ prefix back)
    return endpoint.startsWith('/api/') ? endpoint : '/api/' + endpoint;
  }
  
  // Remove /api/ prefix if present (queryClient already strips it)
  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.replace('/api/', '');
  } else if (cleanEndpoint.startsWith('api/')) {
    cleanEndpoint = cleanEndpoint.replace('api/', '');
  } else if (cleanEndpoint.startsWith('/')) {
    cleanEndpoint = cleanEndpoint.slice(1);
  }
  
  // Check if we have a direct mapping
  if (endpointMapping[cleanEndpoint]) {
    return `${PHP_API_BASE_URL}/${endpointMapping[cleanEndpoint]}`;
  }
  
  // Handle dynamic document endpoints (e.g., documents/123 or documents/uuid)
  // Note: For GET requests, use getApiUrlWithMethod instead
  if (cleanEndpoint.match(/^documents\/[a-zA-Z0-9-]+$/)) {
    const id = cleanEndpoint.split('/')[1];
    // Default to list endpoint for query operations
    return `${PHP_API_BASE_URL}/documents/list.php?id=${id}`;
  }
  
  // Fallback: try to find .php file with same name
  return `${PHP_API_BASE_URL}/${cleanEndpoint}.php`;
}
