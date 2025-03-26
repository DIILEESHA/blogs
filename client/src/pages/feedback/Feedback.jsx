import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Rate,
  Select,
  List,
  Avatar,
  Modal,
  message,
  Checkbox,
  Spin,
} from "antd";
import { UserOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuth } from "../../auth/authContext";
import { useNavigate } from "react-router-dom";
import {
  createFeedback,
  getFeedbacks,
  getUserFeedbacks,
  updateFeedback,
  deleteFeedback,
} from "../../api/Api";

const { TextArea } = Input;
const { Option } = Select;

const FeedbackForm = () => {
  const [form] = Form.useForm();
  const { username, user } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const therapists = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialization: "Cognitive Behavioral Therapy",
    },
    { id: "2", name: "Dr. Michael Chen", specialization: "Family Counseling" },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [allFeedbacks, userFb] = await Promise.all([
          getFeedbacks(),
          username ? getUserFeedbacks() : Promise.resolve([]),
        ]);
        setFeedbacks(allFeedbacks.data || []);
        setUserFeedbacks(userFb.data || []);
      } catch (error) {
        message.error(
          error.response?.data?.message || "Failed to load feedbacks"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username]);

  const handleSubmit = async (values) => {
    if (!username) {
      message.warning("Please login to submit feedback");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);
      const feedbackData = {
        rating: values.rating,
        feedback: values.feedback,
        therapist: values.therapist,
        anonymous: values.anonymous,
      };

      if (editingFeedback?._id) {
        const response = await updateFeedback(
          editingFeedback._id,
          feedbackData
        );
        const updated = response.data;
        setFeedbacks(
          feedbacks.map((f) => (f._id === updated._id ? updated : f))
        );
        setUserFeedbacks(
          userFeedbacks.map((f) => (f._id === updated._id ? updated : f))
        );
        message.success("Feedback updated successfully");
      } else {
        const response = await createFeedback(feedbackData);
        const newFeedback = response.data;
        setFeedbacks([newFeedback, ...feedbacks]);
        setUserFeedbacks([newFeedback, ...userFeedbacks]);
        message.success("Feedback submitted successfully");
      }

      form.resetFields();
      setEditingFeedback(null);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Feedback error:", error);
      message.error(
        error.response?.data?.message || "Failed to submit feedback"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (feedback) => {
    if (!feedback?._id) {
      message.error("Invalid feedback data");
      return;
    }

    setEditingFeedback(feedback);
    form.setFieldsValue({
      therapist: feedback.therapist,
      rating: feedback.rating,
      feedback: feedback.feedback,
      anonymous: feedback.name === "Anonymous",
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Delete Feedback",
      content: "Are you sure you want to delete this feedback?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          // Optimistically remove from UI
          setFeedbacks(prev => prev.filter(f => f._id !== id));
          setUserFeedbacks(prev => prev.filter(f => f._id !== id));
  
          const response = await deleteFeedback(id);
          
          if (!response.success) {
            // If deletion failed, reload the data
            const [allFeedbacks, userFb] = await Promise.all([
              getFeedbacks(),
              getUserFeedbacks()
            ]);
            setFeedbacks(allFeedbacks.data);
            setUserFeedbacks(userFb.data);
            throw new Error(response.message);
          }
  
          message.success(response.message);
        } catch (error) {
          message.error(error.message || "Failed to delete feedback");
        }
      },
    });
  };
  const getTherapistName = (therapistId) => {
    const therapist = therapists.find((t) => t.id === therapistId);
    return therapist
      ? `${therapist.name} (${therapist.specialization})`
      : "Unknown Therapist";
  };

  if (loading && feedbacks.length === 0) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        Share Your Experience
      </h2>
      <p style={{ textAlign: "center", marginBottom: 30 }}>
        Your feedback helps us improve our services.
      </p>

      {username ? (
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            setEditingFeedback(null);
            setIsModalVisible(true);
          }}
          style={{ marginBottom: 20 }}
        >
          Add New Feedback
        </Button>
      ) : (
        <Button
          type="primary"
          onClick={() => navigate("/login")}
          style={{ marginBottom: 20 }}
        >
          Login to Submit Feedback
        </Button>
      )}

      <Modal
        title={editingFeedback ? "Edit Feedback" : "Add Feedback"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingFeedback(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ rating: 5, anonymous: false }}
        >
          <Form.Item
            name="therapist"
            label="Select Your Therapist"
            rules={[
              { required: true, message: "Please select your therapist" },
            ]}
          >
            <Select placeholder="Select therapist">
              {therapists.map((therapist) => (
                <Option key={therapist.id} value={therapist.id}>
                  {therapist.name} ({therapist.specialization})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="rating"
            label="Rate Your Experience"
            rules={[{ required: true, message: "Please rate your experience" }]}
          >
            <Rate allowHalf />
          </Form.Item>

          <Form.Item
            name="feedback"
            label="Your Feedback"
            rules={[
              { required: true, message: "Please provide your feedback" },
              { min: 10, message: "Feedback must be at least 10 characters" },
            ]}
          >
            <TextArea rows={4} placeholder="Share your experience..." />
          </Form.Item>

          <Form.Item name="anonymous" valuePropName="checked">
            <Checkbox>Submit anonymously</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ width: "100%" }}
            >
              {editingFeedback ? "Update Feedback" : "Submit Feedback"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {username && userFeedbacks.length > 0 && (
        <>
          <h3>Your Feedback</h3>
          <List
            itemLayout="horizontal"
            dataSource={userFeedbacks}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(item)}
                    disabled={loading}
                  />,
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(item._id)}
                    danger
                    // disabled={loading}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={item.name}
                  description={
                    <>
                      <Rate disabled value={item.rating} />
                      <p>{item.feedback}</p>
                      <p>
                        <small>
                          Therapist: {getTherapistName(item.therapist)}
                        </small>
                      </p>
                      <p>
                        <small>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </small>
                      </p>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </>
      )}

      <h3 style={{ marginTop: 30 }}>Community Feedback</h3>
      {feedbacks.length === 0 ? (
        <p>No feedback available yet. Be the first to share!</p>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={feedbacks}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={item.name}
                description={
                  <>
                    <Rate disabled value={item.rating} />
                    <p>{item.feedback}</p>
                    <p>
                      <small>
                        Therapist: {getTherapistName(item.therapist)}
                      </small>
                    </p>
                    <p>
                      <small>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </small>
                    </p>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default FeedbackForm;
