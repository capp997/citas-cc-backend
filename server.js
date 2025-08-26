// server.js
import express from 'express';
import bodyParser from 'body-parser';
import { google } from 'googleapis';
import cors from 'cors';
import serviceAccount from './service-account.json' assert { type: "json" };

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  SCOPES
);

const calendar = google.calendar({ version: 'v3', auth });
const CALENDAR_ID = '0852db9a9c8f7d3de116efe057a11fb1716914caa21833cd0b0b26a93c8c259c@group.calendar.google.com';

app.post('/add-event', async (req, res) => {
  try {
    const { nombre, telefono, email, direccion, fecha, hora, servicio, nota } = req.body;

    const startDateTime = new Date(`${fecha}T${hora}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60*60*1000); // 1 hora

    const event = {
      summary: nombre,
      location: direccion,
      description: `Tel: ${telefono}\nEmail: ${email}\nServicio: ${servicio}\nNota: ${nota}`,
      start: { dateTime: startDateTime.toISOString() },
      end: { dateTime: endDateTime.toISOString() },
    };

    await calendar.events.insert({ calendarId: CALENDAR_ID, resource: event });
    res.json({ success: true, message: 'Evento agregado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
