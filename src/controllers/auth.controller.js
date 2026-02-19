const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query(
    `SELECT * FROM users WHERE email=?`,
    [email]
  );

  if (!rows.length)
    return res.status(401).json({ error: "Invalid credentials" });

  const user = rows[0];

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token });
};
