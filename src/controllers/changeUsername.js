const { validationResult } = require("express-validator");
const User = require("../models/user");
const transporter = require("../helpers/transporter");

async function checkExistingUser(userId, oldUsername, newUsername) {
  const user = await User.findByPk(userId);
  if (!user) return "User not found";
  if (user.username !== oldUsername) return "Old username does not match";
  const usernameExists = await User.findOne({
    where: { username: newUsername },
  });
  if (usernameExists) return "New username already exists";
  return null;
}

async function updateUsername(user, newUsername) {
  user.username = newUsername;
  await user.save();
}

async function sendEmailNotification(user, newUsername) {
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Username updated successfully",
    text: `Dear ${user.username}, your username has been updated successfully to ${newUsername}.`,
  };
  transporter.sendMail(mailOptions);
}

exports.changeUsername = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  const { oldUsername, newUsername } = req.body;
  const userId = req.userId;
  try {
    const existingUserError = await checkExistingUser(
      userId,
      oldUsername,
      newUsername
    );
    if (existingUserError)
      return res.status(400).json({ message: existingUserError });
    const user = await User.findByPk(userId);
    await updateUsername(user, newUsername);
    await sendEmailNotification(user, newUsername);
    res.json({ message: "Username updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
