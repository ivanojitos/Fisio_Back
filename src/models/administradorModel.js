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

  static async createHorario(data) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    const normalize = (d) => ({
      fecha: d.fecha || d.Fecha,
      dia_semana: d.dia_semana || d.Dia_Semana,
      hora_inicio: d.hora_inicio || d.Hora_Inicio,
      hora_fin: d.hora_fin || d.Hora_Fin,
    });

    try {
      await transaction.begin();

      const dataArray = Array.isArray(data) ? data : [data];
      const cleanData = dataArray.map(normalize);

      const fechas = cleanData
        .filter((d) => d.fecha)
        .map((d) => new Date(d.fecha.split("/").reverse().join("-")));

      const fechaInicio = new Date(Math.min(...fechas));
      const fechaFin = new Date(Math.max(...fechas));

      const diasEnviados = [...new Set(cleanData.map((d) => d.dia_semana))];

      // ======================================================
      // 1. MERGE (UPSERT)
      // ======================================================
      for (const d of cleanData) {
        if (!d.fecha) continue;

        const horaInicio =
          (d.hora_inicio || "").length === 5
            ? `${d.hora_inicio}:00`
            : d.hora_inicio;

        const horaFin =
          (d.hora_fin || "").length === 5 ? `${d.hora_fin}:00` : d.hora_fin;

        const fecha = new Date(d.fecha.split("/").reverse().join("-"));

        await new sql.Request(transaction)
          .input("Fecha", sql.Date, fecha)
          .input("Dia_Semana", sql.VarChar(10), d.dia_semana)
          .input("Hora_Inicio", sql.VarChar(8), horaInicio)
          .input("Hora_Fin", sql.VarChar(8), horaFin).query(`
            MERGE Horarios_Servicio AS target
            USING (
              SELECT 
                @Fecha AS Fecha,
                @Dia_Semana AS Dia_Semana
            ) AS source
            ON target.Fecha = source.Fecha 
               AND target.Dia_Semana = source.Dia_Semana

            WHEN MATCHED THEN 
              UPDATE SET 
                Hora_Inicio = @Hora_Inicio,
                Hora_Fin = @Hora_Fin,
                Activo = 1,
                updated_at = GETDATE()

            WHEN NOT MATCHED THEN
              INSERT (Fecha, Dia_Semana, Hora_Inicio, Hora_Fin, Activo, created_at, updated_at)
              VALUES (@Fecha, @Dia_Semana, @Hora_Inicio, @Hora_Fin, 1, GETDATE(), GETDATE());
          `);
      }

      // ======================================================
      // 2. TERMINA MERGE PRIMERO
      // ======================================================
      await transaction.commit();

      return { ok: true };
    } catch (error) {
      await transaction.rollback();
      console.log("ERROR:", error);
      throw error;
    }
  }

  static async deleteDia(data) {
    const pool = await getPool();

    const fecha = new Date(data.Fecha.split("/").reverse().join("-"));

    const result = await pool
      .request()
      .input("Fecha", sql.Date, fecha)
      .input("Dia_Semana", sql.VarChar(10), data.Dia_Semana).query(`
      UPDATE Horarios_Servicio
      SET Activo = 0,
          updated_at = GETDATE()
      WHERE Fecha = @Fecha
        AND Dia_Semana = @Dia_Semana
    `);

    return result;
  }
}

module.exports = Admin;
