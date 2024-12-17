import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // ESTE ES EL READ
import Scan from './Scan'; // ESTE ES EL SCAN

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className="header-container">
      <h1 className="header-title">SCAN</h1>
      <Scan />
    </div>
    <div className="header-container">
      <h1 className="header-title">READ</h1>
      <App />
    </div>
  </React.StrictMode>
);