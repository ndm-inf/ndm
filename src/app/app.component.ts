import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'IndImmUI';
  router: Router;

  constructor(rtr: Router) {
    this.router = rtr;
  }

  public viewMain() {
    this.router.navigate(['/main']);
  }

  public viewUpload() {
    this.router.navigate(['/upload']);
  }

  public viewViewPortal() {
    this.router.navigate(['/viewPortal']);
  }

  public viewSecure() {
    this.router.navigate(['/anonymous']);
  }

  public viewDev() {
    this.router.navigate(['/dev']);
  }
}
