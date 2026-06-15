const express = require("express");
const router = express.Router();
const upload = require("../uploads/upload");

// CONTROLLERS
const loginController = require("../controllers/loginController");

// =======================
// AUTH
// =======================
router.post("/login", loginController.login);

router.post(
  "/createPaciente",
  upload.single("foto"), // 🔥 FALTA ESTO
  loginController.crearPaciente,
);

module.exports = router;
