const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");
const forgotPassword = require("../controllers/forgotPassword");
const changePassword = require("../controllers/changePassword");
const login = require("../controllers/login");
const verify = require("../controllers/verify");
const changeUsername = require("../controllers/changeUsername");
const changeEmail = require("../controllers/changeEmail");
const router = express.Router();
const changePhoneNumber = require("../controllers/changePhoneNumber");
const updatePicture = require("../controllers/updatePicture");
const multerMiddleware = require("../middlewares/multerMiddleware");

router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Email is invalid"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/\d/)
      .withMessage("Password must contain a number")
      .matches(/[A-Z]/)
      .withMessage("Password must contain an uppercase letter")
      .matches(/[^a-zA-Z0-9]/)
      .withMessage("Password must contain a symbol"),
    body("phone").notEmpty().withMessage("Phone number is required"),
  ],
  userController.register
);

// router.get("/verify/:token", verify.verify);
router.patch("/verify", verify.verify);

router.post(
  "/login",
  [
    body("identifier")
      .notEmpty()
      .withMessage("Email/Username/Phone is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login.login
);

router.patch(
  "/password",
  [
    authMiddleware,
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters")
      .matches(/\d/)
      .withMessage("New password must contain a number")
      .matches(/[A-Z]/)
      .withMessage("New password must contain an uppercase letter")
      .matches(/[^a-zA-Z0-9]/)
      .withMessage("New password must contain a symbol"),
    body("confirmNewPassword")
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage("Passwords do not match"),
  ],
  changePassword.changePassword
);

router.put("/forgotpassword", forgotPassword.forgotPassword);

router.patch(
  "/reset-password",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  forgotPassword.resetPassword
);

router.patch(
  "/change-username",
  authMiddleware,
  [
    body("oldUsername").notEmpty().withMessage("Old username is required"),
    body("newUsername").notEmpty().withMessage("New username is required"),
  ],
  changeUsername.changeUsername
);

router.patch(
  "/change-email",
  authMiddleware,
  [body("newEmail").isEmail().withMessage("New email is not valid")],
  changeEmail.changeEmail
);

router.patch(
  "/change-phonenumber",
  authMiddleware,
  [
    body("oldPhoneNumber")
      .notEmpty()
      .withMessage("Old phone number is required"),
    body("newPhoneNumber")
      .notEmpty()
      .withMessage("New phone number is required"),
  ],
  changePhoneNumber.changePhoneNumber
);

router.post(
  "/update-picture",
  authMiddleware,
  multerMiddleware,
  updatePicture.updateProfilePicture
);

module.exports = router;
