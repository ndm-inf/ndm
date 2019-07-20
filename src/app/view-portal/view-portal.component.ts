import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
@Component({
  selector: 'app-view-portal',
  templateUrl: './view-portal.component.html',
  styleUrls: ['./view-portal.component.scss']
})
export class ViewPortalComponent implements OnInit {
  Router: Router;
  txID: string;
  minLedger: string;
  IsDev: false;
  constructor( router: Router) {
    this.Router = router;
   }

  public async ViewFile() {
    if (!this.IsDev) {
      this.Router.navigate(['/viewFile', this.txID + '-' + this.minLedger]);
    } else {
      this.Router.navigate(['/viewFile', this.txID + '-' + this.minLedger + '-testnet']);
    }
  }
  ngOnInit() {
  }

}
