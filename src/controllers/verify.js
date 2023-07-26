const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.verify = async (req, res) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader)
      return res.status(401).json({ message: "Missing Authorization header" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verified)
      return res.status(400).json({ message: "User already verified" });
    user.verified = true;
    await user.save();
    res.json({ message: "User verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
