import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileProgressService {
  public TotalFileMetaDataChunks = 0;
  public TotalFileMetaDataChunksUploaded = 0;
  public TotalFileMetaDataChunksValidated = 0;
  public TotalFileMetaDataChunksUploadedPercent = 0;
  public TotalFileMetaDataChunksValidatedPercent = 0;

  public TotalFileDetailChunks = 0;
  public TotalFileDetailChunksUploaded = 0;
  public TotalFileDetailChunksValidated = 0;
  public TotalFileDetailChunksUploadedPercent = 0;
  public TotalFileDetailChunksValidatedPercent = 0;

  public FileDetailUploadComplete = false;
  public FileMetaDataUploadComplete = false;
  public FileDetailValidatedComplete = false;
  public FileMetaDataValidatedComplete = false;

  public RootFileProcessing = false;
  public RootFileComplete = false;

  public ShowHighFeeNotification = false;
  public ShowFatalError = false;
  public HighFeeAttemptCount = 0;

  constructor() {

  }

  public Reset() {
    this.TotalFileMetaDataChunks = 0;
    this.TotalFileMetaDataChunksUploaded = 0;
    this.TotalFileMetaDataChunksValidated = 0;
    this.TotalFileMetaDataChunksUploadedPercent = 0;
    this.TotalFileMetaDataChunksValidatedPercent = 0;
    this.TotalFileDetailChunks = 0;
    this.TotalFileDetailChunksUploaded = 0;
    this.TotalFileDetailChunksValidated = 0;
    this.TotalFileDetailChunksUploadedPercent = 0;
    this.TotalFileDetailChunksValidatedPercent = 0;
    this.FileDetailUploadComplete = false;
    this.FileMetaDataUploadComplete = false;
    this.FileDetailValidatedComplete = false;
    this.FileMetaDataValidatedComplete = false;
    this.RootFileProcessing = false;
    this.RootFileComplete = false;
    this.ShowHighFeeNotification = false;
    this.ShowFatalError = false;
    this.HighFeeAttemptCount = 0;
  }
}
