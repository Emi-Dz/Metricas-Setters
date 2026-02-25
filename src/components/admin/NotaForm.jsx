import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { ErrorMessage } from '../ui/ErrorMessage'
import { Modal } from '../ui/Modal'

/**
 * Create / edit form for a nota, rendered inside a Modal.
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Object|null} initial - Note to edit (null = create mode)
 * @param {Function} onSave - Called with {titulo, contenido} to persist
 * @param {Function} onClose - Called to close the modal
 */
export function NotaForm({ isOpen, initial, onSave, onClose }) {
  const isEdit = Boolean(initial)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Populate fields when editing
  useEffect(() => {
    if (isOpen) {
      setTitulo(initial?.titulo ?? '')
      setContenido(initial?.contenido ?? '')
      setError(null)
    }
  }, [isOpen, initial])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimTitle = titulo.trim()
    const trimContent = contenido.trim()

    if (!trimTitle) {
      setError('El título es obligatorio.')
      return
    }
    if (!trimContent) {
      setError('El contenido no puede estar vacío.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await onSave({ titulo: trimTitle, contenido: trimContent })

    if (result?.error) {
      setError('Error al guardar la nota. Intentá de nuevo.')
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar nota' : 'Nueva nota'}
      size="md"
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
          <label className="form-label" htmlFor="nota-contenido">
            Contenido
          </label>
          <textarea
            id="nota-contenido"
            className="form-textarea"
            placeholder="Escribí el contenido de la nota..."
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={6}
          />
        </div>
      </form>
    </Modal>
  )
}
