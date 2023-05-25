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

  iniciarServidor() {
    const url = 'http://localhost:3000';
    this.http.get(url).subscribe(
      response => {
        console.log('Servidor iniciado correctamente');
      },
      error => {
        console.error('Error al iniciar el servidor', error);
      }
    );
  }

  iniciarRecoleccionDatos() {
    const url = 'http://localhost:3000/api/datos';
    this.http.get<number[]>(url).subscribe(
      data => {
        console.log('Datos recibidos:', data);
        // Aquí puedes realizar cualquier otra acción con los datos recibidos
      },
      error => {
        console.error('Error al obtener los datos', error);
      }
    );
  }
  ejecutarArchivo() {
    const url = 'http://localhost:3000/api/ejecutar-archivo'; // Reemplaza con la URL de tu servidor
    fetch(url)
      .then(response => {
        if (response.ok) {
          console.log('Archivo ejecutado correctamente');
        } else {
          console.error('Error al ejecutar el archivo');
        }
      })
      .catch(error => {
        console.error('Error al ejecutar el archivo', error);
      });
  }
}
