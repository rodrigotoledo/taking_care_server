import { DataTypes, Model, Optional } from 'sequelize'
import sequelize = require('../../../../config/sequelize')

interface UserProfileAttributes {
  id: number
  userId: number
  displayName: string | null
  phone: string | null
  cpf: string | null
  rg: string | null
  cpfDocumentUrl: string | null
  rgDocumentUrl: string | null
  avatarUrl: string | null
  address: string | null
  metadata: Record<string, unknown> | null
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

type UserProfileCreationAttributes = Optional<
  UserProfileAttributes,
  | 'id'
  | 'displayName'
  | 'phone'
  | 'cpf'
  | 'rg'
  | 'cpfDocumentUrl'
  | 'rgDocumentUrl'
  | 'avatarUrl'
  | 'address'
  | 'metadata'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>

export class UserProfileModel
  extends Model<UserProfileAttributes, UserProfileCreationAttributes>
  implements UserProfileAttributes {
  declare id: number
  declare userId: number
  declare displayName: string | null
  declare phone: string | null
  declare cpf: string | null
  declare rg: string | null
  declare cpfDocumentUrl: string | null
  declare rgDocumentUrl: string | null
  declare avatarUrl: string | null
  declare address: string | null
  declare metadata: Record<string, unknown> | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
  declare readonly deletedAt: Date | null
}

const UserProfile =
  (sequelize.models.UserProfile as typeof UserProfileModel | undefined) ??
  UserProfileModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      displayName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      cpf: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      rg: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      cpfDocumentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rgDocumentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'UserProfile',
      tableName: 'user_profiles',
      underscored: true,
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          fields: ['user_id'],
          unique: true,
        },
      ],
    }
  )

export default UserProfile
