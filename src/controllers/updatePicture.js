const User = require("../models/user");

exports.updateProfilePicture = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.avatar = req.file.path;
    await user.save();
    res.json({ message: "Profile picture updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
