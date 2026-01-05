import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Forms from '@/pages/Forms';
import AddForm from '@/pages/AddForm';
import { ROUTES } from '@/utils/routes';
import './App.css';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.FORMS}
          element={
            <ProtectedLayout>
              <Forms />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.ADD_FORM}
          element={
            <ProtectedLayout>
              <AddForm />
            </ProtectedLayout>
          }
        />
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
