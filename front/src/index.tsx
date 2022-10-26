import React from 'react';
import ReactDOM from 'react-dom/client';
import './Styles/index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';

import {store} from "./Redux/Store";
import { Provider } from 'react-redux'

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
/*root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);*/

root.render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
