// Login.js
import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/Api";
import { useAuth } from "../../auth/authContext";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const success = await login(values, navigate);
      if (!success) {
        message.error("Login failed. Please try again.");
      }
    } catch (error) {
      message.error("Login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card
        style={{
          width: 350,
          padding: 20,
          borderRadius: 10,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center" }}>
          Login
        </Title>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please enter your email!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Log in
            </Button>
          </Form.Item>
        </Form>
        <p style={{ textAlign: "center" }}>
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </Card>
    </div>
  );
};

export default Login;
