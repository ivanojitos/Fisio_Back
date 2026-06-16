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
       * 
      FROM Citas
    `);

    return result.recordset;
  }
}

module.exports = Citas;
