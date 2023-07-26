const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { Op } = require("sequelize");

async function findUser(identifier) {
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: identifier },
        { username: identifier },
        { phone: identifier },
      ],
    },
  });
  if (!user) return "User not found";
  return user;
}

async function checkPassword(password, user) {
  if (!(await bcrypt.compare(password, user.password)))
    return "Invalid password";
  return null;
}

async function generateToken(user) {
  const token = jwt.sign(
    {
      userId: user.id,
      verfied: user.verfied,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return token;
}

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await findUser(identifier);
    if (user === "User not found")
      return res.status(404).json({ message: "User not found" });
    const passwordError = await checkPassword(password, user);
    if (passwordError)
      return res.status(400).json({ message: "Invalid password" });
    const token = await generateToken(user);
    res.json({
      token,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
