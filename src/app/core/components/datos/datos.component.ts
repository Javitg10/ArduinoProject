import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartOptions, ChartDataset } from 'chart.js';

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
  
  constructor(private http: HttpClient) { }

  obtenerDatos(): void {
    this.http.get<Lectura[]>('http://localhost:3000/api/datos').subscribe(
      (data) => {
        this.lecturas = data;
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
    this.http.get<number[]>('http://localhost:3000/api/datos').subscribe(
    (data) => {
      this.data = data;
      this.crearGrafica();
    },
    (error) => {
      console.error('Error al obtener los datos:', error);
    }
  );
  }
  crearGrafica(): void {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
  
    if (ctx) {
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.data.map((_, index) => index.toString()),
          datasets: [{
            label: 'Datos desde Arduino',
            data: this.data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  
}
