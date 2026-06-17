const { sql, getPool } = require("../config/db");

class Citas {
  static async create(data) {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("Paciente_Id", sql.Int, data.Paciente_Id)
      .input("Fecha", sql.Date, data.Fecha)
      .input("Hora", sql.VarChar, data.Hora)
      .input("Tipo", sql.VarChar, data.Tipo)
      .input("Notas", sql.VarChar, data.Notas)
      .input("Estatus", sql.VarChar, data.Estatus).query(`
        INSERT INTO Citas
        (Paciente_Id, Fecha, Hora, Tipo, Notas, Estatus)
        OUTPUT INSERTED.*
        VALUES
        (@Paciente_Id, @Fecha, @Hora, @Tipo, @Notas, @Estatus)
      `);

    return result.recordset[0];
  }

  // OBTENER TODOS LOS Citas
  static async getAll() {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
      c.*,
      p.nombre AS paciente_nombre
    FROM Citas c
    LEFT JOIN Pacientes p ON p.id = c.paciente_id
    `);

    return result.recordset;
  }
}

module.exports = Citas;
