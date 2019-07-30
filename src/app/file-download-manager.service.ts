import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import {ChunkingUtility} from './chunking-utility';
import {Buffer} from 'buffer';
import {RippleService} from './ripple.service';
import {RippleFileService} from './ripple-file.service';
import { GeneralResult } from './general-result';
import { FileDetail } from './file-detail';
import { RootFile } from './root-file';
import {FileModel} from './file-model';
import { FileMetaDataDetail } from './file-meta-data-detail';
import { FileDownloadProgressService } from './file-download-progress.service';
import { RootFileIndex } from './root-file-index';
import { promise } from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadManagerService {
  rippleService: RippleService;
  rippleFileService: RippleFileService;
  chunkingUtility: ChunkingUtility;
  fileDownloadProgressService: FileDownloadProgressService;

  constructor(private rippleSer: RippleService, private rippleFileSer: RippleFileService,
    fileDownloadProgressSer: FileDownloadProgressService) {
    this.rippleService = rippleSer;
    this.rippleFileService = rippleFileSer;
    this.fileDownloadProgressService = fileDownloadProgressSer;
    this.chunkingUtility = new ChunkingUtility();
   }

   public async GetIndex(): Promise<RootFileIndex[]> {
    await this.rippleService.ForceConnectIfNotConnected();
    while (!this.rippleService.Connected) {
      await this.chunkingUtility.sleep(1000);
    }

    const min = this.rippleService.earliestLedgerVersion;
    const max = this.rippleService.maxLedgerVersion;

    const unfilteredResults: any[] = await this.rippleService.api.getTransactions(this.rippleService.Config.IndexDestinationAddress(),
      {minLedgerVersion: min, maxLedgerVersion: max});

      const retSet: RootFileIndex[] = [];

      for (let i = 0; i < unfilteredResults.length; i++) {
        if ('memos' in unfilteredResults[i].specification) {
            const indexItem: RootFileIndex  = JSON.parse(unfilteredResults[i].specification.memos[0].data);
            retSet.push(indexItem);
          }
        }
      return retSet;
    }



   public async GetRootFile(rootTx, ledger): Promise<FileModel> {
    const returnModel: FileModel = new FileModel();

    this.fileDownloadProgressService.RootFileDownloadProcessing = true;

    const result: GeneralResult = await this.rippleFileService.GetRootFile(rootTx, ledger);
    if (result.success) {
      const rootFile: RootFile = result.data;

      returnModel.mimeType = rootFile.mimeType;
      returnModel.version = rootFile.version;
      returnModel.fileName = rootFile.fileName;
      returnModel.minLedgerVersion = rootFile.minLedgerVersion;
      returnModel.FileAsBase64 = await this.GetRawFile(rootFile, ledger);
      returnModel.MetaDataAsString = await this.GetRawFileDetail(rootFile, ledger);
    }

    this.fileDownloadProgressService.RootFileDownloadProcessing = false;
    this.fileDownloadProgressService.RootFileDownloadComplete = true;

    return returnModel;
  }

  private async processGetFileDetail(txId, ledger, type): Promise<GeneralResult> {
    while (true) {
      const returnDetail = await this.rippleFileService.GetFileDetail(txId, ledger);
      if (returnDetail.success) {
        this.fileDownloadProgressService.ResetWarningState();
        return returnDetail;
      } else {
        this.chunkingUtility.sleep(3000);
        this.fileDownloadProgressService.WarningStateSource = type;
        this.fileDownloadProgressService.DownloadInWarningState = true;
        this.fileDownloadProgressService.AttemptsInWarningState++ ;
      }
    }
  }

  public async GetRawFileDetail(rootFile: RootFile, ledger: string) {

    this.fileDownloadProgressService.TotalFileMetaDataChunks = rootFile.fileMetaDataDetailChunkCount;
    let parentFileResult: GeneralResult;

    parentFileResult = await this.processGetFileDetail(rootFile.fileMetaDataDetailTxId, ledger,
      'Getting File Metadata contents - root file');

    this.fileDownloadProgressService.TotalFileMetaDataChunksDownloaded = 1;
    this.fileDownloadProgressService.TotalFileMetaDataChunksDownloadedPercent = Math.ceil(100 * (
      this.fileDownloadProgressService.TotalFileMetaDataChunksDownloaded / this.fileDownloadProgressService.TotalFileMetaDataChunks
    ));
    let parentFileDetail: FileMetaDataDetail = parentFileResult.data;
    const fileDetailArray: FileMetaDataDetail[] = [];

    fileDetailArray.push(parentFileDetail);

    while (true) {
      if (parentFileDetail.NextTxPointer && parentFileDetail.NextTxPointer.length > 0) {
        parentFileResult = await this.processGetFileDetail(parentFileDetail.NextTxPointer, ledger,
          'Getting File Metadata contents - root file detail');

        parentFileDetail = parentFileResult.data;
        fileDetailArray.push(parentFileDetail);
        this.fileDownloadProgressService.TotalFileMetaDataChunksDownloaded++;

        this.fileDownloadProgressService.TotalFileMetaDataChunksDownloadedPercent = Math.ceil(100 * (
          this.fileDownloadProgressService.TotalFileMetaDataChunksDownloaded / this.fileDownloadProgressService.TotalFileMetaDataChunks
        ));

      } else {
        break;
      }
    }
    this.fileDownloadProgressService.FileDetailDownloadComplete = true;
    console.log('File Detail Array:' + JSON.stringify(fileDetailArray));

    let fileAsString = '';
    for (let i = fileDetailArray.length - 1; i >= 0; i--) {
      fileAsString += fileDetailArray[i].data;
    }
    return fileAsString;
  }

  public async GetRawFile(rootFile: RootFile, ledger: string) {
    this.fileDownloadProgressService.TotalFileDetailChunks = rootFile.fileDetailChunkCount;
    this.fileDownloadProgressService.TotalFileDetailChunksDownloaded = 1;
    this.fileDownloadProgressService.TotalFileDetailChunksDownloadedPercent = Math.ceil(100 * (
      this.fileDownloadProgressService.TotalFileDetailChunksDownloaded / this.fileDownloadProgressService.TotalFileDetailChunks));
    let parentFileResult: GeneralResult;

    parentFileResult = await this.processGetFileDetail(rootFile.fileDetailTxId, ledger,
      'Getting File Metadata contents - root metadata');

    let parentFileDetail: FileDetail = parentFileResult.data;
    const fileDetailArray: FileDetail[] = [];

    fileDetailArray.push(parentFileDetail);

    while (true) {
      if (parentFileDetail.NextTxPointer && parentFileDetail.NextTxPointer.length > 0) {
        parentFileResult = await this.processGetFileDetail(parentFileDetail.NextTxPointer, ledger,
          'Getting File Metadata contents - metadata detail');

        parentFileDetail = parentFileResult.data;
        fileDetailArray.push(parentFileDetail);

        this.fileDownloadProgressService.TotalFileDetailChunksDownloaded++;

        this.fileDownloadProgressService.TotalFileDetailChunksDownloadedPercent = Math.ceil(100 * (
          this.fileDownloadProgressService.TotalFileDetailChunksDownloaded / this.fileDownloadProgressService.TotalFileDetailChunks));
      } else {
        break;
      }
    }
    this.fileDownloadProgressService.FileMetaDataDownloadComplete = true;

    console.log('File Detail Array:' + JSON.stringify(fileDetailArray));

    let fileAsBase64 = '';
    for (let i = fileDetailArray.length - 1; i >= 0; i--) {
      fileAsBase64 += fileDetailArray[i].data;
    }
    return fileAsBase64;
  }
}
