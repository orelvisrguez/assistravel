# Guía de Configuración de Supabase

Esta guía te llevará paso a paso para configurar Supabase para el proyecto Assistravel.

## Crear Proyecto en Supabase

1. **Crear cuenta**
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta gratuita

2. **Crear nuevo proyecto**
   - Haz clic en "New Project"
   - Elige una organización
   - Nombre del proyecto: `assistravel`
   - Región recomendada: `East US (N. Virginia)`
   - Contraseña de base de datos: **guarda esta contraseña segura**

3. **Esperar inicialización**
   - El proyecto tardará 2-3 minutos en configurarse

## Configurar Variables de Entorno

1. **Obtener credenciales**
   - Ve a Settings > API
   - Copia `Project URL` y `anon public` key

2. **Configurar en local**
   ```bash
   # En tu archivo .env.local
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_publica_anonima
   ```

3. **Configurar en Vercel**
   - Ve a tu proyecto en Vercel
   - Settings > Environment Variables
   - Agrega las mismas variables

## Configurar Base de Datos

### Opción 1: Usando Supabase CLI (Recomendado)

1. **Instalar Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Inicializar proyecto**
   ```bash
   supabase init
   ```

3. **Conectar con tu proyecto**
   ```bash
   supabase link --project-ref tu-project-ref
   ```

4. **Aplicar migraciones**
   ```bash
   supabase db push
   ```

### Opción 2: Ejecución Manual de SQL

Si prefieres no usar CLI, ejecuta manualmente los siguientes scripts SQL en el editor SQL de Supabase:

#### 1. Crear tabla corresponsales
```sql
-- Crear tabla corresponsales
CREATE TABLE public.corresponsales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT UNIQUE NOT NULL,
    contactoprincipal TEXT,
    emailcontacto TEXT,
    telefonocontacto TEXT,
    direccion TEXT,
    pais TEXT,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE corresponsales ENABLE ROW LEVEL SECURITY;
```

#### 2. Crear tabla casos
```sql
-- Crear tabla casos
CREATE TABLE public.casos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    corresponsalid UUID REFERENCES corresponsales(id) ON DELETE RESTRICT,
    nrocasoassistravel TEXT UNIQUE NOT NULL,
    nrocasocorresponsal TEXT,
    fechadeinicio DATE,
    pais TEXT,
    informemedico TEXT,
    fee DECIMAL(10,2),
    costousd DECIMAL(10,2),
    costomonedalocal DECIMAL(10,2),
    simbolomoneda TEXT,
    montoagregado DECIMAL(10,2),
    total DECIMAL(10,2),
    tienefactura BOOLEAN DEFAULT FALSE,
    nrofactura TEXT,
    fechaemisionfactura DATE,
    fechavencimientofactura DATE,
    fechapagofactura DATE,
    estadointerno TEXT DEFAULT 'Pendiente',
    estadodelcaso TEXT,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE casos ENABLE ROW LEVEL SECURITY;
```

#### 3. Crear tabla user_profiles
```sql
-- Crear tabla user_profiles
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Editor', 'Visualizador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

#### 4. Crear trigger para cálculo de total
```sql
-- Función para calcular total automáticamente
CREATE OR REPLACE FUNCTION calculate_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total := COALESCE(NEW.fee, 0) + COALESCE(NEW.costousd, 0) + COALESCE(NEW.montoagregado, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para casos
CREATE TRIGGER trigger_calculate_total
    BEFORE INSERT OR UPDATE ON casos
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total();
```

#### 5. Crear trigger para user_profiles
```sql
-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'Visualizador');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para nuevos usuarios
CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();
```

#### 6. Configurar políticas RLS
```sql
-- Políticas para corresponsales
CREATE POLICY "Allow authenticated users" ON corresponsales FOR ALL TO authenticated USING (true);

-- Políticas para casos
CREATE POLICY "Allow authenticated users" ON casos FOR ALL TO authenticated USING (true);

-- Políticas para user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
```

## Configurar Edge Functions

### 1. Crear función user-management

1. **En Supabase Dashboard**
   - Ve a Edge Functions
   - Crea nueva función: `user-management`

2. **Código de la función**
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

   serve(async (req) => {
     const corsHeaders = {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
       'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
       'Access-Control-Max-Age': '86400',
       'Access-Control-Allow-Credentials': 'false'
     }

     if (req.method === 'OPTIONS') {
       return new Response(null, { status: 200, headers: corsHeaders })
     }

     try {
       const requestData = await req.json()
       const { action, email, password, role, targetUserId } = requestData
       
       const supabaseUrl = Deno.env.get('SUPABASE_URL')!
       const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
       
       const adminHeaders = {
         'Authorization': `Bearer ${serviceRoleKey}`,
         'Content-Type': 'application/json',
         'apikey': serviceRoleKey
       }

       switch (action) {
         case 'invite_user':
           // Lógica para invitar usuario
           break
         case 'update_user_role':
           // Lógica para actualizar rol
           break
         case 'delete_user':
           // Lógica para eliminar usuario
           break
         default:
           throw new Error('Acción no válida')
       }

       return new Response(JSON.stringify({ success: true }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
       })
     } catch (error) {
       return new Response(JSON.stringify({
         error: { code: 'USER_MANAGEMENT_ERROR', message: error.message }
       }), {
         status: 500,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
       })
     }
   })
   ```

## Crear Usuario Administrador

1. **Registro manual**
   - Ve a Authentication > Users
   - Crea usuario con email: `admin@assistravel.com`
   - Contraseña: `Admin123456!`

2. **Asignar rol Admin**
   ```sql
   UPDATE user_profiles 
   SET role = 'Admin' 
   WHERE email = 'admin@assistravel.com';
   ```

## Configurar Storage (Opcional)

Si planeas agregar funcionalidad de archivos:

1. **Crear bucket**
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('uploads', 'uploads', true);
   ```

2. **Políticas de storage**
   ```sql
   CREATE POLICY "Allow authenticated uploads" 
   ON storage.objects FOR INSERT TO authenticated 
   WITH CHECK (bucket_id = 'uploads');
   ```

## Verificar Configuración

1. **Probar conexión**
   ```bash
   npm run dev
   ```

2. **Verificar autenticación**
   - Intenta hacer login con admin@assistravel.com

3. **Verificar datos**
   - Crea un corresponsal de prueba
   - Crea un caso de prueba

## Troubleshooting

### Error: Invalid JWT
- Verifica que las variables de entorno estén correctas
- Asegúrate de usar VITE_ prefix en frontend

### Error: Row Level Security
- Verifica que las políticas RLS estén configuradas
- Asegúrate de que el usuario esté autenticado

### Error: Edge Function
- Verifica que las variables de entorno estén configuradas en Supabase
- Revisa los logs de la función en el dashboard

## Recursos Adicionales

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Guía de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)

---

**Siguiente paso**: [Guía de Despliegue](DEPLOYMENT_GUIDE.md)