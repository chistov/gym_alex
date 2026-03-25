import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, Grid } from 'antd';
import {
  HomeOutlined,
  ReadOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const navItems = [
  { key: '/news', label: 'Новости', icon: <ReadOutlined /> },
  { key: '/shop', label: 'Магазин', icon: <ShoppingOutlined /> },
  { key: '/trainings', label: 'Тренировки', icon: <ThunderboltOutlined /> },
  { key: '/my-trainings', label: 'Мои программы', icon: <TrophyOutlined /> },
  { key: '/profile', label: 'Профиль', icon: <UserOutlined /> },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems = [
    { key: 'profile', label: 'Мой профиль', icon: <UserOutlined /> },
    ...(user?.role === 'admin' ? [{ key: 'admin', label: 'Панель админа', icon: <SettingOutlined /> }] : []),
    { type: 'divider' as const },
    { key: 'logout', label: 'Выйти', icon: <LogoutOutlined />, danger: true },
  ];

  const handleUserMenu = ({ key }: { key: string }) => {
    if (key === 'logout') handleLogout();
    else if (key === 'profile') navigate('/profile');
    else if (key === 'admin') navigate('/admin');
  };

  const selectedKey = '/' + location.pathname.split('/')[1];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop header */}
      {!isMobile && (
        <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div
            style={{ marginRight: 32, cursor: 'pointer', whiteSpace: 'nowrap', lineHeight: 1.2 }}
            onClick={() => navigate('/news')}
          >
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fa541c' }}>Алексей Голубев</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>МС по русскому жиму</div>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={navItems.map(item => ({ key: item.key, label: item.label, icon: item.icon }))}
            onClick={({ key }) => navigate(key)}
            style={{ flex: 1, border: 'none' }}
          />
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} placement="bottomRight">
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size={32} icon={<UserOutlined />} style={{ background: '#fa541c' }} />
              {user?.name}
            </Button>
          </Dropdown>
        </Header>
      )}

      {/* Mobile header */}
      {isMobile && (
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fa541c' }}>Алексей Голубев</div>
            <div style={{ fontSize: 10, color: '#8c8c8c' }}>МС по русскому жиму</div>
          </div>
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} placement="bottomRight">
            <Avatar size={36} icon={<UserOutlined />} style={{ background: '#fa541c', cursor: 'pointer' }} />
          </Dropdown>
        </Header>
      )}

      <Content style={{ padding: isMobile ? '16px 12px' : '24px 48px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.key);
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: isActive ? '#fa541c' : '#8c8c8c',
                  fontSize: 10,
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {!isMobile && (
        <Footer style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 12 }}>
          © 2024 Алексей Голубев — Мастер спорта по русскому жиму
        </Footer>
      )}

      {/* Bottom nav spacer on mobile */}
      {isMobile && <div style={{ height: 68 }} />}
    </Layout>
  );
}
