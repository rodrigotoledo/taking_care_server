import { cpf as cpfValidator } from 'cpf-cnpj-validator'
import { isValidPhoneNumber } from 'libphonenumber-js'

const RG_SANITIZE_REGEX = /[^0-9A-Za-z]/g

export const sanitizeRg = (value: string): string => value.replace(RG_SANITIZE_REGEX, '')

export const isValidRg = (value: string): boolean => {
  const sanitized = sanitizeRg(value)
  return sanitized.length >= 5 && sanitized.length <= 20
}

export const isValidCpf = (value: string): boolean => {
  return cpfValidator.isValid(value)
}

export const isValidInternationalPhone = (value: string): boolean => {
  return isValidPhoneNumber(value)
}
