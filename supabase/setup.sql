-- ============================================================
-- Métricas Setters — Supabase Setup SQL
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================


-- ── 1. TRIGGER: auto-crear profile al registrarse ──────────
--    Cada vez que se crea un usuario en Auth, se inserta
--    automáticamente una fila en public.profiles con role='cliente'.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, cliente_id, created_at, updated_at)
  VALUES (NEW.id, NEW.email, 'cliente', NULL, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. RLS: Row Level Security ─────────────────────────────

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admin reads all profiles" ON profiles;
CREATE POLICY "Admin reads all profiles"
  ON profiles FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admin updates any profile" ON profiles;
CREATE POLICY "Admin updates any profile"
  ON profiles FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- metricas_diarias
ALTER TABLE metricas_diarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente reads own metrics" ON metricas_diarias;
CREATE POLICY "Cliente reads own metrics"
  ON metricas_diarias FOR SELECT
  USING (
    cliente_id = (SELECT cliente_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admin reads all metrics" ON metricas_diarias;
CREATE POLICY "Admin reads all metrics"
  ON metricas_diarias FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- notas
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente reads own notas" ON notas;
CREATE POLICY "Cliente reads own notas"
  ON notas FOR SELECT
  USING (
    cliente_id = (SELECT cliente_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admin full access notas" ON notas;
CREATE POLICY "Admin full access notas"
  ON notas FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated reads active clientes" ON clientes;
CREATE POLICY "Authenticated reads active clientes"
  ON clientes FOR SELECT
  USING (auth.role() = 'authenticated');


-- ── 3. TABLA: reportes_quincenales ─────────────────────────
--    Guarda los reportes quincenales generados automáticamente
--    por n8n cada 15 días. El INSERT lo hace n8n con service_role_key.

CREATE TABLE IF NOT EXISTS reportes_quincenales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  periodo_inicio DATE NOT NULL,
  periodo_fin DATE NOT NULL,

  -- Secciones generadas por IA
  resumen_ejecutivo TEXT,
  analisis_embudo TEXT,
  patrones_detectados JSONB DEFAULT '[]',
  brechas JSONB DEFAULT '[]',
  recomendaciones JSONB DEFAULT '[]',
  analisis_llamadas JSONB DEFAULT '{}',
  control_tecnico JSONB DEFAULT '{}',
  conclusion TEXT,

  -- Métricas calculadas y datos diarios (cache)
  metricas_calculadas JSONB DEFAULT '{}',
  analisis_diario JSONB DEFAULT '[]',

  generado_en TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(cliente_id, periodo_inicio)
);

ALTER TABLE reportes_quincenales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente reads own reportes" ON reportes_quincenales;
CREATE POLICY "Cliente reads own reportes"
  ON reportes_quincenales FOR SELECT
  USING (
    cliente_id = (SELECT cliente_id FROM profiles WHERE id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- n8n inserta usando service_role_key (bypass RLS), no se necesita política de INSERT.
-- Si se usa anon_key desde n8n, descomentar:
-- DROP POLICY IF EXISTS "Anon insert reportes" ON reportes_quincenales;
-- CREATE POLICY "Anon insert reportes" ON reportes_quincenales FOR INSERT WITH CHECK (true);


-- ── 4. PRIMER ADMIN ────────────────────────────────────────
--    Pasos:
--    a) Ir a Authentication → Users → Add user (email + contraseña)
--    b) Copiar el UUID del usuario creado
--    c) Descomentar y ejecutar la línea de UPDATE con ese UUID:

-- UPDATE profiles SET role = 'admin', updated_at = NOW()
-- WHERE id = 'PEGAR-UUID-AQUÍ';
