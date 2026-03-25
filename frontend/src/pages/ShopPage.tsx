import { useEffect, useState } from 'react';
import { Card, Typography, Spin, Empty, Tag, Button, Row, Col, Select, Badge, Space } from 'antd';
import { ShoppingOutlined, TagOutlined } from '@ant-design/icons';
import { productsApi } from '../api/products';
import type { Product } from '../types';

const { Title, Paragraph, Text } = Typography;

const CATEGORY_LABELS: Record<string, string> = {
  services: 'Услуги',
  subscription: 'Абонементы',
  equipment: 'Оборудование',
  accessories: 'Аксессуары',
  general: 'Общее',
};

const CATEGORY_COLORS: Record<string, string> = {
  services: 'blue',
  subscription: 'green',
  equipment: 'orange',
  accessories: 'purple',
  general: 'default',
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>();
  const [total, setTotal] = useState(0);

  const load = async (cat?: string) => {
    setLoading(true);
    try {
      const data = await productsApi.getAll({ category: cat });
      setProducts(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(category); }, [category]);

  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          <ShoppingOutlined style={{ color: '#fa541c', marginRight: 8 }} />
          Магазин
        </Title>
        <Select
          placeholder="Все категории"
          allowClear
          style={{ minWidth: 180 }}
          onChange={v => setCategory(v)}
          value={category}
        >
          {categories.map(([val, label]) => (
            <Select.Option key={val} value={val}>{label}</Select.Option>
          ))}
        </Select>
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        {loading ? 'Загрузка...' : `Найдено товаров: ${total}`}
      </Text>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}><Spin size="large" /></div>
      ) : products.length === 0 ? (
        <Empty description="Товаров не найдено" />
      ) : (
        <Row gutter={[16, 16]}>
          {products.map(product => (
            <Col key={product.id} xs={24} sm={12} lg={8}>
              <Card
                style={{ height: '100%', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                cover={
                  product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ height: 180, objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                    />
                  ) : (
                    <div style={{
                      height: 120,
                      background: 'linear-gradient(135deg, #fff5f0, #ffd8cc)',
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 48,
                    }}>
                      {product.category === 'services' ? '🤝' :
                       product.category === 'subscription' ? '🎫' :
                       product.category === 'equipment' ? '🏋️' : '🛍️'}
                    </div>
                  )
                }
                actions={[
                  <Button
                    key="contact"
                    type="primary"
                    block
                    style={{ margin: '0 16px', width: 'calc(100% - 32px)' }}
                    onClick={() => window.open('https://vk.com/fitnessplus0', '_blank')}
                  >
                    Заказать
                  </Button>
                ]}
              >
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Title level={5} style={{ margin: 0, flex: 1 }}>{product.name}</Title>
                    <Tag color={CATEGORY_COLORS[product.category] || 'default'} style={{ marginLeft: 8, flexShrink: 0 }}>
                      {CATEGORY_LABELS[product.category] || product.category}
                    </Tag>
                  </div>
                  {product.description && (
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 13 }}>
                      {product.description}
                    </Paragraph>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 20, color: '#fa541c' }}>
                      {product.price.toLocaleString('ru-RU')} ₽
                    </Text>
                    {product.stock > 0 ? (
                      <Badge status="success" text={`В наличии: ${product.stock}`} />
                    ) : (
                      <Badge status="error" text="Нет в наличии" />
                    )}
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
