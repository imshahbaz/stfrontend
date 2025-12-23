import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="container flex-grow-1">
      <div className="hero text-center my-5">
        <h1 className="display-3 fw-bold text-primary">Welcome to Shahbaz Trades Application</h1>
        <p className="lead text-muted">Your premier destination for seamless trading experiences.</p>
      </div>

      <div className="row justify-content-center features">
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 ripple hover-shadow" onClick={() => navigate('/strategies')} style={{ cursor: 'pointer' }}>
            <div className="card-body text-center">
              <h3 className="card-title text-primary">Strategy</h3>
              <p className="card-text">Scan and analyze the market with our advanced strategy tools.</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 ripple hover-shadow" onClick={() => navigate('/calculator')} style={{ cursor: 'pointer' }}>
            <div className="card-body text-center">
              <h3 className="card-title text-primary">Calculator</h3>
              <p className="card-text">Calculate returns and analyze trades with our advanced calculator.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
