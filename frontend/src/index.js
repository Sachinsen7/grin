import React  from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './global.css';
import { Toaster } from 'react-hot-toast'

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <Toaster
      position="top-right"
      reverseOrder={false}
    />
    <App />
  </React.StrictMode>
)

