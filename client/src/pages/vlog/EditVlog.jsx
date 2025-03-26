import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Upload, Typography, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { useAuth } from '../../auth/authContext';

const { Title } = Typography;

const EditVlog = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/vlogs/${id}`);
        
        // Check if the logged-in user is the author
        if (response.data.author._id.toString() !== userId.toString()) {
          message.error('You are not authorized to edit this vlog');
          navigate('/');
          return;
        }
        
        form.setFieldsValue({ title: response.data.title });
        setContent(response.data.content);
        setCoverImage(response.data.coverImage);
      } catch (error) {
        message.error(error.response?.data?.message || 'Failed to load vlog');
        navigate('/');
      } finally {
        setFetching(false);
      }
    };
    
    fetchVlog();
  }, [id, form, userId, navigate]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const vlogData = {
        title: values.title,
        coverImage,
        content
      };

      const response = await axios.put(
        `http://localhost:5000/api/vlogs/${id}`,
        vlogData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      message.success('Vlog updated successfully!');
      navigate(`/vlogs/${id}`);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update vlog');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/upload', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setCoverImage(response.data.url);
      return false;
    } catch (error) {
      message.error(error.response?.data?.message || 'Image upload failed');
      return false;
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  if (fetching) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Edit Vlog</Title>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item 
          name="title" 
          label="Title" 
          rules={[{ required: true, message: 'Please input the title!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Cover Image" required>
          <Upload
            accept="image/*"
            beforeUpload={handleImageUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Upload New Cover Image</Button>
          </Upload>
          {coverImage && (
            <img 
              src={coverImage} 
              alt="Cover preview" 
              style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '16px' }} 
            />
          )}
        </Form.Item>

        <Form.Item 
          label="Content" 
          required
          rules={[{ required: true, message: 'Please input the content!' }]}
        >
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            style={{ height: '400px', marginBottom: '40px' }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Vlog
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditVlog;