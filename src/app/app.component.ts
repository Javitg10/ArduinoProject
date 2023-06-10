import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{
  title = 'ArduinoMuscle';
//Este metodo hace que el scroll se vea de diferente manera
  ngAfterViewInit(): void {
    document.body.classList.add('scrollable');
  }
}
