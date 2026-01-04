import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
        // LIGHT: "Pure Clean"
        primary: { main: '#7C3AED' },    // Vivid Violet
        secondary: { main: '#111827' }, // Ink Black
        background: {
          default: '#FFFFFF',           // Crisp White
          paper: '#F9FAFB',             // Very light grey for contrast
        },
        text: {
          primary: '#111827',           // Rich black
          secondary: '#4B5563',         // Slate grey
        },
        divider: '#E5E7EB',
      }
      : {
        // DARK: "Deep Obsidian"
        primary: { main: '#A78BFA' },    // Soft Electric Violet
        secondary: { main: '#F3F4F6' },
        background: {
          default: '#000000',           // Pure Pitch Black
          paper: '#111827',             // Deep Charcoal
        },
        text: {
          primary: '#FFFFFF',           // Pure White
          secondary: '#9CA3AF',         // Muted Silver
        },
        divider: '#1F2937',
      }),
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    h1: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    // CARDS: Sharp and Defined
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 16,
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    // TABLES: High Contrast
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiTableCell-head': {
            backgroundColor: theme.palette.mode === 'light' ? '#F3F4F6' : '#000000',
            color: theme.palette.text.primary,
            fontWeight: 800,
            fontSize: '0.85rem',
            borderBottom: `2px solid ${theme.palette.divider}`,
          },
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover': {
            backgroundColor: theme.palette.mode === 'light' ? '#F9FAFB' : '#1F2937',
          },
        }),
      },
    },
    // BUTTONS: Bold & Rounded
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0px 4px 12px rgba(124, 58, 237, 0.3)' },
        },
      },
    },
    // INPUTS: Minimalist
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
          },
        }),
      },
    },
    // SCROLLBARS & BASELINE
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          msOverflowStyle: 'none',  /* IE and Edge */
          scrollbarWidth: 'none',   /* Firefox */
          '&::-webkit-scrollbar': {
            display: 'none',        /* Chrome, Safari and Opera */
          },
        },
      },
    },
  },
});

const createAppTheme = (mode) => responsiveFontSizes(createTheme(getDesignTokens(mode)));
export default createAppTheme;