import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator as CalcIcon,
  ArrowRight,
  ArrowLeft,
  Receipt,
  Wallet,
  Edit3,
  RefreshCcw,
  TrendingUp,
  Search,
  Calendar
} from 'lucide-react';
import { marginAPI } from '../api/axios';
import DetailRow from './shared/DetailRow';
import { cn } from '../lib/utils';
import dayjs from 'dayjs';

const Calculator = () => {
  const [view, setView] = useState('form');
  const [activeStep, setActiveStep] = useState(1);
  const [margins, setMargins] = useState([]);
  const [loadingMargins, setLoadingMargins] = useState(true);
  const [marginError, setMarginError] = useState(null);
  const [selectedLeverage, setSelectedLeverage] = useState('');
  const [selectedSymbolRaw, setSelectedSymbolRaw] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellType, setSellType] = useState('exact');
  const [daysHeld, setDaysHeld] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [quantityType, setQuantityType] = useState('quantity');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [entryDate, setEntryDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [exitDate, setExitDate] = useState('');

  useEffect(() => {
    if (entryDate) {
      const start = dayjs(entryDate);
      const end = exitDate ? dayjs(exitDate) : dayjs();

      // If exitDate is provided and it's before entryDate
      if (exitDate && end.isBefore(start)) {
        setExitDate(''); // Clear invalid exitDate
        setDaysHeld(0);
        return;
      }

      const diff = end.diff(start, 'day');
      setDaysHeld(diff > 0 ? diff : 0);
    } else {
      setDaysHeld(0);
    }
  }, [entryDate, exitDate]);

  useEffect(() => {
    const fetchMargins = async () => {
      setLoadingMargins(true);
      setMarginError(null);
      try {
        const response = await marginAPI.getAllMargins();
        setMargins(response.data.data);
      } catch (error) {
        console.error("Error fetching margin data:", error);
        setMarginError("Failed to load margin data. Please try again.");
      } finally {
        setLoadingMargins(false);
      }
    };
    fetchMargins();
  }, []);

  const filteredMargins = Array.isArray(margins) ? margins
    .filter(m => m.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const q = searchQuery.toLowerCase();
      const sA = a.symbol.toLowerCase();
      const sB = b.symbol.toLowerCase();

      // Priority 1: Exact match
      if (sA === q) return -1;
      if (sB === q) return 1;

      // Priority 2: Starts with
      const startsA = sA.startsWith(q);
      const startsB = sB.startsWith(q);
      if (startsA && !startsB) return -1;
      if (!startsA && startsB) return 1;

      // Priority 3: Alphabetical
      return sA.localeCompare(sB);
    }) : [];

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!selectedSymbolRaw) newErrors.selectedLeverage = 'Stock selection is required';
      if (!buyPrice || isNaN(parseFloat(buyPrice)) || parseFloat(buyPrice) <= 0)
        newErrors.buyPrice = 'Enter a valid buy price';
      if (!sellPrice || isNaN(parseFloat(sellPrice)) || parseFloat(sellPrice) <= 0)
        newErrors.sellPrice = 'Enter a valid sell target';
    }
    if (step === 2) {
      if (daysHeld === '' || isNaN(parseInt(daysHeld)) || parseInt(daysHeld) < 0)
        newErrors.daysHeld = 'Enter valid holding days (min 0)';
      if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0)
        newErrors.quantity = quantityType === 'quantity' ? 'Enter quantity' : 'Enter capital amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(1)) {
      setActiveStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetForm = () => {
    setActiveStep(1);
    setBuyPrice('');
    setSellPrice('');
    setDaysHeld(0);
    setQuantity('');
    setSelectedSymbolRaw('');
    setSelectedLeverage('');
    setSearchQuery('');
    setErrors({});
  };

  const calculateReturns = () => {
    if (!validateStep(2)) return;

    const leverage = parseFloat(selectedLeverage);
    const bp = parseFloat(buyPrice);
    const spInput = parseFloat(sellPrice);
    const days = parseInt(daysHeld) || 0;
    const qtyVal = parseFloat(quantity);

    let sp = (sellType === 'exact') ? spInput : bp * (1 + spInput / 100);
    let shares = (quantityType === 'quantity') ? qtyVal : Math.trunc((qtyVal * leverage) / bp);

    const totalValue = shares * bp;
    const marginUsed = totalValue / leverage;
    const fundedAmt = totalValue - marginUsed;
    const grossProfit = (sp - bp) * shares;
    const turnover = (bp + sp) * shares;

    const brokerage = 40;
    const STT = (days > 0) ? turnover * 0.001 : shares * sp * 0.00025;
    const stampCharges = shares * bp * (days > 0 ? 0.00015 : 0.00003);
    const transCharges = turnover * 0.0000345;
    const sebiCharges = turnover * 0.000001;
    const gst = 0.18 * (sebiCharges + brokerage + transCharges);
    const totalCharges = brokerage + STT + transCharges + stampCharges + gst + sebiCharges;

    const mtfInterest = (fundedAmt * 0.15 * days) / 365;
    const netProfit = grossProfit - mtfInterest - totalCharges;

    const f = (n) => new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(n);

    setResults({
      totalValue: f(totalValue),
      margin: f(marginUsed),
      funding: f(fundedAmt),
      interest: f(mtfInterest),
      gross: f(grossProfit),
      charges: f(totalCharges),
      net: f(netProfit),
      roi: ((netProfit / marginUsed) * 100).toFixed(2),
      isProfit: netProfit >= 0,
      shares: shares,
      symbol: selectedSymbolRaw,
      sellPrice: ((sellType === 'exact') ? -1 : sp).toFixed(2)
    });

    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 max-w-lg pt-8 md:pt-12 pb-20">
      <AnimatePresence mode="wait">
        {view === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="rounded-[2.5rem] bg-card border border-border shadow-2xl">
              <div className="bg-primary p-6 md:p-8 text-white relative rounded-t-[2.5rem]">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">Trade Calculator</h2>
                <p className="text-xs md:text-sm font-bold opacity-80">Estimate your MTF returns precisely</p>
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20">
                  <motion.div
                    initial={{ width: "50%" }}
                    animate={{ width: activeStep === 1 ? "50%" : "100%" }}
                    className="h-full bg-white"
                  />
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <AnimatePresence mode="wait">
                  {activeStep === 1 ? (
                    <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="relative">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Search Stock</label>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type="text"
                            className={cn(
                              "input pl-12 h-14 rounded-2xl",
                              errors.selectedLeverage && "border-destructive"
                            )}
                            placeholder={loadingMargins ? "Loading stocks..." : marginError ? "Error loading stocks" : "Type stock name..."}
                            value={selectedSymbolRaw || searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setSelectedSymbolRaw('');
                              setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            disabled={loadingMargins || marginError}
                          />
                          {loadingMargins && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                        {marginError && (
                          <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                            <p className="text-xs text-destructive font-bold">{marginError}</p>
                            <button
                              onClick={() => {
                                const fetchMargins = async () => {
                                  setLoadingMargins(true);
                                  setMarginError(null);
                                  try {
                                    const response = await marginAPI.getAllMargins();
                                    setMargins(response.data.data);
                                  } catch (error) {
                                    console.error("Error fetching margin data:", error);
                                    setMarginError("Failed to load margin data. Please try again.");
                                  } finally {
                                    setLoadingMargins(false);
                                  }
                                };
                                fetchMargins();
                              }}
                              className="mt-2 text-xs font-bold text-primary hover:underline"
                            >
                              Retry
                            </button>
                          </div>
                        )}
                        {showDropdown && searchQuery && !loadingMargins && !marginError && (
                          <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-y-auto max-h-[300px] animate-in fade-in slide-in-from-top-2 scrollbar-hide">
                            {filteredMargins.length > 0 ? (
                              filteredMargins.map(m => (
                                <button
                                  key={m.symbol}
                                  className="w-full text-left px-6 py-4 hover:bg-primary/10 transition-colors border-b border-border last:border-0 flex justify-between items-center"
                                  onClick={() => {
                                    setSelectedSymbolRaw(m.symbol);
                                    setSelectedLeverage(m.margin);
                                    setSearchQuery(m.symbol);
                                    setShowDropdown(false);
                                  }}
                                >
                                  <span className="font-bold">{m.symbol}</span>
                                  <span className="text-xs font-black bg-primary/10 text-primary px-2 py-1 rounded-lg">{m.margin}x</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-6 py-4 text-center text-muted-foreground text-sm">
                                No stocks found
                              </div>
                            )}
                          </div>
                        )}
                        {errors.selectedLeverage && <p className="text-xs text-destructive font-bold mt-1 ml-1">{errors.selectedLeverage}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Entry Price</label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground group-focus-within:text-primary transition-colors">₹</span>
                          <input
                            type="number"
                            className={cn("input pl-10 h-14 rounded-2xl", errors.buyPrice && "border-destructive")}
                            value={buyPrice}
                            onChange={e => { setBuyPrice(e.target.value); setErrors(prev => ({ ...prev, buyPrice: '' })); }}
                          />
                        </div>
                        {errors.buyPrice && <p className="text-xs text-destructive font-bold mt-1 ml-1">{errors.buyPrice}</p>}
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary">Exit Strategy</label>
                          <div className="flex bg-muted p-1 rounded-xl gap-1">
                            <button
                              onClick={() => setSellType('exact')}
                              className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", sellType === 'exact' ? "bg-background shadow-sm" : "text-muted-foreground")}
                            >Target Price</button>
                            <button
                              onClick={() => setSellType('percent')}
                              className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", sellType === 'percent' ? "bg-background shadow-sm" : "text-muted-foreground")}
                            >Percentage</button>
                          </div>
                        </div>
                        <div className="relative group">
                          {sellType === 'exact' && <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground group-focus-within:text-primary transition-colors">₹</span>}
                          <input
                            type="number"
                            className={cn(
                              "input h-14 rounded-2xl",
                              sellType === 'exact' ? "pl-10" : "pr-10",
                              errors.sellPrice && "border-destructive"
                            )}
                            placeholder={sellType === 'exact' ? "Exit Price" : "Target Profit %"}
                            value={sellPrice}
                            onChange={e => { setSellPrice(e.target.value); setErrors(prev => ({ ...prev, sellPrice: '' })); }}
                          />
                          {sellType === 'percent' && <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground group-focus-within:text-primary transition-colors">%</span>}
                        </div>
                        {errors.sellPrice && <p className="text-xs text-destructive font-bold mt-1 ml-1">{errors.sellPrice}</p>}
                      </div>

                      <button
                        onClick={handleNext}
                        className="btn btn-primary w-full h-14 rounded-2xl text-lg font-black mt-4 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        Position Sizing <ArrowRight className="ml-2 h-5 w-5" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Entry Date</label>
                          <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                              type="date"
                              className="input h-14 rounded-2xl pl-12 pr-4 cursor-pointer focus:ring-primary/20 appearance-none"
                              value={entryDate}
                              onChange={(e) => setEntryDate(e.target.value)}
                              onClick={(e) => e.target.showPicker?.()}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Exit Date (Optional)</label>
                          <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                              type="date"
                              className="input h-14 rounded-2xl pl-12 pr-4 cursor-pointer focus:ring-primary/20 appearance-none"
                              value={exitDate}
                              min={entryDate}
                              onChange={(e) => setExitDate(e.target.value)}
                              onClick={(e) => e.target.showPicker?.()}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-2xl flex justify-between items-center border border-dashed border-border">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Calculated Holding Days</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-primary">{daysHeld}</span>
                          <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground opacity-60">Days</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary">Entry Method</label>
                          <div className="flex bg-muted p-1 rounded-xl gap-1">
                            <button
                              onClick={() => setQuantityType('quantity')}
                              className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", quantityType === 'quantity' ? "bg-background shadow-sm" : "text-muted-foreground")}
                            >By Quantity</button>
                            <button
                              onClick={() => setQuantityType('investment')}
                              className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", quantityType === 'investment' ? "bg-background shadow-sm" : "text-muted-foreground")}
                            >By Capital</button>
                          </div>
                        </div>
                        <div className="relative group">
                          {quantityType === 'investment' && <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground group-focus-within:text-primary transition-colors">₹</span>}
                          <input
                            type="number"
                            className={cn(
                              "input h-14 rounded-2xl",
                              quantityType === 'investment' && "pl-10",
                              errors.quantity && "border-destructive"
                            )}
                            placeholder={quantityType === 'quantity' ? "Number of Shares" : "Total Capital"}
                            value={quantity}
                            onChange={e => { setQuantity(e.target.value); setErrors(prev => ({ ...prev, quantity: '' })); }}
                          />
                        </div>
                        {errors.quantity && <p className="text-xs text-destructive font-bold mt-1 ml-1">{errors.quantity}</p>}
                      </div>

                      <div className="flex gap-4 mt-6">
                        <button
                          onClick={() => {
                            setActiveStep(1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="btn flex-1 bg-muted border border-border h-14 rounded-2xl font-black text-muted-foreground hover:bg-muted/80"
                        >
                          <ArrowLeft className="mr-2 h-5 w-5" /> Back
                        </button>
                        <button
                          onClick={calculateReturns}
                          className="btn flex-[1.5] bg-green-500 text-white h-14 rounded-2xl font-black shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <CalcIcon className="mr-2 h-5 w-5" /> Calculate
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 md:space-y-6"
          >
            <div className="rounded-[2.5rem] md:rounded-[3rem] bg-card border border-border p-6 md:p-12 text-center relative overflow-hidden shadow-2xl">
              <div className={cn(
                "absolute top-0 left-0 w-full h-2",
                results.isProfit ? "bg-green-500" : "bg-destructive"
              )} />

              <div className={cn(
                "mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-xl transition-transform hover:scale-110",
                results.isProfit ? "bg-green-500 text-white shadow-green-500/20" : "bg-destructive text-white shadow-destructive/20"
              )}>
                <TrendingUp size={window.innerWidth < 768 ? 32 : 40} />
              </div>

              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 md:mb-2 block">Net P&L Result</span>
              <h2 className={cn(
                "text-4xl md:text-6xl font-black tracking-tighter mb-2 md:mb-4",
                results.isProfit ? "text-green-500" : "text-destructive"
              )}>
                ₹{results.net}
              </h2>

              <div className={cn(
                "inline-flex px-5 py-1.5 md:px-6 md:py-2 rounded-full font-black text-xs md:text-sm",
                results.isProfit ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-destructive/10 text-destructive"
              )}>
                {results.roi}% ROI
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mt-8 md:mt-10">
                <button
                  onClick={() => {
                    setView('form');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn h-14 bg-muted border border-border rounded-2xl font-black text-muted-foreground hover:bg-muted/80 flex items-center justify-center"
                >
                  <Edit3 className="mr-2 h-5 w-5" /> Adjust
                </button>
                <button
                  onClick={() => { resetForm(); setView('form'); }}
                  className="btn h-14 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <RefreshCcw className="mr-2 h-5 w-5" /> Reset
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Wallet className="h-4 w-4 md:h-5 md:w-5" />
                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Position Summary</h4>
              </div>
              <div className="space-y-3 md:space-y-4">
                <DetailRow label="Symbol" value={results.symbol} bold />
                <div className="h-px bg-border" />
                <DetailRow label="Total Value" value={`₹${results.totalValue}`} />
                <DetailRow label="Your Capital" value={`₹${results.margin}`} bold />
                <DetailRow label="Quantity" value={results.shares} />
                {results.sellPrice > 0 && <DetailRow label="Target Price" value={results.sellPrice} />}
              </div>
            </div>

            <div className="bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 text-destructive">
                <Receipt className="h-4 w-4 md:h-5 md:w-5" />
                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Cost Breakdown</h4>
              </div>
              <div className="space-y-3 md:space-y-4">
                <DetailRow label="Gross P&L" value={`₹${results.gross}`} />
                <DetailRow label="MTF Interest" value={`₹${results.interest}`} />
                <DetailRow label="Total Charges" value={`₹${results.charges}`} bold />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calculator;