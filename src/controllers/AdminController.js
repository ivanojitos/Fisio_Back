const bcrypt = require("bcrypt");
const Paciente = require("../models/pacienteModel");
const Administrador = require("../models/administradorModel");

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
