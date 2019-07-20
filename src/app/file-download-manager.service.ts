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

   public async GetRootFile(rootTx, ledger): Promise<FileModel> {
    const returnModel: FileModel = new FileModel();

    this.fileDownloadProgressService.RootFileDownloadProcessing = true;

    const result: GeneralResult = await this.rippleFileService.GetRootFile(rootTx, ledger);
    if (result.success) {
      const rootFile: RootFile = result.data;

      returnModel.mimeType = rootFile.mimeType;
      returnModel.version = rootFile.version;
      returnModel.fileName = rootFile.fileName;

      returnModel.FileAsBase64 = await this.GetRawFile(rootFile, ledger);
      returnModel.MetaDataAsString = await this.GetRawFileDetail(rootFile, ledger);
    }

    this.fileDownloadProgressService.RootFileDownloadProcessing = false;
    this.fileDownloadProgressService.RootFileDownloadComplete = true;

    return returnModel;
  }

  public async GetRawFileDetail(rootFile: RootFile, ledger: string) {

    this.fileDownloadProgressService.TotalFileMetaDataChunks = rootFile.fileMetaDataDetailChunkCount;

    let parentFileResult: GeneralResult = await this.rippleFileService.GetFileDetail(rootFile.fileMetaDataDetailTxId, ledger);
    this.fileDownloadProgressService.TotalFileMetaDataChunksDownloaded = 1;
    this.fileDownloadProgressService.TotalFileMetaDataChunksDownloadedPercent = Math.ceil(100 * (
      this.fileDownloadProgressService.TotalFileMetaDataChunksDownloaded / this.fileDownloadProgressService.TotalFileMetaDataChunks
    ));
    let parentFileDetail: FileMetaDataDetail = parentFileResult.data;
    const fileDetailArray: FileMetaDataDetail[] = [];

    fileDetailArray.push(parentFileDetail);

    while (true) {
      if (parentFileDetail.NextTxPointer && parentFileDetail.NextTxPointer.length > 0) {
        parentFileResult = await this.rippleFileService.GetFileDetail(parentFileDetail.NextTxPointer, ledger);
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

    let parentFileResult: GeneralResult = await this.rippleFileService.GetFileDetail(rootFile.fileDetailTxId, ledger);
    let parentFileDetail: FileDetail = parentFileResult.data;
    const fileDetailArray: FileDetail[] = [];

    fileDetailArray.push(parentFileDetail);

    while (true) {
      if (parentFileDetail.NextTxPointer && parentFileDetail.NextTxPointer.length > 0) {
        parentFileResult = await this.rippleFileService.GetFileDetail(parentFileDetail.NextTxPointer, ledger);
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
