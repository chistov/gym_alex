import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from './store/authStore';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewsPage from './pages/NewsPage';
import ShopPage from './pages/ShopPage';
import TrainingsPage from './pages/TrainingsPage';
import TrainingDetailPage from './pages/TrainingDetailPage';
import ProfilePage from './pages/ProfilePage';
import MyTrainingsPage from './pages/MyTrainingsPage';

import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import NewsManagePage from './pages/admin/NewsManagePage';
import ProductsManagePage from './pages/admin/ProductsManagePage';
import TrainingsManagePage from './pages/admin/TrainingsManagePage';

export default function App() {
  const { loadUser, loading, token } = useAuthStore();

  useEffect(() => {
    if (token) loadUser();
  }, [token, loadUser]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/news" element={<NewsPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/trainings" element={<TrainingsPage />} />
            <Route path="/trainings/:id" element={<TrainingDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-trainings" element={<MyTrainingsPage />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="news" element={<NewsManagePage />} />
            <Route path="products" element={<ProductsManagePage />} />
            <Route path="trainings" element={<TrainingsManagePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
