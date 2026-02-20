const service = require('../services/managerCard.service');

async function createManagerCard(req, res) {
  try {
    const result = await service.create(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function publishManagerCard(req, res) {
  try {
    const result = await service.publish(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteManagerCard(req, res) {
  try {
    const result = await service.remove(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllManagerCards(req, res) {
  try {
    const cards = await service.getAll();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUserManagerCards(req, res) {
  try {
    const cards = await service.getByUser(req.params.userId);
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createManagerCard,
  publishManagerCard,
  deleteManagerCard,
  getAllManagerCards,
  getUserManagerCards
};
