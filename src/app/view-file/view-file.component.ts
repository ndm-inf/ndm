import { Component, OnInit } from '@angular/core';
import {Buffer} from 'buffer';
import {RippleService} from '../ripple.service';
import {RippleFileService} from '../ripple-file.service';
import { FileUploadManagerService } from '../file-upload-manager.service';
import { FileDownloadManagerService } from '../file-download-manager.service';
import { FileProgressService } from '../file-progress.service';
import { FileDownloadProgressService } from '../file-download-progress.service';
import { ActivatedRoute } from '@angular/router';
import {FileMimeType} from '@taldor-ltd/angular-file-viewer';
import {FileSaverOptions} from 'file-saver';
import {FileModel} from '../file-model';
import { saveAs } from 'file-saver';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-view-file',
  templateUrl: './view-file.component.html',
  styleUrls: ['./view-file.component.scss']
})
export class ViewFileComponent implements OnInit {
  fileDownloadManager: FileDownloadManagerService;
  fileProgressService: FileProgressService;
  fileDownloadProgressService: FileDownloadProgressService;
  toaster: ToastrService;

  Route: ActivatedRoute;
  roundRobinTest: string;
  roundRobinText: string;
  src: string;
  type: FileMimeType;
  CurrentFile: FileModel;

  public constructor(private fileUploadManagerSer: FileUploadManagerService,
    fileDownloadManagerSer: FileDownloadManagerService, fileProgressSer: FileProgressService,
    FileDownloadProgressSer: FileDownloadProgressService, route: ActivatedRoute, tstr: ToastrService) {
      this.fileDownloadManager = fileDownloadManagerSer;
      this.fileProgressService = fileProgressSer;
      this.fileDownloadProgressService = FileDownloadProgressSer;
      this.Route = route;
      this.toaster = tstr;
  }

  public async ViewFile(rootTx, minLedger) {
    try {
      const response = await this.fileDownloadManager.GetRootFile(rootTx, minLedger);

      if (response.mimeType.toLowerCase().includes('png')) {
        this.type = FileMimeType.PNG;
      } else  if (response.mimeType.toLowerCase().includes('pdf')) {
        this.type = FileMimeType.PDF;
      } else  if (response.mimeType.toLowerCase().includes('jpeg')) {
        this.type = FileMimeType.JPEG;
      } else if (response.mimeType.toLowerCase().includes('mp4')) {
        this.type = FileMimeType.MP4;
      } else {
        this.type = null;
        this.toaster.show('Cannot Preview File. Can download only',
           'Warning', {
            closeButton: true,
            disableTimeOut: true,
            toastClass: 'ngx-toastr tstr-warning'
           });
      }
      this.CurrentFile = response;
      this.src = 'data:' + response.mimeType + ';base64,'  + response.FileAsBase64;
      this.roundRobinText = response.MetaDataAsString;
    } catch {
      this.toaster.error('Error Retrieving File From Ripple Blockchain. Please confirm TX ID and Ledger are correct.',
      'ERROR', {
        closeButton: true,
        disableTimeOut: true
      });
    }
  }

  public async SaveFile() {
    const fileBytes = atob(this.CurrentFile.FileAsBase64);
    const fileByteArray = new Array(fileBytes.length);
    for (let i = 0; i < fileBytes.length; i++) {
      fileByteArray[i] = fileBytes.charCodeAt(i);
    }
    const byteArray = new Uint8Array(fileByteArray);
    const blb = new Blob([byteArray], {type: this.CurrentFile.mimeType});
    // const fs = window; // require('file-saver');
    // this.fs.saveAs(blb, this.CurrentFile.fileName);
    saveAs(blb, this.CurrentFile.fileName);
  }

  public async SaveMetaFile() {
    const fileBytes = atob(this.CurrentFile.FileAsBase64);
    const fileByteArray = new Array(fileBytes.length);
    for (let i = 0; i < fileBytes.length; i++) {
      fileByteArray[i] = fileBytes.charCodeAt(i);
    }
    const byteArray = new Uint8Array(fileByteArray);
    const blb = new Blob([this.CurrentFile.MetaDataAsString], {type: 'text/plain'});
    // const fs = window; // = require('file-saver');
    saveAs(blb, this.CurrentFile.fileName + '.meta.txt');
  }

  ngOnInit() {
    const param = this.Route.snapshot.params['txLedger'];
    const params = param.split('-');
    const tx = params[0];
    const minLedger: number = Number(params[1]);

    if (params.length === 3) {
      if (params[2] === 'testnet') {
        this.fileDownloadManager.rippleService.Config.IsDev = true;
        this.reInit(true);
      } else {
        this.reInit(false);
      }
    } else {
      this.reInit(false);
    }
    this.ViewFile(tx, minLedger);
  }

  async reInit(IsDev) {
    this.fileDownloadManager.rippleService.Config.IsDev = IsDev;
    await this.fileDownloadManager.rippleService.ReInit();
  }

}