import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, message, Modal, Typography, Spin } from 'antd';
import axios from 'axios';
import { useAuth } from '../../auth/authContext';

const { Title } = Typography;

const AdminPanel = () => {
  const [pendingVlogs, setPendingVlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userType, token } = useAuth();

  useEffect(() => {
    if (userType === 'admin') {
      fetchPendingVlogs();
    }
  }, [userType]);

  const fetchPendingVlogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vlogs/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingVlogs(response.data);
    } catch (error) {
      console.error('Error fetching pending vlogs:', error);
      message.error('Failed to fetch pending vlogs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/vlogs/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success(`Vlog ${status}`);
      fetchPendingVlogs();
    } catch (error) {
      console.error('Error updating vlog status:', error);
      message.error(`Failed to ${status} vlog`);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: author => author?.username || 'Unknown',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="link" 
            onClick={() => window.open(`/vlogs/${record._id}`, '_blank')}
          >
            View
          </Button>
          <Button 
            type="primary" 
            onClick={() => handleStatusChange(record._id, 'approved')}
          >
            Approve
          </Button>
          <Button 
            danger
            onClick={() => {
              Modal.confirm({
                title: 'Reject Vlog',
                content: 'Are you sure you want to reject this vlog?',
                onOk: () => handleStatusChange(record._id, 'rejected'),
              });
            }}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  if (userType !== 'admin') {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Title level={4}>You don't have permission to access this page</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Admin Panel - Pending Vlogs</Title>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={pendingVlogs} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default AdminPanel;