const { validationResult } = require("express-validator");
const User = require("../models/user");
const transporter = require("../helpers/transporter");

async function checkExistingUser(userId, oldPhoneNumber) {
  const user = await User.findByPk(userId);
  if (!user) {
    return "User not found";
  }
  if (user.phone !== oldPhoneNumber) {
    return "Old phone number does not match";
  }
  return null;
}

async function checkPhoneNumberInUse(newPhoneNumber) {
  const existingUser = await User.findOne({ where: { phone: newPhoneNumber } });
  if (existingUser) {
    return "Phone number already in use";
  }
  return null;
}

async function updatePhoneNumber(user, newPhoneNumber) {
  user.phone = newPhoneNumber;
  await user.save();
}

async function sendEmailNotification(user, newPhoneNumber) {
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Phone number updated successfully",
    text: `Dear ${user.username}, your phone number has been updated successfully to ${newPhoneNumber}.`,
  };
  transporter.sendMail(mailOptions);
}

exports.changePhoneNumber = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { oldPhoneNumber, newPhoneNumber } = req.body;
  const userId = req.userId;
  try {
    const existingUserError = await checkExistingUser(userId, oldPhoneNumber);
    if (existingUserError) {
      return res.status(400).json({ message: existingUserError });
    }
    const phoneNumberInUseError = await checkPhoneNumberInUse(newPhoneNumber);
    if (phoneNumberInUseError) {
      return res.status(400).json({ message: phoneNumberInUseError });
    }
    const user = await User.findByPk(userId);
    await updatePhoneNumber(user, newPhoneNumber);
    await sendEmailNotification(user, newPhoneNumber);
    res.json({ message: "Phone number updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
