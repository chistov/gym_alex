import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Tag, Button, List, Divider, Space, Descriptions } from 'antd';
import { ArrowLeftOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { trainingsApi } from '../api/trainings';
import type { Training } from '../types';

const { Title, Paragraph, Text } = Typography;

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Начинающий', color: 'green' },
  intermediate: { label: 'Средний', color: 'orange' },
  advanced: { label: 'Продвинутый', color: 'red' },
};

export default function TrainingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    trainingsApi.getById(Number(id))
      .then(setTraining)
      .catch(() => navigate('/trainings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div style={{ textAlign: 'center', padding: 64 }}><Spin size="large" /></div>;
  if (!training) return null;

  const diff = DIFFICULTY_CONFIG[training.difficulty] || { label: training.difficulty, color: 'default' };

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/trainings')}
        style={{ marginBottom: 16, padding: 0, color: '#fa541c' }}
      >
        Все программы
      </Button>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Title level={2} style={{ margin: '0 0 8px' }}>{training.title}</Title>
            <Space>
              <Tag color={diff.color} style={{ fontSize: 14, padding: '2px 8px' }}>{diff.label}</Tag>
              <Text type="secondary">
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {training.duration_weeks} недель
              </Text>
            </Space>
          </div>
          <div style={{ fontSize: 48 }}>🏋️</div>
        </div>

        {training.description && (
          <>
            <Divider />
            <Paragraph style={{ fontSize: 16, color: '#595959', margin: 0 }}>
              {training.description}
            </Paragraph>
          </>
        )}
      </Card>

      <Card title={<span><ThunderboltOutlined style={{ color: '#fa541c', marginRight: 8 }} />Упражнения</span>} style={{ borderRadius: 12 }}>
        {!training.exercises || training.exercises.length === 0 ? (
          <Text type="secondary">Упражнения ещё не добавлены</Text>
        ) : (
          <List
            dataSource={training.exercises}
            renderItem={(ex, idx) => (
              <List.Item style={{ alignItems: 'flex-start' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#fa541c',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                    <Text strong style={{ fontSize: 16 }}>{ex.name}</Text>
                  </div>
                  <div style={{ paddingLeft: 44 }}>
                    <Space wrap>
                      <Tag>{ex.sets} подхода</Tag>
                      <Tag>{ex.reps} повторений</Tag>
                      <Tag color="blue">Отдых: {ex.rest_seconds} сек</Tag>
                    </Space>
                    {ex.description && (
                      <Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 13 }}>
                        {ex.description}
                      </Paragraph>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
