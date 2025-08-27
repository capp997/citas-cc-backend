import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { google } from "googleapis";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuración de Google Calendar con Service Account
const calendar = google.calendar({ version: "v3" });

function getAuth() {
  return new google.auth.JWT(
    process.env.CLIENT_EMAIL, // del service account
    null,
    process.env.PRIVATE_KEY.replace(/\\n/g, "\n"), // Render guarda saltos de línea como \n
    ["https://www.googleapis.com/auth/calendar"]
  );
}

// ✅ Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend de C&C funcionando en Render");
});

// ✅ Crear evento en Google Calendar
app.post("/events", async (req, res) => {
  try {
    const { nombre, telefono, email, direccion, fecha, hora, servicio, nota } = req.body;

    const event = {
      summary: `${servicio} - ${nombre}`,
      description: `📞 Teléfono: ${telefono}\n✉️ Email: ${email}\n📍 Dirección: ${direccion}\n📝 Nota: ${nota}`,
      start: {
        dateTime: `${fecha}T${hora}:00`,
        timeZone: "America/Chicago",
      },
      end: {
        dateTime: `${fecha}T${hora}:00`,
        timeZone: "America/Chicago",
      },
      attendees: email ? [{ email }] : [],
      location: direccion,
    };

    const auth = getAuth();
    await calendar.events.insert({
      auth,
      calendarId: process.env.CALENDAR_ID,
      requestBody: event,
    });

    res.json({ message: "✅ Evento creado en Google Calendar" });
  } catch (error) {
    console.error("❌ Error al crear evento:", error);
    res.status(500).json({ error: "Error al crear evento", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
