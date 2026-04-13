import { useState, useEffect, useRef } from 'react'
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

const PRINT_STYLES = `
@media print {
  .sidebar, .topbar, .no-print { display: none !important; }
  .app-shell__main { padding: 0 !important; }
  body { background: white !important; }
  .card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
  .report-section { break-inside: avoid; page-break-inside: avoid; }
}
`

function IconReport() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
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
            {r.aprobado === false ? ' (borrador)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─── Edit form ────────────────────────────────────────────────────────────────

const textareaStyle = {
  width: '100%',
  padding: 'var(--space-3)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-sm)',
  lineHeight: 1.6,
  resize: 'vertical',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  marginBottom: 'var(--space-1)',
  fontWeight: 'var(--font-weight-semibold)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-primary)',
}

function ReporteEditForm({ reporte, onSave, onCancel, saving }) {
  const [fields, setFields] = useState({
    resumen_ejecutivo: reporte.resumen_ejecutivo || '',
    analisis_embudo: reporte.analisis_embudo || '',
    conclusion: reporte.conclusion || '',
    patrones_detectados: JSON.stringify(reporte.patrones_detectados || [], null, 2),
    ejemplos_conversaciones: JSON.stringify(reporte.ejemplos_conversaciones || [], null, 2),
    brechas: JSON.stringify(reporte.brechas || [], null, 2),
    recomendaciones: JSON.stringify(reporte.recomendaciones || [], null, 2),
    analisis_llamadas: JSON.stringify(reporte.analisis_llamadas || {}, null, 2),
    control_tecnico: JSON.stringify(reporte.control_tecnico || {}, null, 2),
  })
  const [jsonError, setJsonError] = useState(null)

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = () => {
    try {
      const parsed = {
        resumen_ejecutivo: fields.resumen_ejecutivo,
        analisis_embudo: fields.analisis_embudo,
        conclusion: fields.conclusion,
        patrones_detectados: JSON.parse(fields.patrones_detectados),
        ejemplos_conversaciones: JSON.parse(fields.ejemplos_conversaciones),
        brechas: JSON.parse(fields.brechas),
        recomendaciones: JSON.parse(fields.recomendaciones),
        analisis_llamadas: JSON.parse(fields.analisis_llamadas),
        control_tecnico: JSON.parse(fields.control_tecnico),
      }
      setJsonError(null)
      onSave(parsed)
    } catch (e) {
      setJsonError('JSON inválido: ' + e.message)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {jsonError && <ErrorMessage message={jsonError} />}

      <div>
        <label style={labelStyle}>Resumen Ejecutivo</label>
        <textarea rows={5} style={textareaStyle} value={fields.resumen_ejecutivo} onChange={set('resumen_ejecutivo')} />
      </div>

      <div>
        <label style={labelStyle}>Análisis del Embudo</label>
        <textarea rows={4} style={textareaStyle} value={fields.analisis_embudo} onChange={set('analisis_embudo')} />
      </div>

      <div>
        <label style={labelStyle}>Conclusión</label>
        <textarea rows={4} style={textareaStyle} value={fields.conclusion} onChange={set('conclusion')} />
      </div>

      <div>
        <label style={labelStyle}>Patrones detectados (JSON)</label>
        <textarea rows={8} style={{ ...textareaStyle, fontFamily: 'monospace' }} value={fields.patrones_detectados} onChange={set('patrones_detectados')} />
      </div>

      <div>
        <label style={labelStyle}>Ejemplos destacados de conversaciones (JSON)</label>
        <textarea rows={8} style={{ ...textareaStyle, fontFamily: 'monospace' }} value={fields.ejemplos_conversaciones} onChange={set('ejemplos_conversaciones')} />
      </div>

      <div>
        <label style={labelStyle}>Brechas (JSON)</label>
        <textarea rows={6} style={{ ...textareaStyle, fontFamily: 'monospace' }} value={fields.brechas} onChange={set('brechas')} />
      </div>

      <div>
        <label style={labelStyle}>Recomendaciones (JSON)</label>
        <textarea rows={6} style={{ ...textareaStyle, fontFamily: 'monospace' }} value={fields.recomendaciones} onChange={set('recomendaciones')} />
      </div>

      <div>
        <label style={labelStyle}>Análisis de llamadas (JSON)</label>
        <textarea rows={10} style={{ ...textareaStyle, fontFamily: 'monospace' }} value={fields.analisis_llamadas} onChange={set('analisis_llamadas')} />
      </div>

      <div>
        <label style={labelStyle}>Control Técnico (JSON)</label>
        <textarea rows={6} style={{ ...textareaStyle, fontFamily: 'monospace' }} value={fields.control_tecnico} onChange={set('control_tecnico')} />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: 'var(--space-2) var(--space-5)',
            background: 'var(--color-primary-500)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          style={{
            padding: 'var(--space-2) var(--space-5)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ─── Report display ────────────────────────────────────────────────────────────

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
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7 }}>
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

      {/* 6 & 7. Patrones y Brechas */}
      <ReportePatrones
        patrones={reporte.patrones_detectados || []}
        brechas={reporte.brechas || []}
        ejemplos={reporte.ejemplos_conversaciones || []}
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

      {/* 9. Recomendaciones Estratégicas */}
      {(reporte.recomendaciones || []).length > 0 && (
        <ReporteSeccion numero="9" titulo="Recomendaciones Estratégicas">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {reporte.recomendaciones.map((r, i) => (
              <div key={i}>
                {typeof r === 'string' ? (
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{r}</p>
                ) : (
                  <>
                    <p style={{ margin: '0 0 var(--space-1)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                      {r.numero ? `${r.numero}. ` : ''}{r.titulo}
                    </p>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      {r.descripcion}
                    </p>
                  </>
                )}
              </div>
            ))}
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

    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const reportContentRef = useRef(null)

  const handleDownloadPDF = async () => {
    if (!reportContentRef.current || !reporte) return
    setGeneratingPDF(true)
    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      const element = reportContentRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const marginX = 12
      const marginY = 12
      const pdfWidth = pdf.internal.pageSize.getWidth() - marginX * 2
      const pdfHeight = pdf.internal.pageSize.getHeight() - marginY * 2

      // pixels that fit in one PDF page
      const pixelsPerMm = canvas.width / pdfWidth
      const pageHeightPx = Math.floor(pdfHeight * pixelsPerMm)

      let yPx = 0
      while (yPx < canvas.height) {
        if (yPx > 0) pdf.addPage()

        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - yPx)

        // Crop canvas to this page's slice
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = sliceHeightPx
        pageCanvas.getContext('2d').drawImage(canvas, 0, -yPx)

        const sliceHeightMm = sliceHeightPx / pixelsPerMm
        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', marginX, marginY, pdfWidth, sliceHeightMm)

        yPx += sliceHeightPx
      }

      const clienteNombre = (selectedCliente?.nombre || 'reporte').replace(/\s+/g, '_')
      pdf.save(`Reporte_${clienteNombre}_${reporte.periodo_inicio}_${reporte.periodo_fin}.pdf`)
    } catch (err) {
      console.error('Error generando PDF:', err)
    } finally {
      setGeneratingPDF(false)
    }
  }

  // For admin: sync client from URL
  useEffect(() => {
    if (isAdmin && clienteIdFromUrl) setSelectedClienteId(clienteIdFromUrl)
  }, [isAdmin, clienteIdFromUrl])

  // For client: use profile's cliente_id once loaded
  useEffect(() => {
    if (!isAdmin && profile?.cliente_id) setSelectedClienteId(profile.cliente_id)
  }, [isAdmin, profile])

  const handleClientChange = (id) => {
    setSelectedClienteId(id)
    setSelectedPeriodo(null)
    setEditing(false)
    if (id) setSearchParams({ cliente: id })
    else setSearchParams({})
  }

  const { reportes, reporte, loading, error, aprobarReporte, updateReporte } =
    useReportesQuincenales(selectedClienteId, selectedPeriodo, role)

  // Exit edit mode when report changes
  useEffect(() => {
    setEditing(false)
  }, [reporte?.id])

  const handleSaveEdit = async (fields) => {
    setSaving(true)
    const { error: err } = await updateReporte(reporte.id, fields)
    setSaving(false)
    if (!err) setEditing(false)
  }

  const handleAprobar = async () => {
    setApproving(true)
    await aprobarReporte(reporte.id)
    setApproving(false)
  }

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId)
  const isDraft = reporte && reporte.aprobado === false

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
      <style>{PRINT_STYLES}</style>

      {/* Toolbar */}
      <div className="dashboard-toolbar no-print">
        {isAdmin && (
          <ClientSelector
            clientes={clientes}
            selectedId={selectedClienteId}
            onChange={handleClientChange}
            loading={clientesLoading}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {selectedClienteId && reportes.length > 0 && (
            <PeriodSelector
              reportes={reportes}
              selectedPeriodo={selectedPeriodo}
              onChange={(p) => { setSelectedPeriodo(p); setEditing(false) }}
            />
          )}
          {reporte && !editing && (
            <button
              onClick={handleDownloadPDF}
              disabled={generatingPDF}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                cursor: generatingPDF ? 'not-allowed' : 'pointer',
                opacity: generatingPDF ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {generatingPDF ? 'Generando PDF…' : '↓ Descargar PDF'}
            </button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={`Error al cargar el reporte: ${error}`} />}

      {/* Loading */}
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

      {/* No reports */}
      {!loading && selectedClienteId && reportes.length === 0 && (
        <EmptyState
          icon={<IconReport />}
          title={isAdmin ? 'Sin reportes aún' : 'El reporte estará disponible pronto'}
          description={
            isAdmin
              ? 'El primer reporte se generará automáticamente al finalizar el período quincenal.'
              : 'Tu reporte quincenal será publicado por el equipo al finalizar el período.'
          }
        />
      )}

      {/* Admin draft banner + actions */}
      {!loading && reporte && isAdmin && isDraft && !editing && (
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            background: '#fef9c3',
            border: '1px solid #fde047',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: '#713f12' }}>
            ⚠ Borrador — pendiente de aprobación. Los clientes no pueden verlo.
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'transparent',
                color: '#713f12',
                border: '1px solid #fde047',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
              }}
            >
              Editar reporte
            </button>
            <button
              onClick={handleAprobar}
              disabled={approving}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--color-primary-500)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                cursor: approving ? 'not-allowed' : 'pointer',
                opacity: approving ? 0.7 : 1,
              }}
            >
              {approving ? 'Aprobando…' : 'Aprobar y publicar'}
            </button>
          </div>
        </div>
      )}

      {/* Admin: edit form */}
      {!loading && reporte && editing && (
        <ReporteEditForm
          reporte={reporte}
          onSave={handleSaveEdit}
          onCancel={() => setEditing(false)}
          saving={saving}
        />
      )}

      {/* Report display */}
      {!loading && reporte && !editing && (
        <div ref={reportContentRef}>
          <ReporteContent reporte={reporte} />
        </div>
      )}
    </AppShell>
  )
}
