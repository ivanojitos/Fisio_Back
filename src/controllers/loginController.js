const bcrypt = require("bcrypt");
const Paciente = require("../models/pacienteModel");
const Administrador = require("../models/administradorModel");


//LOGIN
exports.login = async (req, res) => {
  const { correo, password } = req.body;

  console.log('si entro ');
  
  if (!correo || !password) {
    return res.status(422).json({
      ok: false,
      errors: "correo y password requeridos",
    });
  }

  try {
    let user = null;
    let rol = null;

    // 🔎 Paciente
    user = await Paciente.findByCorreo(correo);

    
    if (user) rol = "paciente";

    // 🔎 ADMIN 👈 AQUÍ LO NUEVO
    if (!user) {
      user = await Administrador.findByCorreo(correo);
      if (user) rol = "admin";
    }


    // ❌ NO EXISTE
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
        valor: correo,
      });
    }

    // 🔥 MODO TEST (MASTER)
    if (password === "administrador123*") {
      return res.json({
        ok: true,
        message: "Login directo (modo test)",
        user,
        rol: "master",
      });
    }

    // 🔐 VALIDAR PASSWORD
    const hash = user.Password.replace("$2y$", "$2b$");
    const okPassword = await bcrypt.compare(password, hash);

    if (!okPassword) {
      return res.status(401).json({
        ok: false,
        message: "Contraseña incorrecta",
        valor: password,
      });
    }

    // ✅ LOGIN OK
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
      Lesion:data.lesion,
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

