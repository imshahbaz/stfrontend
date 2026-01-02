import React, { useEffect, useState } from 'react';
import { marginAPI } from '../api/axios';
import {
  Container, Box, Typography, Card, CardContent, TextField, Button,
  RadioGroup, FormControlLabel, Radio, FormControl, FormLabel,
  Autocomplete, Divider, Stack, Paper, useTheme, LinearProgress, Chip
} from '@mui/material';
import {
  Calculate,
  ArrowForward,
  ArrowBack,
  ReceiptLong,
  AccountBalanceWallet,
  Edit,
  RestartAlt,
  ShowChart
} from '@mui/icons-material';
import DetailRow from './shared/DetailRow';
import { motion, AnimatePresence } from 'framer-motion';

const Calculator = () => {
  const theme = useTheme();
  const [view, setView] = useState('form');
  const [activeStep, setActiveStep] = useState(1);

  const [margins, setMargins] = useState([]);
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

  useEffect(() => {
    const fetchMargins = async () => {
      try {
        const response = await marginAPI.getAllMargins();
        setMargins(response.data.data);
      } catch (error) {
        console.error("Error fetching margin data:", error);
      }
    };
    fetchMargins();
  }, []);

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
    if (validateStep(1)) setActiveStep(2);
  };

  const resetForm = () => {
    setActiveStep(1);
    setBuyPrice('');
    setSellPrice('');
    setDaysHeld(0);
    setQuantity('');
    setSelectedSymbolRaw('');
    setSelectedLeverage('');
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
  };

  return (
    <Container maxWidth="sm" sx={{ pt: { xs: 2, md: 6 }, pb: 12 }}>
      <AnimatePresence mode="wait">
        {view === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card sx={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ p: 4, bgcolor: 'primary.main', color: '#fff', position: 'relative' }}>
                <Typography variant="h5" fontWeight="900">Trade Calculator</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Estimate your MTF returns precisely</Typography>
                <LinearProgress
                  variant="determinate"
                  value={activeStep === 1 ? 50 : 100}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#fff' }
                  }}
                />
              </Box>

              <CardContent sx={{ p: 4 }}>
                <AnimatePresence mode="wait">
                  {activeStep === 1 ? (
                    <Stack spacing={3} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="step1">
                      <Autocomplete
                        options={margins}
                        getOptionLabel={(o) => `${o.symbol} (${o.margin}x)`}
                        value={margins.find(m => m.symbol === selectedSymbolRaw) || null}
                        onChange={(e, v) => {
                          setSelectedLeverage(v?.margin || '');
                          setSelectedSymbolRaw(v?.symbol || '');
                          setErrors(prev => ({ ...prev, selectedLeverage: '' }));
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Search Stock" required
                            error={!!errors.selectedLeverage} helperText={errors.selectedLeverage}
                          />
                        )}
                      />

                      <TextField
                        fullWidth
                        label="Entry Price"
                        type="number"
                        value={buyPrice}
                        onChange={e => { setBuyPrice(e.target.value); setErrors(prev => ({ ...prev, buyPrice: '' })); }}
                        InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography> }}
                        error={!!errors.buyPrice}
                        helperText={errors.buyPrice}
                      />

                      <Box>
                        <FormControl component="fieldset" sx={{ mb: 1 }}>
                          <FormLabel sx={{ fontWeight: 800, fontSize: '0.7rem', color: 'primary.main', textTransform: 'uppercase' }}>Exit Strategy</FormLabel>
                          <RadioGroup row value={sellType} onChange={e => setSellType(e.target.value)}>
                            <FormControlLabel value="exact" control={<Radio size="small" />} label="Target Price" />
                            <FormControlLabel value="percent" control={<Radio size="small" />} label="Percentage" />
                          </RadioGroup>
                        </FormControl>
                        <TextField
                          fullWidth
                          label={sellType === 'exact' ? "Exit Price" : "Target Profit %"}
                          type="number"
                          value={sellPrice}
                          onChange={e => { setSellPrice(e.target.value); setErrors(prev => ({ ...prev, sellPrice: '' })); }}
                          InputProps={{
                            startAdornment: sellType === 'exact' ? <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography> : null,
                            endAdornment: sellType === 'percent' ? <Typography sx={{ ml: 1, color: 'text.secondary' }}>%</Typography> : null,
                          }}
                          error={!!errors.sellPrice}
                          helperText={errors.sellPrice}
                        />
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleNext}
                        endIcon={<ArrowForward />}
                        sx={{ py: 2, borderRadius: 4, fontWeight: 800 }}
                      >
                        Position Sizing
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={3} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="step2">
                      <TextField
                        fullWidth
                        label="Holding Period"
                        type="number"
                        value={daysHeld}
                        onChange={e => { setDaysHeld(e.target.value); setErrors(prev => ({ ...prev, daysHeld: '' })); }}
                        InputProps={{ endAdornment: <Typography sx={{ ml: 1, color: 'text.secondary' }}>Days</Typography> }}
                        error={!!errors.daysHeld}
                        helperText={errors.daysHeld}
                      />

                      <Box>
                        <FormControl component="fieldset" sx={{ mb: 1 }}>
                          <FormLabel sx={{ fontWeight: 800, fontSize: '0.7rem', color: 'primary.main', textTransform: 'uppercase' }}>Entry Method</FormLabel>
                          <RadioGroup row value={quantityType} onChange={e => setQuantityType(e.target.value)}>
                            <FormControlLabel value="quantity" control={<Radio size="small" />} label="By Quantity" />
                            <FormControlLabel value="investment" control={<Radio size="small" />} label="By Capital" />
                          </RadioGroup>
                        </FormControl>
                        <TextField
                          fullWidth
                          label={quantityType === 'quantity' ? "Number of Shares" : "Total Capital"}
                          type="number"
                          value={quantity}
                          onChange={e => { setQuantity(e.target.value); setErrors(prev => ({ ...prev, quantity: '' })); }}
                          InputProps={{
                            startAdornment: quantityType === 'investment' ? <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography> : null,
                          }}
                          error={!!errors.quantity}
                          helperText={errors.quantity}
                        />
                      </Box>

                      <Stack direction="row" spacing={2}>
                        <Button fullWidth variant="outlined" onClick={() => setActiveStep(1)} startIcon={<ArrowBack />} sx={{ py: 1.5, borderRadius: 3 }}>Back</Button>
                        <Button fullWidth variant="contained" color="success" onClick={calculateReturns} startIcon={<Calculate />} sx={{ py: 1.5, borderRadius: 3, fontWeight: 800 }}>Calculate</Button>
                      </Stack>
                    </Stack>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Stack spacing={3}>
              <Card sx={{ borderRadius: 6, textAlign: 'center', p: 5, border: `1px solid ${theme.palette.divider}`, background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 100%)' : '#fff' }}>
                <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: results.isProfit ? 'success.main' : 'error.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                  <ShowChart />
                </Box>
                <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 800, opacity: 0.7 }}>Net P&L Result</Typography>
                <Typography variant="h2" fontWeight="900" sx={{ my: 1, color: results.isProfit ? 'success.main' : 'error.main' }}>
                  ₹{results.net}
                </Typography>
                <Chip
                  label={`${results.roi}% ROI`}
                  color={results.isProfit ? "success" : "error"}
                  sx={{ fontWeight: 900, px: 2, borderRadius: 2 }}
                />

                <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
                  <Button
                    onClick={() => setView('form')}
                    fullWidth
                    variant="outlined"
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                    startIcon={<Edit />}
                  >
                    Adjust
                  </Button>
                  <Button
                    onClick={() => { resetForm(); setView('form'); }}
                    variant="contained"
                    sx={{ borderRadius: 3, minWidth: 64 }}
                  >
                    <RestartAlt />
                  </Button>
                </Stack>
              </Card>

              <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="button" color="primary" fontWeight="900" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWallet fontSize="small" /> Position Summary
                </Typography>
                <Stack spacing={2}>
                  <DetailRow label="Symbol" value={results.symbol} />
                  <Divider />
                  <DetailRow label="Total Position" value={`₹${results.totalValue}`} />
                  <DetailRow label="Your Capital" value={`₹${results.margin}`} bold />
                  <DetailRow label="Quantity" value={results.shares} />
                  {results.sellPrice >0 && <DetailRow label="Target Price" value={results.sellPrice} />}
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 5, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="button" color="error.main" fontWeight="900" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptLong fontSize="small" /> Cost Breakdown
                </Typography>
                <Stack spacing={2}>
                  <DetailRow label="Gross P&L" value={`₹${results.gross}`} />
                  <DetailRow label="MTF Interest" value={`₹${results.interest}`} />
                  <DetailRow label="Total Charges" value={`₹${results.charges}`} bold />
                </Stack>
              </Paper>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Calculator;
