const cors = require('cors');
const express = require('express');
const { SerialPort } = require('serialport');
const mysql = require('mysql');
const app = express();
app.use(cors());

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'arduino_datos',
});

// Conexión a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión a la base de datos establecida correctamente');
  }
});

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

  if (!isNaN(valor)) {
    // Mostrar el valor leído en la consola
    console.log('Valor leído: ' + valor);

    // Guardar el valor en el array
    datos.push(valor);
  }else{
    
  }

  // Obtener la fecha y hora actual con milisegundos
  const fechaHoraActual = new Date();
  const fechaHora = fechaHoraActual.toISOString().slice(0, 23).replace('T', ' ');

  // Insertar el valor y la fecha/hora en la base de datos
  const query = 'INSERT INTO lecturas (valor, fecha) VALUES (?, ?)';
  connection.query(query, [valor, fechaHora], (err, results) => {
    if (err) {
      console.error('Error al insertar en la base de datos:', err);
    }
    console.log('Valor insertado en la base de datos');
  });
  });

  app.get('/api/datos', function (req, res) {
    const query = 'SELECT * FROM lecturas';
    connection.query(query, function (err, results) {
      if (err) {
        console.error('Error al obtener los datos de la base de datos:', err);
        res.status(500).send('Error al obtener los datos de la base de datos');
      } else {
        res.json(results);
      }
    });
  });

  const port = 3000;
  app.listen(port, function () {
  console.log(`Servidor API iniciado en http://localhost:${port}`);
});


module.exports = app;



