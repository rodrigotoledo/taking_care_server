import { DataTypes, Model, Optional } from 'sequelize'
import sequelize = require('../../../../config/sequelize')

export const USER_TYPES = ['user', 'patient', 'responsible', 'clinic', 'hospital', 'professional', 'admin'] as const
export type UserType = (typeof USER_TYPES)[number]

interface UserAttributes {
  id: number
  email: string
  passwordHash: string
  userType: UserType
  isAdmin: boolean
  isActive: boolean
  resetPasswordTokenHash: string | null
  resetPasswordExpiresAt: Date | null
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'isAdmin' | 'isActive' | 'resetPasswordTokenHash' | 'resetPasswordExpiresAt' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number
  declare email: string
  declare passwordHash: string
  declare userType: UserType
  declare isAdmin: boolean
  declare isActive: boolean
  declare resetPasswordTokenHash: string | null
  declare resetPasswordExpiresAt: Date | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
  declare readonly deletedAt: Date | null
}

const User =
  (sequelize.models.User as typeof UserModel | undefined) ??
  UserModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userType: {
        type: DataTypes.ENUM(...USER_TYPES),
        allowNull: false,
        defaultValue: 'patient',
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      resetPasswordTokenHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
      ],
    }
  )

export default User
