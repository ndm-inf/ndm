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
    this.toaster.success('rPSwPXyDYELvAYKDE9JTTm8DnkqqBAWkDx', 'XRP Address',
    {
      closeButton: true,
      disableTimeOut: true,
      toastClass: 'ngx-toastr tstr-success'
     });
  }

  public popXMR() {
    this.toaster.success('0x973d6f6810BfcF9b3C8D5CAD7cc3b22646459e9A', 'XMR Address',
    {
      closeButton: true,
      disableTimeOut: true,
      toastClass: 'ngx-toastr tstr-success'
     });
  }
   public popBTC() {
    this.toaster.success('13JVgkzZkGVomkvgnymfuZPtJ9ZhXRU1eg', 'BTC Address',
    {
      closeButton: true,
      disableTimeOut: true,
      toastClass: 'ngx-toastr tstr-success'
     });
  }
   public popETH() {
    this.toaster.success('0x973d6f6810bfcf9b3c8d5cad7cc3b22646459e9a', 'ETH Address',
    {
      closeButton: true,
      disableTimeOut: true,
      toastClass: 'ngx-toastr tstr-success'
     });
  }
   public popLTC() {
    this.toaster.success('ltc1qd69dtysjlahcanw3464phq8pxqtwqcly5pjeum', 'LTC Address',
    {
      closeButton: true,
      disableTimeOut: true,
      toastClass: 'ngx-toastr tstr-success'
     });
  }
}
