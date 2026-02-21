import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/register";
import Dashboard from "./pages/dashboard";
import Resources from "./pages/Resources";
import AdminPanel from "./pages/Adminpanel";
import Notices from "./pages/notices";
import Upload from "./pages/upload";
import Progress from "./pages/Progress";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/resources"
          element={user ? <Resources /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={user?.role === 'Admin' || user?.role === 'Faculty' ? <AdminPanel /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/notices"
          element={user ? <Notices /> : <Navigate to="/" />}
        />
        <Route
          path="/upload"
          element={user ? <Upload /> : <Navigate to="/" />}
        />
        <Route
          path="/progress"
          element={user ? <Progress /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;