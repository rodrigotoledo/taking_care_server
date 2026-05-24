import User from './User'
import UserProfile from './UserProfile'

User.hasOne(UserProfile, {
  foreignKey: 'userId',
  as: 'profile',
})

UserProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})

export { User, UserProfile }
