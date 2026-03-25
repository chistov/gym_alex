import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Statistic, Space } from 'antd';
import { UserOutlined, ReadOutlined, ShoppingOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { usersApi } from '../../api/users';
import { newsApi } from '../../api/news';
import { productsApi } from '../../api/products';
import { trainingsApi } from '../../api/trainings';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState({ users: 0, news: 0, products: 0, trainings: 0 });

  useEffect(() => {
    Promise.all([
      usersApi.getAll(),
      newsApi.getAllAdmin(),
      productsApi.getAllAdmin(),
      trainingsApi.getAllAdmin(),
    ]).then(([users, news, products, trainings]) => {
      setStats({
        users: users.length,
        news: news.length,
        products: products.length,
        trainings: trainings.length,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { title: 'Пользователей', value: stats.users, icon: <UserOutlined style={{ fontSize: 24, color: '#1677ff' }} />, color: '#e6f4ff' },
    { title: 'Новостей', value: stats.news, icon: <ReadOutlined style={{ fontSize: 24, color: '#fa541c' }} />, color: '#fff5f0' },
    { title: 'Товаров', value: stats.products, icon: <ShoppingOutlined style={{ fontSize: 24, color: '#52c41a' }} />, color: '#f6ffed' },
    { title: 'Программ', value: stats.trainings, icon: <ThunderboltOutlined style={{ fontSize: 24, color: '#722ed1' }} />, color: '#f9f0ff' },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Дашборд</Title>
      <Row gutter={[16, 16]}>
        {cards.map(c => (
          <Col key={c.title} xs={12} md={6}>
            <Card style={{ borderRadius: 12, background: c.color, border: 'none' }}>
              <Space>
                {c.icon}
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{c.value}</div>
                  <Text type="secondary">{c.title}</Text>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginTop: 24, borderRadius: 12 }}>
        <Title level={4}>Быстрые ссылки</Title>
        <Space wrap>
          <a href="/admin/users">Управление пользователями →</a>
          <a href="/admin/news">Добавить новость →</a>
          <a href="/admin/products">Управление товарами →</a>
          <a href="/admin/trainings">Создать программу →</a>
        </Space>
      </Card>
    </div>
  );
}
