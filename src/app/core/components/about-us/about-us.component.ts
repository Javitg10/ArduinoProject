import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  @ViewChild('demoElement') demoElement!: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  showCardSection: boolean = false;
  //Este metodo utiliza la variable dentro de un metodo asocidaco a un boton para mostrar las cards de presentacion de los dos integrantes
  showCards() {
    this.showCardSection = true;
  }
}
