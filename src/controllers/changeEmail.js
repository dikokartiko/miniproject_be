const { validationResult } = require("express-validator");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const transporter = require("../helpers/transporter");

async function checkExistingUser(userId, currentEmail, newEmail) {
  const user = await User.findByPk(userId);
  if (!user) return "User not found";
  if (user.email !== currentEmail) return "Current email does not match";
  const emailExists = await User.findOne({ where: { email: newEmail } });
  if (emailExists) return "New email already exists";
  return null;
}

async function updateEmail(user, newEmail) {
  user.email = newEmail;
  user.verified = false;
  await user.save();
}

async function sendVerificationEmail(user, newEmail) {
  const token = jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Verify your new email",
    text: `Dear ${user.username}, please verify your new email by clicking on the following link: ${process.env.BASE_URL}/verify/${token}`,
  };
  transporter.sendMail(mailOptions);
}

exports.changeEmail = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  const { currentEmail, newEmail } = req.body;
  const userId = req.userId;
  try {
    const existingUserError = await checkExistingUser(
      userId,
      currentEmail,
      newEmail
    );
    if (existingUserError)
      return res.status(400).json({ message: existingUserError });
    const user = await User.findByPk(userId);
    await updateEmail(user, newEmail);
    await sendVerificationEmail(user, newEmail);
    res.json({
      message: "Email updated successfully. Please verify your new email.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
