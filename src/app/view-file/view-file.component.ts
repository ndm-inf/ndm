import { Component, OnInit } from '@angular/core';
import { Buffer } from 'buffer';
import { RippleService } from '../ripple.service';
import { RippleFileService } from '../ripple-file.service';
import { FileUploadManagerService } from '../file-upload-manager.service';
import { FileDownloadManagerService } from '../file-download-manager.service';
import { FileProgressService } from '../file-progress.service';
import { FileDownloadProgressService } from '../file-download-progress.service';
import { ActivatedRoute } from '@angular/router';
import { FileMimeType } from '@taldor-ltd/angular-file-viewer';
import { FileSaverOptions } from 'file-saver';
import { FileModel } from '../file-model';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { CommentService } from '../comment.service';
import { Comment } from '../comment';
import { CommentModel } from '../comment-model';
import { ChunkingUtility } from '../chunking-utility';

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
  commentService: CommentService;

  Route: ActivatedRoute;
  roundRobinTest: string;
  roundRobinText: string;
  src: string;
  type: FileMimeType;
  CurrentFile: FileModel;
  comment: string;
  sender: string;
  secret: string;
  rootTx: string;
  minLedger: number;

  commentsLoading = false;
  commentsLoaded = false;
  commentsLoadedError = false;
  commentSubmitError = false;
  commentSubmitting = false;

  Comments: CommentModel[] = [];

  hideDefaultViewer = true;
  hideWebmViewer = true;
  hideGifViewer = true;

  public constructor(private fileUploadManagerSer: FileUploadManagerService,
    fileDownloadManagerSer: FileDownloadManagerService, fileProgressSer: FileProgressService,
    FileDownloadProgressSer: FileDownloadProgressService, route: ActivatedRoute, tstr: ToastrService,
    commentSer: CommentService) {
      this.fileDownloadManager = fileDownloadManagerSer;
      this.fileProgressService = fileProgressSer;
      this.fileDownloadProgressService = FileDownloadProgressSer;
      this.Route = route;
      this.toaster = tstr;
      this.commentService = commentSer;
  }

  public async ViewFile(rootTx, minLedger) {
    try {
      const response = await this.fileDownloadManager.GetRootFile(rootTx, minLedger);

      if (response.mimeType.toLowerCase().includes('png')) {
        this.type = FileMimeType.PNG;
        this.hideDefaultViewer = false;
        this.hideWebmViewer = true;
        this.hideGifViewer = true;
      } else  if (response.mimeType.toLowerCase().includes('pdf')) {
        this.type = FileMimeType.PDF;
        this.hideDefaultViewer = false;
        this.hideWebmViewer = true;
        this.hideGifViewer = true;
      } else  if (response.mimeType.toLowerCase().includes('jpeg')) {
        this.type = FileMimeType.JPEG;
        this.hideDefaultViewer = false;
        this.hideWebmViewer = true;
        this.hideGifViewer = true;
      } else if (response.mimeType.toLowerCase().includes('mp4')) {
        this.type = FileMimeType.MP4;
        this.hideDefaultViewer = false;
        this.hideWebmViewer = true;
        this.hideGifViewer = true;
      } else if (response.mimeType.toLowerCase().includes('webm')) {
        // this.type = FileMimeType.WEBM;
        this.hideDefaultViewer = true;
        this.hideWebmViewer = false;
        this.hideGifViewer = true;
      }  else if (response.mimeType.toLowerCase().includes('gif')) {
        // this.type = FileMimeType.GIF;
        this.hideDefaultViewer = true;
        this.hideWebmViewer = true;
        this.hideGifViewer = false;
      } else {
        this.type = null;
        this.toaster.show('Cannot Preview File. Can download only',
           'Warning', {
            closeButton: true,
            disableTimeOut: true,
            toastClass: 'ngx-toastr tstr-warning'
           });
           this.hideWebmViewer = true;

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

  public async AddComment() {
    if (this.comment.length === 0) {
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

    if (!(await this.fileDownloadManager.rippleService.DoesAccountExist(this.sender))) {
      this.toaster.warning('Account does not Exit', 'Please verify your XRP Address');
      return;
    }

    if (!await this.fileDownloadManager.rippleService.IsSenderSecretValid(this.sender, this.secret)) {
      this.toaster.warning('Invalid Secret', 'Please verify the Secret entered for your XRP Address');
      return;
    }

    const cmt: Comment = new Comment();
    cmt.Comment = this.comment;
    cmt.RootTx = this.rootTx;
    let addCmtResult = false;

    const cmtM: CommentModel = new CommentModel();
    cmtM.Comment = cmt.Comment;
    cmtM.RootTx = cmt.RootTx;
    cmtM.Name = cmt.Name;

    this.commentSubmitting = true;

    if (this.CurrentFile.cmtPtr && this.CurrentFile.cmtPtr.length > 0) {
      addCmtResult = await this.commentService.AddComment(cmt, this.sender, this.secret,
        await this.commentService.GetRandomAddressForComment());
    } else {
      addCmtResult = await this.commentService.AddComment(cmt, this.sender, this.secret,
        await this.commentService.GetLegacyCommentAddress());
    }
    if (addCmtResult) {
      cmtM.Time = new Date();
      this.Comments.push(cmtM);
      this.commentSubmitError = false;
    } else {
      this.commentSubmitError = true;
    }
    this.commentSubmitting = false;

  }

  public async RefreshComments() {
    while (this.commentService === null) {
      const cu: ChunkingUtility = new ChunkingUtility();
      await cu.sleep(1000);
    }
    try {
      console.log('refreshing comments');
      this.commentsLoadedError = false;
      this.commentsLoading = true;
      this.commentsLoaded = false;
      const cmts = await this.commentService.GetComments(this.rootTx, await this.commentService.GetLegacyCommentAddress(),
      this.minLedger);
      this.Comments = cmts.reverse();
      this.commentsLoadedError = false;
      this.commentsLoading = false;
      this.commentsLoaded = true;
    } catch {
      this.commentsLoadedError = true;
      this.commentsLoading = false;
      this.commentsLoaded = false;
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
    this.rootTx = tx;
    this.minLedger = minLedger;
    this.RefreshComments();
    this.ViewFile(tx, minLedger);
  }

  async reInit(IsDev) {
    this.fileDownloadManager.rippleService.Config.IsDev = IsDev;
    await this.fileDownloadManager.rippleService.ReInit();
  }

}
