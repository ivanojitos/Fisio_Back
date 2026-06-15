const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const app = express();

app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rutas
app.use("/api", require("./routes/routes"));

app.use("/imagenes", express.static(path.join(__dirname, "imagenes")));
app.use("/uploads", express.static("uploads"));

module.exports = app;
