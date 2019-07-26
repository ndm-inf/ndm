import { Component, OnInit } from '@angular/core';
import { FileDownloadManagerService } from '../file-download-manager.service';
import { RootFileIndex } from '../root-file-index';
import {MatSlideToggle} from '@angular/material';
import { FileUploadManagerService } from '../file-upload-manager.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-file-index',
  templateUrl: './file-index.component.html',
  styleUrls: ['./file-index.component.scss']
})
export class FileIndexComponent implements OnInit {
  IsDev = true;

  FileDownloadManagerService: FileDownloadManagerService;
  FileUploadManager: FileUploadManagerService;
  Router: Router;

  items: RootFileIndex[];

  constructor(router: Router, fileDownloadManagerSer: FileDownloadManagerService, fileuploadManagerSer: FileUploadManagerService) {
    this.FileDownloadManagerService = fileDownloadManagerSer;
    this.FileUploadManager = fileuploadManagerSer;
    this.Router = router;
    this.loadIndex();
  }

  async loadIndex() {
    this.items =  await this.FileDownloadManagerService.GetIndex();
  }

  async toggle() {
    this.FileDownloadManagerService.rippleService.Config.IsDev = this.IsDev;
    await this.FileDownloadManagerService.rippleService.ReInit();
    this.FileUploadManager.EmptyMinLedgerVersions();
    this.items =  await this.FileDownloadManagerService.GetIndex();
  }

  ngOnInit() {
    this.IsDev =  this.FileDownloadManagerService.rippleService.Config.IsDev;
  }

  async ViewFile(item: RootFileIndex) {
    if (!this.IsDev) {
      this.Router.navigate(['/viewFile', item.TxID + '-' + item.Ledger]);
    } else {
      this.Router.navigate(['/viewFile',  item.TxID + '-' + item.Ledger
        + '-testnet']);
    }
  }

}
