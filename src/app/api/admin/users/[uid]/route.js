import { getAdminAuth, getAdminDb, verifyAdminRequest } from '../../../../../lib/firebase/admin'

export async function PATCH(request, { params }) {
  const admin = await verifyAdminRequest(request)
  if (!admin) return Response.json({ error: 'No autorizado.' }, { status: 403 })
  const { uid } = await params

  try {
    const body = await request.json()
    const updates = {}
    if (typeof body.email === 'string' && body.email.trim()) updates.email = body.email.trim()
    if (typeof body.displayName === 'string') updates.displayName = body.displayName.trim()
    if (typeof body.disabled === 'boolean') updates.disabled = body.disabled
    const user = Object.keys(updates).length ? await getAdminAuth().updateUser(uid, updates) : await getAdminAuth().getUser(uid)

    if (body.role === 'admin' || body.role === 'user') {
      const currentClaims = user.customClaims || {}
      await getAdminAuth().setCustomUserClaims(uid, { ...currentClaims, role: body.role })
    }

    await getAdminDb().doc(`users/${uid}`).set({
      email: user.email || '',
      displayName: user.displayName || '',
      disabled: user.disabled,
      ...(body.role === 'admin' || body.role === 'user' ? { role: body.role } : {}),
    }, { merge: true })

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Admin user update error:', error)
    return Response.json({ error: error.message || 'No se pudo actualizar el usuario.' }, { status: 400 })
  }
}

export async function DELETE(request, { params }) {
  const admin = await verifyAdminRequest(request)
  if (!admin) return Response.json({ error: 'No autorizado.' }, { status: 403 })
  const { uid } = await params
  if (uid === admin.uid) return Response.json({ error: 'No podés eliminar tu propia cuenta desde este panel.' }, { status: 400 })

  try {
    await getAdminDb().recursiveDelete(getAdminDb().doc(`users/${uid}`))
    await getAdminAuth().deleteUser(uid)
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return Response.json({ error: error.message || 'No se pudo eliminar el usuario.' }, { status: 400 })
  }
}
