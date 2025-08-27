// server.js o app.js (donde tienes Express configurado)
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend de C&C funcionando en Render");
});

// Aquí defines tus rutas reales, ejemplo:
app.post("/events", (req, res) => {
  // lógica para crear evento en Google Calendar
  res.json({ message: "Evento recibido" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
