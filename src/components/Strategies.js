import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const Strategies = () => {
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [strategyData, setStrategyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cache, setCache] = useState({});

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await api.get(`${process.env.REACT_APP_BACKEND_URL}/api/strategy`);
        setStrategies(response.data);
      } catch (error) {
        console.error('Error fetching strategies:', error);
      }
    };
    fetchStrategies();

    // Load KiteConnect script
    const script = document.createElement('script');
    script.src = 'https://kite.trade/publisher.js?v=3';
    document.head.appendChild(script);
  }, []);

  const fetchStrategyData = async (strategyName) => {
    // Toggle logic: If already showing this strategy, close it
    if (selectedStrategy === strategyName) {
      setSelectedStrategy(null);
      return;
    }

    setSelectedStrategy(strategyName);
    setLoading(true);
    setError('');
    setStrategyData([]);

    // Check cache
    if (cache[strategyName]) {
      setLoading(false);
      setStrategyData(cache[strategyName]);
      return;
    }

    try {
      const response = await api.get(`${process.env.REACT_APP_BACKEND_URL}/api/chartink/fetchWithMargin?strategy=${encodeURIComponent(strategyName)}`);
      // Store in cache
      setCache(prev => ({ ...prev, [strategyName]: response.data }));
      setStrategyData(response.data);
    } catch (error) {
      setError('Error fetching data: ' + error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (stock) => {
    const kite = new window.KiteConnect("kitedemo");
    kite.add({
      "exchange": "NSE",
      "tradingsymbol": stock.symbol,
      "quantity": 1,
      "transaction_type": "BUY",
      "order_type": "MARKET",
      "product": "CNC"
    });
    kite.connect();
  };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="hero text-center mb-5">
        <h1 className="display-3 fw-bold text-primary">Available Strategies</h1>
        <p className="lead text-muted">Explore and select a strategy to analyze the market.</p>
      </div>

      <div className="card shadow-2-strong">
        <div className="card-body">
          <table className="table table-striped table-hover mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th scope="col">Name</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((strategy, index) => (
                <tr key={`${strategy.id}-${index}`}>
                  <td>
                    <a href="#" onClick={(e) => { e.preventDefault(); fetchStrategyData(strategy.name); }} className="text-decoration-none">
                      {strategy.name}
                    </a>
                  </td>
                </tr>
              ))}
              {strategies.length === 0 && (
                <tr key="no-strategies">
                  <td className="text-center">No strategies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div id="strategy-data-container" className="mt-5" style={{ display: selectedStrategy ? 'block' : 'none' }}>
        <h3>Results for: <span id="selected-strategy-name" className="text-primary">{selectedStrategy}</span></h3>
        <table id="strategy-data-table" className="table table-bordered table-hover mt-3" style={{ display: strategyData.length > 0 ? 'table' : 'none' }}>
          <thead className="table-primary">
            <tr>
              <th scope="col">NSE Code</th>
              <th scope="col">Name</th>
              <th scope="col">Close Price</th>
              <th scope="col">Margin</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody id="strategy-data-body">
            {strategyData.map((stock, index) => (
              <tr key={`${stock.symbol}-${index}`}>
                <td data-label="NSE Code">{stock.symbol}</td>
                <td data-label="Name">{stock.name}</td>
                <td data-label="Close Price">{stock.close}</td>
                <td data-label="Margin">{stock.margin}</td>
                <td data-label="Action">
                  <button className="buy-trigger btn btn-primary" onClick={() => handleBuy(stock)}>Buy</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div id="loading-message" className="text-center my-3" style={{ display: loading ? 'block' : 'none' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading data...</p>
        </div>
        <p id="error-message" className="text-danger text-center font-weight-bold" style={{ display: error ? 'block' : 'none' }}>{error}</p>
      </div>

      <div className="mt-5 text-center">
        <Link to="/" className="btn btn-secondary btn-lg">Back to Home</Link>
      </div>
    </main>
  );
};

export default Strategies;
