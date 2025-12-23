import React, { useEffect, useState, useRef } from 'react';
import api from '../api/axios';

const Calculator = () => {
  const [margins, setMargins] = useState([]);
  const [stockInput, setStockInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLeverage, setSelectedLeverage] = useState('');
  const [selectedSymbolRaw, setSelectedSymbolRaw] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellType, setSellType] = useState('exact');
  const [daysHeld, setDaysHeld] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityType, setQuantityType] = useState('quantity');
  const [results, setResults] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const fetchMargins = async () => {
      try {
        const response = await api.get(`${process.env.REACT_APP_BACKEND_URL}/api/margin/all`);
        setMargins(response.data);
      } catch (error) {
        console.error('Error fetching margins:', error);
      }
    };
    fetchMargins();
  }, []);

  const handleStockInputChange = (e) => {
    const value = e.target.value;
    setStockInput(value);
    if (value.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      const filtered = margins.filter(item =>
        item.symbol.toUpperCase().includes(value.trim().toUpperCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    }
  };

  const handleStockFocus = () => {
    if (stockInput.includes('Margin')) setStockInput('');
    setSuggestions(margins);
    setShowSuggestions(true);
  };

  const handleStockBlur = () => {
    setTimeout(() => setShowSuggestions(false), 250);
  };

  const selectSuggestion = (item) => {
    setStockInput(`${item.symbol} (${item.margin}x Margin)`);
    setSelectedLeverage(item.margin);
    setSelectedSymbolRaw(item.symbol);
    setShowSuggestions(false);
  };

  const calculateReturns = () => {
    const symbol = selectedSymbolRaw;
    const leverage = parseFloat(selectedLeverage);
    const bp = parseFloat(buyPrice);
    const spInput = parseFloat(sellPrice);
    const days = parseInt(daysHeld);
    const qtyVal = parseFloat(quantity);

    if (!symbol || isNaN(leverage) || isNaN(bp) || isNaN(spInput) || isNaN(qtyVal)) {
      setAlertMessage('Please select a stock and fill all calculation fields.');
      setResults(null);
      return;
    }

    let sp = (sellType === 'exact') ? spInput : bp * (1 + spInput / 100);
    let shares = (quantityType === 'quantity') ? qtyVal : Math.trunc((qtyVal * leverage) / bp);

    const totalValue = shares * bp;
    const marginUsed = totalValue / leverage;
    const fundedAmt = totalValue - marginUsed;

    const grossProfit = (sp - bp) * shares;
    const turnover = (bp + sp) * shares;

    // standard brokerage assumptions
    const brokerage = 40;
    const STT = (days > 0) ? turnover * 0.001 : shares * sp * 0.00025;
    const stampCharges = shares * bp * (days > 0 ? 0.00015 : 0.00003);
    const transCharges = turnover * 0.0000345;
    const sebiCharges = turnover * 0.000001;
    const gst = 0.18 * (sebiCharges + brokerage + transCharges);
    const totalCharges = brokerage + STT + transCharges + stampCharges + gst + sebiCharges;

    const mtfInterest = (fundedAmt * 0.15 * (days || 0)) / 365;
    const netProfit = grossProfit - mtfInterest - totalCharges;
    const roMargin = (netProfit / marginUsed) * 100;

    const formatInr = (n) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(n);
    };

    setResults({
      totalInvestment: formatInr(totalValue),
      margin: formatInr(marginUsed),
      fundingAmount: formatInr(fundedAmt),
      interest: formatInr(mtfInterest),
      profit: formatInr(grossProfit),
      totalCharges: formatInr(totalCharges),
      netProfit: formatInr(netProfit),
      profitPercent: roMargin.toFixed(2),
      isProfit: netProfit >= 0
    });
    setAlertMessage('');
  };

  return (
    <main className="container my-5 flex-grow-1">
        <div className="hero text-center mb-5">
          <h1 className="display-3 fw-bold text-primary">Trade Calculator</h1>
          <p className="lead text-muted">Analyze your trades with real-time margin and interest calculations.</p>
        </div>

        <div className="card shadow-2-strong">
          <div className="card-body">
            <form onSubmit={(e) => { e.preventDefault(); calculateReturns(); }}>
              <div className="row mb-4 justify-content-center">
                <div className="col-md-8" style={{ position: 'relative' }}>
                  <label htmlFor="stock-input" className="form-label fw-bold">Stock Symbol</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="stock-input"
                    placeholder="Click to select or type to search..."
                    autoComplete="off"
                    value={stockInput}
                    onChange={handleStockInputChange}
                    onFocus={handleStockFocus}
                    onBlur={handleStockBlur}
                    required
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="suggestions-list"
                      style={{
                        display: 'block',
                        position: 'absolute',
                        zIndex: 1000,
                        width: '100%',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        border: '1px solid #ddd',
                        borderRadius: '0 0 8px 8px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                        backgroundColor: 'white'
                      }}
                    >
                      {suggestions.map((item, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          style={{
                            padding: '12px 20px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseDown={() => selectSuggestion(item)}
                        >
                          <strong>{item.symbol}</strong> <span className="badge bg-secondary float-end">{item.margin}x Margin</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <input type="hidden" id="selected-leverage" value={selectedLeverage} />
                  <input type="hidden" id="selected-symbol-raw" value={selectedSymbolRaw} />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-4">
                  <label htmlFor="buy-price" className="form-label">Buy Price</label>
                  <input
                    type="number"
                    className="form-control"
                    id="buy-price"
                    step="0.01"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="sell-price" className="form-label">Sell Price / %</label>
                  <input
                    type="number"
                    className="form-control"
                    id="sell-price"
                    step="0.01"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Sell Calculation Type</label>
                  <div className="btn-group w-100" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="sell-type"
                      id="sell-exact"
                      value="exact"
                      checked={sellType === 'exact'}
                      onChange={(e) => setSellType(e.target.value)}
                    />
                    <label className="btn btn-outline-primary" htmlFor="sell-exact">Exact Price</label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="sell-type"
                      id="sell-percent"
                      value="percent"
                      checked={sellType === 'percent'}
                      onChange={(e) => setSellType(e.target.value)}
                    />
                    <label className="btn btn-outline-primary" htmlFor="sell-percent">Percentage</label>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-4">
                  <label htmlFor="days-held" className="form-label">Days Held</label>
                  <input
                    type="number"
                    className="form-control"
                    id="days-held"
                    min="0"
                    value={daysHeld}
                    onChange={(e) => setDaysHeld(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="quantity" className="form-label">Quantity / Investment</label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantity"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Entry Mode</label>
                  <div className="btn-group w-100" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="quantity-type"
                      id="qty-quantity"
                      value="quantity"
                      checked={quantityType === 'quantity'}
                      onChange={(e) => setQuantityType(e.target.value)}
                    />
                    <label className="btn btn-outline-primary" htmlFor="qty-quantity">By Units</label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="quantity-type"
                      id="qty-investment"
                      value="investment"
                      checked={quantityType === 'investment'}
                      onChange={(e) => setQuantityType(e.target.value)}
                    />
                    <label className="btn btn-outline-primary" htmlFor="qty-investment">By Capital</label>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <button type="submit" className="btn btn-primary btn-lg px-5 shadow">
                  Calculate Returns
                </button>
              </div>
            </form>

            {alertMessage && (
              <div className="alert alert-danger" role="alert">
                {alertMessage}
              </div>
            )}

            {results && (
              <div>
                <hr className="my-5" />
                <h3 className="text-center mb-4">Calculation Summary</h3>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card h-100 border-0 bg-light">
                      <div className="card-body">
                        <h5 className="card-title text-muted mb-4 text-uppercase small fw-bold">Capital Breakdown</h5>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Total Investment :</span>
                          <span className="fw-bold">&#x20B9; {results.totalInvestment}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Your Investment :</span>
                          <span className="fw-bold text-primary">&#x20B9; {results.margin}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Borrowed Funding :</span>
                          <span className="fw-bold">&#x20B9; {results.fundingAmount}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>MTF Interest (15% p.a.):</span>
                          <span className="fw-bold text-danger">&#x20B9; {results.interest}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border-0 bg-light">
                      <div className="card-body">
                        <h5 className="card-title text-muted mb-4 text-uppercase small fw-bold">Performance Metrics</h5>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Gross Profit :</span>
                          <span className="fw-bold">&#x20B9; {results.profit}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Taxes & Charges :</span>
                          <span className="fw-bold text-danger">&#x20B9; {results.totalCharges}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Net Profit/Loss :</span>
                          <span className={`fw-bold fs-5 ${results.isProfit ? 'text-success' : 'text-danger'}`}>
                            &#x20B9; {results.netProfit}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Return on Margin :</span>
                          <span className={`fw-bold ${results.isProfit ? 'text-success' : 'text-danger'}`}>
                            {results.profitPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
  );
};

export default Calculator;
