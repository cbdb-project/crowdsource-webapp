import React from 'react';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const Graph = React.lazy(() => import('./views/Graph'));

const Collab = React.lazy(() => import('./views/Collab'));

const Login = React.lazy(() => import('./views/Pages/Login'));

const Register = React.lazy(() => import('./views/Pages/Register'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'CDBB Web', component: Dashboard },
  { path: '/graph', name: 'CDBB Graph', component: Graph },
  { path: '/collab', name: 'CDBB Collab', component: Collab },
  { path: '/login', name: 'CDBB Login', component: Login },
  { path: '/register', name: 'CDBB Login', component: Register },
  
];

export default routes;
