import express from "express";
import bodyParser from "body-parser";
import { google } from "googleapis";
import fs from "fs";

const app = express();
app.use(bodyParser.json());

// Cargar credenciales de service-account.json
const credentials = JSON.parse(fs.readFileSync("service-account.json", "utf8"));

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  SCOPES
);

const calendar = google.calendar({ version: "v3", auth });

// Ruta para listar eventos del calendario
app.get("/events", async (req, res) => {
  try {
    const result = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID, // Configura este en Render
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
    res.json(result.data.items);
  } catch (err) {
    console.error("Error al obtener eventos:", err);
    res.status(500).send("Error al obtener eventos");
  }
});

// Ruta para crear evento
app.post("/events", async (req, res) => {
  try {
    const { nombre, telefono, email, direccion, fecha, hora, servicio, nota } =
      req.body;

    const startDateTime = new Date(`${fecha}T${hora}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1h

    const event = {
      summary: `${servicio} - ${nombre}`,
      location: direccion,
      description: `Tel: ${telefono}\nEmail: ${email}\nNotas: ${nota}`,
      start: { dateTime: startDateTime, timeZone: "America/Chicago" },
      end: { dateTime: endDateTime, timeZone: "America/Chicago" },
    };

    const response = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID,
      requestBody: event,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error al crear evento:", err);
    res.status(500).send("Error al crear evento");
  }
});

// Render usa su propio puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
