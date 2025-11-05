import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, FileText, LogOut, Upload, Users, Shield } from 'lucide-react';

export default function Layout() {
  const { signOut, user, userProfile, isAdmin, canEdit } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Editor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Visualizador': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Assistravel</h1>
              </div>
              
              <div className="hidden md:flex space-x-1">
                <NavLink
                  to="/corresponsales"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <Building2 className="w-5 h-5" />
                  <span>Corresponsales</span>
                </NavLink>
                
                <NavLink
                  to="/casos"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <FileText className="w-5 h-5" />
                  <span>Casos</span>
                </NavLink>
                
                {canEdit && (
                  <NavLink
                    to="/import"
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Upload className="w-5 h-5" />
                    <span>Importar</span>
                  </NavLink>
                )}

                {isAdmin && (
                  <NavLink
                    to="/users"
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Users className="w-5 h-5" />
                    <span>Usuarios</span>
                  </NavLink>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {userProfile && (
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(userProfile.role)}`}>
                    {userProfile.role}
                  </span>
                )}
                <span className="text-sm text-gray-600">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <NavLink
              to="/corresponsales"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-lg transition text-sm ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Building2 className="w-4 h-4" />
              <span>Corresponsales</span>
            </NavLink>
            
            <NavLink
              to="/casos"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-lg transition text-sm ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <FileText className="w-4 h-4" />
              <span>Casos</span>
            </NavLink>
            
            {canEdit && (
              <NavLink
                to="/import"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg transition text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Upload className="w-4 h-4" />
                <span>Importar</span>
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg transition text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Users className="w-4 h-4" />
                <span>Usuarios</span>
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}