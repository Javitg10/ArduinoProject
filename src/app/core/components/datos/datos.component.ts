import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-datos',
  templateUrl: './datos.component.html',
  styleUrls: ['./datos.component.css']
})
export class DatosComponent {
  datos$: Observable<number[]>;

  constructor(private http: HttpClient) {
    // Realizar una solicitud GET a la API REST y obtener los datos
    let url = 'http://localhost:3000/api/datos'
    this.datos$ = this.http.get<number[]>(url);
  }
  ejecutarArchivo() {
    const url = 'http://localhost:3000/ejecutar-archivo'; // Reemplaza con la URL de tu servidor
  this.http.get(url).subscribe(
    (response) => {
      console.log('Archivo ejecutado correctamente');
    },
    (error) => {
      console.error('Error al ejecutar el archivo', error);
    }
  );
  }
}
