import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketSubject } from 'rxjs/webSocket';
import { takeUntil, map } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
export class DatosComponent implements OnInit, OnDestroy {
  lecturas: Lectura[] = [];
  mensajeConexion: string = '';
  private socket$!: WebSocketSubject<any>;
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.iniciarWebSocket();
  }

  ngOnDestroy(): void {
    this.detenerWebSocket();
    this.destroy$.next();
    this.destroy$.complete();
  }

  conectarArduino(): void {
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
    this.socket$ = new WebSocketSubject('ws://localhost:3030');
    this.socket$
    .pipe(takeUntil(this.destroy$))
    .subscribe((lecturas: Lectura[]) => {
      this.lecturas = lecturas;
    });
  }

  detenerWebSocket() {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
