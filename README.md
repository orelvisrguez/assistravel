# Assistravel - Sistema de Gestión de Casos y Corresponsales

## 📋 Descripción

Assistravel es una aplicación web completa para la gestión de casos de asistencia en viajes y corresponsales. La aplicación incluye un sistema de autenticación robusto con roles, gestión de casos, corresponsales, importación de datos desde Excel, y una interfaz moderna y profesional.

## ✨ Características Principales

### 🔐 Sistema de Autenticación y Roles
- **Autenticación completa** con Supabase Auth (email/contraseña)
- **Sistema de roles de 3 niveles:**
  - **Admin**: Acceso completo (gestión de usuarios, corresponsales, casos)
  - **Editor**: Puede gestionar corresponsales y casos
  - **Visualizador**: Solo puede ver la información
- **Protección de rutas** basada en roles
- **Gestión de usuarios** (solo para Admins)

### 🏢 Gestión de Corresponsales
- **Creación y edición** de corresponsales
- **Información completa**: nombre, contacto, email, teléfono, dirección, país
- **Vista detalle profesional** con estadísticas
- **Casos relacionados** con cada corresponsal
- **Búsqueda y filtrado** avanzado

### 📋 Gestión de Casos
- **Casos completos** con información financiera
- **Cálculo automático** de totales (Fee + Costo USD + Monto Agregado)
- **Informe médico** (Sí/No)
- **Dropdown moderno** para monedas (ARS, BRL, USD, EUR, etc.)
- **Dropdown de países** con opción de agregar nuevos
- **Estados de caso** personalizables
- **Facturación** completa (fechas, números, etc.)
- **Duplicación** de casos

### 📊 Funciones Avanzadas
- **Importación desde Excel** con validación de datos
- **Interfaz responsive** (móvil y desktop)
- **Filtros y búsqueda** en tiempo real
- **Paginación** inteligente
- **Dashboard estadístico**

### 🎨 Diseño Moderno
- **TailwindCSS** para estilos modernos
- **Componentes reutilizables** con diseño consistente
- **Iconos Lucide** integrados
- **Animaciones sutiles** y transiciones

## 🚀 Tecnologías Utilizadas

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS + Radix UI
- **Backend:** Supabase (Auth + Database + Storage + Edge Functions)
- **Routing:** React Router v6
- **Build Tool:** Vite
- **Database:** PostgreSQL (vía Supabase)
- **Deployment:** Vercel/Netlify compatible

## 📁 Estructura del Proyecto

```
assistravel/
├── src/
│   ├── components/           # Componentes React
│   │   ├── AuthPage.tsx      # Página de login/registro
│   │   ├── CasosDashboard.tsx # Dashboard principal de casos
│   │   ├── CorresponsalDetail.tsx # Vista detalle corresponsal
│   │   ├── CorresponsalesDashboard.tsx # Dashboard corresponsales
│   │   ├── UserManagement.tsx # Gestión de usuarios (Admin)
│   │   ├── ProtectedRoute.tsx # Componente de protección
│   │   └── ModernDropdown.tsx # Dropdown moderno reutilizable
│   ├── contexts/
│   │   └── AuthContext.tsx    # Contexto de autenticación
│   ├── hooks/
│   │   └── use-mobile.tsx     # Hook para detectar móvil
│   ├── lib/
│   │   ├── supabase.ts        # Cliente de Supabase
│   │   └── utils.ts           # Utilidades
│   ├── App.tsx                # Componente principal
│   └── main.tsx               # Punto de entrada
├── public/                    # Archivos públicos
├── dist/                      # Archivos compilados
├── supabase/                  # Configuración de base de datos
│   ├── migrations/            # Migraciones de BD
│   └── functions/             # Edge functions
├── docs/                      # Documentación completa
├── package.json               # Dependencias y scripts
├── tailwind.config.js         # Configuración de Tailwind
├── vite.config.ts             # Configuración de Vite
└── vercel.json                # Configuración de deploy
```

## 🏗️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm
- Cuenta de Supabase
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/orelvisrguez/assistravel.git
cd assistravel
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local`:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Configurar Supabase
Sigue las instrucciones en [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) para:
- Crear las tablas necesarias
- Configurar RLS (Row Level Security)
- Crear usuarios de prueba
- Configurar edge functions

### 5. Construir y ejecutar
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

## 📚 Documentación Completa

- **[Configuración de Supabase](docs/SUPABASE_SETUP.md)** - Guía completa de configuración
- **[Guía de Deploy](docs/DEPLOYMENT_GUIDE.md)** - Cómo desplegar en Vercel
- **[Esquema de Base de Datos](docs/DATABASE_SCHEMA.md)** - Estructura completa de BD
- **[Solución de Problemas](docs/TROUBLESHOOTING.md)** - Problemas comunes y soluciones

## 🧪 Usuarios de Prueba

La aplicación incluye usuarios de prueba preconfigurados:

| Email | Contraseña | Rol | Permisos |
|-------|------------|-----|----------|
| `admin@assistravel.com` | `Admin123456!` | Admin | Acceso completo |
| `editor@assistravel.com` | `Admin123456!` | Editor | Gestión de casos/corresponsales |
| `visualizador@assistravel.com` | `Admin123456!` | Visualizador | Solo visualización |

## 🎯 Funcionalidades por Rol

### Admin
- ✅ Gestión completa de usuarios
- ✅ Gestión completa de corresponsales
- ✅ Gestión completa de casos
- ✅ Importación de datos desde Excel
- ✅ Acceso a todas las secciones

### Editor
- ✅ Gestión de corresponsales
- ✅ Gestión de casos
- ✅ Importación de datos desde Excel
- ✅ Acceso a dashboard y reportes

### Visualizador
- ✅ Solo visualización de corresponsales
- ✅ Solo visualización de casos
- ✅ No puede crear, editar o eliminar
- ✅ No tiene acceso a importación

## 🌍 Deploy en Vercel

1. **Conectar repositorio:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Configura las variables de entorno:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

2. **Deploy automático:**
   - Vercel detectará automáticamente que es un proyecto Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. **URL de producción:**
   - Después del deploy, tendrás una URL como: `https://tu-app.vercel.app`

## 📊 Base de Datos

### Tablas Principales

#### `user_profiles`
- Gestión de usuarios y roles
- RLS configurado para seguridad por usuario

#### `corresponsales`
- Información completa de corresponsales
- Cada usuario ve solo sus corresponsales

#### `casos`
- Casos completos con información financiera
- Trigger automático para calcular totales
- Relación con corresponsales

### Migraciones
Todas las migraciones están en `supabase/migrations/` y se aplican automáticamente.

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Previsualizar build local
- `npm run lint` - Verificar código con ESLint

## 🤝 Contribución

1. Fork del repositorio
2. Crear branch para feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit de cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push al branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico, problemas o sugerencias:
- Revisar [documentación](docs/)
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**Assistravel** - Sistema profesional de gestión de casos y corresponsales  
Desarrollado con ❤️ usando React + Supabase