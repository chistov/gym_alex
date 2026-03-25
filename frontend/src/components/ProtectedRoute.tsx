import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Result, Button } from 'antd';

interface Props {
  adminOnly?: boolean;
}

export default function ProtectedRoute({ adminOnly = false }: Props) {
  const { user, token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  if (adminOnly && user.role !== 'admin') {
    return (
      <Result
        status="403"
        title="403"
        subTitle="У вас нет доступа к этой странице"
        extra={<Button type="primary" href="/news">На главную</Button>}
      />
    );
  }

  return <Outlet />;
}
