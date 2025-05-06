const { Doctor, Patient } = require('../models');
const { generateToken } = require('../middlewares/auth');

module.exports = {
  async login(req, res){
    try {
      const { email, password, userType } = req.body;

      const Model = userType === 'patient' ? Patient : Doctor;
      const user = await Model.findOne({ where: { email } });

      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken({
        id: user.id,
        type: userType,
        name: user.name,
        email: user.email
      });

      const userData = user.get({ plain: true });
      delete userData.password;

      return res.json({ user: userData, token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
