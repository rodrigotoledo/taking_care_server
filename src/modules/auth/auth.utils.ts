import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import crypto from 'crypto'
import type { UserType } from './models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']

export interface AuthJwtPayload {
  userId: number
  email: string
  userType: UserType
}

export const hashPassword = async (plainPassword: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plainPassword, salt)
}

export const comparePassword = async (plainPassword: string, passwordHash: string): Promise<boolean> => {
  return bcrypt.compare(plainPassword, passwordHash)
}

export const signAuthToken = (payload: AuthJwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyAuthToken = (token: string): AuthJwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthJwtPayload
  } catch {
    return null
  }
}

export const makePasswordResetToken = (): { rawToken: string; tokenHash: string } => {
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  return { rawToken, tokenHash }
}

export const hashRawToken = (rawToken: string): string => {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}
