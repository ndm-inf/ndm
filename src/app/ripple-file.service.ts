import { Injectable } from '@angular/core';
import { RippleService } from './ripple.service';
import { ChunkingUtility } from './chunking-utility';
import { FileDetail } from './file-detail';
import {CreateFileDetailTransactionChainResponse} from './create-file-detail-transaction-chain-response';
import {CreateFileMetaDataDetailTransactionChainResponse} from './create-file-meta-data-detail-transaction-chain-response';
import { from } from 'rxjs';
import { FileMetaDataDetail } from './file-meta-data-detail';
import {RootFile} from './root-file';
import { GeneralResult } from './general-result';
import {FileProgressService} from './file-progress.service';
import {RootFileIndex} from './root-file-index';
import { Comment } from './comment';

@Injectable({
  providedIn: 'root'
})
export class RippleFileService {
  rippleService: RippleService;
  chunkingUtility: ChunkingUtility;
  fileProgressService: FileProgressService;

  constructor(private rippleSer: RippleService,  fileProgressSer: FileProgressService) {
    this.rippleService = rippleSer;
    this.fileProgressService = fileProgressSer;
    this.chunkingUtility = new ChunkingUtility();
  }

  public async CreateFileIndexTransaction(rootFileIndex: RootFileIndex, secret, sender) {
    const tx = await this.rippleService.Prepare(rootFileIndex, sender, this.rippleService.Config.IndexDestinationAddress());
    const txId = await this.rippleService.SignAndSubmit(tx, secret);
    return txId;
  }
  public async CreateFileDetailTransactionChain(imageAsArrayOfBase64, secret, sender): Promise<CreateFileDetailTransactionChainResponse> {
    let prevTxId = '';
    this.fileProgressService.TotalFileDetailChunksUploaded = 0;
    const returnData = new CreateFileDetailTransactionChainResponse();
    const returnFileDetailArray: FileDetail[] = [];
    const returnTxArray: any[] = [];

    this.fileProgressService.TotalFileDetailChunks = imageAsArrayOfBase64.length;

    for (let i = 0; i < imageAsArrayOfBase64.length; i++) {
      const currentFileDetail: FileDetail = new FileDetail();
      currentFileDetail.data = imageAsArrayOfBase64[i];
      if (i > 0) {
        currentFileDetail.NextTxPointer = prevTxId;
      }
      const tx = await this.rippleService.Prepare(currentFileDetail, sender, this.rippleService.Config.DestinationAddress());
      prevTxId = await this.rippleService.SignAndSubmit(tx, secret);

      this.fileProgressService.TotalFileDetailChunksUploaded++;
      this.fileProgressService.TotalFileDetailChunksUploadedPercent = Math.ceil(100 * (
        this.fileProgressService.TotalFileDetailChunksUploaded / this.fileProgressService.TotalFileDetailChunks
      ));

      returnFileDetailArray.push(currentFileDetail);
      returnTxArray.push(prevTxId);
      returnData.RootTx = prevTxId;
    }
    returnData.FileDetails = returnFileDetailArray;
    returnData.TxIds = returnTxArray;

    return returnData;
  }

  public async CreateComment(comment: Comment, secret: string, sender: string, destination: string) {
    const tx = await this.rippleService.Prepare(comment, sender, destination);
    const txId = await this.rippleService.SignAndSubmit(tx, secret);
    return txId;
  }

  public async CreateFileMetaDataDetailTransactionChain(metaDataAsArray, secret, sender):
    Promise<CreateFileMetaDataDetailTransactionChainResponse> {
    let prevTxId = '';
    this.fileProgressService.TotalFileMetaDataChunksUploaded = 0;
    const returnData = new CreateFileMetaDataDetailTransactionChainResponse();
    const returnFileMetaDataDetailArray: FileMetaDataDetail[] = [];
    const returnTxArray: any[] = [];

    this.fileProgressService.TotalFileMetaDataChunks = metaDataAsArray.length;

    for (let i = 0; i < metaDataAsArray.length; i++) {
      const currentFileMetaDataDetail: FileMetaDataDetail = new FileMetaDataDetail();
      currentFileMetaDataDetail.data = metaDataAsArray[i];

      const tx = await this.rippleService.Prepare(currentFileMetaDataDetail, sender, this.rippleService.Config.DestinationAddress());
      prevTxId = await this.rippleService.SignAndSubmit(tx, secret);

      this.fileProgressService.TotalFileMetaDataChunksUploaded++;
      this.fileProgressService.TotalFileMetaDataChunksUploadedPercent = Math.ceil(100 * (
        this.fileProgressService.TotalFileMetaDataChunksUploaded / this.fileProgressService.TotalFileMetaDataChunks
      ));

      if (i > 0) {
        currentFileMetaDataDetail.NextTxPointer = prevTxId;
      }
      returnFileMetaDataDetailArray.push(currentFileMetaDataDetail);
      returnTxArray.push(prevTxId);
      returnData.RootTx = prevTxId;
    }
    returnData.FileMetaDataDetails = returnFileMetaDataDetailArray;
    returnData.TxIds = returnTxArray;

    return returnData;
  }

  public async CreateRootFileTransaction(fileName, mimeType, sha256, fileDetailTxId, fileMetaDataDetailTxId,
    fileDetailTxCount, fileMetaDataDetailCount, minLedgerVersion, version, secret, sender, commentTxPointer) {
    const rootFile: RootFile = new RootFile();
    rootFile.fileName = fileName;
    rootFile.mimeType = mimeType;
    rootFile.sha256 = sha256;
    rootFile.fileDetailTxId = fileDetailTxId;
    rootFile.fileMetaDataDetailTxId = fileMetaDataDetailTxId;
    rootFile.fileDetailChunkCount = fileDetailTxCount;
    rootFile.fileMetaDataDetailChunkCount = fileMetaDataDetailCount;
    rootFile.version = version;
    rootFile.minLedgerVersion = minLedgerVersion;
    rootFile.cmtPtr = commentTxPointer;

    const tx = await this.rippleService.Prepare(rootFile, sender, this.rippleService.Config.DestinationAddress());
    const txId = await this.rippleService.SignAndSubmit(tx, secret);

    return txId;
  }


  public async GetRootFile(txID, earliestLedgerVersion) {
    const response: GeneralResult = new GeneralResult();
    try {
        const tx = await this.rippleService.api.getTransaction(txID, {minLedgerVersion: earliestLedgerVersion});
        console.log('Entire tx:');
        console.log(tx);

        const memoAsHexString = tx.specification.memos[0];
        const rootFile: RootFile  = JSON.parse(memoAsHexString.data);

        console.log('Deserialized RootFile:');
        console.log(rootFile);

        response.data = rootFile;
        response.success = true;
    } catch (error) {
        console.log('Couldn\'t get transaction outcome:', error);
        response.success = false;
    }
    return response;
  }

  // Todo: refactor to use single getter with type as paramater
  public async GetRootFileIndexItem(txID, earliestLedgerVersion): Promise<GeneralResult> {
    const response: GeneralResult = new GeneralResult();
    response.data = '';
    try {
        const tx = await this.rippleService.api.getTransaction(txID, {minLedgerVersion: earliestLedgerVersion});

        console.log('Entire tx:');
        console.log(tx);

        const memoAsHexString = tx.specification.memos[0];
        const fileDetail: RootFileIndex  = JSON.parse(memoAsHexString.data);

        console.log('Deserialized RootFileIndex:');
        console.log(fileDetail);

        response.data = fileDetail;
        response.success = true;
    } catch (error) {
        console.log('Couldn\'t get transaction outcome:', error);
        response.success = false;
    }
    return response;
  }

  public async GetFileDetail(txID, earliestLedgerVersion) {
    const response: GeneralResult = new GeneralResult();
    response.data = '';
    try {
        const tx = await this.rippleService.api.getTransaction(txID, {minLedgerVersion: earliestLedgerVersion});

        console.log('Entire tx:');
        console.log(tx);

        const memoAsHexString = tx.specification.memos[0];
        const fileDetail: FileDetail  = JSON.parse(memoAsHexString.data);

        console.log('Deserialized FileDetail:');
        console.log(fileDetail);

        response.data = fileDetail;
        response.success = true;
    } catch (error) {
        console.log('Couldn\'t get transaction outcome:', error);
        response.success = false;
    }
    return response;
  }

  public async GetFileMetaDataDetail(txID, earliestLedgerVersion) {
    const response: GeneralResult = new GeneralResult();
    response.data = '';
    try {
        const tx = await this.rippleService.api.getTransaction(txID, {minLedgerVersion: earliestLedgerVersion});

        console.log('Entire tx:');
        console.log(tx);

        const memoAsHexString = tx.specification.memos[0];
        const fileMetaData: FileMetaDataDetail  = JSON.parse(memoAsHexString.data);

        console.log('Deserialized FileMetaData:');
        console.log(fileMetaData);

        response.data = fileMetaData;
        response.success = true;
    } catch (error) {
        console.log('Couldn\'t get transaction outcome:', error);
        response.success = false;
    }
    return response;
  }
}
