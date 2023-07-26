const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const multerMiddleware = require("../middlewares/multerMiddleware");
const createBlog = require("../controllers/blog/createBlog");
const getBlog = require("../controllers/blog/getBlogs");

router.post(
  "/create-blog",
  authMiddleware,
  multerMiddleware,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("category")
      .isIn(["Umum", "Olahraga", "Ekonomi", "Politik", "Bisnis", "Fiksi"])
      .withMessage("Invalid category"),
    body("content")
      .isLength({ max: 500 })
      .withMessage("Content must be less than 500 characters"),
    body("videoLink").optional().isURL().withMessage("Video link is not valid"),
    body("keywords").notEmpty().withMessage("Keywords is required"),
    body("country").notEmpty().withMessage("Country is required"),
  ],
  createBlog.createBlog
);

router.get(
  "/blogs",
  [
    query("category")
      .optional()
      .isIn(["Umum", "Olahraga", "Ekonomi", "Politik", "Bisnis", "Fiksi"])
      .withMessage("Invalid category"),
    query("order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid order"),
    // Add title query parameter
    query("title").optional(),
  ],
  getBlog.getBlogs
);

module.exports = router;
