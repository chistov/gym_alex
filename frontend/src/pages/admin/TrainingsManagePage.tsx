import { useEffect, useState } from 'react';
import { Table, Typography, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, message, Popconfirm, Tag, List, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { trainingsApi } from '../../api/trainings';
import type { Training, Exercise } from '../../types';

const { Title, Text } = Typography;

const DIFFICULTIES = [
  { value: 'beginner', label: 'Начинающий', color: 'green' },
  { value: 'intermediate', label: 'Средний', color: 'orange' },
  { value: 'advanced', label: 'Продвинутый', color: 'red' },
];

export default function TrainingsManagePage() {
  const [items, setItems] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainingModal, setTrainingModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [exerciseModal, setExerciseModal] = useState<Training | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [exerciseForm] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      setItems(await trainingsApi.getAllAdmin());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreateTraining = () => {
    setEditingTraining(null);
    form.resetFields();
    form.setFieldsValue({ difficulty: 'beginner', duration_weeks: 4, published: true });
    setTrainingModal(true);
  };

  const openEditTraining = (item: Training) => {
    setEditingTraining(item);
    form.setFieldsValue({ ...item, published: item.published === 1 });
    setTrainingModal(true);
  };

  const handleSaveTraining = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = { ...values, published: values.published ? 1 : 0 };
      if (editingTraining) {
        const updated = await trainingsApi.update(editingTraining.id, payload);
        setItems(prev => prev.map(i => i.id === editingTraining.id ? { ...i, ...updated } : i));
        message.success('Программа обновлена');
      } else {
        const created = await trainingsApi.create(payload);
        setItems(prev => [created, ...prev]);
        message.success('Программа создана');
      }
      setTrainingModal(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      if (err.response) message.error(err.response.data?.message || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTraining = async (id: number) => {
    try {
      await trainingsApi.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      message.success('Программа удалена');
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const openExercises = async (training: Training) => {
    const full = await trainingsApi.getById(training.id);
    setExerciseModal(full);
    setEditingExercise(null);
    exerciseForm.resetFields();
    exerciseForm.setFieldsValue({ sets: 3, reps: '10', rest_seconds: 60 });
  };

  const handleSaveExercise = async () => {
    if (!exerciseModal) return;
    try {
      const values = await exerciseForm.validateFields();
      setSaving(true);
      if (editingExercise) {
        const updated = await trainingsApi.updateExercise(editingExercise.id, values);
        setExerciseModal(prev => prev ? {
          ...prev,
          exercises: (prev.exercises || []).map(e => e.id === editingExercise.id ? updated : e)
        } : prev);
        message.success('Упражнение обновлено');
      } else {
        const created = await trainingsApi.addExercise(exerciseModal.id, { ...values, order_index: (exerciseModal.exercises || []).length });
        setExerciseModal(prev => prev ? { ...prev, exercises: [...(prev.exercises || []), created] } : prev);
        message.success('Упражнение добавлено');
      }
      setEditingExercise(null);
      exerciseForm.resetFields();
      exerciseForm.setFieldsValue({ sets: 3, reps: '10', rest_seconds: 60 });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      if (err.response) message.error(err.response.data?.message || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    try {
      await trainingsApi.deleteExercise(exerciseId);
      setExerciseModal(prev => prev ? {
        ...prev,
        exercises: (prev.exercises || []).filter(e => e.id !== exerciseId)
      } : prev);
      message.success('Упражнение удалено');
    } catch {
      message.error('Ошибка');
    }
  };

  const diffConfig = (d: string) => DIFFICULTIES.find(x => x.value === d) || { label: d, color: 'default' };

  const columns: ColumnsType<Training> = [
    { title: 'Название', dataIndex: 'title', ellipsis: true },
    {
      title: 'Сложность',
      dataIndex: 'difficulty',
      width: 130,
      render: (d) => { const c = diffConfig(d); return <Tag color={c.color}>{c.label}</Tag>; },
    },
    { title: 'Недель', dataIndex: 'duration_weeks', width: 80 },
    {
      title: 'Статус',
      dataIndex: 'published',
      width: 120,
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Опубликована' : 'Скрыта'}</Tag>,
      responsive: ['md'],
    },
    {
      title: '',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<ThunderboltOutlined />} onClick={() => openExercises(record)} title="Упражнения" />
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditTraining(record)} />
          <Popconfirm title="Удалить программу?" onConfirm={() => handleDeleteTraining(record.id)} okText="Да" cancelText="Нет">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Тренировочные программы</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateTraining}>Создать</Button>
      </div>

      <Table dataSource={items} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} scroll={{ x: true }} />

      {/* Training modal */}
      <Modal
        title={editingTraining ? 'Редактировать программу' : 'Новая программа'}
        open={trainingModal}
        onOk={handleSaveTraining}
        onCancel={() => setTrainingModal(false)}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="difficulty" label="Сложность">
            <Select>
              {DIFFICULTIES.map(d => <Select.Option key={d.value} value={d.value}>{d.label}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="duration_weeks" label="Продолжительность (недель)">
            <InputNumber min={1} max={52} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="published" label="Опубликована" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Exercises modal */}
      <Modal
        title={`Упражнения — ${exerciseModal?.title}`}
        open={!!exerciseModal}
        onCancel={() => { setExerciseModal(null); setEditingExercise(null); }}
        footer={<Button onClick={() => { setExerciseModal(null); setEditingExercise(null); }}>Закрыть</Button>}
        width={640}
      >
        {exerciseModal && (
          <>
            <List
              dataSource={exerciseModal.exercises || []}
              locale={{ emptyText: 'Упражнений нет' }}
              renderItem={(ex, idx) => (
                <List.Item
                  actions={[
                    <Button key="edit" size="small" icon={<EditOutlined />} onClick={() => {
                      setEditingExercise(ex);
                      exerciseForm.setFieldsValue(ex);
                    }} />,
                    <Popconfirm key="del" title="Удалить?" onConfirm={() => handleDeleteExercise(ex.id)} okText="Да" cancelText="Нет">
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <div>
                    <Text strong>{idx + 1}. {ex.name}</Text>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {ex.sets} подх. × {ex.reps} повт. | Отдых: {ex.rest_seconds}с
                    </div>
                  </div>
                </List.Item>
              )}
            />
            <Divider>{editingExercise ? 'Редактировать упражнение' : 'Добавить упражнение'}</Divider>
            <Form form={exerciseForm} layout="vertical" size="small">
              <Form.Item name="name" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
                <Input />
              </Form.Item>
              <Space style={{ width: '100%' }} size={8}>
                <Form.Item name="sets" label="Подходы" style={{ flex: 1 }}>
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="reps" label="Повторения" style={{ flex: 1 }}>
                  <Input placeholder="10 / максимум" />
                </Form.Item>
                <Form.Item name="rest_seconds" label="Отдых (сек)" style={{ flex: 1 }}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Space>
              <Form.Item name="description" label="Описание техники">
                <Input.TextArea rows={2} />
              </Form.Item>
              <Space>
                <Button type="primary" onClick={handleSaveExercise} loading={saving}>
                  {editingExercise ? 'Сохранить' : 'Добавить'}
                </Button>
                {editingExercise && (
                  <Button onClick={() => { setEditingExercise(null); exerciseForm.resetFields(); exerciseForm.setFieldsValue({ sets: 3, reps: '10', rest_seconds: 60 }); }}>
                    Отмена
                  </Button>
                )}
              </Space>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}
