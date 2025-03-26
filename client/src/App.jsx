// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./component/nav/Nav";
import Admin from "./pages/admin/Admin";
import Signup from "./pages/sign/Signup";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import { AuthProvider } from "./auth/authContext";
import Feedback from "./pages/feedback/Feedback";
import VlogDetail from "./pages/vlog/VlogDetail";
import VlogList from "./pages/home/Home";
import PrivateRoute from "./auth/PrivateRoute";
import CreateVlog from "./pages/vlog/CreateVlog";
import EditVlog from "./pages/vlog/EditVlog";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Nav />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute adminOnly>
                <Admin />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Home />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/vlogs" element={<VlogList />} />
          <Route path="/vlogs/:id" element={<VlogDetail />} />
          <Route
            path="/create-vlog"
            element={
              <PrivateRoute>
                <CreateVlog />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-vlog/:id"
            element={
              <PrivateRoute>
                <EditVlog />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;