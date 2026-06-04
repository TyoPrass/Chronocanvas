const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", userController.register);
router.post("/login", userController.loginUser);

router.get("/profile", authMiddleware, userController.getProfile);
router.get("/users", authMiddleware, userController.getAllUsers);
router.get("/users/:id", authMiddleware, userController.getUserById);
router.put("/users/:id", authMiddleware, userController.updateUser);
router.delete("/users/:id", authMiddleware, userController.deleteUser);

router.post("/forgotpassword", userController.forgotPassword);
router.put("/resetpassword/:token", userController.resetPassword);

module.exports = router;
