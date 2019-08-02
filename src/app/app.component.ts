import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'IndImmUI';
  router: Router;
  toaster: ToastrService;

  constructor(rtr: Router, tstr: ToastrService) {
    this.router = rtr;
    this.toaster = tstr;
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

  public viewIndex() {
    this.router.navigate(['/fileIndex']);
  }

  public popXRP() {
    this.toaster.success('rw2htZCsyJk8yNRYDxjiv9QFiZ2yqCQCPJ', 'XRP Address',
    {
      closeButton: true,
      disableTimeOut: true,
      toastClass: 'ngx-toastr tstr-success'
     });
  }

  public popXMR() {
    this.toaster.success('47Nye79bFFea5Crez8xS7zjjjwBTYbSBD9mxDLfBcNPSXejx8MXxRgy545GNVEGu2HbSTyfJhHfcod9VcXXiZcYw7x3x6se', 'XMR Address',
    {
      closeButton: true,
      disableTimeOut: true,
      toastClass: 'ngx-toastr tstr-success'
     });
  }
   public popBTC() {
    this.toaster.success('bc1q9nfy6f6t5rmd0pz0k4ygrycq7g2h5k5gg3a58k', 'BTC Address',
    {
      closeButton: true,
      disableTimeOut: true,
      toastClass: 'ngx-toastr tstr-success'
     });
  }
   public popETH() {
    this.toaster.success('0x4620b95421Fb2e04c203A7b7c836eC5C6C74fdC6', 'ETH Address',
    {
      closeButton: true,
      disableTimeOut: true,
      toastClass: 'ngx-toastr tstr-success'
     });
  }
   public popLTC() {
    this.toaster.success('LgiG6nz4Q7zuYdT6Z2KC6BWevRGMXqDbfP', 'LTC Address',
    {
      closeButton: true,
      disableTimeOut: true,
      toastClass: 'ngx-toastr tstr-success'
     });
  }
}
