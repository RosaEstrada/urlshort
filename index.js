require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: true })); // para leer body desde formulario
app.use(express.json());
app.use('/public', express.static(__dirname + '/public'));

// Página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Base de datos temporal en memoria
const urls = [];
let counter = 1;

// Validación de URL simple con regex
function isValidUrl(url) {
  const regex = /^https?:\/\/.+/;
  return regex.test(url);
}

// POST - acorta URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Guardar URL
  const shortUrl = counter++;
  urls.push({ original_url: originalUrl, short_url: shortUrl });

  res.json({
    original_url: originalUrl,
    short_url: shortUrl,
  });
});

// GET - redirigir a URL original
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const entry = urls.find(u => u.short_url === shortUrl);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Servidor
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});


