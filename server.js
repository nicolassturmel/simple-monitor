const express = require('express');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const app = express();
const port = 3000;

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Gestion des sessions
app.use((req, res, next) => {
  const urlPath = req.path;
  const sessionId = urlPath.split('/')[1];
    console.log("use")
  if (sessionId.length === 10) {

    console.log("id : ",sessionId)
    const sessionFile = path.join(__dirname, 'sessions', sessionId + '.json');
    if (!fs.existsSync(sessionFile)) {
      res.status(404).send('Session introuvable');
      return;
    }
    req.sessionId = sessionId;
  } else {
    const newSessionId = generateUniqueSessionId();
    const newSessionFile = path.join(__dirname, 'sessions', newSessionId + '.json');
    fs.writeFileSync(newSessionFile, JSON.stringify(createNewSession()));
    res.redirect('/' + newSessionId);
    return;
  }

  next();
});

app.use(express.json());

app.get('/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    if (fs.existsSync(`./sessions/${sessionId}.json`)) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
      res.status(404).send('Session introuvable');
    }
  });

// Route pour obtenir les données de session
app.get('/:sessionId/data', (req, res) => {
  const sessionFile = path.join(__dirname, 'sessions', req.sessionId + '.json');
  const sessionData = fs.readFileSync(sessionFile, 'utf-8');
  res.send(sessionData);
});

// Route pour mettre à jour les données de session
app.post('/:sessionId/update', (req, res) => {
  const sessionFile = path.join(__dirname, 'sessions', req.sessionId + '.json');
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
