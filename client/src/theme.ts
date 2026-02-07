import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A professional blue
    },
    secondary: {
      main: '#dc004e', // A contrasting pink/red
    },
    background: {
      default: '#f4f6f8', // A light grey background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
    },
    h2: {
        fontSize: '2rem',
        fontWeight: 500,
    }
  },
  spacing: 8, // Base spacing unit
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }
        }
    },
    MuiTextField: {
        defaultProps: {
            variant: 'outlined',
            margin: 'normal',
        }
    }
  }
});

export default theme;
