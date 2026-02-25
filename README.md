# Métricas Setters

Dashboard de métricas para equipos de setters. Login con dos roles (admin y cliente), conectado a Supabase, deployable en Vercel.

---

## Setup rápido

### 1. Variables de entorno

Copiá `.env.example` a `.env` y completá con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Encontrás estos valores en: **Supabase Dashboard → Settings → API**

---

### 2. Ejecutar el SQL de setup (una sola vez)

1. Abrí el archivo `supabase/setup.sql`
2. Copiá todo el contenido
3. Pegalo en: **Supabase Dashboard → SQL Editor → New query**
4. Hacé clic en **Run**

Esto crea:
- El trigger que vincula Auth con la tabla `profiles` automáticamente
- Las políticas RLS para que cada usuario solo vea lo que le corresponde

---

### 3. Crear el primer usuario admin

1. Ir a **Supabase Dashboard → Authentication → Users → Add user**
2. Ingresá email y contraseña → clic en **Create user**
3. Copiá el UUID del usuario creado (columna `UID`)
4. Ir a **SQL Editor** y ejecutar:

```sql
UPDATE profiles SET role = 'admin', updated_at = NOW()
WHERE id = 'PEGAR-UUID-AQUÍ';
```

¡Listo! Ya podés loguearte con ese usuario como admin.

---

### 4. Crear cuentas de cliente

Una vez logueado como admin, ir a **Gestión de Usuarios** en el sidebar y usar el botón **"Nuevo usuario"**.

Ingresás:
- Email del cliente
- Contraseña temporal (el cliente puede cambiarla)
- Rol: `Cliente`
- Cliente asignado (de la tabla `clientes`)

> Los usuarios con badge **⚠ Pendiente** son los que no tienen cliente asignado todavía.

---

## Desarrollo local

```bash
npm install
npm run dev
```

## Build para producción

```bash
npm run build
```

## Deploy en Vercel

1. Importar el repo en [vercel.com](https://vercel.com)
2. Agregar las variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. El `vercel.json` ya está configurado para SPA routing

---

## Estructura

```
src/
├── context/AuthContext.jsx      # Auth + perfil + rol
├── hooks/
│   ├── useMetrics.js            # Métricas diarias con date range
│   ├── useNotas.js              # CRUD notas (optimistic)
│   ├── useClientes.js           # Lista de clientes activos
│   └── useProfiles.js           # Gestión de usuarios (admin)
├── pages/
│   ├── LoginPage.jsx
│   ├── ClientDashboardPage.jsx  # Vista cliente
│   ├── AdminDashboardPage.jsx   # Vista admin con selector de cliente
│   └── AdminClientesPage.jsx    # Gestión de usuarios
└── lib/
    ├── supabaseClient.js        # Cliente principal
    └── adminAuthClient.js       # Cliente sin sesión (para crear usuarios)
```

## Tablas Supabase requeridas

| Tabla | Columnas |
|---|---|
| `clientes` | id, nombre, slug, activo, created_at |
| `metricas_diarias` | id, cliente_id, fecha, leads_totales, agendas_enviadas, agendas_confirmadas, created_at |
| `notas` | id, cliente_id, autor_id, titulo, contenido, created_at, updated_at |
| `profiles` | id, email, role, cliente_id, created_at, updated_at |
