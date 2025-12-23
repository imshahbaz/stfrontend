import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-light text-center text-lg-start mt-auto">
      <div className="text-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        &copy; {currentYear} <a className="text-dark" href="/">Trades Application</a>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
