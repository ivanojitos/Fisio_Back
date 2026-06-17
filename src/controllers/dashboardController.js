const bcrypt = require("bcrypt");
const { sql, getPool } = require("../config/db");

exports.dashboard = async (req, res) => {
  const pool = await getPool();
  const pacienteId = req.params.id;

  const [citas, historial, recomendaciones, archivos, proxima] =
    await Promise.all([
      pool
        .request()
        .input("id", pacienteId)
        .query("SELECT COUNT(*) AS total FROM Citas WHERE Paciente_Id = @id"),

      pool
        .request()
        .input("id", pacienteId)
        .query(
          "SELECT COUNT(*) AS total FROM Historial_Clinico WHERE Paciente_Id = @id",
        ),

      pool
        .request()
        .input("id", pacienteId)
        .query(
          "SELECT COUNT(*) AS total FROM Recomendaciones WHERE Paciente_Id = @id",
        ),

      pool
        .request()
        .input("id", pacienteId)
        .query(
          "SELECT COUNT(*) AS total FROM Archivos_Medicos WHERE Paciente_Id = @id",
        ),

      pool.request().input("id", pacienteId).query(`
        SELECT TOP 1 
        CONVERT(varchar, Fecha, 120) AS Fecha
        FROM Citas
        WHERE Paciente_Id = @id
        ORDER BY Fecha ASC
      `),
    ]);

  res.json({
    citas: citas.recordset[0].total,
    sesiones: historial.recordset[0].total,
    recomendaciones: recomendaciones.recordset[0].total,
    archivos: archivos.recordset[0].total,
    proximaCita: proxima.recordset?.[0]?.Fecha || "Sin citas",
  });
};

exports.getAvailableHours = async (req, res) => {
  try {
    const { fecha } = req.query;

    const pool = await getPool();

    /* =========================================
      1. obtener día de semana en JS (NO SQL)
    ========================================= */
    const dateObj = new Date(fecha);

    const mapDia = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    const diaShort = mapDia[dateObj.getDay()];

    /* =========================================
      2. horarios del sistema
    ========================================= */
    const horarios = await pool.request().input("dia", sql.VarChar, diaShort)
      .query(`
    SELECT Hora_Inicio, Hora_Fin
    FROM Horarios_Servicio
    WHERE LTRIM(RTRIM(LOWER(Dia_Semana))) = LOWER(@dia)
    AND Activo = 1
  `);

    /* =========================================
      3. citas ocupadas
    ========================================= */
    const citas = await pool.request().input("fecha", sql.Date, fecha).query(`
        SELECT FORMAT(Hora, 'HH:mm') AS Hora
        FROM Citas
        WHERE CAST(Fecha AS DATE) = @fecha
      `);

    console.log(citas, horarios);

    const ocupadas = new Set(citas.recordset.map((c) => c.Hora));

    /* =========================================
      4. generar slots reales
      (cada 1 hora, limpio y seguro)
    ========================================= */
    const available = [];

    horarios.recordset.forEach((h) => {
      let start = new Date(`1970-01-01T${h.Hora_Inicio}`);
      const end = new Date(`1970-01-01T${h.Hora_Fin}`);

      while (start < end) {
        const hora = start.toTimeString().slice(0, 5);

        if (!ocupadas.has(hora)) {
          available.push(hora);
        }

        start = new Date(start.getTime() + 60 * 60000);
      }
    });

    console.log(available);

    res.json({
      availableHours: available,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error al obtener horarios",
    });
  }
};
