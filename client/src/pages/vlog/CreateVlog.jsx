import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useAuth } from "../../auth/authContext";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const CreateVlog = () => {
  const [form] = Form.useForm();
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth(); // Ensure userId is coming from authentication
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
  
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("User not authenticated. Please log in.");
        return;
      }
  
      const vlogData = {
        title: values.title,
        coverImage: values.coverImage,
        content,
        author: userId,
        status: 'pending' // Set status as pending
      };
  
      const response = await axios.post(
        "http://localhost:5000/api/vlogs",
        vlogData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      message.success("Vlog submitted for admin approval!");
      navigate("/");
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to create vlog");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <Title level={2}>Create New Vlog</Title>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="coverImage" label="Cover Image URL" rules={[{ required: true }]}>
          <Input
            placeholder="Enter image URL"
            onChange={(e) => setCoverImage(e.target.value)}
          />
        </Form.Item>

        {coverImage && (
          <img
            src={coverImage}
            alt="Cover preview"
            style={{ maxWidth: "100%", maxHeight: "300px", marginTop: "16px" }}
          />
        )}

        <Form.Item label="Content" required>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            style={{ height: "400px", marginBottom: "40px" }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Publish Vlog
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateVlog;
