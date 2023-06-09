import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketSubject } from 'rxjs/webSocket';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as Plotly from 'plotly.js-dist-min';
import Swal from 'sweetalert2';
import * as Papa from 'papaparse';


interface Lectura {
  dni: string;
  id: number;
  valor: number;
  fecha: string;
}

@Component({
  selector: 'app-datos',
  templateUrl: './datos.component.html',
  styleUrls: ['./datos.component.scss']
})
export class DatosComponent implements OnInit, OnDestroy, AfterViewInit{
  lecturas: Lectura[] = [];
  mensajeConexion: string = '';
  private socket$!: WebSocketSubject<any>;
  private destroy$ = new Subject<void>();
  private plotlyConfig: any;
  ArduinoON: boolean = false;
  hayDatos: boolean = false;
  stopConn: boolean = false;
  comParams: any;
  filtroFecha!:string;
  filtroDni!:string;
  
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  

  constructor(private http: HttpClient) {}
  ngAfterViewInit(): void {
    this.inicializarGrafico();
    this.actualizarGrafico();
  }
  ngOnInit(): void {
    
    this.iniciarWebSocket();
    // Restaurar estado desde el almacenamiento local
    const storedLecturas = localStorage.getItem('lecturas');
    if (storedLecturas) {
      this.lecturas = JSON.parse(storedLecturas);
    }

    const storedBtnActivo = localStorage.getItem('btnActivo');
    if (storedBtnActivo) {
      this.ArduinoON = JSON.parse(storedBtnActivo);
    }

    const storedHayDatos = localStorage.getItem('hayDatos');
    if (storedHayDatos) {
      this.hayDatos = JSON.parse(storedHayDatos);
    }

    const storedStopConn = localStorage.getItem('stopConn');
    if (storedStopConn) {
      this.stopConn = JSON.parse(storedStopConn);
    }
    const storedcomParams = localStorage.getItem('comParams');
    if (storedcomParams) {
      this.comParams = JSON.parse(storedcomParams);
    }
    

  }

  ngOnDestroy(): void {
    this.detenerWebSocket();
    this.destroy$.next();
    this.destroy$.complete();
  }
  resetearArduino(): void {
    this.iniciarWebSocket();
    this.http.post('http://localhost:3000/borrar_datos_actual', {}).subscribe(
      (response: any) => {
        this.mensajeConexion = response.mensaje;
        this.hayDatos = false;
        this.lecturas.splice(0, this.lecturas.length);
        this.actualizarGrafico();
        this.guardarEstadoLocalStorage();
        
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
        this.ArduinoON = false;
        this.stopConn = true;
        this.guardarEstadoLocalStorage();
      },
      (error: any) => {
        console.error(error);
        
      }
    );
  }
  reconectarArduino(): void {
    this.iniciarWebSocket();
    this.http.post('http://localhost:3000/conectar_arduino', this.comParams).subscribe(
      (response: any) => {
        this.mensajeConexion = response.mensaje;
        this.ArduinoON = true;
        this.stopConn = false;
        this.guardarEstadoLocalStorage();
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
        this.hayDatos = true;
        this.actualizarGrafico();
        this.guardarEstadoLocalStorage();
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
      this.lecturas.splice(0, this.lecturas.length);
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

  guardarEstadoLocalStorage() {
    // Guardar las variables en el almacenamiento local
    localStorage.setItem('lecturas', JSON.stringify(this.lecturas));
    localStorage.setItem('btnActivo', JSON.stringify(this.ArduinoON));
    localStorage.setItem('hayDatos', JSON.stringify(this.hayDatos));
    localStorage.setItem('stopConn', JSON.stringify(this.stopConn));
    localStorage.setItem('comParams', JSON.stringify(this.comParams));
  }


  construirArduino(): void{
    Swal.fire({
      title: 'Conectar con Arduino',
      html: `
        <input id="pathInput" class="swal2-input" placeholder="Ruta (ej: COM3)">
        <input id="baudRateInput" class="swal2-input" placeholder="Baud Rate (ej: 9600)">
        <input id="dataBitsInput" class="swal2-input" placeholder="Data Bits (ej: 8)">
        <input id="stopBitsInput" class="swal2-input" placeholder="Stop Bits (ej: 1)">
        <input id="parityInput" class="swal2-input" placeholder="Parity (ej: none)">
        <input id="dniInput" class="swal2-input" placeholder="DNI Paciente: (ej: 99223344X)">
      `,
      showCancelButton: true,
      confirmButtonText: 'Conectar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        return {
          path: (<HTMLInputElement>document.getElementById('pathInput')).value,
          baudRate: parseInt((<HTMLInputElement>document.getElementById('baudRateInput')).value),
          dataBits: parseInt((<HTMLInputElement>document.getElementById('dataBitsInput')).value),
          stopBits: parseInt((<HTMLInputElement>document.getElementById('stopBitsInput')).value),
          parity: (<HTMLInputElement>document.getElementById('parityInput')).value,
          currentDni: (<HTMLInputElement>document.getElementById('dniInput')).value
        };
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.comParams = result.value;
        this.guardarEstadoLocalStorage();
        this.iniciarWebSocket();
        this.http.post('http://localhost:3000/conectar_arduino', this.comParams).subscribe(
          (response: any) => {
            this.mensajeConexion = response.mensaje;
            this.ArduinoON = true;
            this.guardarEstadoLocalStorage();
          },
          (error: any) => {
            console.error(error);
          }
        );
      }
    });
  }

  generarCSV(): void {
    const csv = Papa.unparse(this.lecturas);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'lecturas.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  Filtro() {
    Swal.fire({
      title: 'Filtro por DNI y Fecha',
      html:
        '<input id="fecha" class="swal2-input" placeholder="Fecha" type="date">' +
        '<input id="dni" class="swal2-input" placeholder="DNI" type="text">',
      showCancelButton: true,
      confirmButtonText: 'Buscar',
      preConfirm: () => {
        this.filtroFecha = (document.getElementById('fecha') as HTMLInputElement).value;
        this.filtroDni = (document.getElementById('dni') as HTMLInputElement).value;
  
        this.realizarConsulta();
      }
    });
  }
  realizarConsulta() {
    const fecha = this.filtroFecha;
    const dni = this.filtroDni;
  
    // Realiza la consulta utilizando los valores de fecha y dni
  
    // Ejemplo de consulta utilizando HttpClient
    this.http.get('http://localhost:3000/consulta', { params: { fecha, dni } }).subscribe(
      (response: any) => {
        // Procesa la respuesta de la consulta
        console.log(response);
      },
      (error: any) => {
        console.error(error);
      }
    );
}
}