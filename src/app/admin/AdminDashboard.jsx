'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { BookHeart, CirclePlus, Clock3 } from '../../components/ui/icons'
import { getAllPublicRecipes } from '../../services/publicRecipesService'

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
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUid, setEditingUid] = useState(null)
  const [editing, setEditing] = useState({ email: '', displayName: '', role: 'user', disabled: false })
  const [recipes, setRecipes] = useState([])
  const [recipesLoading, setRecipesLoading] = useState(true)
  const [recipesError, setRecipesError] = useState('')

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

  useEffect(() => {
    let active = true
    if (!isAdmin) {
      setRecipesLoading(false)
      return undefined
    }

    setRecipesLoading(true)
    setRecipesError('')
    getAllPublicRecipes()
      .then((data) => {
        if (active) setRecipes(data)
      })
      .catch((loadError) => {
        if (active) setRecipesError(loadError.message)
      })
      .finally(() => {
        if (active) setRecipesLoading(false)
      })

    return () => {
      active = false
    }
  }, [isAdmin])

  async function createUser(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await request('/api/admin/users', { method: 'POST', body: JSON.stringify(form) })
      setForm({ email: '', password: '', displayName: '' })
      setShowCreateForm(false)
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
      <section className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-coral">Área administrativa</p>
            <h1 className="mt-3 font-display text-4xl">Panel de administración</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink/60 dark:text-cream/60">Gestioná las cuentas y las recetas generales de sibo.decis desde un solo lugar.</p>
          </div>
        </div>

        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
          <section className="min-w-0 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-coral"><span className="grid h-7 w-7 place-items-center rounded-lg bg-sage text-moss dark:bg-moss/30 dark:text-sage">{users.length}</span> Usuarios</p>
                <h2 className="mt-3 font-display text-3xl">Cuentas registradas</h2>
                <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Administrá accesos y permisos.</p>
              </div>
              <button type="button" onClick={() => setShowCreateForm((current) => !current)} className="flex items-center gap-2 rounded-full bg-moss px-4 py-2.5 text-xs font-bold text-white transition hover:bg-ink"><CirclePlus size={16} /> {showCreateForm ? 'Cerrar' : 'Agregar usuario'}</button>
            </div>

            {showCreateForm && <form onSubmit={createUser} className="mt-6 grid gap-3 rounded-2xl bg-cream p-4 dark:bg-ink">
              <input className="field" type="text" placeholder="Nombre" value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} required />
              <input className="field" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              <input className="field" type="password" placeholder="Contraseña" minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
              <button type="submit" disabled={saving} className="rounded-full bg-coral px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Creando...' : 'Crear usuario'}</button>
            </form>}

            {error && <p className="mt-5 rounded-xl bg-coral/10 p-4 text-sm text-coral">{error}</p>}

            <div className="mt-6 min-w-0 max-h-[34rem] overflow-auto rounded-2xl border border-ink/10 dark:border-cream/10">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-ink/10 bg-white text-xs uppercase tracking-wider text-ink/45 dark:border-cream/10 dark:bg-ink-soft dark:text-cream/45">
                  <tr><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Acceso</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr>
                </thead>
                <tbody>
                  {loading && <tr><td className="px-4 py-8 text-ink/50 dark:text-cream/50" colSpan="5">Cargando usuarios...</td></tr>}
                  {!loading && users.length === 0 && <tr><td className="px-4 py-8 text-ink/50 dark:text-cream/50" colSpan="5">Todavía no hay usuarios registrados.</td></tr>}
                  {!loading && users.map((record) => {
                    const isEditing = editingUid === record.uid
                    return <tr key={record.uid} className="border-b border-ink/5 last:border-0 dark:border-cream/5">
                      <td className="px-4 py-4">{isEditing ? <div className="space-y-2"><input className="field" value={editing.displayName} onChange={(event) => setEditing({ ...editing, displayName: event.target.value })} /><input className="field" type="email" value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} /></div> : <><strong className="block">{record.displayName || 'Sin nombre'}</strong><span className="text-xs text-ink/50 dark:text-cream/50">{record.email || record.uid}</span></>}</td>
                      <td className="px-4 py-4">{getProviderLabel(record.providers)}</td>
                      <td className="px-4 py-4">{isEditing ? <select className="field" value={editing.role} onChange={(event) => setEditing({ ...editing, role: event.target.value })}><option value="user">user</option><option value="admin">admin</option></select> : record.role}</td>
                      <td className="px-4 py-4">{isEditing ? <label className="flex items-center gap-2"><input type="checkbox" checked={editing.disabled} onChange={(event) => setEditing({ ...editing, disabled: event.target.checked })} /> Desactivado</label> : record.disabled ? 'Desactivado' : 'Activo'}</td>
                      <td className="px-4 py-4"><div className="flex flex-wrap gap-2">{isEditing ? <><button type="button" onClick={() => saveEditing(record.uid)} disabled={saving} className="rounded-full bg-moss px-3 py-2 text-xs font-bold text-white">Guardar</button><button type="button" onClick={() => setEditingUid(null)} className="rounded-full border border-ink/15 px-3 py-2 text-xs font-bold dark:border-cream/15">Cancelar</button></> : <><button type="button" onClick={() => startEditing(record)} className="rounded-full border border-ink/15 px-3 py-2 text-xs font-bold dark:border-cream/15">Editar</button><button type="button" onClick={() => deleteUser(record)} disabled={saving || record.uid === user?.uid} className="rounded-full bg-coral px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Eliminar</button></>}</div></td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="min-w-0 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft dark:border-cream/10 dark:bg-ink-soft dark:shadow-soft-dark sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-coral"><BookHeart size={16} /> Recetas generales</p>
                <h2 className="mt-3 font-display text-3xl">Contenido público</h2>
                <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Una vista rápida de las recetas disponibles.</p>
              </div>
              <span className="rounded-full bg-sage px-3 py-1.5 text-xs font-bold text-moss dark:bg-moss/30 dark:text-sage">{recipes.length} recetas</span>
            </div>

            {recipesLoading && <p className="mt-6 rounded-2xl bg-cream px-4 py-8 text-center text-sm text-ink/50 dark:bg-ink dark:text-cream/50">Cargando recetas...</p>}
            {recipesError && <p className="mt-6 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">No pudimos cargar las recetas: {recipesError}</p>}
            {!recipesLoading && !recipesError && recipes.length === 0 && <div className="mt-6 grid min-h-40 place-items-center rounded-2xl border border-dashed border-ink/15 px-6 text-center dark:border-cream/15"><div><BookHeart className="mx-auto mb-3 text-moss/40 dark:text-sage/40" size={26} /><p className="text-sm font-semibold text-ink/60 dark:text-cream/60">Todavía no hay recetas generales</p><p className="mt-1 text-xs text-ink/40 dark:text-cream/40">Agregá la primera desde la gestión de recetas.</p></div></div>}
            {!recipesLoading && !recipesError && recipes.length > 0 && <div className="mt-6 grid gap-3">
              {recipes.slice(0, 3).map((recipe) => <article key={recipe.id} className="rounded-2xl border border-ink/10 bg-cream p-4 dark:border-cream/10 dark:bg-ink">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl text-moss dark:text-sage">{recipe.name}</h3>
                  {recipe.time && <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-coral"><Clock3 size={13} /> {recipe.time}</span>}
                </div>
                {recipe.description && <p className="mt-2 line-clamp-2 text-sm text-ink/60 dark:text-cream/60">{recipe.description}</p>}
                {Array.isArray(recipe.tags) && recipe.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{recipe.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-sage px-2.5 py-1 text-[10px] font-bold text-moss dark:bg-moss/30 dark:text-sage">{tag}</span>)}</div>}
              </article>)}
            </div>}

            <Link href="/admin/recetas" className="mt-6 flex items-center justify-center rounded-full bg-moss px-5 py-3 text-sm font-bold text-white transition hover:bg-ink">Gestionar recetas generales</Link>
          </section>
        </div>
      </section>
    </main>
  )
}
