import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  router: Router;

  constructor(rtr: Router) {
    this.router = rtr;
  }

  public viewUpload() {
    this.router.navigate(['/upload']);
  }

  public viewViewPortal() {
    this.router.navigate(['/viewPortal']);
  }
  ngOnInit() {
  }

}
