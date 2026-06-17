const bcrypt = require("bcrypt");
const Paciente = require("../models/pacienteModel");
const Administrador = require("../models/administradorModel");
const Horarios = require("../models/horariosModel");

exports.crearAdmin = async (req, res) => {
  const data = req.body;

  console.log("BODY:", data);
  console.log("FILE:", req.file);

  const required = ["nombre", "correo", "password", "fechaN"];

  for (let f of required) {
    if (!data[f]) {
      return res.status(422).json({
        ok: false,
        error: `Falta ${f}`,
      });
    }
  }

  try {
    const hashed = await bcrypt.hash(data.password, 10);

    // 🔥 GUARDAR RUTA DE LA FOTO
    const fotoPath = req.file
      ? `/imagenes/administrador/${req.file.filename}`
      : null;

    const admin = await Administrador.create({
      Nombre: data.nombre,
      Correo: data.correo,
      Password: hashed,
      Estatus: "Activo",
      Rol: "Admin",
      Fecha_Nacimiento: data.fechaN,
      Foto: fotoPath,
    });

    return res.json({
      ok: true,
      message: "Administrador creado correctamente",
      data: admin,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
};

//administrador registrar horarios servicio
exports.horarios = async (req, res) => {
  const { horarios } = req.body;

  if (!Array.isArray(horarios) || horarios.length === 0) {
    return res.status(422).json({
      ok: false,
      error: "Debe enviar un arreglo de horarios",
    });
  }

  try {
    const result = [];

    for (const horario of horarios) {
      const nuevo = await Administrador.createHorario({
        Dia_Semana: horario.dia_semana,
        Fecha: horario.fecha,
        Hora_Inicio: horario.hora_inicio,
        Hora_Fin: horario.hora_fin,
        Activo: 1,
      });

      result.push(nuevo);
    }

    return res.json({
      ok: true,
      message: "Horarios guardados correctamente",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
};

exports.gethorariosSemana = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const data = await Horarios.getAllByWeek(fechaInicio, fechaFin);

    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      message: "Error obteniendo horarios",
    });
  }
};

exports.updateHorarios = async (req, res) => {
  try {
    const { horarios } = req.body;

    console.log(horarios);

    const data = await Horarios.updateHorarios(horarios);

    console.log(data);

    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      message: "Error al actualizar horarios",
    });
  }
};

exports.deleteDia = async (req, res) => {
  const { fecha, dia_semana } = req.body;

  try {
    const result = await Administrador.deleteDia({
      Fecha: fecha,
      Dia_Semana: dia_semana,
    });

    return res.json({
      ok: true,
      message: "Horario eliminado correctamente",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
};
