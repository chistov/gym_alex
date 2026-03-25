import { useEffect, useState } from 'react';
import { Table, Typography, Tag, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Descriptions } from 'antd';
import { UserOutlined, EyeOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { usersApi } from '../../api/users';
import { trainingsApi, userTrainingsApi } from '../../api/trainings';
import type { User, Training } from '../../types';

const { Title } = Typography;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [assignModal, setAssignModal] = useState<User | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [u, t] = await Promise.all([usersApi.getAll(), trainingsApi.getAllAdmin()]);
      setUsers(u);
      setTrainings(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await usersApi.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      message.success('Пользователь удалён');
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const handleAssign = async () => {
    try {
      const values = await form.validateFields();
      await userTrainingsApi.assign({ user_id: assignModal!.id, training_id: values.training_id, notes: values.notes });
      message.success('Программа назначена');
      setAssignModal(null);
      form.resetFields();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Ошибка назначения');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Имя',
      dataIndex: 'name',
      render: (name, record) => (
        <span>
          {name}
          {record.role === 'admin' && <Tag color="red" style={{ marginLeft: 8 }}>Админ</Tag>}
        </span>
      ),
    },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Параметры',
      render: (_, r) => (
        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
          {r.height ? `${r.height}см` : '—'} / {r.weight ? `${r.weight}кг` : '—'}
        </span>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'created_at',
      render: (d) => dayjs(d).format('DD.MM.YYYY'),
      responsive: ['md'],
    },
    {
      title: 'Действия',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setViewUser(record)} />
          <Button size="small" icon={<ThunderboltOutlined />} onClick={() => { setAssignModal(record); form.resetFields(); }} />
          {record.role !== 'admin' && (
            <Popconfirm title="Удалить пользователя?" onConfirm={() => handleDelete(record.id)} okText="Да" cancelText="Нет">
              <Button size="small" danger>Удалить</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>
        <UserOutlined style={{ marginRight: 8 }} />
        Пользователи ({users.length})
      </Title>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: true }}
      />

      {/* View user details */}
      <Modal
        title={viewUser?.name}
        open={!!viewUser}
        onCancel={() => setViewUser(null)}
        footer={<Button onClick={() => setViewUser(null)}>Закрыть</Button>}
      >
        {viewUser && (
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Email">{viewUser.email}</Descriptions.Item>
            <Descriptions.Item label="Телефон">{viewUser.phone || '—'}</Descriptions.Item>
            <Descriptions.Item label="Пол">{viewUser.gender === 'male' ? 'Мужской' : viewUser.gender === 'female' ? 'Женский' : '—'}</Descriptions.Item>
            <Descriptions.Item label="Возраст">{viewUser.age ? `${viewUser.age} лет` : '—'}</Descriptions.Item>
            <Descriptions.Item label="Рост">{viewUser.height ? `${viewUser.height} см` : '—'}</Descriptions.Item>
            <Descriptions.Item label="Вес">{viewUser.weight ? `${viewUser.weight} кг` : '—'}</Descriptions.Item>
            <Descriptions.Item label="Цель">{viewUser.fitness_goal || '—'}</Descriptions.Item>
            <Descriptions.Item label="Опыт">{viewUser.experience || '—'}</Descriptions.Item>
            <Descriptions.Item label="Здоровье">{viewUser.health_notes || '—'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Assign training */}
      <Modal
        title={`Назначить программу — ${assignModal?.name}`}
        open={!!assignModal}
        onOk={handleAssign}
        onCancel={() => setAssignModal(null)}
        okText="Назначить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="training_id" label="Программа" rules={[{ required: true, message: 'Выберите программу' }]}>
            <Select placeholder="Выберите программу">
              {trainings.map(t => (
                <Select.Option key={t.id} value={t.id}>{t.title}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Заметки для пользователя">
            <Input.TextArea rows={3} placeholder="Рекомендации, особенности..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
