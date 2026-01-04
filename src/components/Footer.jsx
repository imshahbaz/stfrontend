import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-background text-center py-6 mt-auto border-t border-border">
      <p className="text-sm text-muted-foreground">
        &copy; {currentYear}{' '}
        <Link to="/" className="text-foreground hover:text-primary underline-offset-4 hover:underline transition-colors font-medium">
          Shahbaz Trades Application
        </Link>
        . All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;