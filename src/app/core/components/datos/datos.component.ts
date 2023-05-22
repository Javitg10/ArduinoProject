import { Component, OnInit } from '@angular/core';
import { SerialPort } from 'serialport';

@Component({
  selector: 'app-datos',
  templateUrl: './datos.component.html',
  styleUrls: ['./datos.component.css']
})
export class DatosComponent implements OnInit {
  datos: any[] = []; // Arreglo para almacenar los datos recibidos

  ngOnInit(): void {
    const comPort1 = new SerialPort({
      path: 'COM3',
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
    });

    comPort1.on('open', () => {
      console.log('Conexión establecida correctamente');
    });

    comPort1.on('error', (err: Error) => {
      console.error('Error al conectar: ', err.message);
    });

    comPort1.on('data', (data: Buffer) => {
      // Convertir el buffer recibido a un string
      const str: string = data.toString();

      // Parsear el valor del pin analógico
      const valor: number = parseInt(str);

      // Mostrar el valor leído en la consola
      console.log('Valor leído: ' + valor);

      // Agregar el dato al arreglo de datos
      this.datos.push({
        id: this.datos.length + 1,
        fecha: new Date().toLocaleString(),
        dato: valor
      });
    });
  }
}
