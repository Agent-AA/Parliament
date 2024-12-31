const { NONAME } = require('dns');
const express = require('express');
const path = require('path')
const app = express();
const utils = require('./serverUtils');
const port = 8000;

app.use(express.urlencoded({ extended: true })); 

//#region ----- Webpage and static file requests -----
app.use(express.static(path.join(__dirname, '/webpage')));

app.head('/', (req, res) => {
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  if (req.query.session_id) {
    res.sendFile(path.join(__dirname, '/webpage/member.html'));
  } else {
    res.sendFile(path.join(__dirname, '/webpage/login.html'));
  }
});

app.get('/president', (req, res) => {
  res.sendFile(path.join(__dirname, '/webpage/president.html'));
});

app.get('/newSession', (req, res) => {
  sessionID = Math.floor(Math.random() * 10000);
  // fill in zeros so 5 digits long
  sessionID = sessionID.toString().padStart(5, '0');
  
  session = {
    "id": sessionID,
    "created_at": Date.now(),
  }
  
  utils.save(session);
  res.send(session);
});

//#endregion

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});