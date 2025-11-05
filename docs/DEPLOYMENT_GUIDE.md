# Guía de Despliegue en Vercel

Esta guía te llevará paso a paso para desplegar Assistravel en Vercel con configuración óptima para producción.

## Prerrequisitos

- Proyecto configurado localmente (ver [README.md](../README.md))
- Supabase configurado (ver [SUPABASE_SETUP.md](SUPABASE_SETUP.md))
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Vercel](https://vercel.com)

## Método 1: Despliegue Automático desde GitHub (Recomendado)

### Paso 1: Preparar Repositorio

1. **Fork del repositorio**
   ```bash
   # O clonar y crear nuevo repositorio
   git clone https://github.com/orelvisrguez/assistravel.git
   cd assistravel
   ```

2. **Commit inicial (si es nuevo repo)**
   ```bash
   git add .
   git commit -m "Initial commit: Assistravel project"
   git branch -M main
   git remote add origin https://github.com/orelvisrguez/assistravel.git
   git push -u origin main
   ```

### Paso 2: Conectar con Vercel

1. **Acceder a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub

2. **Importar proyecto**
   - Clic en "New Project"
   - Selecciona tu repositorio de Assistravel
   - Clic en "Import"

3. **Configuración automática**
   - Vercel detectará automáticamente:
     - Framework: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

### Paso 3: Configurar Variables de Entorno

1. **En Vercel Dashboard**
   - Ve a tu proyecto > Settings > Environment Variables

2. **Agregar variables requeridas**
   ```
   Variable Name: VITE_SUPABASE_URL
   Value: https://tu-proyecto.supabase.co
   
   Variable Name: VITE_SUPABASE_ANON_KEY
   Value: tu_clave_publica_anonima
   ```

3. **Aplicar a todos los entornos**
   - Production: ✅
   - Preview: ✅
   - Development: ✅

### Paso 4: Desplegar

1. **Primer despliegue**
   - Clic en "Deploy"
   - Vercel construirá y desplegará automáticamente

2. **Verificar despliegue**
   - URL será algo como: `https://assistravel-tu-usuario.vercel.app`

## Método 2: Despliegue con Vercel CLI

### Instalación

```bash
npm install -g vercel
```

### Configuración inicial

```bash
# En tu directorio del proyecto
vercel login
vercel
```

### Configurar variables de entorno

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Desplegar

```bash
# Para preview
vercel

# Para producción
vercel --prod
```

## Configuración Avanzada

### vercel.json Optimizado

El proyecto ya incluye `vercel.json` con configuración optimizada:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Optimizaciones de Build

1. **Scripts optimizados en package.json**
   ```json
   {
     "scripts": {
       "build": "tsc && vite build",
       "build:prod": "NODE_ENV=production tsc && vite build"
     }
   }
   ```

2. **Configuración de TypeScript**
   - El proyecto usa configuración optimizada para producción

## Configurar Dominio Personalizado

### Dominio propio

1. **En Vercel Dashboard**
   - Ve a tu proyecto > Settings > Domains

2. **Agregar dominio**
   - Ingresa tu dominio: `assistravel.tudominio.com`
   - Sigue las instrucciones DNS

3. **Configurar DNS**
   ```
   Tipo: CNAME
   Nombre: assistravel
   Valor: cname.vercel-dns.com
   ```

### Subdirectorio (opcional)

Para servir desde subdirectorio:

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/app/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Automatic Deployments

### Branch-based Deployments

Vercel automáticamente:

- **main branch** → Producción
- **otras branches** → Preview deployments

### Preview Deployments

- Cada PR genera un preview único
- URL: `https://assistravel-git-branch-tu-usuario.vercel.app`

### Deploy Hooks

Para disparar deployments desde otros servicios:

1. **Crear Deploy Hook**
   - Settings > Git > Deploy Hooks
   - Nombre: "Production Deploy"

2. **Usar webhook**
   ```bash
   curl -X POST "https://api.vercel.com/v1/integrations/deploy/tu-hook-id"
   ```

## Monitoreo y Analytics

### Vercel Analytics

1. **Habilitar Analytics**
   - Dashboard > Analytics
   - Sigue las instrucciones de integración

2. **Instalar en proyecto**
   ```bash
   npm install @vercel/analytics
   ```

3. **Configurar en main.tsx**
   ```typescript
   import { inject } from '@vercel/analytics';
   
   inject();
   ```

### Error Monitoring

```typescript
// src/lib/monitoring.ts
export function logError(error: Error, context?: string) {
  if (process.env.NODE_ENV === 'production') {
    // Integración con servicio de monitoring
    console.error(`[${context}]`, error);
  }
}
```

## Performance Optimization

### Build Optimizations

1. **Análisis de bundle**
   ```bash
   npm run build
   npx vite-bundle-analyzer dist
   ```

2. **Code splitting automático**
   - Vite maneja automáticamente code splitting
   - React Router lazy loading implementado

### Cache Configuration

Vercel automáticamente configura:

- **Static assets**: Cache 1 año
- **HTML**: Cache corto con revalidación
- **API routes**: Sin cache por defecto

## CI/CD Pipeline

### GitHub Actions (opcional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Troubleshooting

### Build Failures

1. **Error de TypeScript**
   ```bash
   # Verificar localmente
   npm run type-check
   ```

2. **Error de dependencias**
   ```bash
   # Limpiar y reinstalar
   rm -rf node_modules package-lock.json
   npm install
   ```

### Runtime Errors

1. **Variables de entorno**
   - Verificar que estén configuradas en Vercel
   - Verificar prefijo `VITE_`

2. **Routing issues**
   ```json
   // vercel.json - rewrite para SPA
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### Performance Issues

1. **Bundle size**
   ```bash
   # Analizar tamaño
   npm run build
   npx bundlephobia
   ```

2. **Loading performance**
   - Habilitar Vercel Analytics
   - Usar Chrome DevTools

## Comandos Útiles

```bash
# Información del proyecto
vercel ls

# Logs en tiempo real
vercel logs

# Variables de entorno
vercel env ls

# Eliminar deployment
vercel rm deployment-url

# Inspeccionar deployment
vercel inspect deployment-url
```

## Siguientes Pasos

1. **Configurar monitoreo**
2. **Configurar dominio personalizado**
3. **Habilitar analytics**
4. **Configurar alertas**
5. **Documentar URLs de producción**

## URLs de Referencia

- **Demo**: [https://6b6lmu2di3z0.space.minimax.io](https://6b6lmu2di3z0.space.minimax.io)
- **Documentación Vercel**: [https://vercel.com/docs](https://vercel.com/docs)
- **Vite Deploy Guide**: [https://vitejs.dev/guide/static-deploy.html](https://vitejs.dev/guide/static-deploy.html)

---

**Siguiente**: [Troubleshooting Guide](TROUBLESHOOTING.md)