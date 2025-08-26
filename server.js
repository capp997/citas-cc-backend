const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Configura tu Service Account JSON
const serviceAccount = require('./service-account.json'); // Sube este archivo a Render

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const calendarId = 'TU_CALENDAR_ID@group.calendar.google.com';

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: SCOPES
});

const calendar = google.calendar({ version: 'v3', auth });

// Obtener eventos
app.get('/get-events', async (req, res) => {
  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: (new Date()).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = response.data.items.map(evt => ({
      nombre: evt.summary || '',
      telefono: evt.description?.split('|')[0] || '',
      email: evt.description?.split('|')[1] || '',
      direccion: evt.location || '',
      fecha: evt.start.dateTime ? evt.start.dateTime.split('T')[0] : evt.start.date,
      hora: evt.start.dateTime ? evt.start.dateTime.split('T')[1].slice(0,5) : '',
      servicio: evt.description?.split('|')[2] || '',
      nota: evt.description?.split('|')[3] || ''
    }));
    res.json(events);
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener los eventos' });
  }
});

// Agregar evento
app.post('/add-event', async (req, res) => {
  try {
    const { nombre, telefono, email, direccion, fecha, hora, servicio, nota } = req.body;
    const startDateTime = `${fecha}T${hora}:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60*60*1000).toISOString(); // +1 hora

    const event = {
      summary: nombre,
      location: direccion,
      description: `${telefono}|${email}|${servicio}|${nota}`,
      start: { dateTime: startDateTime, timeZone: 'America/Chicago' },
      end: { dateTime: endDateTime, timeZone: 'America/Chicago' },
    };

    await calendar.events.insert({ calendarId, resource: event });
    res.json({ success: true });
  } catch(err){
    console.error(err);
    res.status(500).json({ success: false, error: 'No se pudo agregar el evento' });
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
