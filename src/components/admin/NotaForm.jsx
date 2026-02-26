import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { ErrorMessage } from '../ui/ErrorMessage'
import { Modal } from '../ui/Modal'
import { RichTextEditor } from '../ui/RichTextEditor'
import { formatDate } from '../../lib/dateUtils'

/** Returns the last day of a given month (Date object) */
function lastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0)
}

function getPeriodPresets() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()

  const lastCurrent = lastDayOfMonth(y, m)
  const lastPrev = lastDayOfMonth(y, m - 1)
  const firstPrev = new Date(y, m - 1, 1)

  return [
    {
      label: '1ª quincena',
      from: formatDate(new Date(y, m, 1)),
      to: formatDate(new Date(y, m, 15)),
    },
    {
      label: '2ª quincena',
      from: formatDate(new Date(y, m, 16)),
      to: formatDate(lastCurrent),
    },
    {
      label: 'Este mes',
      from: formatDate(new Date(y, m, 1)),
      to: formatDate(lastCurrent),
    },
    {
      label: 'Mes anterior',
      from: formatDate(firstPrev),
      to: formatDate(lastPrev),
    },
  ]
}

/**
 * Create / edit form for a nota, rendered inside a Modal.
 *
 * @param {boolean}    isOpen        - Whether the modal is open
 * @param {Object|null} initial      - Note to edit (null = create mode)
 * @param {Function}   onSave        - Called with {titulo, contenido, periodo_desde, periodo_hasta}
 * @param {Function}   onClose       - Called to close the modal
 * @param {Object}     defaultPeriod - { from, to } to pre-fill when creating a new note
 */
export function NotaForm({ isOpen, initial, onSave, onClose, defaultPeriod }) {
  const isEdit = Boolean(initial)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [periodoDesde, setPeriodoDesde] = useState('')
  const [periodoHasta, setPeriodoHasta] = useState('')
  const [activePreset, setActivePreset] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const presets = getPeriodPresets()

  // Populate fields when opening
  useEffect(() => {
    if (isOpen) {
      setTitulo(initial?.titulo ?? '')
      setContenido(initial?.contenido ?? '')
      setError(null)
      setActivePreset(null)

      if (initial) {
        // Editing: restore saved period
        setPeriodoDesde(initial.periodo_desde ?? '')
        setPeriodoHasta(initial.periodo_hasta ?? '')
      } else {
        // Creating: use defaultPeriod if provided, otherwise empty
        setPeriodoDesde(defaultPeriod?.from ?? '')
        setPeriodoHasta(defaultPeriod?.to ?? '')
      }
    }
  }, [isOpen, initial])

  const applyPreset = (preset, index) => {
    setPeriodoDesde(preset.from)
    setPeriodoHasta(preset.to)
    setActivePreset(index)
  }

  const handlePeriodoDesdeChange = (val) => {
    setPeriodoDesde(val)
    setActivePreset(null)
  }

  const handlePeriodoHastaChange = (val) => {
    setPeriodoHasta(val)
    setActivePreset(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimTitle = titulo.trim()

    // Check if content is empty (Tiptap outputs '<p></p>' for empty editor)
    const isEmpty = !contenido || contenido === '<p></p>' || contenido.replace(/<[^>]*>/g, '').trim() === ''

    if (!trimTitle) {
      setError('El título es obligatorio.')
      return
    }
    if (isEmpty) {
      setError('El contenido no puede estar vacío.')
      return
    }

    // Validate period: both or neither
    if ((periodoDesde && !periodoHasta) || (!periodoDesde && periodoHasta)) {
      setError('Si asignás un período, completá ambas fechas.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await onSave({
      titulo: trimTitle,
      contenido,
      periodo_desde: periodoDesde || null,
      periodo_hasta: periodoHasta || null,
    })

    if (result?.error) {
      setError('Error al guardar la nota. Intentá de nuevo.')
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
  }

  // Use isOpen + initial id as key to remount (and reset) the editor on each open
  const editorKey = isOpen ? `nota-${initial?.id ?? 'new'}` : 'closed'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar nota' : 'Nueva nota'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            type="submit"
          >
            {isEdit ? 'Guardar cambios' : 'Crear nota'}
          </Button>
        </>
      }
    >
      <form className="nota-form" onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}

        <div className="form-group">
          <label className="form-label" htmlFor="nota-titulo">
            Título
          </label>
          <input
            id="nota-titulo"
            className="form-input"
            type="text"
            placeholder="Ej: Resumen de la semana"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={200}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Contenido
          </label>
          <RichTextEditor
            key={editorKey}
            value={contenido}
            onChange={setContenido}
            placeholder="Escribí el contenido de la nota..."
          />
        </div>

        {/* Period selection */}
        <div className="form-group">
          <label className="form-label">
            Período de la nota{' '}
            <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)' }}>(opcional)</span>
          </label>

          <div className="nota-period-presets">
            {presets.map((preset, i) => (
              <button
                key={preset.label}
                type="button"
                className={`nota-period-preset${activePreset === i ? ' nota-period-preset--active' : ''}`}
                onClick={() => applyPreset(preset, i)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="nota-period-dates">
            <div>
              <label className="form-label" htmlFor="nota-periodo-desde" style={{ fontSize: 'var(--font-size-xs)' }}>
                Desde
              </label>
              <input
                id="nota-periodo-desde"
                className="form-input"
                type="date"
                value={periodoDesde}
                onChange={(e) => handlePeriodoDesdeChange(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="nota-periodo-hasta" style={{ fontSize: 'var(--font-size-xs)' }}>
                Hasta
              </label>
              <input
                id="nota-periodo-hasta"
                className="form-input"
                type="date"
                value={periodoHasta}
                onChange={(e) => handlePeriodoHastaChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
