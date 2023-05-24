const cors = require('cors');
const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(cors());

app.get('/ejecutar-archivo', (req, res) => {
  const fileName = 'arduino.js';
  const filePath = path.join(__dirname, fileName);

  exec(`node ${filePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el archivo: ${error.message}`);
      res.status(500).send('Error al ejecutar el archivo');
      return;
    }
    console.log(`Archivo ejecutado correctamente. Salida: ${stdout}`);
    res.send('Archivo ejecutado correctamente');
  });
});

app.listen(3000, function () {
  console.log('Servidor iniciado en http://localhost:3000');
});

module.exports = app;



