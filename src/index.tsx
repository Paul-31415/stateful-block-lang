import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

const div = document.createElement('div');
document.body.appendChild(div);
document.body.style.margin = '0px';

ReactDOM.render(<App />, div);
