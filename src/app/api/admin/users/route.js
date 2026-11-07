import { getAdminAuth, getAdminDb, verifyAdminRequest } from '../../../../lib/firebase/admin'

function serializeUser(user) {
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    disabled: user.disabled,
    role: user.customClaims?.role || 'user',
    providers: user.providerData.map((provider) => provider.providerId),
    createdAt: user.metadata.creationTime || null,
    lastLoginAt: user.metadata.lastSignInTime || null,
  }
}

export async function GET(request) {
  const admin = await verifyAdminRequest(request)
  if (!admin) return Response.json({ error: 'No autorizado.' }, { status: 403 })

  try {
    const result = await getAdminAuth().listUsers(1000)
    return Response.json({ users: result.users.map(serializeUser) })
  } catch (error) {
    console.error('Admin users list error:', error)
    return Response.json({ error: 'No se pudieron cargar los usuarios.' }, { status: 500 })
  }
}

export async function POST(request) {
  const admin = await verifyAdminRequest(request)
  if (!admin) return Response.json({ error: 'No autorizado.' }, { status: 403 })

  try {
    const body = await request.json()
    if (!body.email || !body.password) return Response.json({ error: 'Email y contraseña son obligatorios.' }, { status: 400 })

    const user = await getAdminAuth().createUser({
      email: body.email.trim(),
      password: body.password,
      displayName: body.displayName?.trim() || '',
    })
    await getAdminAuth().setCustomUserClaims(user.uid, { role: 'user' })
    await getAdminDb().doc(`users/${user.uid}`).set({
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: '',
      role: 'user',
      createdAt: new Date(),
    })

    return Response.json({ user: serializeUser(user) }, { status: 201 })
  } catch (error) {
    console.error('Admin user create error:', error)
    return Response.json({ error: error.message || 'No se pudo crear el usuario.' }, { status: 400 })
  }
}
