import { Component, OnInit } from '@angular/core';
import {Buffer} from 'buffer';
import {RippleService} from '../ripple.service';
import {RippleFileService} from '../ripple-file.service';
import { FileUploadManagerService } from '../file-upload-manager.service';
import { FileDownloadManagerService } from '../file-download-manager.service';
import {FileProgressService} from '../file-progress.service';
import { FileDownloadProgressService } from '../file-download-progress.service';
import {Router} from '@angular/router';
import {IndImmConfigService} from '../ind-imm-config.service';
import {MatSlideToggle} from '@angular/material';
import {ToastrService} from 'ngx-toastr';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  IsDev = true;

  showViewFileButton = false;
  showIndexingFile = false;

  fileToUpload: File = null;
  fileAsBase64: string;
  fileMetaData = '';
  description = '';

  fileUploadManager: FileUploadManagerService;
  fileDownloadManager: FileDownloadManagerService;
  fileProgressService: FileProgressService;
  fileDownloadProgressService: FileDownloadProgressService;
  config: IndImmConfigService;
  toaster: ToastrService;
  dialog: MatDialog;

  Router: Router;
  roundRobinTest: string;
  roundRobinText: string;

  mostRecentTxId: string;
  secret = '';
  sender = '';
  xrpBalance = 0;
  estCost = 0;
  fileLink = '';


  toggle() {
    this.config.IsDev = this.IsDev;
    this.fileUploadManager.rippleService.ReInit();
    this.fileUploadManager.EmptyMinLedgerVersions();
  }

  public handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    const reader = new FileReader();
    this.fileProgressService.Reset();
    reader.onload = (e) => {
      const fileAsBuffer = Buffer.from(btoa(<string>reader.result), 'base64');
      this.fileAsBase64 =  fileAsBuffer.toString('base64');
      this.RefreshBalanceAndEstimate();
    };

    reader.readAsBinaryString(this.fileToUpload);
  }

  public async RefreshBalanceAndEstimate() {
    if (this.sender.length > 0) {
      this.xrpBalance = await this.fileUploadManager.rippleService.GetXRPBalance(this.sender);
    }
    if (this.fileToUpload) {
    this.estCost =  0.0000027 * (this.fileToUpload.size);
    }
  }

  public async UploadFile() {
    if (this.fileToUpload === null) {
      this.toaster.warning('No File Chosen', 'Please choose a file to upload');
      return;
    }

    if (this.sender.length === 0) {
      this.toaster.warning('No XRP Addressed', 'Please enter an XRP address');
      return;
    }

    if (this.secret.length === 0) {
      this.toaster.warning('No XRP Secret', 'Please enter the secret for your XRP address');
      return;
    }

    if (!(await this.fileUploadManager.rippleService.DoesAccountExist(this.sender))) {
      this.toaster.warning('Account does not Exit', 'Please verify your XRP Address');
      return;
    }

    if (!await this.fileUploadManager.rippleService.IsSenderSecretValid(this.sender, this.secret)) {
      this.toaster.warning('Invalid Secret', 'Please verify the Secret entered for your XRP Address');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '650px',
      panelClass: 'custom-modalbox'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.UploadFileAndDisplay(this.fileAsBase64, this.fileMetaData);
      } else {
        this.toaster.warning('Uploading Aborted', 'Confirm was not entered in modal.');
      }
    });
  }

  public async Cancel () {
    this.toaster.error('Cancelling', 'Cancelling upload and refreshing');

    await this.fileUploadManager.rippleService.api.disconnect();
    location.reload();
  }
  public async UploadFileAndDisplay(fileAsBase64, fileMetaData) {
    if (fileMetaData.length === 0) {
      fileMetaData = 'File Contains no additional text';
    }
    this.fileUploadManager.SetCredentials(this.sender, this.secret);
    this.fileUploadManager.rippleService.AccountForSequence = this.sender;
    await this.fileUploadManager.rippleService.CheckSequence();

    const rootTx = await this.fileUploadManager.CreateFile(fileAsBase64, fileMetaData, this.fileToUpload.name,
      this.fileToUpload.type, '', '0.9');

    this.showIndexingFile = true;
    const indexTxId = await this.fileUploadManager.CreateFileIndex(rootTx, this.fileToUpload.name, this.fileToUpload.type,
      '', '0.9', this.description, this.fileToUpload.size);

    // await this.fileDownloadManager.rippleFileService.GetRootFileIndexItem(indexTxId, await this.fileUploadManager.GetMinLedgerVersion());

    this.showIndexingFile = false;

    this.fileProgressService.RootFileProcessing = false;
    this.fileProgressService.RootFileComplete = true;
    this.showViewFileButton = true;
    this.mostRecentTxId = rootTx;
    const ledger = await this.fileUploadManager.GetMinLedgerVersion();

    const fullLink = window.location.href;
    const stripLink = fullLink.replace(window.location.origin, '');
    const remainingDir = stripLink.replace('upload', '');
    const strippedDir = remainingDir.replace('/', '');
    if (this.fileUploadManager.rippleService.Config.IsDev) {
      this.fileLink = 'viewFile/' + rootTx + '-' + ledger + '-testnet';
    } else {
      this.fileLink = 'viewFile/' + rootTx + '-' + ledger;
    }
  }

  public constructor(private fileUploadManagerSer: FileUploadManagerService,
    fileDownloadManagerSer: FileDownloadManagerService, fileProgressSer: FileProgressService,
    FileDownloadProgressSer: FileDownloadProgressService, router: Router, cfg: IndImmConfigService,
    tstr: ToastrService, public dlg: MatDialog) {
      this.fileUploadManager = fileUploadManagerSer;
      this.fileDownloadManager = fileDownloadManagerSer;
      this.fileProgressService = fileProgressSer;
      this.fileDownloadProgressService = FileDownloadProgressSer;
      this.config = cfg;
      this.Router = router;
      this.toaster = tstr;
      this.dialog = dlg;
      this.fileUploadManager.rippleService.ForceConnectIfNotConnected();
  }

  public async ViewFile() {
    if (!this.fileUploadManager.rippleService.Config.IsDev) {
      this.Router.navigate(['/viewFile', this.mostRecentTxId + '-' + await this.fileUploadManager.GetMinLedgerVersion()]);
    } else {
      this.Router.navigate(['/viewFile', this.mostRecentTxId + '-' + await this.fileUploadManager.GetMinLedgerVersion()
        + '-testnet']);
    }
  }

  ngOnInit() {
    this.IsDev = this.config.IsDev;
  }

}
