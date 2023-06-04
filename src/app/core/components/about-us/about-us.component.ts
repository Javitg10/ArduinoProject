import {Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
  
    showCards() {
      this.showCardSection = true;
    }
  }
