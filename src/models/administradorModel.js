const { sql, getPool } = require("../config/db");

class Admin {
  //OBTENER POR CORREO
  static async findByCorreo(correo) {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("Correo", sql.VarChar, correo)
      .query("SELECT * FROM usuarios WHERE Correo = @Correo");

    return result.recordset[0];
  }

  static async create(data) {
    const pool = await getPool();
    const now = new Date();

    const result = await pool
      .request()
      .input("Nombre", sql.VarChar, data.Nombre)
      .input("Correo", sql.VarChar, data.Correo)
      .input("Password_hash", sql.VarChar, data.Password)
      .input("Estatus", sql.VarChar, data.Estatus)
      .input("Rol", sql.VarChar, data.Rol)
      .input("Fecha_Nacimiento", sql.DateTime, data.Fecha_Nacimiento)
      .input("Foto", sql.VarChar, data.Foto)
      .input("CreatedAt", sql.DateTime, now).query(`
      INSERT INTO usuarios
      (Nombre, Correo, Password_hash, Estatus, Rol, Fecha_Nacimiento, Foto, CreatedAt)
      OUTPUT INSERTED.*
      VALUES
      (@Nombre, @Correo, @Password_hash, @Estatus, @Rol, @Fecha_Nacimiento, @Foto, @CreatedAt)
    `);

    return result.recordset[0];
  }
}

module.exports = Admin;
