import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Strategies from './pages/Strategies';
import Config from './pages/Config';
import ServerMonitoring from './pages/ServerMonitoring';
import MarketData from './pages/MarketData';
import SchedulerTasks from './pages/SchedulerTasks';
import Scanner from './pages/Scanner';
import BrokerManagement from './pages/BrokerManagement';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/broker-management" element={<BrokerManagement />} />
          <Route path="/config" element={<Config />} />
          <Route path="/server-monitoring" element={<ServerMonitoring />} />
          <Route path="/market-data" element={<MarketData />} />
          <Route path="/scheduler-tasks" element={<SchedulerTasks />} />
        </Route>
      </Route>
    </Routes>
  );
}

