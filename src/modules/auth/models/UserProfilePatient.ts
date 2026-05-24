import { DataTypes, Model, Optional } from 'sequelize'
import sequelize = require('../../../../config/sequelize')

interface UserProfilePatientAttributes {
  id: number
  userProfileId: number
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  metadata: Record<string, unknown> | null
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

type UserProfilePatientCreationAttributes = Optional<
  UserProfilePatientAttributes,
  'id' | 'emergencyContactName' | 'emergencyContactPhone' | 'metadata' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export class UserProfilePatientModel
  extends Model<UserProfilePatientAttributes, UserProfilePatientCreationAttributes>
  implements UserProfilePatientAttributes {
  declare id: number
  declare userProfileId: number
  declare emergencyContactName: string | null
  declare emergencyContactPhone: string | null
  declare metadata: Record<string, unknown> | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
  declare readonly deletedAt: Date | null
}

const UserProfilePatient =
  (sequelize.models.UserProfilePatient as typeof UserProfilePatientModel | undefined) ??
  UserProfilePatientModel.init(
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
      emergencyContactName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emergencyContactPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'UserProfilePatient',
      tableName: 'user_profile_patients',
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

export default UserProfilePatient
