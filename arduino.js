const { SerialPort } = require('serialport');
const app = require('./expressAPI');

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

app.get('/api/datos', function (req, res) {
  res.json(datos);
});

