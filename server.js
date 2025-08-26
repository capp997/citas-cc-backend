import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { google } from "googleapis";
import { readFile } from "fs/promises";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === CONFIGURAR GOOGLE CALENDAR ===
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const calendarId = "0852db9a9c8f7d3de116efe057a11fb1716914caa21833cd0b0b26a93c8c259c@group.calendar.google.com";

// Autenticación con service-account.json
async function getAuthClient() {
  const keyFile = JSON.parse(await readFile("service-account.json", "utf-8"));
  const auth = new google.auth.GoogleAuth({
    credentials: keyFile,
    scopes: SCOPES,
  });
  return auth;
}

// === RUTA: Agregar evento ===
app.post("/add-event", async (req, res) => {
  try {
    const { nombre, telefono, email, direccion, fecha, hora, servicio, nota } = req.body;

    const auth = await getAuthClient();
    const calendar = google.calendar({ version: "v3", auth });

    const event = {
      summary: `${servicio} - ${nombre}`,
      location: direccion,
      description: `Notas: ${nota}\nTel: ${telefono}\nEmail: ${email}`,
      start: {
        dateTime: `${fecha}T${hora}:00-06:00`, // Ajusta zona horaria
        timeZone: "America/Chicago",
      },
      end: {
        dateTime: `${fecha}T${hora}:00-06:00`,
        timeZone: "America/Chicago",
      },
    };

    const response = await calendar.events.insert({
      auth,
      calendarId,
      resource: event,
    });

    res.json({ success: true, eventId: response.data.id });
  } catch (error) {
    console.error("Error al crear evento:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === RUTA: Obtener eventos ===
app.get("/events", async (req, res) => {
  try {
    const auth = await getAuthClient();
    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    res.json(response.data.items);
  } catch (error) {
    console.error("Error al listar eventos:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
