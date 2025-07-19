require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Base de datos simulada en memoria
let urlDatabase = [];

// Validar URL y acortar
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validación de formato de URL usando regex
  const urlRegex = /^(https?:\/\/)([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  const parsedUrl = urlParser.parse(originalUrl);

  // Verificar si el hostname realmente existe
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // Verificar si ya existe
      const existing = urlDatabase.find(u => u.original_url === originalUrl);
      if (existing) {
        return res.json(existing);
      }

      // Crear nuevo short_url
      const shortUrl = urlDatabase.length + 1;
      const newEntry = {
        original_url: originalUrl,
        short_url: shortUrl
      };
      urlDatabase.push(newEntry);
      res.json(newEntry);
    }
  });
});

// Redireccionar usando short_url
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const entry = urlDatabase.find(u => u.short_url === shortUrl);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.status(404).json({ error: 'No short URL found for the given input' });
  }
});

// Puerto
app.listen(port, function () {
  console.log(`Your app is listening on port ${port}`);
});

