const cors = require('cors');
const express = require('express');
const { SerialPort } = require('serialport');
const mysql = require('mysql');
const app = express();
const puerto = 3000;
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3030 });
const bodyParser = require('body-parser');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let comPort1;
let datos = [];


function enviarActualizaciones() {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const datosFormateados = JSON.stringify(datos);
        client.send(datosFormateados);
      }
    });
}
app.delete('/eliminar_datos', (req, res)=>{
  const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'arduino_datos',
  });
  connection.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
    } else {
     
    }
  });
  console.log('Conexión a la base de datos establecida correctamente');

// Eliminar todos los registros de la tabla "lecturas"
  const query = 'DELETE FROM lecturas';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al eliminar los datos:', error);
      res.status(500).json({ error: 'Error al eliminar los datos de la tabla "lecturas"' });
    } else {
      console.log('Todos los registros de la tabla "lecturas" han sido eliminados correctamente');
      res.json({ mensaje: 'Todos los registros de la tabla "lecturas" han sido eliminados correctamente' });
    }
  });

});


app.post('/enviar_datos', (req, res) => {
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
      datos.forEach((lectura) => {
        const fecha = lectura.fecha;
        const valor = lectura.valor;

        // Insertar los valores en la base de datos
        const query = 'INSERT INTO lecturas (valor, fecha) VALUES (?, ?)';
        connection.query(query, [valor, fecha], (error, results) => {
          if (error) {
            console.error('Error al insertar los datos:', error);
            res.status(500).json({ error: 'Error al insertar los datos en la base de datos' });
          } else {
            console.log('Datos insertados correctamente:', results);
          }
        });
      });
      res.json({ mensaje: 'Datos correctamente enviados a la base de datos' });
    }
  });
  
});
app.post('/conectar_arduino', (req, res) => {
  const comParams = req.body; // Obtener los parámetros enviados desde el cliente

  // Realizar la configuración de la conexión con Arduino utilizando los parámetros recibidos
  comPort1 = new SerialPort({
    path: comParams.path,
    baudRate: comParams.baudRate,
    dataBits: comParams.dataBits,
    stopBits: comParams.stopBits,
    parity: comParams.parity,
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

      // Obtener la fecha y hora actual con milisegundos
      const fechaHoraActual = new Date();
      const fechaHora = fechaHoraActual.toISOString().slice(0, 23).replace('T', ' ');

      const lectura = {
        id: datos.length + 1,
        valor: valor,
        fecha: fechaHora,
      };

      datos.push(lectura);
      enviarActualizaciones();
    }
  });
  res.json({ mensaje: 'Conexión exitosa con Arduino' });
});
app.post('/borrar_datos_actual', (req, res) => {
  datos.splice(0, datos.length);
  res.json({ mensaje: 'Los datos han sido borrados exitosamente' });
});

app.post('/desconectar_arduino', (req, res) => {
  comPort1.close((err) => {
    if (err) {
      console.error('Error al cerrar la conexión:', err);
    } else {
      console.log('Conexión cerrada correctamente');
    }
  });
  res.json({ mensaje: 'Conexión cerrada exitosamente' });
});

app.post('/api/datos', function (req, res) {
  res.json({ mensaje: 'Leyendo datos...' });
});

app.listen(puerto, function () {
  console.log(`Servidor API iniciado en http://localhost:${puerto}`);
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Recibir mensajes del cliente (si es necesario)
  });
});


