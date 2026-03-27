import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useClientes } from '../hooks/useClientes'
import { useReportesQuincenales } from '../hooks/useReportesQuincenales'
import { AppShell } from '../components/layout/AppShell'
import { ClientSelector } from '../components/admin/ClientSelector'
import { MetricCardGrid } from '../components/metrics/MetricCardGrid'
import { MetricsAreaChart } from '../components/metrics/MetricsAreaChart'
import { MetricsTable } from '../components/metrics/MetricsTable'
import ReporteSeccion from '../components/reporte/ReporteSeccion'
import ReportePatrones from '../components/reporte/ReportePatrones'
import ReporteLlamadas from '../components/reporte/ReporteLlamadas'
import { Spinner } from '../components/ui/Spinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDisplayDate } from '../lib/dateUtils'

function IconReport() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function PeriodSelector({ reportes, selectedPeriodo, onChange }) {
  if (reportes.length === 0) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <label
        htmlFor="periodo-select"
        style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        Período:
      </label>
      <select
        id="periodo-select"
        value={selectedPeriodo || reportes[0]?.periodo_inicio || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: 'var(--space-2) var(--space-3)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--font-size-sm)',
          cursor: 'pointer',
        }}
      >
        {reportes.map((r) => (
          <option key={r.id} value={r.periodo_inicio}>
            {formatDisplayDate(r.periodo_inicio)} — {formatDisplayDate(r.periodo_fin)}
          </option>
        ))}
      </select>
    </div>
  )
}

function ReporteContent({ reporte }) {
  const mc = reporte.metricas_calculadas || {}
  const totals = {
    leads: mc.leads_totales ?? 0,
    enviadas: mc.agendas_enviadas ?? 0,
    confirmadas: mc.agendas_confirmadas ?? 0,
  }
  const analisisDiario = reporte.analisis_diario || []
  const diaPico = mc.dia_pico

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* 1. Resumen Ejecutivo */}
      {reporte.resumen_ejecutivo && (
        <ReporteSeccion numero="1" titulo="Resumen Ejecutivo">
          <p style={{
            margin: 0,
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1.7,
          }}>
            {reporte.resumen_ejecutivo}
          </p>
        </ReporteSeccion>
      )}

      {/* 2. Métricas Generales */}
      <ReporteSeccion numero="2" titulo="Métricas Generales">
        <MetricCardGrid totals={totals} prevTotals={null} />
        {(mc.tasa_conversion || mc.tasa_confirmacion) && (
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
            {mc.tasa_conversion && (
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Tasa de conversión a agenda: <strong style={{ color: 'var(--color-text-primary)' }}>{mc.tasa_conversion}%</strong>
              </span>
            )}
            {mc.tasa_confirmacion && (
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Tasa de confirmación: <strong style={{ color: 'var(--color-text-primary)' }}>{mc.tasa_confirmacion}%</strong>
              </span>
            )}
          </div>
        )}
      </ReporteSeccion>

      {/* 3. Análisis Diario */}
      {analisisDiario.length > 0 && (
        <ReporteSeccion numero="3" titulo="Análisis Diario">
          <MetricsAreaChart data={analisisDiario} />
          <div style={{ marginTop: 'var(--space-4)' }}>
            <MetricsTable data={analisisDiario} loading={false} defaultSortAsc={true} />
          </div>
        </ReporteSeccion>
      )}

      {/* 4. Análisis del Embudo */}
      {reporte.analisis_embudo && (
        <ReporteSeccion numero="4" titulo="Análisis del Embudo">
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7 }}>
            {reporte.analisis_embudo}
          </p>
        </ReporteSeccion>
      )}

      {/* 5. Lectura del Comportamiento */}
      {diaPico && (
        <ReporteSeccion numero="5" titulo="Lectura del Comportamiento">
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Día pico:{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              {formatDisplayDate(diaPico.fecha)} — {diaPico.leads} leads
            </strong>
          </p>
        </ReporteSeccion>
      )}

      {/* 6, 7, 9. Patrones, Brechas y Recomendaciones */}
      <ReportePatrones
        patrones={reporte.patrones_detectados || []}
        brechas={reporte.brechas || []}
        recomendaciones={reporte.recomendaciones || []}
      />

      {/* 8. Control Técnico */}
      {reporte.control_tecnico && Object.keys(reporte.control_tecnico).length > 0 && (
        <ReporteSeccion numero="8" titulo="Control Técnico">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {reporte.control_tecnico.tiempo_respuesta && (
              <div>
                <p style={{ margin: '0 0 var(--space-1)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                  Tiempo de respuesta
                </p>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {reporte.control_tecnico.tiempo_respuesta}
                </p>
              </div>
            )}
            {reporte.control_tecnico.mejoras_implementadas && (
              <div>
                <p style={{ margin: '0 0 var(--space-1)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                  Mejoras implementadas
                </p>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {reporte.control_tecnico.mejoras_implementadas}
                </p>
              </div>
            )}
          </div>
        </ReporteSeccion>
      )}

      {/* 10. Análisis de Llamadas GHL */}
      <ReporteLlamadas analisis_llamadas={reporte.analisis_llamadas || {}} />

      {/* 11. Conclusión */}
      {reporte.conclusion && (
        <ReporteSeccion numero="11" titulo="Conclusión">
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7 }}>
            {reporte.conclusion}
          </p>
        </ReporteSeccion>
      )}

      {/* Footer */}
      <p style={{
        margin: 0,
        fontSize: 'var(--font-size-xs, 11px)',
        color: 'var(--color-text-tertiary, #9ca3af)',
        textAlign: 'right',
      }}>
        Generado automáticamente el {formatDisplayDate(reporte.generado_en?.split('T')[0])}
      </p>
    </div>
  )
}

export function ReportePage() {
  const { profile, role } = useAuth()
  const isAdmin = role === 'admin'

  const [searchParams, setSearchParams] = useSearchParams()
  const clienteIdFromUrl = searchParams.get('cliente')

  const { clientes, loading: clientesLoading } = useClientes()

  const [selectedClienteId, setSelectedClienteId] = useState(
    isAdmin ? (clienteIdFromUrl || null) : (profile?.cliente_id || null)
  )
  const [selectedPeriodo, setSelectedPeriodo] = useState(null)

  // For admin: sync client from URL
  useEffect(() => {
    if (isAdmin && clienteIdFromUrl) {
      setSelectedClienteId(clienteIdFromUrl)
    }
  }, [isAdmin, clienteIdFromUrl])

  // For client: use profile's cliente_id once loaded
  useEffect(() => {
    if (!isAdmin && profile?.cliente_id) {
      setSelectedClienteId(profile.cliente_id)
    }
  }, [isAdmin, profile])

  const handleClientChange = (id) => {
    setSelectedClienteId(id)
    setSelectedPeriodo(null)
    if (id) setSearchParams({ cliente: id })
    else setSearchParams({})
  }

  const { reportes, reporte, loading, error } = useReportesQuincenales(
    selectedClienteId,
    selectedPeriodo
  )

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId)

  return (
    <AppShell
      title="Reporte Quincenal"
      subtitle={
        selectedCliente
          ? `${selectedCliente.nombre} · ${reportes.length} período${reportes.length !== 1 ? 's' : ''} disponible${reportes.length !== 1 ? 's' : ''}`
          : isAdmin
          ? 'Seleccioná un cliente'
          : 'Tu reporte quincenal'
      }
    >
      {/* Toolbar */}
      <div className="dashboard-toolbar">
        {isAdmin && (
          <ClientSelector
            clientes={clientes}
            selectedId={selectedClienteId}
            onChange={handleClientChange}
            loading={clientesLoading}
          />
        )}
        {selectedClienteId && reportes.length > 0 && (
          <PeriodSelector
            reportes={reportes}
            selectedPeriodo={selectedPeriodo}
            onChange={setSelectedPeriodo}
          />
        )}
      </div>

      {error && <ErrorMessage message={`Error al cargar el reporte: ${error}`} />}

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner />
        </div>
      )}

      {/* Admin: no client selected */}
      {isAdmin && !selectedClienteId && !loading && (
        <div className="no-client-selected">
          <div className="no-client-selected__icon">👆</div>
          <p className="no-client-selected__title">Seleccioná un cliente</p>
          <p className="no-client-selected__text">
            Usá el selector de arriba para ver el reporte quincenal de un cliente.
          </p>
        </div>
      )}

      {/* No reports yet */}
      {!loading && selectedClienteId && reportes.length === 0 && (
        <EmptyState
          icon={<IconReport />}
          title="Sin reportes aún"
          description="El primer reporte se generará automáticamente al finalizar el período quincenal."
        />
      )}

      {/* Report content */}
      {!loading && reporte && <ReporteContent reporte={reporte} />}
    </AppShell>
  )
}
