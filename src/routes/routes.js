const express = require("express");
const router = express.Router();
const upload = require("../uploads/upload");

// CONTROLLERS
const loginController = require("../controllers/loginController");
const AdminController = require("../controllers/AdminController");
const PacientesController = require("../controllers/PacientesController");
const CitasController = require("../controllers/CitasController");
// =======================
// AUTH
// =======================
router.post("/login", loginController.login);


router.post(
  "/createPaciente",
  upload.single("foto"), // 🔥 FALTA ESTO
  loginController.crearPaciente,
);

// =======================
// ADMINISTRADOR
// =======================
router.post("/createAdmin", upload.single("foto"), AdminController.crearAdmin);



// =======================
// PACIENTES
// =======================
router.post("/pacientes", PacientesController.buscarPacientes);


// =======================
// CITAS
// =======================
router.post("/citasave", CitasController.create);
router.get("/citas", CitasController.index);

module.exports = router;
