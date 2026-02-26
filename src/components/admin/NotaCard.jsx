import { formatDateTime, formatDisplayDate } from '../../lib/dateUtils'

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

/** Detect whether the content string contains HTML tags */
function isHtml(str) {
  return typeof str === 'string' && /<[a-z][\s\S]*>/i.test(str)
}

/**
 * Single note display card.
 *
 * @param {Object}   nota     - Note object from DB
 * @param {boolean}  readOnly - If true, shows full content (no line-clamp) and hides edit/delete
 * @param {Function} onEdit   - Called when edit button is clicked (undefined = read-only)
 * @param {Function} onDelete - Called when delete button is clicked (undefined = read-only)
 */
export function NotaCard({ nota, readOnly = false, onEdit, onDelete }) {
  const hasPeriod = nota.periodo_desde && nota.periodo_hasta
  const contentIsHtml = isHtml(nota.contenido)

  const contentClass = [
    contentIsHtml ? 'nota-card__prose' : 'nota-card__content',
    readOnly ? 'nota-card__content--full' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="nota-card">
      <div className="nota-card__header">
        <h4 className="nota-card__title">{nota.titulo}</h4>
        {!readOnly && (
          <div className="nota-card__actions">
            {onEdit && (
              <button
                className="btn btn--ghost btn--icon"
                onClick={() => onEdit(nota)}
                title="Editar nota"
                aria-label="Editar nota"
              >
                <IconEdit />
              </button>
            )}
            {onDelete && (
              <button
                className="btn btn--ghost btn--icon"
                onClick={() => onDelete(nota.id)}
                title="Eliminar nota"
                aria-label="Eliminar nota"
                style={{ color: 'var(--color-danger-500)' }}
              >
                <IconTrash />
              </button>
            )}
          </div>
        )}
      </div>

      {hasPeriod && (
        <span className="nota-card__period">
          📅 {formatDisplayDate(nota.periodo_desde)} – {formatDisplayDate(nota.periodo_hasta)}
        </span>
      )}

      {contentIsHtml ? (
        <div
          className={contentClass}
          dangerouslySetInnerHTML={{ __html: nota.contenido }}
        />
      ) : (
        <p className={contentClass}>{nota.contenido}</p>
      )}

      <p className="nota-card__meta">
        {nota.updated_at && nota.updated_at !== nota.created_at
          ? `Editado ${formatDateTime(nota.updated_at)}`
          : `Publicado ${formatDateTime(nota.created_at)}`}
      </p>
    </div>
  )
}
