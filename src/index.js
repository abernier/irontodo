import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './App';

import PubSub from 'pubsub-js';

const app = ReactDOM.render(
  <App />,
  document.getElementById('root')
);

// Globals
window.app = app;
window.PubSub = PubSub;