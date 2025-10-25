import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Corrected import to use AppContent, the default export of App.tsx.
import AppContent from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppContent />
  </React.StrictMode>
);