//Constantes con las librerías necesarias.
const cors = require('cors');
const express = require('express');
const { SerialPort } = require('serialport');
const mysql = require('mysql');
const app = express();
const puerto = 3000;
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3030 });
const bodyParser = require('body-parser');
const moment = require('moment');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Variables para utilizar en el servidor
let comPort1;
let datos = [];
let currentDni;

//Función para enviar datos al cliente actualizados.
function enviarActualizaciones() {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const datosFormateados = JSON.stringify(datos);
        client.send(datosFormateados);
      }
    });
}

//Funciones app para interacturar con la BBDD y el cliente
app.delete('/eliminar_datos/:dni', (req, res)=>{
  // Obtener los parámetros enviados desde el cliente
  const dni = req.params.dni;
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
  // Eliminar todos los registros de la tabla "lecturas" asociados a un DNI.
  const query = `DELETE FROM lecturas WHERE dni = '${dni}'`;
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

//Función para conectarse con la placa Arduino y ir leyendo e insertando en datos[] el valor de pin analógico.
app.post('/conectar_arduino', (req, res) => {
  // Obtener los parámetros enviados desde el cliente
  const comParams = req.body; 
  currentDni = comParams.currentDni;
  // Realizar la configuración de la conexión con Arduino utilizando los parámetros recibidos
  comPort1 = new SerialPort({
    path: comParams.path,
    baudRate: comParams.baudRate,
    dataBits: comParams.dataBits,
    stopBits: comParams.stopBits,
    parity: comParams.parity,
  });
  //Abrir señal con Arduino
  comPort1.on('open', function () {});
  //Posible error al conectar
  comPort1.on('error', function (err) {
    res.json({mensaje: err.message})
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
      
      const fechaHora = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      const lectura = {
        dni: currentDni,
        id: datos.length + 1,
        valor: valor,
        fecha: fechaHora,
      };
      //Actualizar array datos y mandar sus actualizaciones
      datos.push(lectura);
      enviarActualizaciones();
    }
  });
  res.json({ mensaje: 'Conexión exitosa con Arduino, puede ver sus datos..' });
});

app.post('/borrar_datos_actual', (req, res) => {
  //Vaciar el array datos.
  datos.splice(0, datos.length);
  res.json({ mensaje: 'Los datos han sido borrados exitosamente' });
});

//Función para consultar todos los datos por DNI
app.post('/consultar_datos', (req, res) => {
  // Obtener los parámetros de búsqueda del cuerpo de la solicitud
  const filtroDniFecha = req.body;
  const dniSearch = filtroDniFecha.dniSearch;

  const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'arduino_datos',
    timezone: 'utc' // Establecer la zona horaria a UTC
  });

  // Conexión a la base de datos
  connection.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      res.status(500).json({ error: 'Error al conectar a la base de datos', });
    } else {
      console.log('Conexión a la base de datos establecida correctamente');
      //Consulta para seleccionar todos los valores correspondientes a un DNI
      let query = `SELECT * FROM lecturas WHERE dni = '${dniSearch}'`;
      // Ejecutar la consulta en la base de datos
      connection.query(query, (error, results) => {
        if (error) {
          console.error('Error al consultar los datos:', error);
          res.status(500).json({ error: 'Error al consultar los datos' });
        } else {
          // Ajustar la hora sumando 2 horas y restando 2, cambiar el formato a YYYY-MM-dd hh:mm:ss.mss y reemplazar T y Z
          const datosFormateados = results.map((dato) => {
            const fechaHora = new Date(dato.fecha);
            fechaHora.setHours(fechaHora.getHours() + 2 - 2);
            return {
              ...dato,
              fecha: fechaHora.toISOString().replace('T', ' ').replace('Z', ''),
            };
          });
          res.json(datosFormateados);
        }
      });
    }
  });
});

//Funcion para desconectarse de la placa de Arduino y dejar de enviar datos.
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


//Funciones para mantener los puertos activos
app.listen(puerto, function () {
  console.log(`Servidor API iniciado en http://localhost:${puerto}`);
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    
  });
});



