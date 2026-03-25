import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Space, Steps, Select, InputNumber, Radio } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';

const { Title, Text } = Typography;

const GOALS = [
  'Похудение',
  'Набор мышечной массы',
  'Поддержание формы',
  'Развитие силы',
  'Улучшение выносливости',
  'Реабилитация',
];

const EXPERIENCE = [
  { value: 'beginner', label: 'Начинающий (до 6 месяцев)' },
  { value: 'intermediate', label: 'Средний (6 мес — 2 года)' },
  { value: 'advanced', label: 'Продвинутый (2+ года)' },
];

type FormValues = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  fitness_goal?: string;
  experience?: string;
  health_notes?: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, setUser, login } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<FormValues>>({});
  const [form] = Form.useForm();

  const steps = [
    { title: 'Аккаунт', description: 'Email и пароль' },
    { title: 'Параметры', description: 'Рост, вес, возраст' },
    { title: 'Цели', description: 'Что хотите достичь' },
  ];

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData(prev => ({ ...prev, ...values }));
      setStep(s => s + 1);
    } catch {}
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const all = { ...formData, ...values } as FormValues;
      setLoading(true);
      setError('');

      await register({
        name: all.name!,
        email: all.email!,
        password: all.password!,
        phone: all.phone,
      });

      // Update profile with fitness data
      const { usersApi } = await import('../api/users');
      const updated = await usersApi.updateProfile({
        height: all.height,
        weight: all.weight,
        age: all.age,
        gender: all.gender,
        fitness_goal: all.fitness_goal,
        experience: all.experience,
        health_notes: all.health_notes,
      });
      setUser(updated);

      navigate('/news');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff5f0 0%, #fff 100%)',
      padding: '24px 16px',
    }}>
      <Card style={{ width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: 16 }}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏋️</div>
            <Title level={3} style={{ margin: 0, color: '#fa541c' }}>Регистрация</Title>
            <Text type="secondary">Создайте личный кабинет</Text>
          </div>

          <Steps current={step} size="small" items={steps} />

          {error && <Alert message={error} type="error" showIcon />}

          <Form form={form} layout="vertical" size="large">
            {/* Step 0: Account */}
            {step === 0 && (
              <>
                <Form.Item name="name" label="Ваше имя" rules={[{ required: true, message: 'Введите имя' }]}>
                  <Input prefix={<UserOutlined />} placeholder="Иван Иванов" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Введите email' },
                    { type: 'email', message: 'Некорректный email' },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="ivan@example.com" />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Пароль"
                  rules={[
                    { required: true, message: 'Введите пароль' },
                    { min: 6, message: 'Минимум 6 символов' },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Минимум 6 символов" />
                </Form.Item>
                <Form.Item name="phone" label="Телефон (необязательно)">
                  <Input prefix={<PhoneOutlined />} placeholder="+7 900 000-00-00" />
                </Form.Item>
              </>
            )}

            {/* Step 1: Physical params */}
            {step === 1 && (
              <>
                <Form.Item name="gender" label="Пол">
                  <Radio.Group>
                    <Radio value="male">Мужской</Radio>
                    <Radio value="female">Женский</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item name="age" label="Возраст">
                  <InputNumber placeholder="30" min={10} max={100} style={{ width: '100%' }} suffix="лет" />
                </Form.Item>
                <Form.Item name="height" label="Рост">
                  <InputNumber placeholder="175" min={100} max={250} style={{ width: '100%' }} suffix="см" />
                </Form.Item>
                <Form.Item name="weight" label="Вес">
                  <InputNumber placeholder="70" min={30} max={300} style={{ width: '100%' }} suffix="кг" />
                </Form.Item>
              </>
            )}

            {/* Step 2: Goals */}
            {step === 2 && (
              <>
                <Form.Item name="fitness_goal" label="Ваша цель">
                  <Select placeholder="Выберите цель">
                    {GOALS.map(g => <Select.Option key={g} value={g}>{g}</Select.Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="experience" label="Опыт тренировок">
                  <Select placeholder="Выберите уровень">
                    {EXPERIENCE.map(e => <Select.Option key={e.value} value={e.value}>{e.label}</Select.Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="health_notes" label="Особенности здоровья (необязательно)">
                  <Input.TextArea
                    placeholder="Например: больная спина, проблемы с коленями..."
                    rows={3}
                  />
                </Form.Item>
              </>
            )}
          </Form>

          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            {step > 0 ? (
              <Button onClick={() => setStep(s => s - 1)}>Назад</Button>
            ) : (
              <Link to="/login">Уже есть аккаунт</Link>
            )}
            {step < 2 ? (
              <Button type="primary" onClick={handleNext}>Далее</Button>
            ) : (
              <Button type="primary" loading={loading} onClick={handleSubmit}>
                Зарегистрироваться
              </Button>
            )}
          </Space>

          <div style={{ textAlign: 'center' }}>
            <Link to="/">← На главную</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
}
