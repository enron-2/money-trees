import React from 'react';
import ReactDOM from 'react-dom';
import './main.css';

import App from './app/app';

import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#EE82EE',
    },
    secondary: {
      main: '#E6E6FA',
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
