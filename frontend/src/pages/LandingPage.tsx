import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Row, Col, Card, Space, Grid, Tag } from 'antd';
import {
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ReadOutlined,
  UserOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const features = [
  { icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#fa541c' }} />, title: 'Тренировочные программы', desc: 'Программы по жиму лёжа и силовым дисциплинам под ваш уровень и цели' },
  { icon: <TrophyOutlined style={{ fontSize: 32, color: '#fa541c' }} />, title: 'Личный кабинет', desc: 'Фиксируйте параметры, следите за прогрессом и результатами' },
  { icon: <FireOutlined style={{ fontSize: 32, color: '#fa541c' }} />, title: 'Техника русского жима', desc: 'Правильная постановка техники — фундамент роста результатов' },
  { icon: <StarOutlined style={{ fontSize: 32, color: '#fa541c' }} />, title: 'Персональный подход', desc: 'Индивидуальные консультации и программы с учётом ваших особенностей' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Nav */}
      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <div>
          <Text strong style={{ fontSize: 18, color: '#fa541c' }}>Алексей Голубев</Text>
          <Tag color="red" style={{ marginLeft: 8, fontSize: 11 }}>МС по русскому жиму</Tag>
        </div>
        <Space>
          {user ? (
            <Button type="primary" onClick={() => navigate('/news')}>Личный кабинет</Button>
          ) : (
            <>
              <Button onClick={() => navigate('/login')}>Войти</Button>
              <Button type="primary" onClick={() => navigate('/register')}>Регистрация</Button>
            </>
          )}
        </Space>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #fff5f0 0%, #fff 100%)', padding: isMobile ? '40px 24px' : '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12} style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <Space style={{ marginBottom: 16 }}>
                <Tag color="volcano" style={{ fontSize: 13, padding: '4px 12px' }}>Мастер спорта</Tag>
                <Tag color="orange" style={{ fontSize: 13, padding: '4px 12px' }}>Русский жим</Tag>
              </Space>
              <Title level={1} style={{ color: '#1a1a1a', marginBottom: 16, fontSize: isMobile ? 30 : 46, lineHeight: 1.2 }}>
                Жим лёжа — это наука.<br />
                <span style={{ color: '#fa541c' }}>Я научу тебя побеждать.</span>
              </Title>
              <Paragraph style={{ fontSize: 17, color: '#595959', marginBottom: 32 }}>
                Алексей Голубев — Мастер спорта по русскому жиму. Тренирую с нуля до соревновательного уровня: техника, силовые показатели, подготовка к стартам.
              </Paragraph>
              <Space wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<UserOutlined />}
                  onClick={() => navigate('/register')}
                  style={{ height: 48, paddingInline: 32, fontSize: 16 }}
                >
                  Начать тренировки
                </Button>
                <Button
                  size="large"
                  icon={<ReadOutlined />}
                  onClick={() => navigate('/login')}
                  style={{ height: 48, paddingInline: 32, fontSize: 16 }}
                >
                  Уже есть аккаунт
                </Button>
              </Space>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'center' }}>
              {!imgError ? (
                <img
                  src="/trainer.png"
                  alt="Алексей Голубев — МС по русскому жиму"
                  style={{
                    maxWidth: isMobile ? 280 : 400,
                    width: '100%',
                    borderRadius: 24,
                    boxShadow: '0 20px 60px rgba(250, 84, 28, 0.25)',
                  }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div style={{
                  width: isMobile ? 280 : 360,
                  height: isMobile ? 320 : 400,
                  background: 'linear-gradient(135deg, #fa541c20, #fa541c40)',
                  borderRadius: 24,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 80,
                }}>
                  🏆
                </div>
              )}
            </Col>
          </Row>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '40px 24px', background: '#1a1a1a' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[24, 24]} justify="center">
            {[
              { value: 'МС', label: 'Мастер спорта' },
              { value: '10+', label: 'лет в жиме' },
              { value: '500+', label: 'учеников' },
              { value: '100+', label: 'призёров' },
            ].map(stat => (
              <Col key={stat.label} xs={12} sm={6} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fa541c' }}>{stat.value}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{stat.label}</div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* About */}
      <div style={{ padding: isMobile ? '40px 24px' : '64px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 16 }}>О тренере</Title>
          <Paragraph style={{ fontSize: 16, color: '#595959', lineHeight: 1.8 }}>
            <strong>Русский жим</strong> — это жим штанги лёжа на максимальное количество повторений.
            Дисциплина требует не только силы, но и выносливости, идеальной техники и правильной подготовки.
            Алексей прошёл путь от новичка до Мастера спорта и знает каждый шаг этого пути.
          </Paragraph>
          <Paragraph style={{ fontSize: 16, color: '#595959', lineHeight: 1.8 }}>
            Работает с атлетами любого уровня — от первой тренировки до соревновательной подготовки.
            Индивидуальный подход, честная обратная связь, реальный результат.
          </Paragraph>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: isMobile ? '40px 24px' : '64px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
            Что вы получите
          </Title>
          <Row gutter={[24, 24]}>
            {features.map(f => (
              <Col key={f.title} xs={24} sm={12} lg={6}>
                <Card
                  style={{ height: '100%', textAlign: 'center', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  styles={{ body: { padding: '32px 24px' } }}
                >
                  <div style={{ marginBottom: 16 }}>{f.icon}</div>
                  <Title level={4} style={{ marginBottom: 12 }}>{f.title}</Title>
                  <Paragraph style={{ color: '#595959', margin: 0 }}>{f.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 24px', textAlign: 'center', background: '#fff' }}>
        <Title level={2}>Готов к первому повторению?</Title>
        <Paragraph style={{ fontSize: 18, color: '#595959', marginBottom: 32 }}>
          Зарегистрируйся, заполни профиль — и получи программу, заточенную под тебя
        </Paragraph>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/register')}
          style={{ height: 52, paddingInline: 48, fontSize: 18 }}
        >
          Записаться на тренировку
        </Button>
      </div>

      {/* Footer */}
      <div style={{ padding: '24px', textAlign: 'center', background: '#1a1a1a', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
        © 2024 Алексей Голубев — Мастер спорта по русскому жиму
      </div>
    </div>
  );
}
