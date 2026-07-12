import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Override confirm to prevent iframe blocking errors
const originalConfirm = window.confirm;
window.confirm = (msg) => {
  try {
    return originalConfirm(msg);
  } catch (e) {
    console.warn('Confirm blocked, auto-confirming:', msg);
    return true;
  }
};


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
