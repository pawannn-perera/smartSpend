import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import EditExpense from "./pages/EditExpense";
import Bills from "./pages/Bills";
import AddBill from "./pages/AddBill";
import EditBill from "./pages/EditBill";
import Warranties from "./pages/Warranties";
import AddWarranty from "./pages/AddWarranty";
import EditWarranty from "./pages/EditWarranty";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./contexts/AuthContext";
import Profile from "./pages/Profile";
import LoginRegister from "./pages/LoginRegister";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginRegister />} />
      <Route path="/register" element={<LoginRegister />} />
      {/* Dashboard Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        *
        <Route path="expenses" element={<Expenses />} />
        <Route path="expenses/add" element={<AddExpense />} />
        <Route path="expenses/:id" element={<EditExpense />} />
        {/* Bill Routes */}
        <Route path="bills" element={<Bills />} />
        <Route path="bills/add" element={<AddBill />} />
        <Route path="bills/:id" element={<EditBill />} />
        {/* Warranty Routes */}
        <Route path="warranties" element={<Warranties />} />
        <Route path="warranties/add" element={<AddWarranty />} />
        <Route path="warranties/:id" element={<EditWarranty />} />
        {/* Profile */}
        <Route path="profile" element={<Profile />} />
      </Route>
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
