import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Button,
  Typography,
  message,
  Spin,
  Space,
  Tag,
} from "antd";
import { Link } from "react-router-dom";
import {
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";
import styled from "styled-components";

const { Title, Text } = Typography;

// Styled components for better customization
const StyledCard = styled(Card)`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .ant-card-cover {
    height: 200px;
    overflow: hidden;

    img {
      height: 100%;
      width: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
  }

  &:hover .ant-card-cover img {
    transform: scale(1.05);
  }

  .ant-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
`;

const StyledButton = styled(Button)`
  margin-top: auto;
  align-self: flex-start;
`;

const HomepageContainer = styled.div`
  padding: 24px;
  background: linear-gradient(to bottom, #f5f7fa, #e4e8ed);
  min-height: 100vh;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 20px 0;

  h2 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 8px;
    font-weight: 600;
  }

  p {
    color: #7f8c8d;
    font-size: 1.1rem;
    max-width: 700px;
    margin: 0 auto;
  }
`;

const Homepage = () => {
  const [vlogs, setVlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVlogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/vlogs");
        // Filter only approved vlogs if not admin
        const filteredVlogs = response.data.filter(
          (vlog) => vlog.status === "approved"
        );
        setVlogs(filteredVlogs);
      } catch (error) {
        message.error("Failed to load vlogs.");
      } finally {
        setLoading(false);
      }
    };

    fetchVlogs();
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <HomepageContainer>
      <HeaderSection>
        <Title level={2}>Discover Amazing Vlogs</Title>
        <Text>
          Explore stories, experiences, and insights from our community
        </Text>
      </HeaderSection>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]} justify="center">
          {vlogs.length > 0 ? (
            vlogs.map((vlog) => (
              <Col xs={24} sm={12} md={8} lg={8} xl={6} key={vlog._id}>
                <StyledCard
                  hoverable
                  cover={
                    <img
                      alt={vlog.title}
                      src={
                        vlog.coverImage ||
                        "https://via.placeholder.com/300x200?text=Vlog+Cover"
                      }
                    />
                  }
                >
                  <div style={{ marginBottom: 12 }}>
                    <Tag color="blue" style={{ marginBottom: 8 }}>
                      {vlog.category || "General"}
                    </Tag>
                    <Title level={4} style={{ marginBottom: 8 }}>
                      {vlog.title}
                    </Title>
                    <Text type="secondary" ellipsis={{ rows: 3 }}>
                      {vlog.content.substring(0, 150)}...
                    </Text>
                  </div>

                  <Space style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      <UserOutlined /> {vlog.author?.username || "Anonymous"}
                    </Text>
                    <Text type="secondary">
                      <ClockCircleOutlined /> {formatDate(vlog.createdAt)}
                    </Text>
                  </Space>

                  <Link to={`/vlogs/${vlog._id}`}>
                    <StyledButton type="primary" icon={<EyeOutlined />}>
                      Read More
                    </StyledButton>
                  </Link>
                </StyledCard>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Card style={{ textAlign: "center", padding: "40px 0" }}>
                <Title level={4} type="secondary">
                  No vlogs available yet
                </Title>
                <Text>Be the first to create one!</Text>
              </Card>
            </Col>
          )}
        </Row>
      )}

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Link to="/create-vlog">
          <Button
            type="primary"
            size="large"
            style={{
              padding: "0 32px",
              height: 48,
              fontSize: "1.1rem",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.4)",
            }}
          >
            Create New Vlog
          </Button>
        </Link>
      </div>
    </HomepageContainer>
  );
};

export default Homepage;
