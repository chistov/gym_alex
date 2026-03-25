import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Grid } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ReadOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';

const { Sider, Content, Header } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Дашборд' },
  { key: '/admin/users', icon: <UserOutlined />, label: 'Пользователи' },
  { key: '/admin/news', icon: <ReadOutlined />, label: 'Новости' },
  { key: '/admin/products', icon: <ShoppingOutlined />, label: 'Товары' },
  { key: '/admin/trainings', icon: <ThunderboltOutlined />, label: 'Тренировки' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const selectedKey = location.pathname === '/admin' ? '/admin' :
    menuItems.find(m => m.key !== '/admin' && location.pathname.startsWith(m.key))?.key || '/admin';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider theme="dark" width={220} style={{ position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100 }}>
          <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Title level={5} style={{ color: '#fa541c', margin: 0 }}>Панель тренера</Title>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>Алексей Голубев</div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ marginTop: 8 }}
          />
          <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, padding: '0 16px' }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/news')}
              style={{ color: 'rgba(255,255,255,0.6)', width: '100%', textAlign: 'left' }}
            >
              На сайт
            </Button>
          </div>
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : 220 }}>
        {isMobile && (
          <Header style={{ background: '#001529', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <Title level={5} style={{ color: '#fa541c', margin: 0 }}>Панель тренера</Title>
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ color: '#fff' }} onClick={() => navigate('/news')}>
              На сайт
            </Button>
          </Header>
        )}
        {isMobile && (
          <div style={{ background: '#001529', overflowX: 'auto' }}>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[selectedKey]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{ minWidth: 600 }}
            />
          </div>
        )}
        <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
