const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const User = require("../models/user");

exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword)
      return res.status(400).json({ message: "Passwords do not match" });
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!(await bcrypt.compare(oldPassword, user.password)))
      return res.status(400).json({ message: "Invalid old password" });
    await user.update({ password: await bcrypt.hash(newPassword, 10) });
    res.json({ message: "Password changed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
