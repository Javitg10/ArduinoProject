const cors = require('cors');
const express = require('express');
const { SerialPort } = require('serialport');
const mysql = require('mysql');
const app = express();
const puerto = 3000;
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3030 });
app.use(cors());

let comPort1;
let datos = [];

function conectar_arduino() {
    comPort1 = new SerialPort({
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

          
          // Obtener la fecha y hora actual con milisegundos
          const fechaHoraActual = new Date();
          const fechaHora = fechaHoraActual.toISOString().slice(0, 23).replace('T', ' ');

          const lectura = {
              id: datos.length + 1,
              valor: valor,
              fecha: fechaHora
          };

          datos.push(lectura);
          console.log(datos);
          enviarActualizaciones();
      }
    })
    
}

function desconectar_arduino(){
    comPort1.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión:', err);
        } else {
          console.log('Conexión cerrada correctamente');
        }
    })
}
function enviarActualizaciones() {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(datos));
      }
    });
}

app.post('/conectar_arduino', (req, res) => {
    conectar_arduino();
    res.json({ mensaje: 'Conexión exitosa con Arduino' });
});

app.post('/desconectar_arduino', (req, res) => {
    desconectar_arduino();
    res.json({ mensaje: 'Conexión cerrada exitosamente' });
});

app.post('/api/datos', function (req, res) {
    
    res.json({ mensaje: 'Leyendo datos...' });
});


app.listen(puerto, function () {
console.log(`Servidor API iniciado en http://localhost:${puerto}`);
});

wss.on('connection', (ws) => {
  ws.send(JSON.stringify(datos)); // Enviar los datos existentes al cliente recién conectado
  ws.on('message', (message) => {
    // Recibir mensajes del cliente (si es necesario)
  });
});


