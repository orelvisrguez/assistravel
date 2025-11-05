# Esquema de Base de Datos - Assistravel

Esta documentación describe el esquema completo de la base de datos PostgreSQL utilizada en Assistravel.

## Resumen General

La base de datos utiliza **PostgreSQL** a través de **Supabase** e implementa:

- **Row Level Security (RLS)** para seguridad a nivel de fila
- **Triggers** para cálculos automáticos y perfiles de usuario
- **Foreign Keys** para integridad referencial
- **Roles de usuario** para control de acceso granular

## Tablas del Sistema

### 1. Tabla `corresponsales`

Almacena información de corresponsales médicos internacionales.

```sql
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
```

#### Campos

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único | PRIMARY KEY |
| `user_id` | UUID | Usuario propietario | FK a auth.users |
| `nombre` | TEXT | Nombre del corresponsal | UNIQUE, NOT NULL |
| `contactoprincipal` | TEXT | Persona de contacto principal | Opcional |
| `emailcontacto` | TEXT | Email de contacto | Opcional |
| `telefonocontacto` | TEXT | Teléfono de contacto | Opcional |
| `direccion` | TEXT | Dirección física | Opcional |
| `pais` | TEXT | País del corresponsal | Opcional |
| `observaciones` | TEXT | Notas adicionales | Opcional |
| `created_at` | TIMESTAMP | Fecha de creación | Auto-generado |

#### Índices

```sql
-- Índice automático en PRIMARY KEY
-- Índice automático en UNIQUE (nombre)
-- Índice en user_id para optimizar queries por usuario
CREATE INDEX idx_corresponsales_user_id ON corresponsales(user_id);
```

#### Políticas RLS

```sql
-- Permitir acceso autenticado (simplificado para demo)
CREATE POLICY "Allow authenticated users" ON corresponsales 
FOR ALL TO authenticated USING (true);
```

### 2. Tabla `casos`

Almacena información de casos médicos asociados a corresponsales.

```sql
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
```

#### Campos

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único | PRIMARY KEY |
| `user_id` | UUID | Usuario propietario | FK a auth.users |
| `corresponsalid` | UUID | Corresponsal asociado | FK a corresponsales |
| `nrocasoassistravel` | TEXT | Número de caso interno | UNIQUE, NOT NULL |
| `nrocasocorresponsal` | TEXT | Número de caso del corresponsal | Opcional |
| `fechadeinicio` | DATE | Fecha de inicio del caso | Opcional |
| `pais` | TEXT | País del caso | Opcional |
| `informemedico` | TEXT | Informe médico (Sí/No) | Opcional |
| `fee` | DECIMAL(10,2) | Honorarios | Opcional |
| `costousd` | DECIMAL(10,2) | Costo en USD | Opcional |
| `costomonedalocal` | DECIMAL(10,2) | Costo en moneda local | Opcional |
| `simbolomoneda` | TEXT | Símbolo de moneda local | Opcional |
| `montoagregado` | DECIMAL(10,2) | Monto adicional | Opcional |
| `total` | DECIMAL(10,2) | Total calculado automáticamente | Auto-calculado |
| `tienefactura` | BOOLEAN | Indica si tiene factura | Default: FALSE |
| `nrofactura` | TEXT | Número de factura | Opcional |
| `fechaemisionfactura` | DATE | Fecha emisión factura | Opcional |
| `fechavencimientofactura` | DATE | Fecha vencimiento factura | Opcional |
| `fechapagofactura` | DATE | Fecha pago factura | Opcional |
| `estadointerno` | TEXT | Estado interno del caso | Default: 'Pendiente' |
| `estadodelcaso` | TEXT | Estado del caso | Opcional |
| `observaciones` | TEXT | Observaciones adicionales | Opcional |
| `created_at` | TIMESTAMP | Fecha de creación | Auto-generado |

#### Estados de Caso

Los estados del caso (`estadodelcaso`) incluyen:

- **On going** - Caso en progreso
- **No fee** - Caso sin honorarios
- **Refacturado** - Caso refacturado
- **Para refacturar** - Caso pendiente de refacturación
- **Cobrado** - Caso cobrado

#### Índices

```sql
CREATE INDEX idx_casos_user_id ON casos(user_id);
CREATE INDEX idx_casos_corresponsalid ON casos(corresponsalid);
CREATE INDEX idx_casos_estadodelcaso ON casos(estadodelcaso);
CREATE INDEX idx_casos_fechadeinicio ON casos(fechadeinicio);
```

#### Políticas RLS

```sql
-- Permitir acceso autenticado (simplificado para demo)
CREATE POLICY "Allow authenticated users" ON casos 
FOR ALL TO authenticated USING (true);
```

### 3. Tabla `user_profiles`

Extiende la funcionalidad de autenticación con roles específicos.

```sql
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Editor', 'Visualizador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Campos

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | ID del usuario | PRIMARY KEY, FK a auth.users |
| `email` | TEXT | Email del usuario | UNIQUE, NOT NULL |
| `role` | TEXT | Rol del usuario | CHECK constraint |
| `created_at` | TIMESTAMP | Fecha de creación | Auto-generado |
| `updated_at` | TIMESTAMP | Última actualización | Auto-generado |

#### Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso completo: CRUD en todos los módulos + gestión de usuarios |
| **Editor** | Crear/Editar casos y corresponsales (sin eliminar) |
| **Visualizador** | Solo lectura en todos los módulos |

#### Políticas RLS

```sql
-- Los usuarios pueden ver todos los perfiles
CREATE POLICY "Users can view all profiles" ON user_profiles 
FOR SELECT TO authenticated USING (true);

-- Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON user_profiles 
FOR UPDATE TO authenticated USING (auth.uid() = id);
```

## Triggers y Funciones

### 1. Cálculo Automático de Total

```sql
-- Función para calcular total automáticamente
CREATE OR REPLACE FUNCTION calculate_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total := COALESCE(NEW.fee, 0) + COALESCE(NEW.costousd, 0) + COALESCE(NEW.montoagregado, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que ejecuta el cálculo
CREATE TRIGGER trigger_calculate_total
    BEFORE INSERT OR UPDATE ON casos
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total();
```

### 2. Creación Automática de Perfiles

```sql
-- Función para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'Visualizador');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para usuarios nuevos
CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();
```

### 3. Actualización de timestamp

```sql
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para user_profiles
CREATE TRIGGER trigger_update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

## Relaciones y Integridad

### Diagrama de Relaciones

```
auth.users (Supabase Auth)
    ↓ (1:1)
user_profiles
    ↓ (1:N)
corresponsales
    ↓ (1:N)
casos
```

### Foreign Keys

1. **user_profiles.id** → **auth.users.id**
   - ON DELETE CASCADE (si se elimina usuario, se elimina perfil)

2. **corresponsales.user_id** → **auth.users.id**
   - ON DELETE CASCADE (si se elimina usuario, se eliminan corresponsales)

3. **casos.user_id** → **auth.users.id**
   - ON DELETE CASCADE (si se elimina usuario, se eliminan casos)

4. **casos.corresponsalid** → **corresponsales.id**
   - ON DELETE RESTRICT (no se puede eliminar corresponsal con casos)

## Migraciones

Las migraciones se encuentran en `supabase/migrations/` y deben ejecutarse en orden:

1. `1762296749_create_corresponsales_table.sql`
2. `1762296751_create_casos_table.sql`
3. `1762297756_add_missing_columns_corresponsales.sql`
4. `1762302583_add_total_field_and_trigger.sql`
5. `1762309932_create_user_profiles_table.sql`
6. `1762309959_create_rls_policies_for_roles.sql`
7. `1762309976_create_rls_policies_casos_roles.sql`
8. `1762311037_fix_circular_rls_policies.sql`
9. `1762311051_recreate_user_profiles_policies.sql`
10. `1762311067_simplify_all_rls_policies.sql`

## Queries Comunes

### Estadísticas de Corresponsal

```sql
-- Obtener estadísticas de un corresponsal
SELECT 
    c.id,
    c.nombre,
    COUNT(ca.id) as total_casos,
    SUM(ca.total) as monto_total,
    COUNT(CASE WHEN ca.estadodelcaso = 'Cobrado' THEN 1 END) as casos_cobrados,
    COUNT(CASE WHEN ca.estadodelcaso = 'On going' THEN 1 END) as casos_en_progreso
FROM corresponsales c
LEFT JOIN casos ca ON c.id = ca.corresponsalid
WHERE c.id = $1
GROUP BY c.id, c.nombre;
```

### Casos por Estado

```sql
-- Distribución de casos por estado
SELECT 
    estadodelcaso,
    COUNT(*) as cantidad,
    SUM(total) as monto_total
FROM casos
WHERE corresponsalid = $1
GROUP BY estadodelcaso
ORDER BY cantidad DESC;
```

### Dashboard de Usuario

```sql
-- Resumen para dashboard
SELECT 
    (SELECT COUNT(*) FROM corresponsales WHERE user_id = auth.uid()) as total_corresponsales,
    (SELECT COUNT(*) FROM casos WHERE user_id = auth.uid()) as total_casos,
    (SELECT SUM(total) FROM casos WHERE user_id = auth.uid()) as monto_total,
    (SELECT COUNT(*) FROM casos WHERE user_id = auth.uid() AND estadodelcaso = 'Cobrado') as casos_cobrados;
```

## Backup y Recuperación

### Backup Automático

Supabase realiza backups automáticos:
- **Diario**: Últimos 7 días
- **Semanal**: Últimas 4 semanas  
- **Mensual**: Últimos 3 meses

### Backup Manual

```bash
# Usando Supabase CLI
supabase db dump --file backup.sql

# Usando pg_dump
pg_dump "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres" > backup.sql
```

### Restauración

```bash
# Restaurar desde backup
psql "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres" < backup.sql
```

## Optimización de Performance

### Índices Recomendados

```sql
-- Para queries frecuentes
CREATE INDEX CONCURRENTLY idx_casos_created_at ON casos(created_at DESC);
CREATE INDEX CONCURRENTLY idx_corresponsales_pais ON corresponsales(pais);
CREATE INDEX CONCURRENTLY idx_casos_pais ON casos(pais);
```

### Análisis de Queries

```sql
-- Analizar performance de query
EXPLAIN ANALYZE SELECT * FROM casos WHERE corresponsalid = $1;
```

## Consideraciones de Seguridad

1. **RLS Habilitado**: Todas las tablas tienen RLS activado
2. **Políticas Simplificadas**: Para demo, políticas permisivas con usuarios autenticados
3. **Triggers SECURITY DEFINER**: Para operaciones que requieren permisos elevados
4. **Validaciones**: CHECK constraints en roles de usuario

---

**Próximo**: [Troubleshooting Guide](TROUBLESHOOTING.md)