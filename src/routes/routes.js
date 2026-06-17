const express = require("express");
const router = express.Router();
const upload = require("../uploads/upload");

// CONTROLLERS
const loginController = require("../controllers/loginController");
const AdminController = require("../controllers/AdminController");
const PacientesController = require("../controllers/PacientesController");
const CitasController = require("../controllers/CitasController");
const dasboardController = require("../controllers/dashboardController");
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
router.post("/horarios", AdminController.horarios);
router.get("/gethorariosSemana", AdminController.gethorariosSemana);
router.post("/updateHorarios", AdminController.updateHorarios);
router.post("/deleteDia", AdminController.deleteDia);
// =======================
// PACIENTES
// =======================
router.post("/pacientes", PacientesController.buscarPacientes);

// =======================
// CITAS
// =======================
router.post("/citasave", CitasController.create);
router.get("/citas", CitasController.index);

// =======================
//PACIENTE DASHBOARD
// =======================
router.get("/dashboard/:id", dasboardController.dashboard)
router.get('/horarios-disponibles', dasboardController.getAvailableHours)

module.exports = router;
