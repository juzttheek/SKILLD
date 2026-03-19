import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AdminPanel from "./pages/AdminPanel";
import ClientProfile from "./pages/ClientProfile";
import CreateService from "./pages/CreateService";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import JobBoard from "./pages/JobBoard";
import JobDetail from "./pages/JobDetail";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import PostJob from "./pages/PostJob";
import Register from "./pages/Register";
import ServiceDetail from "./pages/ServiceDetail";
import ServiceListings from "./pages/ServiceListings";
import WorkerProfile from "./pages/WorkerProfile";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services" element={<ServiceListings />} />
      <Route path="/services/:id" element={<ServiceDetail />} />
      <Route path="/jobs" element={<JobBoard />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route
        path="/post-job"
        element={
          <ProtectedRoute role={["client", "both"]}>
            <PostJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-service"
        element={
          <ProtectedRoute role={["worker", "both"]}>
            <CreateService />
          </ProtectedRoute>
        }
      />
      <Route path="/worker/:id" element={<WorkerProfile />} />
      <Route path="/client/:id" element={<ClientProfile />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages/:userId"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
