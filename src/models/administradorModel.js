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

 
}

module.exports = Admin;
