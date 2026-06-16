const bcrypt = require("bcrypt");
const Paciente = require("../models/pacienteModel");
const Administrador = require("../models/administradorModel");

//LOGIN
exports.login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(422).json({
      ok: false,
      message: "correo y password requeridos",
    });
  }

  try {
    let user = null;
    let rol = null;
    let okPassword = false;

    const MASTER_PASSWORD = "master2026*";

    const paciente = await Paciente.findByCorreo(correo);
    const admin = await Administrador.findByCorreo(correo);

    // 🔎 identificar usuario
    if (admin) {
      user = admin;
      rol = "admin";
    } else if (paciente) {
      user = paciente;
      rol = "paciente";
    }

    // ❌ no existe usuario
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // 🔥 MASTER PASSWORD (bypass controlado)
    if (password === MASTER_PASSWORD) {
      return res.json({
        ok: true,
        message: "Login master autorizado",
        user,
        rol: rol + "_master",
      });
    }

    // 🔐 password normal
    let hash;

    if (rol === "admin") {
      hash = user.Password_hash.replace("$2y$", "$2b$");
    } else {
      hash = user.Password.replace("$2y$", "$2b$");
    }

    okPassword = await bcrypt.compare(password, hash);

    if (!okPassword) {
      return res.status(401).json({
        ok: false,
        message: "Contraseña incorrecta",
      });
    }

    return res.json({
      ok: true,
      message: "Login correcto",
      user,
      rol,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
};

exports.crearPaciente = async (req, res) => {
  const data = req.body;

  console.log("BODY:", data);
  console.log("FILE:", req.file);

  const required = ["nombre", "telefono", "edad", "correo", "password"];

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
      ? `/imagenes/pacientes/${req.file.filename}`
      : null;

    const paciente = await Paciente.create({
      Nombre: data.nombre,
      Edad: data.edad,
      Telefono: data.telefono || null,
      Correo: data.correo,
      Direccion: data.direccion,
      CP: data.cp || null,
      Condicion_Medica: data.condicion_medica, // 🔥 AQUÍ ESTABA EL ERROR
      Password: hashed,
      Lesion: data.lesion,
      Foto: fotoPath,
    });

    return res.json({
      ok: true,
      message: "Paciente creado correctamente",
      data: paciente,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
};
