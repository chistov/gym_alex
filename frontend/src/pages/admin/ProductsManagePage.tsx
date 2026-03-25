import { useEffect, useState } from 'react';
import { Table, Typography, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { productsApi } from '../../api/products';
import type { Product } from '../../types';

const { Title } = Typography;

const CATEGORIES = [
  { value: 'services', label: 'Услуги' },
  { value: 'subscription', label: 'Абонементы' },
  { value: 'equipment', label: 'Оборудование' },
  { value: 'accessories', label: 'Аксессуары' },
  { value: 'general', label: 'Общее' },
];

export default function ProductsManagePage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      setItems(await productsApi.getAllAdmin());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ category: 'general', stock: 0, published: true });
    setModalOpen(true);
  };

  const openEdit = (item: Product) => {
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
        const updated = await productsApi.update(editing.id, payload);
        setItems(prev => prev.map(i => i.id === editing.id ? updated : i));
        message.success('Товар обновлён');
      } else {
        const created = await productsApi.create(payload);
        setItems(prev => [created, ...prev]);
        message.success('Товар создан');
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
      await productsApi.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      message.success('Товар удалён');
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const catLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat;

  const columns: ColumnsType<Product> = [
    { title: 'Название', dataIndex: 'name', ellipsis: true },
    { title: 'Категория', dataIndex: 'category', render: (c) => <Tag>{catLabel(c)}</Tag>, width: 130 },
    {
      title: 'Цена',
      dataIndex: 'price',
      width: 110,
      render: (p) => `${p.toLocaleString('ru-RU')} ₽`,
    },
    { title: 'Остаток', dataIndex: 'stock', width: 80 },
    {
      title: 'Статус',
      dataIndex: 'published',
      width: 120,
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Опубликован' : 'Скрыт'}</Tag>,
      responsive: ['md'],
    },
    {
      title: '',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Удалить товар?" onConfirm={() => handleDelete(record.id)} okText="Да" cancelText="Нет">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Товары</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Добавить</Button>
      </div>

      <Table dataSource={items} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} scroll={{ x: true }} />

      <Modal
        title={editing ? 'Редактировать товар' : 'Новый товар'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Цена (₽)" rules={[{ required: true, message: 'Введите цену' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="category" label="Категория">
            <Select>
              {CATEGORIES.map(c => <Select.Option key={c.value} value={c.value}>{c.label}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="stock" label="Количество в наличии">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="image_url" label="URL изображения">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
          <Form.Item name="published" label="Опубликован" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
