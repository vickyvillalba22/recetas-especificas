import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const identifier = process.argv[2]
const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!identifier) throw new Error('Uso: npm run admin:bootstrap -- email-o-uid')
if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Faltan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY.')
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
const auth = getAuth(app)
const db = getFirestore(app)
const user = identifier.includes('@') ? await auth.getUserByEmail(identifier) : await auth.getUser(identifier)
const claims = { ...(user.customClaims || {}), role: 'admin' }

await auth.setCustomUserClaims(user.uid, claims)
await db.doc(`users/${user.uid}`).set({
  uid: user.uid,
  email: user.email || '',
  displayName: user.displayName || '',
  photoURL: user.photoURL || '',
  role: 'admin',
  updatedAt: FieldValue.serverTimestamp(),
}, { merge: true })

console.log(`Administrador configurado: ${user.email || user.uid}`)
console.log('Cerrá sesión y volvé a ingresar para renovar el token de Firebase.')
