import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: ('Admin' | 'Editor' | 'Visualizador')[];
  requiresEdit?: boolean; // Requiere permisos de edición (Admin o Editor)
  requiresDelete?: boolean; // Requiere permisos de eliminación (Solo Admin)
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requiresEdit = false,
  requiresDelete = false,
  fallback 
}: ProtectedRouteProps) {
  const { user, userProfile, loading, canEdit, canDelete } = useAuth();

  // Mostrar loading mientras se carga la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado, no mostrar nada (será redirigido por el componente padre)
  if (!user || !userProfile) {
    return null;
  }

  // Verificar permisos específicos
  if (requiresDelete && !canDelete) {
    return fallback || <AccessDenied message="Se requieren permisos de administrador para esta acción." />;
  }

  if (requiresEdit && !canEdit) {
    return fallback || <AccessDenied message="Se requieren permisos de edición para esta acción." />;
  }

  // Verificar roles específicos
  if (requiredRoles.length > 0 && !requiredRoles.includes(userProfile.role)) {
    const rolesText = requiredRoles.join(', ');
    return fallback || <AccessDenied message={`Esta sección requiere uno de los siguientes roles: ${rolesText}`} />;
  }

  // Si todas las verificaciones pasan, mostrar el contenido
  return <>{children}</>;
}

// Componente para mostrar mensaje de acceso denegado
function AccessDenied({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{message}</p>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Si crees que deberías tener acceso a esta sección, contacta a tu administrador.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook personalizado para verificar permisos en componentes
export function usePermissions() {
  const { userProfile, isAdmin, isEditor, isVisualizador, canEdit, canDelete } = useAuth();

  const hasRole = (role: 'Admin' | 'Editor' | 'Visualizador') => {
    return userProfile?.role === role;
  };

  const hasAnyRole = (roles: ('Admin' | 'Editor' | 'Visualizador')[]) => {
    return userProfile ? roles.includes(userProfile.role) : false;
  };

  return {
    userRole: userProfile?.role,
    isAdmin,
    isEditor,
    isVisualizador,
    canEdit,
    canDelete,
    hasRole,
    hasAnyRole
  };
}