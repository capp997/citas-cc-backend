import express from "express";
import { google } from "googleapis";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// Configuración Google Calendar
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const jwtClient = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  SCOPES
);

const calendar = google.calendar({ version: "v3", auth: jwtClient });

// Ruta para crear evento
app.post("/eventos", async (req, res) => {
  try {
    const { summary, description, start, end } = req.body;
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary,
        description,
        start: { dateTime: start },
        end: { dateTime: end },
      },
    });
    res.status(200).json({ message: "Evento creado", data: response.data });
  } catch (error) {
    console.error("Error al crear evento:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verificar servidor
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
