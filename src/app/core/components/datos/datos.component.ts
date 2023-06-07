import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketSubject } from 'rxjs/webSocket';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as Plotly from 'plotly.js-dist-min';
import Swal from 'sweetalert2';


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
  private plotlyConfig: any;
  btnActivo: boolean = false;
  hayDatos: boolean = false;
  paginatedLecturas: Lectura[]=[]; // Arreglo de lecturas para mostrar en la página actual
  pageSize = 15; // Tamaño de página
  pageIndex = 0;
  
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.lecturas = [];
    this.paginatedLecturas = [];
    
  }

  ngOnDestroy(): void {
    this.detenerWebSocket();
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalPages(): number {
    return Math.ceil(this.lecturas.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i);
  }

 
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageIndex = page;
      this.paginatedLecturas = this.lecturas.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize);
    }
  }
  resetearArduino(): void {
    this.inicializarGrafico();
    this.iniciarWebSocket();
    this.http.post('http://localhost:3000/resetear_arduino', {}).subscribe(
      (response: any) => {
        this.mensajeConexion = response.mensaje;
        this.btnActivo = true;
        this.hayDatos = true;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }
  conectarArduino(): void {
    this.inicializarGrafico();
    this.iniciarWebSocket();
    this.http.post('http://localhost:3000/conectar_arduino', {}).subscribe(
      (response: any) => {
        this.mensajeConexion = response.mensaje;
        this.btnActivo = true;
        this.hayDatos = true;
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
        this.btnActivo = false;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  enviarDatos(): void {
    this.http.post('http://localhost:3000/enviar_datos', {}).subscribe(
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
        this.actualizarGrafico();
      });
  }

  detenerWebSocket() {
    if (this.socket$) {
      this.socket$.complete();
    }
  }

  inicializarGrafico() {
    this.plotlyConfig = {
      responsive: true
    };

    Plotly.newPlot(
      this.chartContainer.nativeElement,
      [{ y: [], type: 'scatter' }],
      { margin: { t: 0 } },
      this.plotlyConfig
    );
  }

  actualizarGrafico() {
    const yData = this.lecturas.map((lectura) => lectura.valor);
    const xData = this.lecturas.map((lectura) => {
      const fechaCompleta = new Date(lectura.fecha);
      const hora = fechaCompleta.getUTCHours().toString().padStart(2, '0');
      const minuto = fechaCompleta.getUTCMinutes().toString().padStart(2, '0');
      const segundo = fechaCompleta.getUTCSeconds().toString().padStart(2, '0');
      const milisegundos = fechaCompleta.getUTCMilliseconds().toString().padStart(3, '0');
      return `${hora}:${minuto}:${segundo}.${milisegundos}`;
    });
  
    Plotly.update(this.chartContainer.nativeElement, { x: [xData], y: [yData] }, {}, [0]);
  }
  confirmarEliminacion() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará todos los datos de la tabla de lectura. ¿Deseas continuar?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, borrar todo',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.http.delete('http://localhost:3000/eliminar_datos', {}).subscribe(
      (response: any) => {
        Swal.fire(
          'Eliminación exitosa',
          'Todos los datos de la tabla de lectura han sido eliminados.',
          'success'
        );
      },
      (error: any) => {
        Swal.fire(
          'Error',
          'Ocurrió un error al intentar eliminar los datos.',
          'error'
        );
      }
    );}else{
      console.log("Eliminación anulada.")
    }
  });}
}
