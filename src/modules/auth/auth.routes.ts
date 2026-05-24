import { Router } from 'express'
import { forgotPassword, me, resetPassword, signin, signup, updatePassword, updateProfile } from './auth.controller'
import { authenticateAuth } from './auth.middleware'
import { authUpload } from './auth.upload'

const authRoutes = Router()

authRoutes.post(
  '/signup',
  authUpload.fields([
    { name: 'cpfDocument', maxCount: 1 },
    { name: 'rgDocument', maxCount: 1 },
  ]),
  signup
)
authRoutes.post('/signin', signin)
authRoutes.post('/forgot-password', forgotPassword)
authRoutes.post('/reset-password', resetPassword)
authRoutes.get('/me', authenticateAuth, me)
authRoutes.put(
  '/me/profile',
  authenticateAuth,
  authUpload.fields([
    { name: 'cpfDocument', maxCount: 1 },
    { name: 'rgDocument', maxCount: 1 },
  ]),
  updateProfile
)
authRoutes.put('/me/password', authenticateAuth, updatePassword)

export default authRoutes
