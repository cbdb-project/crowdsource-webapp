import React from 'react';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const Graph = React.lazy(() => import('./views/Graph'));


// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'CDBB Web', component: Dashboard },
  { path: '/graph', name: 'CDBB Web', component: Graph },
  
];

export default routes;
