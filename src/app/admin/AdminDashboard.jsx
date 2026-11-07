'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'

function getProviderLabel(providers) {
  if (providers?.includes('google.com')) return 'Google'
  if (providers?.includes('password')) return 'Email'
  return providers?.join(', ') || '—'
}

export function AdminDashboard() {
  const { user, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [editingUid, setEditingUid] = useState(null)
  const [editing, setEditing] = useState({ email: '', displayName: '', role: 'user', disabled: false })

  async function request(path, options = {}) {
    const token = await user.getIdToken()
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.error || 'No se pudo completar la operación.')
    return payload
  }

  async function loadUsers() {
    if (!user || !isAdmin) return
    setLoading(true)
    setError('')
    try {
      const payload = await request('/api/admin/users')
      setUsers(payload.users || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [isAdmin, user])

  async function createUser(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await request('/api/admin/users', { method: 'POST', body: JSON.stringify(form) })
      setForm({ email: '', password: '', displayName: '' })
      await loadUsers()
    } catch (createError) {
      setError(createError.message)
    } finally {
      setSaving(false)
    }
  }

  function startEditing(record) {
    setEditingUid(record.uid)
    setEditing({ email: record.email, displayName: record.displayName, role: record.role, disabled: record.disabled })
  }

  async function saveEditing(uid) {
    setSaving(true)
    setError('')
    try {
      await request(`/api/admin/users/${uid}`, { method: 'PATCH', body: JSON.stringify(editing) })
      setEditingUid(null)
      await loadUsers()
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteUser(record) {
    if (!window.confirm(`¿Eliminar permanentemente a ${record.email || record.uid}?`)) return
    setSaving(true)
    setError('')
    try {
      await request(`/api/admin/users/${record.uid}`, { method: 'DELETE' })
      await loadUsers()
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-88px)] bg-cream px-5 py-12 text-ink dark:bg-ink-dark dark:text-cream lg:px-10">
      <section className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-coral">Área administrativa</p>
            <h1 className="mt-3 font-display text-4xl">Usuarios</h1>
            <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Gestioná las cuentas registradas sin acceder a sus datos privados.</p>
          </div>
          <Link href="/" className="rounded-full border border-ink/15 px-5 py-3 text-sm font-bold text-ink/75 transition hover:bg-white dark:border-cream/15 dark:text-cream/80 dark:hover:bg-ink-soft">Volver al inicio</Link>
        </div>

        <div className="mb-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark">
          <h2 className="font-display text-2xl">Agregar usuario</h2>
          <form onSubmit={createUser} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <input className="field" type="text" placeholder="Nombre" value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} required />
            <input className="field" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            <input className="field" type="password" placeholder="Contraseña" minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            <button type="submit" disabled={saving} className="rounded-full bg-moss px-5 py-3 text-sm font-bold text-white disabled:opacity-60">Crear</button>
          </form>
        </div>

        {error && <p className="mb-5 rounded-xl bg-coral/10 p-4 text-sm text-coral">{error}</p>}

        <div className="overflow-x-auto rounded-3xl border border-ink/10 bg-white shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/45 dark:border-cream/10 dark:text-cream/45">
              <tr><th className="px-5 py-4">Usuario</th><th className="px-5 py-4">Acceso</th><th className="px-5 py-4">Rol</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Acciones</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td className="px-5 py-8 text-ink/50 dark:text-cream/50" colSpan="5">Cargando usuarios...</td></tr> : users.map((record) => {
                const isEditing = editingUid === record.uid
                return <tr key={record.uid} className="border-b border-ink/5 last:border-0 dark:border-cream/5">
                  <td className="px-5 py-4">{isEditing ? <div className="space-y-2"><input className="field" value={editing.displayName} onChange={(event) => setEditing({ ...editing, displayName: event.target.value })} /><input className="field" type="email" value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} /></div> : <><strong className="block">{record.displayName || 'Sin nombre'}</strong><span className="text-xs text-ink/50 dark:text-cream/50">{record.email || record.uid}</span></>}</td>
                  <td className="px-5 py-4">{getProviderLabel(record.providers)}</td>
                  <td className="px-5 py-4">{isEditing ? <select className="field" value={editing.role} onChange={(event) => setEditing({ ...editing, role: event.target.value })}><option value="user">user</option><option value="admin">admin</option></select> : record.role}</td>
                  <td className="px-5 py-4">{isEditing ? <label className="flex items-center gap-2"><input type="checkbox" checked={editing.disabled} onChange={(event) => setEditing({ ...editing, disabled: event.target.checked })} /> Desactivado</label> : record.disabled ? 'Desactivado' : 'Activo'}</td>
                  <td className="px-5 py-4"><div className="flex flex-wrap gap-2">{isEditing ? <><button type="button" onClick={() => saveEditing(record.uid)} disabled={saving} className="rounded-full bg-moss px-3 py-2 text-xs font-bold text-white">Guardar</button><button type="button" onClick={() => setEditingUid(null)} className="rounded-full border border-ink/15 px-3 py-2 text-xs font-bold dark:border-cream/15">Cancelar</button></> : <><button type="button" onClick={() => startEditing(record)} className="rounded-full border border-ink/15 px-3 py-2 text-xs font-bold dark:border-cream/15">Editar</button><button type="button" onClick={() => deleteUser(record)} disabled={saving || record.uid === user?.uid} className="rounded-full bg-coral px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Eliminar</button></>}</div></td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
