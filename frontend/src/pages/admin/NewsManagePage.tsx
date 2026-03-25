import { useEffect, useState } from 'react';
import { Table, Typography, Button, Modal, Form, Input, Switch, Space, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { newsApi } from '../../api/news';
import type { NewsItem } from '../../types';

const { Title } = Typography;

export default function NewsManagePage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const data = await newsApi.getAllAdmin();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ published: true });
    setModalOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditing(item);
    form.setFieldsValue({ ...item, published: item.published === 1 });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = { ...values, published: values.published ? 1 : 0 };
      if (editing) {
        const updated = await newsApi.update(editing.id, payload);
        setItems(prev => prev.map(i => i.id === editing.id ? updated : i));
        message.success('Новость обновлена');
      } else {
        const created = await newsApi.create(payload);
        setItems(prev => [created, ...prev]);
        message.success('Новость создана');
      }
      setModalOpen(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      if (err.response) message.error(err.response.data?.message || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await newsApi.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      message.success('Новость удалена');
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const columns: ColumnsType<NewsItem> = [
    {
      title: 'Заголовок',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Статус',
      dataIndex: 'published',
      width: 100,
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Опубликовано' : 'Черновик'}</Tag>,
    },
    {
      title: 'Дата',
      dataIndex: 'created_at',
      width: 120,
      render: (d) => dayjs(d).format('DD.MM.YYYY'),
      responsive: ['md'],
    },
    {
      title: '',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Удалить новость?" onConfirm={() => handleDelete(record.id)} okText="Да" cancelText="Нет">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Новости</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Добавить</Button>
      </div>

      <Table dataSource={items} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} scroll={{ x: true }} />

      <Modal
        title={editing ? 'Редактировать новость' : 'Новая новость'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={saving}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Заголовок" rules={[{ required: true, message: 'Введите заголовок' }]}>
            <Input placeholder="Заголовок новости" />
          </Form.Item>
          <Form.Item name="content" label="Содержание" rules={[{ required: true, message: 'Введите содержание' }]}>
            <Input.TextArea rows={6} placeholder="Текст новости..." />
          </Form.Item>
          <Form.Item name="image_url" label="URL изображения">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
          <Form.Item name="published" label="Опубликовано" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
