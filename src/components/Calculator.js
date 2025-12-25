import { useEffect, useState } from 'react';
import { marginAPI } from '../api/axios';
import {
  Container, Box, Typography, Card, CardContent, TextField, Button,
  RadioGroup, FormControlLabel, Radio, FormControl, FormLabel,
  Autocomplete, Grid, Divider, Stack, Paper
} from '@mui/material';
import { Calculate, ArrowForward, ArrowBack, ReceiptLong, AccountBalanceWallet, Edit } from '@mui/icons-material';

const Calculator = () => {
  const [view, setView] = useState('form');
  const [activeStep, setActiveStep] = useState(1);
  const [margins, setMargins] = useState([]);
  const [selectedLeverage, setSelectedLeverage] = useState('');
  const [selectedSymbolRaw, setSelectedSymbolRaw] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellType, setSellType] = useState('exact');
  const [daysHeld, setDaysHeld] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityType, setQuantityType] = useState('quantity');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchMargins = async () => {
      try {
        const response = await marginAPI.getAllMargins();
        setMargins(response.data);
      } catch (error) { console.error(error); }
    };
    fetchMargins();
  }, []);

  // --- VALIDATION LOGIC PER STEP ---
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!selectedLeverage) newErrors.selectedLeverage = 'Stock selection is required';
      if (!buyPrice || isNaN(parseFloat(buyPrice)) || parseFloat(buyPrice) <= 0) 
        newErrors.buyPrice = 'Enter a valid buy price';
      if (!sellPrice || isNaN(parseFloat(sellPrice)) || parseFloat(sellPrice) <= 0) 
        newErrors.sellPrice = 'Enter a valid sell price/percent';
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
    }
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

    const f = (n) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

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
      symbol: selectedSymbolRaw
    });
    setView('results');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {view === 'form' ? (
        <Card variant="outlined" sx={{ borderRadius: 4, boxShadow: 3 }}>
          <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h5" fontWeight="800">Trade Calculator</Typography>
            <Typography variant="caption">Step {activeStep} of 2: {activeStep === 1 ? 'Asset Details' : 'Position Size'}</Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {activeStep === 1 ? (
              <Stack spacing={4}>
                <Autocomplete
                  fullWidth
                  options={margins}
                  getOptionLabel={(o) => `${o.symbol} (${o.margin}x)`}
                  onChange={(e, v) => { 
                    setSelectedLeverage(v?.margin || ''); 
                    setSelectedSymbolRaw(v?.symbol || ''); 
                    setErrors(prev => ({ ...prev, selectedLeverage: '' })); 
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Stock" variant="outlined" required 
                      error={!!errors.selectedLeverage} helperText={errors.selectedLeverage} 
                    />
                  )}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Buy Price" type="number" value={buyPrice} 
                      onChange={e => { setBuyPrice(e.target.value); setErrors(prev => ({ ...prev, buyPrice: '' })); }} 
                      required error={!!errors.buyPrice} helperText={errors.buyPrice} 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label={sellType === 'exact' ? "Sell Price" : "Profit %"} type="number" value={sellPrice} 
                      onChange={e => { setSellPrice(e.target.value); setErrors(prev => ({ ...prev, sellPrice: '' })); }} 
                      required error={!!errors.sellPrice} helperText={errors.sellPrice} 
                    />
                  </Grid>
                </Grid>
                <FormControl component="fieldset">
                  <FormLabel sx={{ fontWeight: 700, mb: 1, fontSize: '0.8rem' }}>SELL CALCULATION</FormLabel>
                  <RadioGroup row value={sellType} onChange={e => setSellType(e.target.value)}>
                    <FormControlLabel value="exact" control={<Radio />} label="Price" />
                    <FormControlLabel value="percent" control={<Radio />} label="Percent" />
                  </RadioGroup>
                </FormControl>
                <Button fullWidth variant="contained" size="large" onClick={handleNext} endIcon={<ArrowForward />} sx={{ py: 2, borderRadius: 2 }}>
                  Next: Sizing
                </Button>
              </Stack>
            ) : (
              <Stack spacing={4}>
                <TextField fullWidth label="Holding Duration (Days)" type="number" value={daysHeld} 
                  onChange={e => { setDaysHeld(e.target.value); setErrors(prev => ({ ...prev, daysHeld: '' })); }} 
                  required error={!!errors.daysHeld} helperText={errors.daysHeld} 
                />
                <TextField
                  fullWidth
                  label={quantityType === 'quantity' ? "Number of Shares" : "Investment Capital"}
                  type="number"
                  value={quantity}
                  onChange={e => { setQuantity(e.target.value); setErrors(prev => ({ ...prev, quantity: '' })); }}
                  required
                  error={!!errors.quantity}
                  helperText={errors.quantity}
                />
                <FormControl component="fieldset">
                  <FormLabel sx={{ fontWeight: 700, mb: 1, fontSize: '0.8rem' }}>ENTRY MODE</FormLabel>
                  <RadioGroup row value={quantityType} onChange={e => setQuantityType(e.target.value)}>
                    <FormControlLabel value="quantity" control={<Radio />} label="By Units" />
                    <FormControlLabel value="investment" control={<Radio />} label="By Capital" />
                  </RadioGroup>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button fullWidth variant="outlined" onClick={() => setActiveStep(1)} startIcon={<ArrowBack />} sx={{ py: 2 }}>Back</Button>
                  <Button fullWidth variant="contained" color="success" onClick={calculateReturns} startIcon={<Calculate />} sx={{ py: 2 }}>Calculate</Button>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      ) : (
        /* RESULTS VIEW */
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 4, textAlign: 'center', p: 4, boxShadow: 6 }}>
            <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 700, opacity: 0.9 }}>NET PROFIT / LOSS</Typography>
            <Typography variant="h2" fontWeight="900" sx={{ color: results.isProfit ? 'success.main' : 'error.main' }}>₹ {results.net}</Typography>
            <Typography variant="h6">{results.roi}% Return on Margin</Typography>

            <Button onClick={() => setView('form')} fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }} startIcon={<Edit />}>
              Edit Trade
            </Button>
          </Card>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="subtitle2" color="primary" fontWeight="800" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWallet fontSize="small" /> CAPITAL DETAILS
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <DetailRow label="Stock Symbol" value={results.symbol} />
              <DetailRow label="Total Exposure" value={`₹ ${results.totalValue}`} />
              <DetailRow label="Your Margin" value={`₹ ${results.margin}`} bold />
              <DetailRow label="Units (Shares)" value={results.shares} />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="subtitle2" color="error.main" fontWeight="800" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptLong fontSize="small" /> CHARGES BREAKDOWN
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <DetailRow label="Gross P&L" value={`₹ ${results.gross}`} />
              <DetailRow label="MTF Interest (15%)" value={`₹ ${results.interest}`} />
              <DetailRow label="Taxes & Brokerage" value={`₹ ${results.charges}`} bold />
            </Stack>
          </Paper>
        </Stack>
      )}
    </Container>
  );
};

const DetailRow = ({ label, value, bold }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={bold ? 900 : 600}>{value}</Typography>
  </Box>
);

export default Calculator;