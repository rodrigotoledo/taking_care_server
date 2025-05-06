const { Doctor, Patient } = require('../models');
const { generateToken } = require('../middlewares/auth');

module.exports = {
  async login(req, res){
    console.log(req.body)
    try {
      const { email, password, userType } = req.body;

      // 1. Busca usuário
      const Model = userType === 'patient' ? Patient : Doctor;
      const user = await Model.findOne({ where: { email } });

      // 2. Verifica senha (simplificado)
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // 3. Gera token
      const token = generateToken({
        id: user.id,
        type: userType,
        name: user.name
      });

      // 4. Retorna sem a senha
      const userData = user.get({ plain: true });
      delete userData.password;

      return res.json({ user: userData, token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
