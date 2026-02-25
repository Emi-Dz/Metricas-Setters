import { useState } from 'react'
import { useNotas } from '../../hooks/useNotas'
import { NotaCard } from './NotaCard'
import { NotaForm } from './NotaForm'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { ErrorMessage } from '../ui/ErrorMessage'

function IconNote() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

/**
 * Notes panel shown in both admin (editable) and client (read-only) views.
 *
 * @param {string} clienteId - The client whose notes to display
 * @param {boolean} readOnly - If true, hides add/edit/delete controls
 */
export function NotasPanel({ clienteId, readOnly = false }) {
  const { notas, loading, error, createNota, updateNota, deleteNota } =
    useNotas(clienteId)

  const [formOpen, setFormOpen] = useState(false)
  const [editingNota, setEditingNota] = useState(null)

  const handleEdit = (nota) => {
    setEditingNota(nota)
    setFormOpen(true)
  }

  const handleDelete = async (notaId) => {
    if (!window.confirm('¿Seguro que querés eliminar esta nota?')) return
    await deleteNota(notaId)
  }

  const handleSave = async (fields) => {
    if (editingNota) {
      return updateNota(editingNota.id, fields)
    }
    return createNota(fields)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingNota(null)
  }

  return (
    <>
      <div className="notas-panel">
        <div className="notas-panel__header">
          <h3 className="notas-panel__title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              📝 Notas del equipo
            </span>
          </h3>
          {!readOnly && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingNota(null)
                setFormOpen(true)
              }}
            >
              <IconPlus />
              Nueva nota
            </Button>
          )}
        </div>

        <div className="notas-panel__body">
          {error && <ErrorMessage message={error} />}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Spinner size="md" />
            </div>
          ) : notas.length === 0 ? (
            <EmptyState
              icon={<IconNote />}
              title="Sin notas"
              description={
                readOnly
                  ? 'El equipo aún no publicó notas para tu cuenta.'
                  : 'Todavía no hay notas para este cliente.'
              }
              action={
                !readOnly && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingNota(null)
                      setFormOpen(true)
                    }}
                  >
                    Crear primera nota
                  </Button>
                )
              }
            />
          ) : (
            notas.map((nota) => (
              <NotaCard
                key={nota.id}
                nota={nota}
                onEdit={!readOnly ? handleEdit : undefined}
                onDelete={!readOnly ? handleDelete : undefined}
              />
            ))
          )}
        </div>
      </div>

      {!readOnly && (
        <NotaForm
          isOpen={formOpen}
          initial={editingNota}
          onSave={handleSave}
          onClose={handleFormClose}
        />
      )}
    </>
  )
}
