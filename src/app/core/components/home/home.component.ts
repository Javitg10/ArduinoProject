import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('demoElement') demoElement!: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

    showCardSection: boolean = false;
  
    showCards() {
      this.showCardSection = true;
    }
        
}
