import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Pass-through wrapper so all pages cleanly render with the modern JSTU header & design system
  // Completely eliminates the legacy orange 'AI Biz' bar and dummy navigation
  return <>{children}</>;
};

export default Layout;
