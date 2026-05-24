import type { Request, Response, NextFunction } from 'express'
import { verifyAuthToken } from './auth.utils'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: {
      userId: number
      email: string
      userType: 'user' | 'patient' | 'responsible' | 'clinic' | 'hospital' | 'professional' | 'admin'
    }
  }
}

export const authenticateAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized access' })
    return
  }

  const token = authHeader.replace('Bearer ', '')
  const payload = verifyAuthToken(token)

  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  req.auth = payload
  next()
}
