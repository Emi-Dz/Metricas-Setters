import { useState } from 'react'
import { useProfiles } from '../hooks/useProfiles'
import { useClientes } from '../hooks/useClientes'
import { AppShell } from '../components/layout/AppShell'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { formatDateTime } from '../lib/dateUtils'

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const styles = {
    admin: { background: 'var(--color-accent-100)', color: 'var(--color-accent-600)' },
    cliente: { background: 'var(--color-primary-50)', color: 'var(--color-primary-700)' },
  }
  const labels = { admin: 'Admin', cliente: 'Cliente' }

  return (
    <span
      style={{
        ...( styles[role] ?? { background: 'var(--color-gray-100)', color: 'var(--color-gray-600)' }),
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
        padding: '2px 10px',
        borderRadius: 'var(--radius-full)',
      }}
    >
      {labels[role] ?? role}
    </span>
  )
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

function EditProfileModal({ profile, clientes, onSave, onChangePassword, onClose }) {
  const [role, setRole] = useState(profile.role ?? 'cliente')
  const [clienteId, setClienteId] = useState(profile.cliente_id ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (role === 'cliente' && !clienteId) {
      setError('Seleccioná un cliente para este usuario.')
      return
    }
    if (newPassword && newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    setError(null)

    const result = await onSave(profile.id, {
      role,
      cliente_id: role === 'admin' ? null : clienteId,
    })
    if (result?.error) {
      setError('Error al guardar. Intentá de nuevo.')
      setLoading(false)
      return
    }

    if (newPassword) {
      const pwResult = await onChangePassword(profile.id, newPassword)
      if (pwResult?.error) {
        setError(`Perfil guardado, pero error al cambiar contraseña: ${pwResult.error.message}`)
        setLoading(false)
        return
      }
    }

    onClose()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {error && <ErrorMessage message={error} />}

      <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>Usuario:</strong> {profile.email}
      </div>

      <div className="form-group">
        <label className="form-label">Rol</label>
        <select className="form-select" value={role} onChange={(e) => { setRole(e.target.value); if (e.target.value === 'admin') setClienteId('') }}>
          <option value="cliente">Cliente</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      {role === 'cliente' && (
        <div className="form-group">
          <label className="form-label">Cliente asignado</label>
          <select className="form-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">— Sin asignar —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {role === 'admin' && (
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          Los administradores pueden ver todos los clientes. No se requiere asignación.
        </p>
      )}

      <div className="form-group">
        <label className="form-label">Nueva contraseña <span style={{ fontWeight: 'normal', color: 'var(--color-text-muted)' }}>(opcional)</span></label>
        <input
          type="password"
          className="form-input"
          placeholder="Dejá vacío para no cambiarla"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="modal__footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="primary" type="submit" loading={loading}>Guardar cambios</Button>
      </div>
    </form>
  )
}

// ─── New Cliente Modal ────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function NewClienteModal({ onSave, onClose }) {
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleNombreChange = (e) => {
    const val = e.target.value
    setNombre(val)
    if (!slugTouched) setSlug(slugify(val))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!slug.trim()) { setError('El slug es obligatorio.'); return }
    setLoading(true)
    setError(null)
    const result = await onSave({ nombre: nombre.trim(), slug: slug.trim() })
    if (result?.error) {
      const msg = result.error.message ?? ''
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setError('Ya existe un cliente con ese slug. Usá uno diferente.')
      } else {
        setError(`Error al crear: ${msg}`)
      }
      setLoading(false)
      return
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {error && <ErrorMessage message={error} />}

      <div className="form-group">
        <label className="form-label">Nombre del cliente</label>
        <input
          type="text"
          className="form-input"
          placeholder="Ej: Micaela Gallardo"
          value={nombre}
          onChange={handleNombreChange}
          autoFocus
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Slug <span style={{ fontWeight: 'normal', color: 'var(--color-text-muted)' }}>(identificador único)</span></label>
        <input
          type="text"
          className="form-input"
          placeholder="micaela-gallardo"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
          disabled={loading}
        />
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Solo letras minúsculas, números y guiones. Se genera automáticamente.
        </p>
      </div>

      <div className="modal__footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="primary" type="submit" loading={loading}>Crear cliente</Button>
      </div>
    </form>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteUserModal({ profile, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    const result = await onConfirm(profile.id)
    if (result?.error) {
      setError(`Error al eliminar: ${result.error.message}`)
      setLoading(false)
      return
    }
    onClose()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {error && <ErrorMessage message={error} />}
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
        ¿Estás seguro que querés eliminar al usuario <strong style={{ color: 'var(--color-text-primary)' }}>{profile.email}</strong>?
      </p>
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        Esta acción es irreversible. Se eliminará la cuenta de acceso y el perfil.
      </p>
      <div className="modal__footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="danger" onClick={handleConfirm} loading={loading}>Eliminar usuario</Button>
      </div>
    </div>
  )
}

// ─── New User Modal ───────────────────────────────────────────────────────────

function NewUserModal({ clientes, onSave, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('cliente')
  const [clienteId, setClienteId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('El email es obligatorio.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (role === 'cliente' && !clienteId) { setError('Seleccioná un cliente para este usuario.'); return }

    setLoading(true)
    setError(null)

    const result = await onSave({
      email: email.trim(),
      password,
      role,
      cliente_id: role === 'admin' ? null : clienteId,
    })

    if (result?.error) {
      const msg = result.error.message ?? ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('Ya existe un usuario con ese email.')
      } else {
        setError(`Error al crear el usuario: ${msg}`)
      }
      setLoading(false)
      return
    }

    onClose()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {error && <ErrorMessage message={error} />}

      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          placeholder="usuario@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Contraseña temporal</label>
        <input
          type="password"
          className="form-input"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          El usuario podrá cambiarla desde su cuenta.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">Rol</label>
        <select
          className="form-select"
          value={role}
          onChange={(e) => { setRole(e.target.value); if (e.target.value === 'admin') setClienteId('') }}
          disabled={loading}
        >
          <option value="cliente">Cliente</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      {role === 'cliente' && (
        <div className="form-group">
          <label className="form-label">Cliente asignado</label>
          <select className="form-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)} disabled={loading}>
            <option value="">— Seleccioná un cliente —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <div className="modal__footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="primary" type="submit" loading={loading}>Crear usuario</Button>
      </div>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminClientesPage() {
  const { profiles, loading, error, updateProfile, createUser, deleteUser, updatePassword } = useProfiles()
  const { clientes, createCliente } = useClientes()

  const [editingProfile, setEditingProfile] = useState(null)
  const [deletingProfile, setDeletingProfile] = useState(null)
  const [newUserOpen, setNewUserOpen] = useState(false)
  const [newClienteOpen, setNewClienteOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 4000)
  }

  const handleUpdate = async (id, fields) => {
    const result = await updateProfile(id, fields)
    if (!result?.error) {
      setEditingProfile(null)
      showSuccess('Usuario actualizado correctamente.')
    }
    return result
  }

  const handleCreate = async (fields) => {
    const result = await createUser(fields)
    if (!result?.error) {
      setNewUserOpen(false)
      showSuccess('Usuario creado correctamente.')
    }
    return result
  }

  const handleDelete = async (userId) => {
    const result = await deleteUser(userId)
    if (!result?.error) {
      setDeletingProfile(null)
      showSuccess('Usuario eliminado correctamente.')
    }
    return result
  }

  const handleCreateCliente = async (fields) => {
    const result = await createCliente(fields)
    if (!result?.error) {
      setNewClienteOpen(false)
      showSuccess(`Cliente "${fields.nombre}" creado correctamente.`)
    }
    return result
  }

  const pendingCount = profiles.filter(
    (p) => p.role === 'cliente' && !p.cliente_id
  ).length

  return (
    <AppShell title="Gestión de Usuarios" subtitle="Creá y configurá cuentas de acceso">

      {/* Success banner */}
      {successMsg && (
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-success-100)',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-success-600)',
          fontSize: 'var(--font-size-sm)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            Usuarios ({profiles.length})
          </h2>
          {pendingCount > 0 && (
            <span style={{
              background: 'var(--color-warning-100)',
              color: '#92400e',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #fde68a',
            }}>
              {pendingCount} sin asignar
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" size="md" onClick={() => setNewClienteOpen(true)}>
            <IconPlus />
            Nuevo cliente
          </Button>
          <Button variant="primary" size="md" onClick={() => setNewUserOpen(true)}>
            <IconPlus />
            Nuevo usuario
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={`Error al cargar usuarios: ${error}`} />}

      {/* Table */}
      <div className="metrics-table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
            <Spinner size="lg" />
          </div>
        ) : profiles.length === 0 ? (
          <EmptyState
            icon={<IconUsers />}
            title="Sin usuarios"
            description="Creá el primer usuario con el botón de arriba."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="metrics-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'default' }}>Email</th>
                  <th style={{ cursor: 'default' }}>Rol</th>
                  <th style={{ cursor: 'default' }}>Cliente asignado</th>
                  <th style={{ cursor: 'default' }}>Creado</th>
                  <th style={{ cursor: 'default' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  const isPending = p.role === 'cliente' && !p.cliente_id
                  return (
                    <tr
                      key={p.id}
                      style={isPending ? { background: '#fffbeb' } : undefined}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <div style={{
                            width: '30px', height: '30px',
                            background: p.role === 'admin' ? 'var(--color-accent-500)' : 'var(--color-primary-500)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'white',
                            flexShrink: 0,
                          }}>
                            {p.email?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span style={{ fontSize: 'var(--font-size-sm)' }}>{p.email}</span>
                        </div>
                      </td>
                      <td><RoleBadge role={p.role} /></td>
                      <td>
                        {p.clientes?.nombre ? (
                          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                            {p.clientes.nombre}
                          </span>
                        ) : p.role === 'admin' ? (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Todos los clientes</span>
                        ) : (
                          <span style={{
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: '#92400e',
                            background: 'var(--color-warning-100)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                          }}>
                            ⚠ Pendiente
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {formatDateTime(p.created_at)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button
                            className="btn btn--ghost btn--sm"
                            onClick={() => setEditingProfile(p)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <IconEdit />
                            Editar
                          </button>
                          <button
                            className="btn btn--ghost btn--sm"
                            onClick={() => setDeletingProfile(p)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-error, #dc2626)' }}
                          >
                            <IconTrash />
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={Boolean(editingProfile)}
        onClose={() => setEditingProfile(null)}
        title="Editar usuario"
        size="sm"
      >
        {editingProfile && (
          <EditProfileModal
            profile={editingProfile}
            clientes={clientes}
            onSave={handleUpdate}
            onChangePassword={updatePassword}
            onClose={() => setEditingProfile(null)}
          />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={Boolean(deletingProfile)}
        onClose={() => setDeletingProfile(null)}
        title="Eliminar usuario"
        size="sm"
      >
        {deletingProfile && (
          <DeleteUserModal
            profile={deletingProfile}
            onConfirm={handleDelete}
            onClose={() => setDeletingProfile(null)}
          />
        )}
      </Modal>

      {/* New user modal */}
      <Modal
        isOpen={newUserOpen}
        onClose={() => setNewUserOpen(false)}
        title="Nuevo usuario"
        size="sm"
      >
        <NewUserModal
          clientes={clientes}
          onSave={handleCreate}
          onClose={() => setNewUserOpen(false)}
        />
      </Modal>

      {/* New cliente modal */}
      <Modal
        isOpen={newClienteOpen}
        onClose={() => setNewClienteOpen(false)}
        title="Nuevo cliente"
        size="sm"
      >
        <NewClienteModal
          onSave={handleCreateCliente}
          onClose={() => setNewClienteOpen(false)}
        />
      </Modal>
    </AppShell>
  )
}
