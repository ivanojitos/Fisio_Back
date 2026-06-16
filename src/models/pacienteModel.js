const { sql, getPool } = require("../config/db");

class Paciente {
  static async findById(id) {
    const pool = await getPool();

    const result = await pool.request().input("Id", sql.Int, id).query(`
        SELECT * 
        FROM Pacientes 
        WHERE Id = @Id
      `);

    return result.recordset[0];
  }

  static async findByCorreo(correo) {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("Correo", sql.VarChar, correo.trim()).query(`
        SELECT TOP 1 * 
        FROM Pacientes 
        WHERE LTRIM(RTRIM(Correo)) = @Correo
      `);

    return result.recordset[0];
  }

  static async create(data) {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("Nombre", sql.VarChar, data.Nombre)
      .input("Edad", sql.Int, data.Edad)
      .input("Telefono", sql.VarChar, data.Telefono)
      .input("Correo", sql.VarChar, data.Correo)
      .input("Direccion", sql.VarChar, data.Direccion)
      .input("CP", sql.VarChar, data.CP)
      .input("Condicion_Medica", sql.VarChar, data.Condicion_Medica)
      .input("Password", sql.VarChar, data.Password)
      .input("Lesion", sql.VarChar, data.Lesion)
      .input("Estatus", sql.VarChar, "Activo")
      .input("Foto", sql.VarChar, data.Foto).query(`
        INSERT INTO Pacientes
        (Nombre, Edad, Telefono, Correo, Direccion, CP,
         Condicion_Medica, Password, Lesion, Estatus, Foto)
        OUTPUT INSERTED.*
        VALUES
        (@Nombre, @Edad, @Telefono, @Correo, @Direccion, @CP,
         @Condicion_Medica, @Password, @Lesion, @Estatus, @Foto)
      `);

    return result.recordset[0];
  }

  static async buscarPacientes(search) {
    const pool = await getPool();

    const result = await pool.request().input("search", `%${search}%`).query(`
      SELECT TOP 10
        Id,
        Nombre
      FROM Pacientes
      WHERE Nombre LIKE @search
      ORDER BY Nombre ASC
    `);

    return result.recordset;
  }


}

module.exports = Paciente;
