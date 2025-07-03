import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login.tsx';
import HomePage from '../pages/index';

const routes = [
  { path: '/login', element: <Login /> },
  { path: '/index', element: <HomePage /> },
  { path: '*', element: <Navigate to="/login" /> },
];

const AppRoutes: React.FC = () => (
  <Routes>
    {routes.map((route) => (
      <Route key={route.path} path={route.path} element={route.element} />
    ))}
  </Routes>
);

export default AppRoutes; 