import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Items from './pages/Items';
import Products from './pages/Products';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import InventoryLevels from './pages/InventoryLevels';
import StockMovements from './pages/StockMovements';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import Production from './pages/Production';
import Login from './pages/Login';
import useAuthStore from './store/authStore';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <div className="page-transition">
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/suppliers" element={<Suppliers />} />
                                        <Route path="/customers" element={<Customers />} />
                                        <Route path="/items" element={<Items />} />
                                        <Route path="/products" element={<Products />} />
                                        <Route path="/employees" element={<Employees />} />
                                        <Route path="/attendance" element={<Attendance />} />
                                        <Route path="/leaves" element={<LeaveRequests />} />
                                        <Route path="/inventory" element={<InventoryLevels />} />
                                        <Route path="/movements" element={<StockMovements />} />
                                        <Route path="/orders" element={<Orders />} />
                                        <Route path="/invoices" element={<Invoices />} />
                                        <Route path="/production" element={<Production />} />
                                    </Routes>
                                </div>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
