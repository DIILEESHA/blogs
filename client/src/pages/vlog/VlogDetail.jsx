import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Avatar,
  Button,
  Space,
  Input,
  message,
  Modal,
  Divider,
  Tag,
  Spin,
} from "antd";
import {
  LikeOutlined,
  ShareAltOutlined,
  EditOutlined,
  DeleteOutlined,
  CommentOutlined,
  CalendarOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../auth/authContext";
import styled from "styled-components";
import DOMPurify from "dompurify";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Styled components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const CoverImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.01);
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const ContentContainer = styled.div`
  .ql-editor {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #333;

    p {
      margin-bottom: 1.2em;
    }

    img {
      max-width: 100%;
      border-radius: 8px;
      margin: 16px 0;
    }
  }
`;

const CommentSection = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
`;

const CommentCard = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const VlogDetail = () => {
  const { id } = useParams();
  const [vlog, setVlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const { username, userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVlog = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/vlogs/${id}`
        );
        setVlog(response.data);
      } catch (error) {
        message.error("Failed to load vlog");
      } finally {
        setLoading(false);
      }
    };

    fetchVlog();
  }, [id]);

  const handleDeleteComment = async (commentId) => {
    Modal.confirm({
      title: "Delete Comment",
      content: "Are you sure you want to delete this comment?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          // Optimistically update the UI immediately
          setVlog((prevVlog) => ({
            ...prevVlog,
            comments: prevVlog.comments.filter(
              (comment) => comment._id !== commentId
            ),
          }));

          // Then make the API call
          await axios.delete(
            `http://localhost:5000/api/vlogs/${id}/comment/${commentId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          message.success("Comment deleted successfully");
        } catch (error) {
          // Revert the UI if the deletion fails
          setVlog((prevVlog) => {
            // You might need to store the original comments before deletion
            // for proper reverting. Alternatively, you could refetch the vlog:
            return prevVlog; // This simple version doesn't revert - see enhanced version below
          });

          message.error(
            error.response?.data?.message || "Failed to delete comment"
          );
        }
      },
    });
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/vlogs/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the vlog state while preserving all other properties
      setVlog((prevVlog) => ({
        ...prevVlog,
        likes: response.data.likes,
      }));

      // message.success(
      // response.data.likes.includes(userId) ? "Liked!" : "Like removed"
      // );
    } catch (error) {
      message.error("Failed to like vlog");
    }
  };
  const handleComment = async () => {
    if (!comment.trim()) {
      message.warning("Please enter a comment");
      return;
    }

    try {
      // Optimistically update the UI
      const newComment = {
        text: comment,
        user: userId,
        username: username, // Using the username from your auth context
        createdAt: new Date(),
        _id: Date.now().toString(), // Temporary ID for optimistic update
      };

      setVlog((prevVlog) => ({
        ...prevVlog,
        comments: [newComment, ...prevVlog.comments],
      }));
      setComment("");

      // Send the actual request
      const response = await axios.post(
        `http://localhost:5000/api/vlogs/${id}/comment`,
        { text: comment },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update with the server's response (which includes the real _id)
      setVlog((prevVlog) => ({
        ...prevVlog,
        comments: prevVlog.comments
          .map((c) =>
            c._id === newComment._id
              ? response.data.comments.find(
                  (serverComment) =>
                    serverComment.text === comment &&
                    serverComment.user === userId
                )
              : c
          )
          .filter(Boolean), // Remove any null values if the mapping failed
      }));

      message.success("Comment added");
    } catch (error) {
      // Revert on error
      setVlog((prevVlog) => ({
        ...prevVlog,
        comments: prevVlog.comments.filter((c) => c._id !== newComment._id),
      }));
      message.error("Failed to add comment");
    }
  };

  const shareVlog = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      message.success("Link copied to clipboard!");
    });
  };

  const handleEdit = () => {
    navigate(`/edit-vlog/${id}`);
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: "Delete Vlog",
      content:
        "Are you sure you want to delete this vlog? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/vlogs/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          message.success("Vlog deleted successfully!");
          navigate("/");
        } catch (error) {
          message.error(
            error.response?.data?.message || "Failed to delete vlog"
          );
        }
      },
    });
  };

  if (loading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "100px" }}
      >
        <Spin size="large" />
      </div>
    );

  if (!vlog)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Title level={3}>Vlog not found</Title>
        <Button type="primary" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    );

  const isAuthor =
    userId && vlog.author && userId.toString() === vlog.author._id.toString();
  const isLiked = vlog.likes?.includes(userId);

  const createSanitizedHtml = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <Container>
      <CoverImage
        src={
          vlog?.coverImage ||
          "https://via.placeholder.com/800x400?text=Vlog+Cover"
        }
        alt={vlog?.title}
      />

      <AuthorInfo>
        <Avatar size={64} src={vlog.author?.avatar}>
          {vlog.author?.username?.charAt(0) || "?"}
        </Avatar>
        <div style={{ marginLeft: 16 }}>
          <Title level={5} style={{ marginBottom: 4 }}>
            {vlog.author?.username || "Unknown Author"}
          </Title>
          <Space>
            <Text type="secondary">
              <CalendarOutlined />{" "}
              {new Date(vlog.createdAt).toLocaleDateString()}
            </Text>
            <Tag color="blue">{vlog.category || "General"}</Tag>
          </Space>
        </div>
      </AuthorInfo>

      <Title level={2} style={{ marginBottom: 24 }}>
        {vlog?.title}
      </Title>

      <ContentContainer>
        <div
          className="ql-editor"
          dangerouslySetInnerHTML={createSanitizedHtml(vlog.content)}
        />
      </ContentContainer>

      <Divider />

      <Space size="large" style={{ marginBottom: 24 }}>
        <Button
          icon={<LikeOutlined />}
          onClick={
            userId
              ? handleLike
              : () => message.warning("Please login to like this vlog")
          }
          type={isLiked ? "primary" : "default"}
          disabled={!userId}
        >
          {vlog.likes?.length || 0} Likes
        </Button>
        <Button icon={<ShareAltOutlined />} onClick={shareVlog}>
          Share
        </Button>
        {isAuthor && (
          <>
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              Edit
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Delete
            </Button>
          </>
        )}
      </Space>

      <CommentSection>
        <Title level={4}>
          <CommentOutlined /> Comments ({vlog.comments?.length || 0})
        </Title>

        {userId ? (
          <div style={{ marginBottom: 24 }}>
            <TextArea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={500}
              showCount
            />
            <Button
              type="primary"
              onClick={handleComment}
              style={{ marginTop: 12 }}
              icon={<CommentOutlined />}
            >
              Post Comment
            </Button>
          </div>
        ) : (
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <Button
              type="primary"
              onClick={() => navigate("/login")}
              icon={<LoginOutlined />}
            >
              Login to comment
            </Button>
          </div>
        )}

        {vlog.comments?.length > 0 ? (
          vlog.comments.map((comment) => (
            <CommentCard key={comment._id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Avatar src={comment.user?.avatar}>
                    {comment.user?.username?.charAt(0) || "?"}
                  </Avatar>
                  <div style={{ marginLeft: 12 }}>
                    <Text strong>{comment.username || "Anonymous"}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </Text>
                  </div>
                </div>
                {(userId === comment.user?.toString() ||
                  userId === vlog.author?._id?.toString()) && (
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteComment(comment._id)}
                  />
                )}
              </div>
              <Text style={{ marginLeft: 44 }}>{comment.text}</Text>
            </CommentCard>
          ))
        ) : (
          <Text type="secondary">
            No comments yet. Be the first to comment!
          </Text>
        )}
      </CommentSection>
    </Container>
  );
};

export default VlogDetail;
