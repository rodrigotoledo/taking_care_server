import { cpf as cpfValidator } from 'cpf-cnpj-validator'

const RG_SANITIZE_REGEX = /[^0-9A-Za-z]/g
const PHONE_REGEX = /^[\d\s\-\+\(\)]{10,20}$/

export const sanitizeRg = (value: string): string => value.replace(RG_SANITIZE_REGEX, '')

export const isValidRg = (value: string): boolean => {
  const sanitized = sanitizeRg(value)
  return sanitized.length >= 5 && sanitized.length <= 20
}

export const isValidCpf = (value: string): boolean => {
  return cpfValidator.isValid(value)
}

export const isValidPhone = (value: string): boolean => {
  return PHONE_REGEX.test(value)
}
