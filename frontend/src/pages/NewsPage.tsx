import { useEffect, useState } from 'react';
import { Card, Typography, Spin, Empty, Pagination, Tag } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { newsApi } from '../api/news';
import type { NewsItem } from '../types';

const { Title, Paragraph, Text } = Typography;

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const data = await newsApi.getAll(p, 10);
      setItems(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 64 }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        <ReadOutlined style={{ color: '#fa541c', marginRight: 8 }} />
        Новости и статьи
      </Title>

      {items.length === 0 ? (
        <Empty description="Новостей пока нет" />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map(item => (
              <Card
                key={item.id}
                style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                cover={
                  item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      style={{ height: 200, objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                    />
                  ) : undefined
                }
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Title level={4} style={{ margin: 0, flex: 1 }}>{item.title}</Title>
                  <Tag color="orange" style={{ marginLeft: 8, flexShrink: 0 }}>
                    {dayjs(item.created_at).format('D MMM YYYY')}
                  </Tag>
                </div>
                <Paragraph
                  style={{ color: '#595959', margin: 0 }}
                  ellipsis={{ rows: 4, expandable: true, symbol: 'Читать далее' }}
                >
                  {item.content}
                </Paragraph>
              </Card>
            ))}
          </div>

          {total > 10 && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Pagination
                current={page}
                total={total}
                pageSize={10}
                onChange={p => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
