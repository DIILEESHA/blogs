// src/components/Nav/Nav.js
import React, { useState } from "react";
import { Popover, Button, Avatar } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/authContext";
import "./nav.css";

const Nav = () => {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  console.log("Current username in Nav:", username); // Debugging

  const handleLogout = () => {
    logout();
  };

  const content = (
    <div className="profile-popover">
      <p style={{ marginBottom: "16px" }}>
        <strong>Username:</strong> {username}
      </p>
      <Button onClick={handleLogout} type="primary" block danger>
        Logout
      </Button>
    </div>
  );

  return (
    <div className="nav_container">
      <div className="nav_sub">
        <Link style={{ color: "inherit", textDecoration: "none" }} to="/">
          <h1 className="nav_title">TherappyConnect</h1>
        </Link>
      </div>
      <div className="nav_sub">
        <ul className="nav_ul">
        <Link style={{ color: "inherit", textDecoration: "none" }} to="/feedback">
            <li className="nav_i">Feedback</li>
          </Link>
          {username ? (
            <li className="nav_i">
              <Popover
                content={content}
                title="Account"
                trigger="click"
                placement="bottomRight"
                overlayClassName="account-popover"
              >
                <Avatar
                  src="https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXZhdGFyfGVufDB8fDB8fHww"
                  alt="Profile"
                  className="avatar-profile"
                />
              </Popover>
            </li>
          ) : (
            <li className="nav_i" onClick={() => navigate("/login")}>
              Login
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Nav;
