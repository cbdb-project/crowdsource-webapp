import React from 'react';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const Graph = React.lazy(() => import('./views/Graph'));

const Collab = React.lazy(() => import('./views/Collab'));
const Proposals = React.lazy(() => import('./views/Proposals'));
const Export = React.lazy(() => import('./views/Collab/Export.js'));
const Import = React.lazy(() => import('./views/Collab/Import.js'));

const Login = React.lazy(() => import('./views/Pages/Login'));

const Register = React.lazy(() => import('./views/Pages/Register'));
const ManageTasks = React.lazy(() => import('./views/Manage/ManageTasks'));
const ManageUsers = React.lazy(() => import('./views/Manage/ManageUsers'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'CDBB Web', component: Dashboard },
  { path: '/graph', name: 'CDBB Graph', component: Graph },
  { path: '/collab', name: 'CDBB Collab', component: Collab },
  { path: '/proposals', name: 'Review proposals', component: Proposals },
  { path: '/export', name: 'Export tasks', component: Export },
  { path: '/import', name: 'Import Task', component: Import },
  { path: '/login', name: 'CDBB Login', component: Login },
  { path: '/register', name: 'CDBB Register', component: Register },
  { path: '/manageTasks', name: 'Manage Tasks', component: ManageTasks },
  { path: '/manageUsers', name: 'Manage Users', component: ManageUsers },
  
];

export default routes;
