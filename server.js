const express = require('express');
const path = require('path')
const app = express();
const port = 8000;

//#region ----- Webpage and static file requests -----
app.use(express.static(path.join(__dirname, '/webpage/player')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/webpage/player/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '/webpage/admin/index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
//#endregion