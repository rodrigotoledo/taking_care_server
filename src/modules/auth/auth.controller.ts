import type { Request, Response } from 'express'
import { Op } from 'sequelize'
import { User, UserProfile, UserProfileProfessional } from './models'
import type { UserType } from './models/User'
import {
  comparePassword,
  hashPassword,
  hashRawToken,
  makePasswordResetToken,
  signAuthToken,
} from './auth.utils'
import { isValidCpf, isValidPhone, isValidRg } from './auth.validation'

interface UploadFiles {
  cpfDocument?: Express.Multer.File[]
  rgDocument?: Express.Multer.File[]
}

const getUploadedDocumentUrl = (file: Express.Multer.File | undefined): string | null => {
  if (!file) return null
  return `/uploads/auth-documents/${file.filename}`
}

const validUserTypes: UserType[] = ['user', 'patient', 'responsible', 'clinic', 'hospital', 'professional', 'admin']

const sanitizeUserResponse = (user: any, profile: any) => ({
  id: user.id,
  email: user.email,
  userType: user.userType,
  isAdmin: user.isAdmin,
  isActive: user.isActive,
  profile: profile
    ? {
      displayName: profile.displayName,
      phone: profile.phone,
      cpf: profile.cpf,
      rg: profile.rg,
      cpfDocumentUrl: profile.cpfDocumentUrl,
      rgDocumentUrl: profile.rgDocumentUrl,
      avatarUrl: profile.avatarUrl,
      address: profile.address,
      metadata: profile.metadata,
    }
    : null,
})

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = (req.files as UploadFiles | undefined) ?? {}
    const cpfDocument = files.cpfDocument?.[0]
    const rgDocument = files.rgDocument?.[0]

    const { email, password, confirmPassword, userType = 'patient', displayName, phone, cpf, rg } = req.body

    if (!email || !password || !phone || !cpf || !rg) {
      res.status(400).json({ error: 'email, password, phone, cpf and rg are required' })
      return
    }

    if (!cpfDocument || !rgDocument) {
      res.status(400).json({ error: 'cpfDocument and rgDocument uploads are required' })
      return
    }

    if (confirmPassword && confirmPassword !== password) {
      res.status(400).json({ error: 'password and confirmPassword must match' })
      return
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'password must be at least 8 characters' })
      return
    }

    if (!isValidPhone(phone)) {
      res.status(400).json({ error: 'Invalid phone number format' })
      return
    }

    if (!isValidCpf(cpf)) {
      res.status(400).json({ error: 'Invalid CPF' })
      return
    }

    if (!isValidRg(rg)) {
      res.status(400).json({ error: 'Invalid RG' })
      return
    }

    if (typeof userType !== 'string' || !validUserTypes.includes(userType as UserType)) {
      res.status(400).json({ error: 'Invalid userType value' })
      return
    }

    if (typeof email !== 'string') {
      res.status(400).json({ error: 'email and password are required' })
      return
    }

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      res.status(409).json({ error: 'Email is already registered' })
      return
    }

    const passwordHash = await hashPassword(password)

    const user = await User.create({
      email,
      passwordHash,
      userType: userType as UserType,
      isAdmin: userType === 'admin',
      isActive: true,
    })

    const profile = await UserProfile.create({
      userId: user.id,
      displayName: displayName ?? null,
      phone: phone,
      cpf: cpf ?? null,
      rg: rg ?? null,
      cpfDocumentUrl: getUploadedDocumentUrl(cpfDocument),
      rgDocumentUrl: getUploadedDocumentUrl(rgDocument),
      metadata: null,
    })

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    })

    res.status(201).json({
      token,
      user: sanitizeUserResponse(user, profile),
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to sign up' })
  }
}

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' })
      return
    }

    const user = await User.findOne({ where: { email }, include: [{ model: UserProfile, as: 'profile' }] })

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    })

    res.json({
      token,
      user: sanitizeUserResponse(user, (user as any).profile),
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to sign in' })
  }
}

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({ error: 'email is required' })
      return
    }

    const user = await User.findOne({ where: { email } })

    if (!user) {
      res.json({ message: 'If the email exists, a reset link was generated.' })
      return
    }

    const { rawToken, tokenHash } = makePasswordResetToken()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

    await user.update({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: expiresAt,
    })

    res.json({
      message: 'Password reset token generated.',
      resetToken: process.env.NODE_ENV === 'production' ? undefined : rawToken,
      expiresAt,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process forgot password' })
  }
}

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      res.status(400).json({ error: 'token and newPassword are required' })
      return
    }

    const tokenHash = hashRawToken(token)

    const user = await User.findOne({
      where: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { [Op.gt]: new Date() },
      },
    })

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' })
      return
    }

    const passwordHash = await hashPassword(newPassword)

    await user.update({
      passwordHash,
      resetPasswordTokenHash: null,
      resetPasswordExpiresAt: null,
    })

    res.json({ message: 'Password has been reset successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reset password' })
  }
}

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = req.auth
    if (!auth) {
      res.status(401).json({ error: 'Unauthorized access' })
      return
    }

    const user = await User.findByPk(auth.userId, {
      include: [{ model: UserProfile, as: 'profile' }],
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ user: sanitizeUserResponse(user, (user as any).profile) })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch current user' })
  }
}

export const listProfessionals = async (_req: Request, res: Response): Promise<void> => {
  try {
    const professionals = await User.findAll({
      where: {
        userType: 'professional',
        isActive: true,
      },
      include: [
        {
          model: UserProfile,
          as: 'profile',
          include: [
            {
              model: UserProfileProfessional,
              as: 'professionalProfile',
            },
          ],
        },
      ],
      order: [['id', 'ASC']],
    })

    const data = professionals.map((user: any) => ({
      id: user.id,
      email: user.email,
      displayName: user.profile?.displayName ?? null,
      specialty: user.profile?.professionalProfile?.specialty ?? null,
    }))

    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list professionals' })
  }
}

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = req.auth
    if (!auth) {
      res.status(401).json({ error: 'Unauthorized access' })
      return
    }

    const files = (req.files as UploadFiles | undefined) ?? {}
    const cpfDocument = files.cpfDocument?.[0]
    const rgDocument = files.rgDocument?.[0]

    const { displayName, phone, cpf, rg, currentPassword } = req.body

    if (!currentPassword || typeof currentPassword !== 'string') {
      res.status(400).json({ error: 'currentPassword is required to confirm profile updates' })
      return
    }

    if (phone !== undefined && phone !== null && String(phone).trim() !== '' && !isValidPhone(String(phone))) {
      res.status(400).json({ error: 'Invalid phone number format' })
      return
    }

    if (cpf !== undefined && cpf !== null && String(cpf).trim() !== '' && !isValidCpf(String(cpf))) {
      res.status(400).json({ error: 'Invalid CPF' })
      return
    }

    if (rg !== undefined && rg !== null && String(rg).trim() !== '' && !isValidRg(String(rg))) {
      res.status(400).json({ error: 'Invalid RG' })
      return
    }

    const user = await User.findByPk(auth.userId, {
      include: [{ model: UserProfile, as: 'profile' }],
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const passwordValid = await comparePassword(currentPassword, user.passwordHash)
    if (!passwordValid) {
      res.status(401).json({ error: 'Current password is incorrect' })
      return
    }

    let profile = (user as any).profile as InstanceType<typeof UserProfile> | null

    if (!profile) {
      profile = await UserProfile.create({ userId: user.id })
    }

    await profile.update({
      displayName: displayName ?? profile.displayName,
      phone: phone ?? profile.phone,
      cpf: cpf ?? profile.cpf,
      rg: rg ?? profile.rg,
      cpfDocumentUrl: getUploadedDocumentUrl(cpfDocument) ?? profile.cpfDocumentUrl,
      rgDocumentUrl: getUploadedDocumentUrl(rgDocument) ?? profile.rgDocumentUrl,
    })

    const freshUser = await User.findByPk(auth.userId, {
      include: [{ model: UserProfile, as: 'profile' }],
    })

    if (!freshUser) {
      res.status(404).json({ error: 'User not found after profile update' })
      return
    }

    res.json({
      message: 'Profile updated successfully',
      user: sanitizeUserResponse(freshUser, (freshUser as any).profile),
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update profile' })
  }
}

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = req.auth
    if (!auth) {
      res.status(401).json({ error: 'Unauthorized access' })
      return
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      res.status(400).json({ error: 'currentPassword, newPassword and confirmNewPassword are required' })
      return
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({ error: 'newPassword and confirmNewPassword must match' })
      return
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'newPassword must be at least 8 characters' })
      return
    }

    const user = await User.findByPk(auth.userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const passwordValid = await comparePassword(currentPassword, user.passwordHash)
    if (!passwordValid) {
      res.status(401).json({ error: 'Current password is incorrect' })
      return
    }

    const passwordHash = await hashPassword(newPassword)
    await user.update({ passwordHash })

    res.json({ message: 'Password updated successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update password' })
  }
}
