import { DataTypes, Model, Optional } from 'sequelize'
import sequelize = require('../../../../config/sequelize')

interface UserProfileProfessionalAttributes {
  id: number
  userProfileId: number
  councilType: string | null
  councilNumber: string | null
  specialty: string | null
  metadata: Record<string, unknown> | null
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

type UserProfileProfessionalCreationAttributes = Optional<
  UserProfileProfessionalAttributes,
  'id' | 'councilType' | 'councilNumber' | 'specialty' | 'metadata' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export class UserProfileProfessionalModel
  extends Model<UserProfileProfessionalAttributes, UserProfileProfessionalCreationAttributes>
  implements UserProfileProfessionalAttributes {
  declare id: number
  declare userProfileId: number
  declare councilType: string | null
  declare councilNumber: string | null
  declare specialty: string | null
  declare metadata: Record<string, unknown> | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
  declare readonly deletedAt: Date | null
}

const UserProfileProfessional =
  (sequelize.models.UserProfileProfessional as typeof UserProfileProfessionalModel | undefined) ??
  UserProfileProfessionalModel.init(
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
      councilType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      councilNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      specialty: {
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
      modelName: 'UserProfileProfessional',
      tableName: 'user_profile_professionals',
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

export default UserProfileProfessional
