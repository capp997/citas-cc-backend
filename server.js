import express from "express";
import cors from "cors";
import { google } from "googleapis";

// Carga tus credenciales desde variable de entorno
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

const app = express();

// Configura CORS para tu frontend Netlify
app.use(cors({
  origin: "https://ccfamily.net", // reemplaza con tu URL real
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Configura Google Calendar
const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key.replace(/\\n/g, "\n"), // importante para saltos de línea
  ["https://www.googleapis.com/auth/calendar"]
);

const calendar = google.calendar({ version: "v3", auth });

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente en Render con Google Calendar!");
});

// Ruta para crear eventos
app.post("/eventos", async (req, res) => {
  try {
    const { summary, description, start, end } = req.body;

    if (!summary || !start || !end) {
      return res.status(400).json({ message: "Faltan campos obligatorios: summary, start, end" });
    }

    const event = {
      summary,
      description,
      start: { dateTime: start },
      end: { dateTime: end }
    };

    const response = await calendar.events.insert({
      calendarId: "primary", // Puedes cambiar por un calendario específico
      resource: event
    });

    res.status(201).json({ message: "Evento creado correctamente", evento: response.data });
  } catch (error) {
    console.error("Error al crear evento:", error);
    res.status(500).json({ message: "Error al crear evento", error: error.message });
  }
});

// Puerto dinámico de Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
