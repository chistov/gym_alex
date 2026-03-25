import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Empty, Tag, Button, Space, Select, message } from 'antd';
import { TrophyOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { userTrainingsApi } from '../api/trainings';
import type { UserTraining } from '../types';

const { Title, Text } = Typography;

const STATUS_CONFIG = {
  active: { label: 'Активна', color: 'blue' },
  completed: { label: 'Завершена', color: 'green' },
  paused: { label: 'На паузе', color: 'orange' },
};

export default function MyTrainingsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<UserTraining[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await userTrainingsApi.getMyTrainings();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await userTrainingsApi.updateStatus(id, { status });
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: status as UserTraining['status'] } : i));
      message.success('Статус обновлён');
    } catch {
      message.error('Ошибка обновления');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 64 }}><Spin size="large" /></div>;

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        <TrophyOutlined style={{ color: '#fa541c', marginRight: 8 }} />
        Мои тренировочные программы
      </Title>

      {items.length === 0 ? (
        <Empty
          description="У вас пока нет назначенных программ"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Тренер назначит вам программу после консультации
          </Text>
          <Button type="primary" onClick={() => navigate('/trainings')}>
            Смотреть все программы
          </Button>
        </Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(item => {
            const statusConfig = STATUS_CONFIG[item.status] || { label: item.status, color: 'default' };
            return (
              <Card key={item.id} style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Title level={4} style={{ margin: '0 0 8px' }}>{item.training_title}</Title>
                    <Space wrap>
                      <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
                      {item.difficulty && (
                        <Tag>{item.difficulty === 'beginner' ? 'Начинающий' : item.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}</Tag>
                      )}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Назначено: {dayjs(item.assigned_at).format('D MMM YYYY')}
                      </Text>
                    </Space>
                    {item.training_description && (
                      <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 13 }}>
                        {item.training_description}
                      </Text>
                    )}
                    {item.notes && (
                      <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff7f0', borderRadius: 8, fontSize: 13 }}>
                        <Text type="secondary">Заметки тренера: </Text>
                        <Text>{item.notes}</Text>
                      </div>
                    )}
                  </div>
                  <Space direction="vertical" align="end">
                    <Select
                      value={item.status}
                      onChange={v => updateStatus(item.id, v)}
                      style={{ width: 150 }}
                      size="small"
                    >
                      <Select.Option value="active">Активна</Select.Option>
                      <Select.Option value="paused">На паузе</Select.Option>
                      <Select.Option value="completed">Завершена</Select.Option>
                    </Select>
                    <Button
                      type="link"
                      icon={<ArrowRightOutlined />}
                      style={{ padding: 0, color: '#fa541c' }}
                      onClick={() => navigate(`/trainings/${item.training_id}`)}
                    >
                      Открыть программу
                    </Button>
                  </Space>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
