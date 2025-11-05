# Assistravel - Sistema de Gestión de Casos y Corresponsales

Un sistema completo y moderno para la gestión de casos médicos y corresponsales internacionales, desarrollado con React, TypeScript, Supabase y TailwindCSS.

## Descripción

Assistravel es una aplicación web full-stack diseñada para facilitar la gestión eficiente de casos médicos y corresponsales internacionales. Incluye un sistema robusto de autenticación multi-rol, gestión completa de datos, importación de archivos Excel y un diseño moderno y responsive.

## Características Principales

### Sistema de Autenticación Multi-Rol
- **Admin**: Acceso completo a todos los módulos y gestión de usuarios
- **Editor**: Gestión de casos y corresponsales (sin permisos de eliminación)
- **Visualizador**: Acceso de solo lectura a todos los datos

### Módulos Funcionales
- **Gestión de Corresponsales**: CRUD completo con vista detallada profesional
- **Gestión de Casos**: CRUD completo con cálculos automáticos
- **Importación Excel**: Procesamiento automático de archivos .xlsx
- **Gestión de Usuarios**: Administración completa de usuarios y roles (Solo Admin)

### Características Técnicas
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (Base de datos PostgreSQL + Autenticación + Edge Functions)
- **Styling**: TailwindCSS + Radix UI
- **Routing**: React Router v6 con protección de rutas
- **Seguridad**: Row Level Security (RLS) en base de datos

## Demo en Vivo

**URL de Demostración**: [https://6b6lmu2di3z0.space.minimax.io](https://6b6lmu2di3z0.space.minimax.io)

### Credenciales de Prueba

| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|----------|
| **Admin** | admin@assistravel.com | Admin123456! | Acceso completo |
| **Editor** | editor@assistravel.com | Admin123456! | Crear/Editar (sin eliminar) |
| **Visualizador** | visualizador@assistravel.com | Admin123456! | Solo lectura |

## Instalación y Configuración

### Prerrequisitos

- Node.js 18.0.0 o superior
- npm 8.0.0 o superior
- Cuenta en [Supabase](https://supabase.com)
- (Opcional) Cuenta en [Vercel](https://vercel.com) para despliegue

### Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/orelvisrguez/assistravel.git
   cd assistravel
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_publica_anonima
   ```

4. **Configurar Supabase**
   - Sigue la guía en [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

6. **Acceder a la aplicación**
   ```
   http://localhost:5173
   ```

## Despliegue en Vercel

### Despliegue Automático (Recomendado)

1. **Fork este repositorio**

2. **Conectar con Vercel**
   - Ve a [vercel.com](https://vercel.com) e importa tu fork
   - Vercel detectará automáticamente la configuración

3. **Configurar variables de entorno en Vercel**
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_publica_anonima
   ```

4. **Desplegar**
   - Vercel desplegará automáticamente en cada push a main

### Despliegue Manual

```bash
# Construir para producción
npm run build

# Vista previa local del build
npm run preview

# Desplegar con Vercel CLI
npx vercel --prod
```

Para más detalles, consulta [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

## Estructura del Proyecto

```
assistravel/
├── docs/                          # Documentación
│   ├── SUPABASE_SETUP.md         # Configuración de Supabase
│   ├── DEPLOYMENT_GUIDE.md       # Guía de despliegue
│   ├── DATABASE_SCHEMA.md        # Esquema de base de datos
│   └── TROUBLESHOOTING.md        # Solución de problemas
├── src/
│   ├── components/               # Componentes React
│   │   ├── AuthPage.tsx          # Página de autenticación
│   │   ├── Layout.tsx            # Layout principal
│   │   ├── CorresponsalesDashboard.tsx # Dashboard de corresponsales
│   │   ├── CorresponsalDetail.tsx # Vista detallada de corresponsal
│   │   ├── CasosDashboard.tsx    # Dashboard de casos
│   │   ├── CasoDetail.tsx        # Vista detallada de caso
│   │   ├── ImportPage.tsx        # Módulo de importación Excel
│   │   ├── UserManagement.tsx    # Gestión de usuarios
│   │   └── ProtectedRoute.tsx    # Protección de rutas
│   ├── contexts/
│   │   └── AuthContext.tsx       # Contexto de autenticación
│   ├── hooks/
│   │   └── use-mobile.tsx        # Hook para detección móvil
│   └── lib/
│       ├── supabase.ts           # Cliente Supabase
│       └── utils.ts              # Utilidades
├── supabase/
│   ├── functions/                # Edge Functions
│   └── migrations/               # Migraciones de base de datos
├── package.json
├── vercel.json                   # Configuración Vercel
├── .env.example                  # Variables de entorno ejemplo
└── README.md
```

## Tecnologías Utilizadas

### Frontend
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de build rápida
- **TailwindCSS** - Framework CSS utility-first
- **Radix UI** - Componentes accesibles
- **React Router v6** - Routing del lado cliente
- **React Hook Form** - Gestión de formularios
- **Lucide React** - Iconografía

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Row Level Security** - Seguridad a nivel de fila
- **Edge Functions** - Funciones serverless
- **Realtime** - Actualizaciones en tiempo real

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **TypeScript** - Verificación de tipos
- **PostCSS** - Procesamiento CSS
- **Autoprefixer** - Prefijos CSS automáticos

## Funcionalidades Detalladas

### Módulo de Corresponsales
- Vista de listado con búsqueda y paginación
- Vista detallada profesional con información completa
- Resumen estadístico (total de casos, montos, distribución por estado)
- Sección de casos relacionados con filtros y búsqueda
- CRUD completo con validaciones

### Módulo de Casos
- Gestión completa de casos médicos
- Cálculo automático de totales (Fee + Costo USD + Monto Agregado)
- Estados de caso con códigos de color consistentes
- Formularios modernos con validaciones robustas
- Relación con corresponsales

### Sistema de Importación Excel
- Drag & drop de archivos .xlsx
- Procesamiento automático en dos fases
- Validaciones y conversión de datos
- Estadísticas y reporte de errores
- Barra de progreso visual

### Sistema de Usuarios (Solo Admin)
- Creación y gestión de usuarios
- Asignación de roles
- Invitaciones por email
- Cambio de contraseñas
- Eliminación de usuarios

## Seguridad

- **Autenticación**: Supabase Auth con email/contraseña
- **Autorización**: Sistema de roles con permisos granulares
- **Base de Datos**: Row Level Security (RLS) en todas las tablas
- **Frontend**: Protección de rutas basada en roles
- **HTTPS**: Comunicación segura en producción

## Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación en [docs/](docs/)
2. Consulta la guía de solución de problemas: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
3. Abre un issue en GitHub

## Roadmap

- [ ] Módulo de reportes avanzados
- [ ] Integración con APIs de terceros
- [ ] Notificaciones en tiempo real
- [ ] Módulo de facturación
- [ ] API REST pública
- [ ] Aplicación móvil

---

**Desarrollado con ❤️ por MiniMax Agent**

**Demo**: [https://6b6lmu2di3z0.space.minimax.io](https://6b6lmu2di3z0.space.minimax.io)