import User from './User'
import UserProfile from './UserProfile'
import UserProfilePatient from './UserProfilePatient'
import UserProfileProfessional from './UserProfileProfessional'
import UserProfileResponsible from './UserProfileResponsible'

User.hasOne(UserProfile, {
  foreignKey: 'userId',
  as: 'profile',
})

UserProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})

UserProfile.hasOne(UserProfilePatient, {
  foreignKey: 'userProfileId',
  as: 'patientProfile',
})

UserProfilePatient.belongsTo(UserProfile, {
  foreignKey: 'userProfileId',
  as: 'userProfile',
})

UserProfile.hasOne(UserProfileProfessional, {
  foreignKey: 'userProfileId',
  as: 'professionalProfile',
})

UserProfileProfessional.belongsTo(UserProfile, {
  foreignKey: 'userProfileId',
  as: 'userProfile',
})

UserProfile.hasOne(UserProfileResponsible, {
  foreignKey: 'userProfileId',
  as: 'responsibleProfile',
})

UserProfileResponsible.belongsTo(UserProfile, {
  foreignKey: 'userProfileId',
  as: 'userProfile',
})

export { User, UserProfile, UserProfilePatient, UserProfileProfessional, UserProfileResponsible }
