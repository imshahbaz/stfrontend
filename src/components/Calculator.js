import React, { useEffect, useState } from 'react';
import { marginAPI } from '../api/axios';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Autocomplete,
  Grid,
  Alert,
} from '@mui/material';
import { Calculate } from '@mui/icons-material';

const Calculator = () => {
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
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchMargins = async () => {
      try {
        const response = await marginAPI.getAllMargins();
        setMargins(response.data);
      } catch (error) {
        console.error('Error fetching margins:', error);
      }
    };
    fetchMargins();
  }, []);

  const selectSuggestion = (item) => {
    setSelectedLeverage(item.margin);
    setSelectedSymbolRaw(item.symbol);
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
    <Container maxWidth="lg" sx={{ flexGrow: 1, py: 5 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Calculate sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" color="primary" gutterBottom>
          Trade Calculator
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Analyze your trades with real-time margin and interest calculations.
        </Typography>
      </Box>

      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={(e) => { e.preventDefault(); calculateReturns(); }}>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={margins}
                  getOptionLabel={(option) => `${option.symbol} (${option.margin}x Margin)`}
                  value={margins.find(item => item.symbol === selectedSymbolRaw) || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      selectSuggestion(newValue);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Stock Symbol"
                      placeholder="Type to search stocks..."
                      required
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: '1.5rem',
                          padding: '20px 24px',
                          minHeight: '70px'
                        },
                        '& .MuiInputLabel-root': { fontSize: '1.4rem' }
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body1"><strong>{option.symbol}</strong></Typography>
                        <Typography variant="body2" color="text.secondary">{option.margin}x Margin</Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Buy Price"
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  required
                  fullWidth
                  inputProps={{ step: "0.01" }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Sell Price / %"
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  required
                  fullWidth
                  inputProps={{ step: "0.01" }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Sell Calculation Type</FormLabel>
                  <RadioGroup
                    row
                    value={sellType}
                    onChange={(e) => setSellType(e.target.value)}
                  >
                    <FormControlLabel value="exact" control={<Radio />} label="Exact Price" />
                    <FormControlLabel value="percent" control={<Radio />} label="Percentage" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Days Held"
                  type="number"
                  value={daysHeld}
                  onChange={(e) => setDaysHeld(e.target.value)}
                  required
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Quantity / Investment"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  fullWidth
                  inputProps={{ step: "0.01" }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Entry Mode</FormLabel>
                  <RadioGroup
                    row
                    value={quantityType}
                    onChange={(e) => setQuantityType(e.target.value)}
                  >
                    <FormControlLabel value="quantity" control={<Radio />} label="By Units" />
                    <FormControlLabel value="investment" control={<Radio />} label="By Capital" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ px: 5 }}
              >
                Calculate Returns
              </Button>
            </Box>
          </Box>

          {alertMessage && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {alertMessage}
            </Alert>
          )}

          {results && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h4" component="h3" align="center" gutterBottom>
                Calculation Summary
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="h6" component="h5" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Capital Breakdown
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Investment:</Typography>
                        <Typography fontWeight="bold">₹ {results.totalInvestment}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Your Investment:</Typography>
                        <Typography fontWeight="bold" color="primary.main">₹ {results.margin}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Borrowed Funding:</Typography>
                        <Typography fontWeight="bold">₹ {results.fundingAmount}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>MTF Interest (15% p.a.):</Typography>
                        <Typography fontWeight="bold" color="error.main">₹ {results.interest}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="h6" component="h5" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Performance Metrics
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Gross Profit:</Typography>
                        <Typography fontWeight="bold">₹ {results.profit}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Taxes & Charges:</Typography>
                        <Typography fontWeight="bold" color="error.main">₹ {results.totalCharges}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Net Profit/Loss:</Typography>
                        <Typography fontWeight="bold" fontSize="1.25rem" color={results.isProfit ? 'success.main' : 'error.main'}>
                          ₹ {results.netProfit}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Return on Margin:</Typography>
                        <Typography fontWeight="bold" color={results.isProfit ? 'success.main' : 'error.main'}>
                          {results.profitPercent}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Calculator;
