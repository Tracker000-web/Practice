const service = require('../services/tracker.service');

exports.createTracker = async (req, res) => {
  try {
    const result = await service.create(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitTracker = async (req, res) => {
  try {
    const result = await service.submit(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserTrackers = async (req, res) => {
  try {
    const trackers = await service.getByUser(req.params.userId);
    res.json(trackers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
