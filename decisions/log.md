# Log de decisiones — Metricas Setters

## 2026-08-06 — Gestión de credenciales: documentar sin rotar

Las credenciales del proyecto (service_role key de Supabase, password de la DB,
PAT de GitHub, cuentas de Gmail y Supabase, logins de la app) estuvieron expuestas
en texto plano.

**Decisión: no se rotan.** Riesgo asumido explícitamente por Rodrigo. En lugar de
rotar, se ordenó dónde viven:

- `.env.example` — template documentado en español, sin valores. Se commitea. Cada
  variable explica qué es, dónde obtenerla y qué riesgo tiene exponerla.
- `.env.local` — valores reales de las variables que consume la app. En `.gitignore`.
- `CREDENCIALES.local.md` — lo que no es variable de entorno (cuentas, usuarios de la
  app, token de GitHub, datos de n8n). En `.gitignore` vía el patrón `*.local.md`.

## 2026-08-06 — `.mcp.json` destrackeado del repo

`CLAUDE.md` afirmaba que `.mcp.json` estaba en `.gitignore`. **Era falso:** el archivo
estaba trackeado y se commiteó con la API key real de n8n en `c18f221`.

Se agregó a `.gitignore` y se sacó del índice con `git rm --cached` (el archivo local
queda intacto, el MCP server sigue funcionando).

**Limitación conocida:** esto no borra la key del historial. Sigue siendo recuperable
por cualquiera con acceso al repo. Limpiarla requiere reescribir historial con
`git filter-repo`, que quedó como pendiente y no se ejecutó.

## 2026-08-06 — Deuda identificada: `service_role` en el bundle público

`VITE_SUPABASE_SERVICE_ROLE_KEY` se consume desde `src/lib/adminServiceClient.js`,
que es código de cliente. Al llevar el prefijo `VITE_`, Vite la escribe literal dentro
del bundle que se sirve en https://metricas-setters.vercel.app/ — es legible por
cualquier visitante y saltea RLS por completo.

La usa solo para `deleteUser` y `updateUserById` del panel admin.

**No se corrigió en esta sesión.** Queda registrado en `pendientes.md`. El arreglo es
mover esas dos operaciones a una función de servidor (Vercel Serverless en `/api` o
Supabase Edge Function) que valide que quien llama es admin, y renombrar la variable
a `SUPABASE_SERVICE_ROLE_KEY` sin el prefijo `VITE_`.
