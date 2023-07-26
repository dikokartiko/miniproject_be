const { Op, Sequelize } = require("sequelize");
const Blog = require("../../models/blog");

function buildWhereClause(category, title) {
  const where = {};
  if (category) {
    where.category = category;
  }

  if (title) {
    where.title = { [Op.like]: Sequelize.fn("LOWER", `%${title}%`) };
  }
  return where;
}

async function getBlogsData(where, limit, offset, order) {
  const blogs = await Blog.findAndCountAll({
    where,
    limit,
    offset,
    order: [["id", order === "asc" ? "ASC" : "DESC"]],
  });
  return blogs;
}

exports.getBlogs = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const category = req.query.category;
  const title = req.query.title;
  const order = req.query.order;
  try {
    const where = buildWhereClause(category, title);
    const blogs = await getBlogsData(where, limit, offset, order);
    res.json({
      blogs: blogs.rows,
      currentPage: page,
      totalPages: Math.ceil(blogs.count / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
