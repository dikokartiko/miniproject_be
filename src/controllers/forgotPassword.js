const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const transporter = require("../helpers/transporter");

async function findUserByEmail(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) return "User not found";
  return user;
}

async function generateResetToken(user) {
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  await user.update({
    resetPasswordToken: token,
    resetPasswordTokenExpiresAt: Date.now() + 3600000,
  });
  return token;
}

async function sendResetEmail(email, token) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset your password",
    text: `Click this link to reset your password: ${process.env.BASE_URL}/reset-password/${token}`,
  };
  await transporter.sendMail(mailOptions);
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (user === "User not found")
      return res.status(404).json({ message: "User not found" });
    const token = await generateResetToken(user);
    await sendResetEmail(email, token);
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function validateToken(user, token) {
  if (
    !user.resetPasswordToken ||
    user.resetPasswordToken !== token ||
    Date.now() > user.resetPasswordTokenExpiresAt
  ) {
    return "Invalid or expired token";
  }
  return null;
}

async function resetPassword(user, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await user.update({
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordTokenExpiresAt: null,
  });
}

exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }
    const { password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const tokenError = await validateToken(user, token);
    if (tokenError) return res.status(400).json({ message: tokenError });
    await resetPassword(user, password);
    res.json({ message: "Password has been reset" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
