const service = require('../services/managerCard.service');

exports.createManagerCard = async (req, res) => {
  try {
    const result = await service.create(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.publishManagerCard = async (req, res) => {
  try {
    const result = await service.publish(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteManagerCard = async (req, res) => {
  try {
    const result = await service.remove(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllManagerCards = async (req, res) => {
  try {
    const cards = await service.getAll();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserManagerCards = async (req, res) => {
  try {
    const cards = await service.getByUser(req.params.userId);
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
