import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import {ChunkingUtility} from './chunking-utility';
import {Buffer} from 'buffer';
import {RippleService} from './ripple.service';
import {RippleFileService} from './ripple-file.service';
import { GeneralResult } from './general-result';
import { FileDetail } from './file-detail';
import { RootFile } from './root-file';
import { CreateFileDetailTransactionChainResponse } from './create-file-detail-transaction-chain-response';
import { FileUploadStatus } from './file-upload-status.enum';
import { FileValidationStatus } from './file-validation-status.enum';
import { FileProgressService } from './file-progress.service';
import { RootFileIndex } from './root-file-index';
import { CommentService } from './comment.service';
@Injectable({
  providedIn: 'root'
})
export class FileUploadManagerService {
  rippleService: RippleService;
  rippleFileService: RippleFileService;
  fileProgressService: FileProgressService;
  chunkingUtility: ChunkingUtility;
  commentService: CommentService;

  secret: string;
  sender: string;
  minLedgerVersions: number[] = [];

  public UploadStatus: FileUploadStatus;
  public ValidationStatus: FileValidationStatus;

  constructor(private rippleSer: RippleService, private rippleFileSer: RippleFileService, fileProgressSer: FileProgressService,
      commentSer: CommentService) {
    this.rippleService = rippleSer;
    this.rippleFileService = rippleFileSer;
    this.fileProgressService = fileProgressSer;
    this.chunkingUtility = new ChunkingUtility();
    this.commentService = commentSer;
   }

  public EmptyMinLedgerVersions() {
    this.minLedgerVersions = [];
  }

  public SetCredentials(senderAddress, senderSecret) {
      this.sender = senderAddress;
      this.secret = senderSecret;
  }

  public async GetMinLedgerVersion() {
    let min = Number.POSITIVE_INFINITY;
    for (const value of this.minLedgerVersions) {
      min = Math.min(min, value);
    }
    console.log('Earliest ledger:' + min);
    return min;
  }

  public async CreateFile(fileAsBase64, fileMetaData, filename, fileType, sha, version) {
    this.EmptyMinLedgerVersions();
    this.minLedgerVersions.push(this.rippleService.maxLedgerVersion);
    this.fileProgressService.RootFileProcessing = true;
    const fileDetailTx = await this.CreateFileDetail(fileAsBase64);
    const fileMetaDataDetailTx =  await this.CreateFileMetaDataDetail(fileMetaData);

    const rootTx = await this.CreateRootFileBase(filename, fileType,
      sha, fileDetailTx.RootTx, fileMetaDataDetailTx.RootTx, fileDetailTx.FileDetails.length,
      fileMetaDataDetailTx.FileMetaDataDetails.length, version, await this.commentService.GetRandomAddressForComment());

    return rootTx;
  }

  public async CreateFileIndex(rootTx, filename, fileType, sha, version, description, size) {
    const fileIndex: RootFileIndex = new RootFileIndex();
    fileIndex.Ledger = await this.GetMinLedgerVersion();
    fileIndex.TxID = rootTx;
    fileIndex.description = description;
    fileIndex.fileName = filename;
    fileIndex.mimeType = fileType;
    fileIndex.sha256 = sha;
    fileIndex.size = size;
    fileIndex.Version = version;
    const txId = await this.rippleFileService.CreateFileIndexTransaction(fileIndex, this.secret, this.sender);

    while (true) {
      await this.chunkingUtility.sleep(5000);
      const isValidAndConfirmed = await this.rippleService.ValidateTransaction(txId,
                await this.GetMinLedgerVersion());
      if (isValidAndConfirmed.success) {
        this.minLedgerVersions.push(isValidAndConfirmed.data);
        console.log('Root Tx confirmed:' + txId);
        break;
      }
    }
    return txId;
  }

  public async CreateRootFileBase (filename: string, fileType: string, sha256: string, fileDetailTx: string,
    fileMetaDataDetailTx: string, fileDetailTxCount: number, fileMetaDataDetailTxCount: number, version: string,
      commentTxPointer: string) {

    this.fileProgressService.RootFileProcessing = true;

    const rootTxId = await this.rippleFileService.CreateRootFileTransaction(filename, fileType,
      sha256, fileDetailTx, fileMetaDataDetailTx, fileDetailTxCount, fileMetaDataDetailTxCount,
       await this.GetMinLedgerVersion(), version, this.secret, this.sender, commentTxPointer);

    while (true) {
      await this.chunkingUtility.sleep(5000);
      const isValidAndConfirmed = await this.rippleService.ValidateTransaction(rootTxId,
                await this.GetMinLedgerVersion());
      if (isValidAndConfirmed.success) {
        this.minLedgerVersions.push(isValidAndConfirmed.data);
        console.log('Root Tx confirmed:' + rootTxId);
        break;
      }
    }

    return rootTxId;
  }

   public async CreateFileDetail(fileAsBase64): Promise<CreateFileDetailTransactionChainResponse> {
    const imageAsBase64Array = await this.chunkingUtility.chunkStringToBase64Array(900, fileAsBase64);
    const fileDetailResponse =
      await this.rippleFileService.CreateFileDetailTransactionChain(imageAsBase64Array, this.secret, this.sender);
    const validatedFileDetailTxs: string[] = [];

    this.fileProgressService.FileDetailUploadComplete = true;


    console.log('FileDetailTransactionChain Complete:');

    this.fileProgressService.TotalFileDetailChunksValidated = 0;

    while (true) {
      console.log('Begin FileDetailTransactionChain Validation:');

      await this.chunkingUtility.sleep(5000);
      let validatedCounter = 0;

      for (let i = 0; i < fileDetailResponse.TxIds.length; i++) {
        if (validatedFileDetailTxs.indexOf(fileDetailResponse.TxIds[i]) > - 1) {
          validatedCounter++;
        } else {
          const isValidAndConfirmed = await this.rippleService.ValidateTransaction(fileDetailResponse.TxIds[i],
            await this.GetMinLedgerVersion());
          if (isValidAndConfirmed.success) {
            if (validatedFileDetailTxs.indexOf(isValidAndConfirmed.data) === - 1) {
              this.minLedgerVersions.push(isValidAndConfirmed.data);
            }

            validatedFileDetailTxs.push(fileDetailResponse.TxIds[i]);
            validatedCounter++;


            this.fileProgressService.TotalFileDetailChunksValidated = validatedCounter;
            this.fileProgressService.TotalFileDetailChunksValidatedPercent = Math.ceil(100 * (
              this.fileProgressService.TotalFileDetailChunksValidated / this.fileProgressService.TotalFileDetailChunks
            ));
          }
        }
      }

      console.log(validatedCounter + ' of ' + fileDetailResponse.TxIds.length);
      if (validatedCounter === fileDetailResponse.TxIds.length) {
        console.log('All File Transactions Validated');
        console.log('Root File Meta Data Transactions ID' + fileDetailResponse.RootTx);
        this.fileProgressService.FileDetailValidatedComplete = true;
        break;
      }
    }

    return fileDetailResponse;
  }

  public async CreateFileMetaDataDetail(metaData) {
    const validatedFileMetaDataDetailTxs: string[] = [];

    const metaDataTestAsArray = await this.chunkingUtility.chunkStringToBase64Array(900, metaData);

    const fileMetaDataDetailResponse =
      await this.rippleFileService.CreateFileMetaDataDetailTransactionChain(metaDataTestAsArray, this.secret, this.sender);

      this.fileProgressService.TotalFileMetaDataChunksValidated = 0;
      this.fileProgressService.FileMetaDataUploadComplete = true;

    while (true) {
      console.log('Begin CreateFileMetaDataDetailTransactionChain Validation:');

      await this.chunkingUtility.sleep(5000);

      let validatedCounter = 0;
      for (let i = 0; i < fileMetaDataDetailResponse.TxIds.length; i++) {
        if (validatedFileMetaDataDetailTxs.indexOf(fileMetaDataDetailResponse.TxIds[i]) > - 1) {
          validatedCounter++;
        } else {
          const isValidAndConfirmed = await this.rippleService.ValidateTransaction(fileMetaDataDetailResponse.TxIds[i],
            await this.GetMinLedgerVersion());
          if (isValidAndConfirmed.success) {
            if (validatedFileMetaDataDetailTxs.indexOf(isValidAndConfirmed.data) === - 1) {
              this.minLedgerVersions.push(isValidAndConfirmed.data);
            }

            validatedFileMetaDataDetailTxs.push(isValidAndConfirmed.data);
            validatedCounter++;

            this.fileProgressService.TotalFileMetaDataChunksValidated = validatedCounter;
            this.fileProgressService.TotalFileMetaDataChunksValidatedPercent = Math.ceil(100 * (
              this.fileProgressService.TotalFileMetaDataChunksValidated / this.fileProgressService.TotalFileMetaDataChunks
            ));
          }
        }
      }

      console.log(validatedCounter + ' of ' + fileMetaDataDetailResponse.TxIds.length);
      if (validatedCounter === fileMetaDataDetailResponse.TxIds.length) {
        console.log('All File Meta Data Transactions Validated');
        console.log('Root File Meta Data Transactions ID' + fileMetaDataDetailResponse.RootTx);
        this.fileProgressService.FileMetaDataValidatedComplete = true;
        break;
      }
    }
    return fileMetaDataDetailResponse;
  }
}
