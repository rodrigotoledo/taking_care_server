import { DataTypes, Model, Optional } from 'sequelize'
import sequelize = require('../../../../config/sequelize')

interface UserProfileResponsibleAttributes {
  id: number
  userProfileId: number
  relationship: string | null
  metadata: Record<string, unknown> | null
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

type UserProfileResponsibleCreationAttributes = Optional<
  UserProfileResponsibleAttributes,
  'id' | 'relationship' | 'metadata' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export class UserProfileResponsibleModel
  extends Model<UserProfileResponsibleAttributes, UserProfileResponsibleCreationAttributes>
  implements UserProfileResponsibleAttributes {
  declare id: number
  declare userProfileId: number
  declare relationship: string | null
  declare metadata: Record<string, unknown> | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
  declare readonly deletedAt: Date | null
}

const UserProfileResponsible =
  (sequelize.models.UserProfileResponsible as typeof UserProfileResponsibleModel | undefined) ??
  UserProfileResponsibleModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userProfileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      relationship: {
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
      modelName: 'UserProfileResponsible',
      tableName: 'user_profile_responsibles',
      underscored: true,
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          fields: ['user_profile_id'],
          unique: true,
        },
      ],
    }
  )

export default UserProfileResponsible
