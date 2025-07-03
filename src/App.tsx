import React from 'react';
import { HashRouter } from 'react-router-dom';
import AppRoutes from './route';

const App: React.FC = () => (
  <HashRouter>
    <AppRoutes />
  </HashRouter>
);

export default App;
