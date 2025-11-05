import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import Layout from './components/Layout';
import CorresponsalesDashboard from './components/CorresponsalesDashboard';
import CorresponsalDetail from './components/CorresponsalDetail';
import CasosDashboard from './components/CasosDashboard';
import CasoDetail from './components/CasoDetail';
import ImportPage from './components/ImportPage';
import UserManagement from './components/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/corresponsales" /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/corresponsales" />} />
        
        {/* Corresponsales - Admin y Editor pueden gestionar, Visualizador solo ve */}
        <Route 
          path="corresponsales" 
          element={
            <ProtectedRoute>
              <CorresponsalesDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="corresponsales/:id" 
          element={
            <ProtectedRoute>
              <CorresponsalDetail />
            </ProtectedRoute>
          } 
        />
        
        {/* Casos - Todos pueden ver, Admin y Editor pueden gestionar */}
        <Route 
          path="casos" 
          element={
            <ProtectedRoute>
              <CasosDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="casos/:id" 
          element={
            <ProtectedRoute>
              <CasoDetail />
            </ProtectedRoute>
          } 
        />
        
        {/* Importar Excel - Solo Admin y Editor */}
        <Route 
          path="import" 
          element={
            <ProtectedRoute requiresEdit={true}>
              <ImportPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Gestión de Usuarios - Solo Admin */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}