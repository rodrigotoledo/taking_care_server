const { User } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async list(req, res) {
    try {
      const { search, limit = 50, page = 1 } = req.query;

      const limitNumber = Number.parseInt(limit, 10) || 50;
      const pageNumber = Number.parseInt(page, 10) || 1;

      const where = {
        user_type: { [Op.in]: ['clinic', 'hospital'] },
        is_active: true
      };

      if (search) {
        where[Op.or] = [
          { email: { [Op.iLike]: `%${search}%` } },
          { 'profile->>display_name': { [Op.iLike]: `%${search}%` } },
        ];
      }

      const careLocations = await User.findAndCountAll({
        where,
        attributes: ['id', 'email', 'user_type', 'profile'],
        order: [['created_at', 'DESC']],
        offset: (pageNumber - 1) * limitNumber,
        limit: limitNumber,
        raw: true,
      });

      const formattedLocations = careLocations.rows.map(location => {
        const profile = typeof location.profile === 'string' ? JSON.parse(location.profile) : (location.profile || {});
        const { type: _, ...profileWithoutType } = profile;
        return {
          id: location.id,
          type: location.user_type,
          email: location.email,
          display_name: profile.display_name,
          ...profileWithoutType,
        };
      });

      return res.json({
        total: careLocations.count,
        pages: Math.ceil(careLocations.count / limitNumber),
        data: formattedLocations
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Failure when listing care locations',
        details: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const careLocation = await User.findOne({
        where: {
          id: req.params.id,
          user_type: { [Op.in]: ['clinic', 'hospital'] }
        },
        attributes: ['id', 'email', 'user_type', 'profile'],
        raw: true,
      });

      if (!careLocation) {
        return res.status(404).json({ error: 'Care location not found' });
      }

      const profile = typeof careLocation.profile === 'string' ? JSON.parse(careLocation.profile) : (careLocation.profile || {});
      const { type: _, ...profileWithoutType } = profile;
      return res.json({
        id: careLocation.id,
        type: careLocation.user_type,
        email: careLocation.email,
        display_name: profile.display_name,
        ...profileWithoutType,
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Failure when fetching care location',
        details: error.message
      });
    }
  }
};
