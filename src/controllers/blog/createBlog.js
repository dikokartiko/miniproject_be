const { validationResult } = require("express-validator");
const Blog = require("../../models/blog");
const User = require("../../models/User");

const allowedCategories = [
  "Umum",
  "Olahraga",
  "Ekonomi",
  "Politik",
  "Bisnis",
  "Fiksi",
];

async function checkUser(userId) {
  const user = await User.findByPk(userId);
  if (!user) return "User not found";
  if (!user.verified) return "User is not verified";
  return null;
}

async function createBlog(
  title,
  author,
  category,
  content,
  videoLink,
  keywords,
  country,
  userId,
  imageLink
) {
  const blog = await Blog.create({
    title,
    author,
    publicationDate: new Date(),
    imageLink,
    category,
    content,
    videoLink,
    keywords,
    country,
    userId,
  });
  return blog;
}

async function validateBlog(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  const { title, category, content, videoLink, keywords, country } = req.body;
  const userId = req.userId;
  const userError = await checkUser(userId);
  if (userError) return res.status(400).json({ message: userError });
  if (!allowedCategories.includes(category))
    return res.status(400).json({ message: "Invalid category" });
  return { title, category, content, videoLink, keywords, country, userId };
}

exports.createBlog = async (req, res, next) => {
  try {
    const validatedBlog = await validateBlog(req, res);
    if (validatedBlog.message) return;
    const { title, category, content, videoLink, keywords, country, userId } =
      validatedBlog;
    const user = await User.findByPk(userId);
    const imageLink = req.file.path;
    const blog = await createBlog(
      title,
      user.username,
      category,
      content,
      videoLink,
      keywords,
      country,
      userId,
      imageLink
    );
    res.json({ message: "Blog created successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
