const bcryptjs = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../middlewares/auth');

module.exports = {
  async login(req, res){
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcryptjs.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        user_type: user.user_type
      });

      const userData = user.get({ plain: true });
      delete userData.password_hash;

      return res.json({ user: userData, token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async signup(req, res) {
    try {
      const { email, password, confirmPassword, userType, displayName, phone, cpf, rg } = req.body;

      if (!email || !password || !confirmPassword || !userType || !cpf || !rg) {
        return res.status(400).json({
          error: 'Missing required fields'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          error: 'Passwords do not match'
        });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          error: 'Email already registered'
        });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);

      const profile = {
        display_name: displayName || email.split('@')[0],
        phone: phone || null,
        cpf: cpf,
        rg: rg
      };

      const user = await User.create({
        email,
        password_hash: hashedPassword,
        user_type: userType,
        is_active: true,
        profile: JSON.stringify(profile)
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        user_type: user.user_type
      });

      const userData = user.get({ plain: true });
      delete userData.password_hash;

      return res.status(201).json({ user: userData, token });
    } catch (error) {
      return res.status(500).json({
        error: 'Failure when creating user',
        details: error.message
      });
    }
  },

  async listProfessionals(req, res) {
    try {
      const professionals = await User.findAll({
        where: { user_type: 'professional' },
        attributes: ['id', 'email', 'profile'],
        order: [['id', 'ASC']]
      });

      const data = professionals.map((prof) => {
        const profile = typeof prof.profile === 'string' ? JSON.parse(prof.profile) : prof.profile || {};
        return {
          id: prof.id,
          email: prof.email,
          displayName: profile?.display_name || null,
          specialty: profile?.specialty || null
        };
      });

      return res.json({ data });
    } catch (error) {
      return res.status(400).json({
        error: 'Failure when listing professionals',
        details: error.message
      });
    }
  }
};
