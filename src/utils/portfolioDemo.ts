/**
 * Portfolio Demo Mode Utilities
 * 
 * Automatically logs in visitors with a demo token for portfolio demonstrations.
 * This allows recruiters/visitors to immediately use all features without authentication.
 */

export const PORTFOLIO_DEMO_TOKEN = 'portfolio-demo-token';

export const DEMO_USER = null;

/**
 * Initialize portfolio demo mode - Decommissioned for security
 */
export const initPortfolioDemo = () => {
  // Purge any legacy demo token to protect against unauthorized access
  if (localStorage.getItem('token') === PORTFOLIO_DEMO_TOKEN) {
    localStorage.removeItem('token');
  }
};

/**
 * Check if current user is in demo mode
 */
export const isPortfolioDemo = (): boolean => {
  return false;
};

