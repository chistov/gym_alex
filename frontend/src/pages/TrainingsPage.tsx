import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Empty, Tag, Row, Col, Button, Space } from 'antd';
import { ThunderboltOutlined, ClockCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { trainingsApi } from '../api/trainings';
import type { Training } from '../types';

const { Title, Paragraph, Text } = Typography;

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Начинающий', color: 'green' },
  intermediate: { label: 'Средний', color: 'orange' },
  advanced: { label: 'Продвинутый', color: 'red' },
};

export default function TrainingsPage() {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trainingsApi.getAll()
      .then(setTrainings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 64 }}><Spin size="large" /></div>;

  return (
    <div>
      <Title level={2} style={{ marginBottom: 8 }}>
        <ThunderboltOutlined style={{ color: '#fa541c', marginRight: 8 }} />
        Тренировочные программы
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Программы составлены персонально. Если хотите получить свою — обратитесь к тренеру.
      </Paragraph>

      {trainings.length === 0 ? (
        <Empty description="Программы ещё не добавлены" />
      ) : (
        <Row gutter={[16, 16]}>
          {trainings.map(t => {
            const diff = DIFFICULTY_CONFIG[t.difficulty] || { label: t.difficulty, color: 'default' };
            return (
              <Col key={t.id} xs={24} md={12} lg={8}>
                <Card
                  style={{ height: '100%', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                  onClick={() => navigate(`/trainings/${t.id}`)}
                  cover={
                    <div style={{
                      height: 120,
                      background: 'linear-gradient(135deg, #fff5f0, #ffd8cc)',
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 48,
                    }}>
                      🏋️
                    </div>
                  }
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div>
                      <Title level={4} style={{ margin: '0 0 8px' }}>{t.title}</Title>
                      <Space>
                        <Tag color={diff.color}>{diff.label}</Tag>
                        <Text type="secondary">
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          {t.duration_weeks} нед.
                        </Text>
                      </Space>
                    </div>
                    {t.description && (
                      <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 13 }}>
                        {t.description}
                      </Paragraph>
                    )}
                    <Button type="link" style={{ padding: 0, color: '#fa541c' }} icon={<ArrowRightOutlined />}>
                      Подробнее
                    </Button>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
