const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const transporter = require("../helpers/transporter");

async function checkExistingUser(email, username, phone) {
  if (await User.findOne({ where: { email } })) {
    return "Email already registered";
  }
  if (await User.findOne({ where: { username } })) {
    return "Username already existed";
  }
  if (await User.findOne({ where: { phone } })) {
    return "Phone Number already existed";
  }
  return null;
}

async function createUser(username, email, password, phone) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    phone,
    verified: false,
  });
  return newUser;
}

async function sendVerificationEmail(email, userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your account",
    text: `Click this link to verify your account: ${process.env.BASE_URL}/verify/${token}`,
  });
}

exports.register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    const existingUserError = await checkExistingUser(email, username, phone);
    if (existingUserError) {
      return res.status(400).json({ message: existingUserError });
    }
    const newUser = await createUser(username, email, password, phone);
    await sendVerificationEmail(email, newUser.id);
    res.status(201).json({
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      phone: newUser.phone,
      verified: newUser.verified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
