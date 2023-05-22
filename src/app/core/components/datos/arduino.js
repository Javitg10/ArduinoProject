const cors = require('cors'); // Importa el módulo cors
const { SerialPort } = require('serialport');
const { exec } = require('child_process');
const express = require('express');
const path = require('path');
const app = express();
app.use(cors()); // Habilita el middleware cors

// Crear un array para almacenar los valores leídos
let datos = [];

const comPort1 = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
});

comPort1.on('open', function () {
  console.log('Conexión establecida correctamente');
});

comPort1.on('error', function (err) {
  console.error('Error al conectar: ', err.message);
});

comPort1.on('data', function (data) {
  // Convertir el buffer recibido a un string
  let str = data.toString();

  // Parsear el valor del pin analógico
  let valor = parseInt(str);

  // Mostrar el valor leído en la consola
  console.log('Valor leído: ' + valor);

  // Guardar el valor en el array
  datos.push(valor);
});
app.get('/ejecutar-archivo', (req, res) => {
  const fileName = 'arduino.js'; // Nombre del archivo .js que deseas ejecutar
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
// Ruta para obtener los datos como JSON
app.get('/api/datos', function(req, res) {
  res.json(datos);
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, function() {
  console.log('Servidor iniciado en http://localhost:3000');
});