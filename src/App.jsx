import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './pages/admin/AdminLayout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Plans from './pages/Plans';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Investments from './pages/Investments';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Trading from './pages/Trading';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminTrades from './pages/admin/AdminTrades';
import AdminMarkets from './pages/admin/AdminMarkets';
import AdminBankAccounts from './pages/admin/AdminBankAccounts';
import AdminTickets from './pages/admin/AdminTickets';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* User Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="trading" element={<Trading />} />
        <Route path="investments" element={<Investments />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Legacy route redirect */}
      <Route path="/trading" element={<Trading />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="deposits" element={<AdminDeposits />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
        <Route path="trades" element={<AdminTrades />} />
        <Route path="markets" element={<AdminMarkets />} />
        <Route path="bank-accounts" element={<AdminBankAccounts />} />
        <Route path="tickets" element={<AdminTickets />} />
      </Route>
    </Routes>
  );
}

export default App;
