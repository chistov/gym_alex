import { useState } from 'react';
import { Form, Input, InputNumber, Select, Radio, Button, Card, Typography, message, Space, Divider, Descriptions, Tag } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuthStore } from '../store/authStore';
import { usersApi } from '../api/users';

const { Title, Text } = Typography;

const GOALS = ['Похудение', 'Набор мышечной массы', 'Поддержание формы', 'Развитие силы', 'Улучшение выносливости', 'Реабилитация'];
const EXPERIENCE = [
  { value: 'beginner', label: 'Начинающий (до 6 месяцев)' },
  { value: 'intermediate', label: 'Средний (6 мес — 2 года)' },
  { value: 'advanced', label: 'Продвинутый (2+ года)' },
];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  if (!user) return null;

  const startEdit = () => {
    form.setFieldsValue({
      name: user.name,
      phone: user.phone,
      height: user.height,
      weight: user.weight,
      age: user.age,
      gender: user.gender,
      fitness_goal: user.fitness_goal,
      experience: user.experience,
      health_notes: user.health_notes,
    });
    setEditing(true);
  };

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const updated = await usersApi.updateProfile(values);
      setUser(updated);
      setEditing(false);
      message.success('Профиль обновлён');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const expLabel = EXPERIENCE.find(e => e.value === user.experience)?.label || user.experience;

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        <UserOutlined style={{ color: '#fa541c', marginRight: 8 }} />
        Мой профиль
      </Title>

      <Card
        style={{ borderRadius: 12, marginBottom: 16 }}
        extra={
          !editing ? (
            <Button icon={<EditOutlined />} onClick={startEdit}>Редактировать</Button>
          ) : (
            <Space>
              <Button onClick={() => setEditing(false)}>Отмена</Button>
              <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={onSave}>Сохранить</Button>
            </Space>
          )
        }
      >
        {!editing ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#fa541c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                color: '#fff',
                fontWeight: 700,
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <Title level={3} style={{ margin: 0 }}>{user.name}</Title>
                <Text type="secondary">{user.email}</Text>
                {user.role === 'admin' && <Tag color="red" style={{ marginLeft: 8 }}>Администратор</Tag>}
              </div>
            </div>

            <Divider />

            <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ color: '#8c8c8c' }}>
              {user.phone && <Descriptions.Item label="Телефон">{user.phone}</Descriptions.Item>}
              {user.gender && <Descriptions.Item label="Пол">{user.gender === 'male' ? 'Мужской' : 'Женский'}</Descriptions.Item>}
              {user.age && <Descriptions.Item label="Возраст">{user.age} лет</Descriptions.Item>}
              {user.height && <Descriptions.Item label="Рост">{user.height} см</Descriptions.Item>}
              {user.weight && <Descriptions.Item label="Вес">{user.weight} кг</Descriptions.Item>}
              {user.fitness_goal && <Descriptions.Item label="Цель">{user.fitness_goal}</Descriptions.Item>}
              {user.experience && <Descriptions.Item label="Опыт">{expLabel}</Descriptions.Item>}
              {user.health_notes && <Descriptions.Item label="Особенности здоровья" span={2}>{user.health_notes}</Descriptions.Item>}
              <Descriptions.Item label="Дата регистрации">{dayjs(user.created_at).format('D MMMM YYYY')}</Descriptions.Item>
            </Descriptions>

            {!user.height && !user.weight && (
              <div style={{ marginTop: 16, padding: 16, background: '#fff7f0', borderRadius: 8, border: '1px solid #ffcba4' }}>
                <Text>Заполните параметры профиля, чтобы тренер мог составить для вас индивидуальную программу</Text>
                <br />
                <Button type="primary" size="small" style={{ marginTop: 8 }} onClick={startEdit}>Заполнить</Button>
              </div>
            )}
          </>
        ) : (
          <Form form={form} layout="vertical" size="large">
            <Form.Item name="name" label="Имя" rules={[{ required: true, message: 'Введите имя' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Телефон">
              <Input placeholder="+7 900 000-00-00" />
            </Form.Item>
            <Divider>Физические параметры</Divider>
            <Form.Item name="gender" label="Пол">
              <Radio.Group>
                <Radio value="male">Мужской</Radio>
                <Radio value="female">Женский</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="age" label="Возраст">
              <InputNumber min={10} max={100} style={{ width: '100%' }} suffix="лет" />
            </Form.Item>
            <Form.Item name="height" label="Рост">
              <InputNumber min={100} max={250} style={{ width: '100%' }} suffix="см" />
            </Form.Item>
            <Form.Item name="weight" label="Вес">
              <InputNumber min={30} max={300} style={{ width: '100%' }} suffix="кг" />
            </Form.Item>
            <Divider>Цели и опыт</Divider>
            <Form.Item name="fitness_goal" label="Цель тренировок">
              <Select placeholder="Выберите цель">
                {GOALS.map(g => <Select.Option key={g} value={g}>{g}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="experience" label="Опыт тренировок">
              <Select placeholder="Выберите уровень">
                {EXPERIENCE.map(e => <Select.Option key={e.value} value={e.value}>{e.label}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="health_notes" label="Особенности здоровья">
              <Input.TextArea placeholder="Больная спина, проблемы с коленями..." rows={3} />
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
}
