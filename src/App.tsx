import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Forms from '@/pages/Forms';
import AddForm from '@/pages/AddForm';
import FormDetail from '@/pages/FormDetail';
import Agents from '@/pages/Agents';
import Retailers from '@/pages/Retailers';
import RetailerDetail from '@/pages/RetailerDetail';
import Farmers from '@/pages/Farmers';
import FarmerDetail from '@/pages/FarmerDetail';
import Requests from '@/pages/Requests';
import RequestDetail from '@/pages/RequestDetail';
import Loans from '@/pages/Loans';
import LoanDetail from '@/pages/LoanDetail';
import CreditScoreCalculators from '@/pages/CreditScoreCalculators';
import AddAgent from '@/pages/AddAgent';
import Responses from '@/pages/Responses';
import ResponseDetail from '@/pages/ResponseDetail';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ChangePassword from '@/pages/ChangePassword';
import Maps from '@/pages/Maps';
import Admins from "@/pages/Admins";
import AddAdmin from "@/pages/AddAdmin";
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Protected Routes */}
        <Route
          path={ROUTES.CHANGE_PASSWORD}
          element={
            <ProtectedLayout>
              <ChangePassword />
            </ProtectedLayout>
          }
        />
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
        <Route
          path={ROUTES.FORM_DETAIL}
          element={
            <ProtectedLayout>
              <FormDetail />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.AGENTS}
          element={
            <ProtectedLayout>
              <Agents />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.RETAILERS}
          element={
            <ProtectedLayout>
              <Retailers />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.RETAILER_DETAIL}
          element={
            <ProtectedLayout>
              <RetailerDetail />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.FARMERS}
          element={
            <ProtectedLayout>
              <Farmers />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.FARMER_DETAIL}
          element={
            <ProtectedLayout>
              <FarmerDetail />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.REQUESTS}
          element={
            <ProtectedLayout>
              <Requests />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.REQUEST_DETAIL}
          element={
            <ProtectedLayout>
              <RequestDetail />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.LOANS}
          element={
            <ProtectedLayout>
              <Loans />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.LOAN_DETAIL}
          element={
            <ProtectedLayout>
              <LoanDetail />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.CREDIT_SCORE_CALCULATORS}
          element={
            <ProtectedLayout>
              <CreditScoreCalculators />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.ADD_AGENT}
          element={
            <ProtectedLayout>
              <AddAgent />
            </ProtectedLayout>
          }
        />
        <Route
          path="/agent/edit/:id"
          element={
            <ProtectedLayout>
              <AddAgent />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.ADMINS}
          element={
            <ProtectedLayout>
              <Admins />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.ADD_ADMIN}
          element={
            <ProtectedLayout>
              <AddAdmin />
            </ProtectedLayout>
          }
        />
        <Route
          path="/admin/edit/:id"
          element={
            <ProtectedLayout>
              <AddAdmin />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.RESPONSES}
          element={
            <ProtectedLayout>
              <Responses />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.RESPONSE_DETAIL}
          element={
            <ProtectedLayout>
              <ResponseDetail />
            </ProtectedLayout>
          }
        />
        <Route
          path={ROUTES.MAPS}
          element={
            <ProtectedLayout>
              <Maps />
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
