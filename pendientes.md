# Pendientes — Metricas Setters

Última actualización: 2026-08-06

## 🔴 Prioridad 1 — bloquea trabajo

- [ ] **Falta la anon key en `.env.local`.** `VITE_SUPABASE_ANON_KEY` quedó vacía; sin
      eso el login no arranca en local. Sacarla de Supabase → Project Settings → API →
      Project API keys → `anon` / `public` (si el dashboard muestra las claves nuevas
      `sb_publishable_...`, buscar la pestaña **Legacy API keys**).
- [ ] **Corregir las métricas.** Rodrigo detectó que los números están mal y va a pasar
      un sheet con los correctos. Comparar contra las fórmulas actuales
      (`PeriodSummary.jsx`) y contra el esquema real de `metricas_diarias` en Supabase.

## 🟡 Deuda técnica identificada

- [ ] **`service_role` viaja al navegador.** `VITE_SUPABASE_SERVICE_ROLE_KEY` se consume
      en `src/lib/adminServiceClient.js`, que es código de cliente. Vite la inlinea en
      el bundle público → cualquiera la extrae y saltea RLS por completo.
      Arreglo: mover `deleteUser` y `updateUserById` a una Vercel Serverless Function
      (`/api`) o Supabase Edge Function que valide que quien llama es admin. La variable
      pasa a `SUPABASE_SERVICE_ROLE_KEY`, sin el prefijo `VITE_`.
- [ ] **La API key de n8n quedó en el historial de git** (commit `c18f221`, en
      `.mcp.json`). El archivo ya se destrackeó y está en `.gitignore`, pero eso no lo
      borra del historial: sigue siendo recuperable. Solo se limpia reescribiendo
      historial (`git filter-repo`).
- [ ] **Todos los usuarios de la app comparten el password `metricas`.** Es un problema
      de diseño de acceso, no de rotación: quien conoce el patrón entra a la cuenta de
      cualquier cliente.
- [ ] **`metricas_diarias` no tiene `CREATE TABLE` en `supabase/setup.sql`** — solo las
      policies de RLS. El esquema real vive únicamente en la base y no es versionable
      ni reproducible desde el repo.

## ⚪ Menor

- [ ] `CLAUDE.md` afirma que `.mcp.json` está en `.gitignore`. Era falso hasta hoy
      (estaba trackeado). Ya está corregido en los hechos, pero conviene revisar si el
      resto del `CLAUDE.md` tiene otras afirmaciones desactualizadas.

## ✅ Cerrado el 2026-08-06

- [x] Documentar las variables de entorno en `.env.example`, en español y con el riesgo
      de cada una.
- [x] Guardar los valores reales en `.env.local` (ignorado por git).
- [x] Guardar las credenciales que no son variables de entorno en
      `CREDENCIALES.local.md` (ignorado por git).
- [x] Agregar `.mcp.json` y `*.local.md` a `.gitignore` y destrackear `.mcp.json`.

> **Decisión:** las credenciales expuestas **no se rotan**. Riesgo asumido por Rodrigo.
> No re-abrir el tema.
