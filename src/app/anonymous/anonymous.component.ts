import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-anonymous',
  templateUrl: './anonymous.component.html',
  styleUrls: ['./anonymous.component.scss']
})
export class AnonymousComponent implements OnInit, AfterViewInit {

  elmRef: ElementRef;
  constructor(private elementRef: ElementRef) {
    this.elmRef = elementRef;
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    // const homeelm = this.elmRef.nativeElement.ownerDocument.body.querySelector('#home');
    // homeelm.className = '';
    // homeelm.classList = null;
  }
}
