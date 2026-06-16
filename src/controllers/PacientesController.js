const bcrypt = require("bcrypt");
const Paciente = require("../models/pacienteModel");
const Administrador = require("../models/administradorModel");


exports.buscarPacientes = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const data = await Paciente.buscarPacientes(search);

    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error obteniendo pacientes",
    });
  }
};