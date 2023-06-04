import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketSubject } from 'rxjs/webSocket';


interface Lectura {
  id: number;
  valor: number;
  fecha: string;
}

@Component({
  selector: 'app-datos',
  templateUrl: './datos.component.html',
  styleUrls: ['./datos.component.css']
})
export class DatosComponent {
  lecturas: Lectura[] = [];
  data: number[] = [];
  mensajeConexion: string = '';
  private socket$: WebSocketSubject<Lectura>;

  constructor(private http: HttpClient) {
    this.socket$ = new WebSocketSubject('ws://localhost:3030'); // Establecer conexión WebSocket
  }
  
  conectarArduino(): void {
    this.iniciarWebSocket();
    this.http.post('http://localhost:3000/conectar_arduino', {}).subscribe(
      (response: any) => {
        this.mensajeConexion = response.mensaje;
      },
      (error: any) => {
        console.error(error);
      }
    );
    
  }
  desconectarArduino(): void {
    this.detenerWebSocket();
    this.http.post('http://localhost:3000/desconectar_arduino', {}).subscribe(
      (response: any) => {
        this.mensajeConexion = response.mensaje;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }
  obtenerDatos(): void {
    this.http.post('http://localhost:3000/api/datos', {}).subscribe(
      (response: any) => {
        this.mensajeConexion = response.mensaje;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }
  iniciarWebSocket() {
    // Escuchar eventos de actualización de datos
    this.socket$.subscribe(
      (lectura) => {
        this.lecturas.push(lectura);
        console.log(lectura) // Agregar nueva lectura al array
      },
      (error) => {
        console.error('Error en la conexión WebSocket:', error);
      }
    );
  }

  detenerWebSocket() {
    if (this.socket$) {
      this.socket$.complete(); // Cerrar la conexión WebSocket 
    }
  }
}
