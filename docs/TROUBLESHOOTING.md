# Guía de Solución de Problemas - Assistravel

Esta guía cubre los problemas más comunes y sus soluciones.

## Problemas de Configuración Local

### Error: "Faltan las variables de entorno de Supabase"

**Síntomas:**
```
Error: Faltan las variables de entorno de Supabase
```

**Solución:**
1. Verificar que existe `.env.local`:
   ```bash
   ls -la .env.local
   ```

2. Verificar contenido del archivo:
   ```bash
   cat .env.local
   ```

3. Asegurar formato correcto:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_publica_anonima
   ```

4. Reiniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Error: "Cannot resolve dependency"

**Síntomas:**
```
npm ERR! Could not resolve dependency
```

**Solución:**
1. Limpiar caché:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   ```

2. Reinstalar dependencias:
   ```bash
   npm install
   ```

3. Si persiste, verificar versión Node.js:
   ```bash
   node --version  # Debe ser >= 18.0.0
   npm --version   # Debe ser >= 8.0.0
   ```

### Error: Puerto ocupado

**Síntomas:**
```
Error: listen EADDRINUSE :::5173
```

**Solución:**
1. Cambiar puerto:
   ```bash
   npm run dev -- --port 3000
   ```

2. O matar proceso:
   ```bash
   lsof -ti:5173 | xargs kill -9
   ```

## Problemas de Supabase

### Error: "Invalid JWT"

**Síntomas:**
- No puede hacer login
- Error 401 en requests

**Solución:**
1. Verificar variables de entorno:
   ```bash
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

2. Verificar en Supabase Dashboard:
   - Settings > API > Project URL
   - Settings > API > Project API keys > anon public

3. Asegurar prefijo `VITE_`:
   ```env
   VITE_SUPABASE_URL=...  # ✅ Correcto
   SUPABASE_URL=...       # ❌ Incorrecto
   ```

### Error: "Row Level Security"

**Síntomas:**
```
Error: new row violates row-level security policy
```

**Solución:**
1. Verificar que el usuario está autenticado:
   ```javascript
   const { user } = useAuth();
   console.log('User:', user);
   ```

2. Verificar políticas RLS en Supabase:
   ```sql
   -- Ver políticas activas
   SELECT * FROM pg_policies WHERE tablename = 'corresponsales';
   ```

3. Si necesario, recrear políticas:
   ```sql
   DROP POLICY IF EXISTS "Allow authenticated users" ON corresponsales;
   CREATE POLICY "Allow authenticated users" ON corresponsales 
   FOR ALL TO authenticated USING (true);
   ```

### Error: "Connection failed"

**Síntomas:**
- No se conecta a Supabase
- Timeout en requests

**Solución:**
1. Verificar status de Supabase:
   - Ve a [status.supabase.com](https://status.supabase.com)

2. Verificar URL del proyecto:
   ```bash
   curl https://tu-proyecto.supabase.co/rest/v1/
   ```

3. Verificar configuración de red/firewall

## Problemas de Autenticación

### Usuario no puede hacer login

**Diagnóstico:**
1. Verificar en Supabase Dashboard > Authentication > Users
2. Verificar que el email existe
3. Verificar que está confirmado (email_confirmed_at)

**Solución:**
1. Si usuario no existe, crear:
   ```sql
   -- En Supabase SQL Editor
   INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
   VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'usuario@email.com',
     crypt('contraseña', gen_salt('bf')),
     NOW(),
     NOW(),
     NOW()
   );
   ```

2. Si usuario existe pero no puede entrar:
   ```sql
   -- Resetear contraseña
   UPDATE auth.users 
   SET encrypted_password = crypt('nuevacontraseña', gen_salt('bf'))
   WHERE email = 'usuario@email.com';
   ```

### Perfil de usuario no se crea automáticamente

**Síntomas:**
- Usuario puede hacer login pero no tiene rol
- Error al acceder a rutas protegidas

**Solución:**
1. Verificar trigger:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'trigger_create_user_profile';
   ```

2. Crear perfil manualmente:
   ```sql
   INSERT INTO user_profiles (id, email, role)
   SELECT id, email, 'Visualizador'
   FROM auth.users 
   WHERE email = 'usuario@email.com';
   ```

3. Recrear trigger si no existe:
   ```sql
   CREATE OR REPLACE FUNCTION create_user_profile()
   RETURNS TRIGGER AS $$
   BEGIN
       INSERT INTO public.user_profiles (id, email, role)
       VALUES (NEW.id, NEW.email, 'Visualizador');
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER trigger_create_user_profile
       AFTER INSERT ON auth.users
       FOR EACH ROW
       EXECUTE FUNCTION create_user_profile();
   ```

## Problemas de Datos

### Cálculo de total no funciona

**Síntomas:**
- Campo `total` en casos queda en NULL
- No se actualiza automáticamente

**Solución:**
1. Verificar trigger:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'trigger_calculate_total';
   ```

2. Recrear trigger:
   ```sql
   CREATE OR REPLACE FUNCTION calculate_total()
   RETURNS TRIGGER AS $$
   BEGIN
       NEW.total := COALESCE(NEW.fee, 0) + COALESCE(NEW.costousd, 0) + COALESCE(NEW.montoagregado, 0);
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trigger_calculate_total
       BEFORE INSERT OR UPDATE ON casos
       FOR EACH ROW
       EXECUTE FUNCTION calculate_total();
   ```

3. Actualizar casos existentes:
   ```sql
   UPDATE casos 
   SET total = COALESCE(fee, 0) + COALESCE(costousd, 0) + COALESCE(montoagregado, 0)
   WHERE total IS NULL;
   ```

### Error: "duplicate key value violates unique constraint"

**Síntomas:**
```
duplicate key value violates unique constraint "corresponsales_nombre_key"
```

**Solución:**
1. Verificar nombres duplicados:
   ```sql
   SELECT nombre, COUNT(*) 
   FROM corresponsales 
   GROUP BY nombre 
   HAVING COUNT(*) > 1;
   ```

2. Limpiar duplicados (conservar el más reciente):
   ```sql
   DELETE FROM corresponsales 
   WHERE id NOT IN (
     SELECT MAX(id) 
     FROM corresponsales 
     GROUP BY nombre
   );
   ```

## Problemas de Edge Functions

### Edge Function retorna error 500

**Diagnóstico:**
1. Ver logs en Supabase Dashboard > Edge Functions
2. Verificar variables de entorno

**Solución:**
1. Verificar que la función existe:
   ```bash
   curl -X POST 'https://tu-proyecto.supabase.co/functions/v1/user-management' \
     -H 'Authorization: Bearer TOKEN' \
     -H 'Content-Type: application/json' \
     -d '{"action": "test"}'
   ```

2. Verificar variables de entorno en Supabase:
   - Settings > Edge Functions > Environment Variables

3. Redeployar función si es necesario

### Error: "User management function not found"

**Solución:**
1. Crear la función en Supabase Dashboard
2. Copiar código desde `supabase/functions/user-management/index.ts`
3. Configurar variables de entorno

## Problemas de Despliegue

### Build falla en Vercel

**Síntomas:**
```
Error: Build failed with exit code 1
```

**Solución:**
1. Verificar variables de entorno en Vercel
2. Verificar logs de build en Vercel Dashboard
3. Probar build local:
   ```bash
   npm run build
   ```

4. Verificar configuración TypeScript:
   ```bash
   npm run type-check
   ```

### Aplicación no carga después del despliegue

**Síntomas:**
- Página en blanco
- Error 404 en rutas

**Solución:**
1. Verificar `vercel.json`:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

2. Verificar variables de entorno en producción
3. Verificar logs del browser (F12 > Console)

## Problemas de Performance

### Aplicación carga lenta

**Diagnóstico:**
1. Usar Chrome DevTools > Network
2. Verificar tamaño de bundle
3. Verificar queries de base de datos

**Solución:**
1. Optimizar imágenes
2. Implementar lazy loading
3. Agregar índices a base de datos:
   ```sql
   CREATE INDEX CONCURRENTLY idx_casos_corresponsalid ON casos(corresponsalid);
   ```

### Queries lentas

**Diagnóstico:**
```sql
EXPLAIN ANALYZE SELECT * FROM casos WHERE corresponsalid = 'uuid';
```

**Solución:**
1. Agregar índices necesarios
2. Optimizar queries JOIN
3. Usar paginación en frontend

## Problemas de UI/UX

### Componentes no se renderizan

**Diagnóstico:**
1. Verificar errores en console (F12)
2. Verificar imports de componentes
3. Verificar props requeridos

**Solución:**
1. Verificar estructura de componentes
2. Verificar estilos CSS/Tailwind
3. Verificar dependencias de Radix UI

### Estilos no se aplican

**Síntomas:**
- Componentes sin estilos
- Layout roto

**Solución:**
1. Verificar configuración Tailwind:
   ```javascript
   // tailwind.config.js
   content: [
     "./index.html",
     "./src/**/*.{js,ts,jsx,tsx}",
   ]
   ```

2. Verificar imports CSS:
   ```javascript
   // main.tsx
   import './index.css'
   ```

## Comandos de Diagnóstico

### Verificar estado de la aplicación

```bash
# Verificar variables de entorno
npm run dev 2>&1 | grep -i "supabase\|error"

# Verificar conexión a Supabase
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_URL/rest/v1/"

# Verificar build local
npm run build && npm run preview

# Verificar tipos TypeScript
npm run type-check
```

### Logs útiles

```bash
# Logs de Vercel
vercel logs

# Logs de desarrollo
npm run dev | tee debug.log

# Análisis de bundle
npm run build
npx vite-bundle-analyzer dist
```

## Contacto y Soporte

Si no puedes resolver el problema:

1. **Documentación**: Revisa todos los docs en `docs/`
2. **Demo**: Compara con [demo funcional](https://6b6lmu2di3z0.space.minimax.io)
3. **Issues**: Abre un issue en GitHub con:
   - Descripción del problema
   - Steps to reproduce
   - Screenshots si aplica
   - Logs relevantes

## Recursos Adicionales

- [Documentación Supabase](https://supabase.com/docs)
- [Documentación Vercel](https://vercel.com/docs)
- [Documentación Vite](https://vitejs.dev/)
- [Documentación React Router](https://reactrouter.com/)
- [Status de Supabase](https://status.supabase.com/)

---

**Volver a**: [README Principal](../README.md)