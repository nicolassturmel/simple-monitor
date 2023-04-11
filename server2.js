const express = require('express');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  const newSessionId = generateUniqueSessionId();
  const newSessionFile = path.join(__dirname, 'sessions', newSessionId + '.json');
  fs.writeFileSync(newSessionFile, JSON.stringify(createNewSession()));
  res.redirect('/' + newSessionId);
});

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

app.get('/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;

  if (sessionId.length === 10) {
    const sessionFile = path.join(__dirname, 'sessions', sessionId + '.json');
    if (!fs.existsSync(sessionFile)) {
      res.status(404).send('Session introuvable');
      return;
    }
  } else {
    res.status(404).send('URL incorrecte');
    return;
  }

  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour obtenir les données de session
app.get('/:sessionId/data', (req, res) => {
  const sessionId = req.params.sessionId;
  const sessionFile = path.join(__dirname, 'sessions', sessionId + '.json');
  const sessionData = fs.readFileSync(sessionFile, 'utf-8');
  res.send(sessionData);
});

// Route pour mettre à jour les données de session
app.post('/:sessionId/update', (req, res) => {
  const sessionId = req.params.sessionId;
  const sessionFile = path.join(__dirname, 'sessions', sessionId + '.json');
  const updatedData = req.body;
  fs.writeFileSync(sessionFile, JSON.stringify(updatedData));
  res.send({ success: true });
});

function generateUniqueSessionId() {
  const id = nanoid(10);
  if (fs.existsSync(`./sessions/${id}.json`)) {
    return generateUniqueSessionId();
  }
  return id;
}

function createNewSession() {
  return {
    settings: {},
    services: [],
  };
}

app.listen(port, () => {
  console.log(`Application en écoute sur le port ${port}`);
});
