const bcrypt = require("bcrypt");
const Paciente = require("../models/pacienteModel");
const Citas = require("../models/CitasModel");

exports.create = async (req, res) => {
  const data = req.body;

  const required = ["paciente_id", "fecha", "hora", "tipo", "notas", "estatus"];

  for (let f of required) {
    if (!data[f]) {
      return res.status(422).json({
        ok: false,
        error: `Falta ${f}`,
      });
    }
  }

  try {
    const admin = await Citas.create({
      Paciente_Id: data.paciente_id,
      Fecha: data.fecha,
      Hora: data.hora,
      Tipo: data.tipo,
      Notas: data.notas,
      Estatus: data.estatus,
    });

    return res.json({
      ok: true,
      message: "Cita creado correctamente",
      data: admin,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
};

exports.index = async (req, res) => {
  try {
    const data = await Citas.getAll();

    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      message: "Error obteniendo Citas",
    });
  }
};
