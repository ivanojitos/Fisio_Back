const { sql, getPool } = require("../config/db");

class Horarios {
  static async getAllByWeek(fechaInicio, fechaFin) {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("fechaInicio", sql.Date, fechaInicio)
      .input("fechaFin", sql.Date, fechaFin).query(`
      SELECT *
      FROM Horarios_Servicio
      WHERE Fecha BETWEEN @fechaInicio AND @fechaFin
      AND ACTIVO = 1
      ORDER BY Fecha ASC
    `);

    return result.recordset;
  }

  static async updateHorarios(horarios) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
      if (!Array.isArray(horarios) || horarios.length === 0) {
        return [];
      }

      await transaction.begin();

      const request = new sql.Request(transaction);

      // 📅 tomar rango de fechas del payload
      const fechas = horarios.map(
        (h) => new Date(h.fecha.split("/").reverse().join("-")),
      );

      const minFecha = new Date(Math.min(...fechas));
      const maxFecha = new Date(Math.max(...fechas));

      // ❌ 1. BORRAR HORARIOS DEL RANGO
      await request
        .input("min", sql.Date, minFecha)
        .input("max", sql.Date, maxFecha).query(`
          DELETE FROM Horarios_Servicio
          WHERE Fecha BETWEEN @min AND @max
        `);

      // ➕ 2. INSERTAR NUEVOS
      for (const h of horarios) {
        const fecha = new Date(h.fecha.split("/").reverse().join("-"));

        const horaInicio =
          h.hora_inicio.length === 5 ? `${h.hora_inicio}:00` : h.hora_inicio;
        const horaFin =
          h.hora_fin.length === 5 ? `${h.hora_fin}:00` : h.hora_fin;

        await new sql.Request(transaction)
          .input("fecha", sql.Date, fecha)
          .input("dia", sql.VarChar(10), h.dia_semana)
          .input("inicio", sql.VarChar(8), horaInicio)
          .input("fin", sql.VarChar(8), horaFin).query(`
            INSERT INTO Horarios_Servicio
              (Fecha, Dia_Semana, Hora_Inicio, Hora_Fin)
            VALUES
              (@fecha, @dia, @inicio, @fin)
          `);
      }

      await transaction.commit();

      return { ok: true };
    } catch (error) {
      await transaction.rollback();
      console.log("Error updateHorarios (transaction):", error);
      throw error;
    }
  }
}

module.exports = Horarios;
