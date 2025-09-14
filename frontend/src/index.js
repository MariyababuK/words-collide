import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';
import App from './App.jsx'; // Make sure this points to your main App file

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);