import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadProgressService {
  public TotalFileMetaDataChunks: number;
  public TotalFileMetaDataChunksDownloaded: number;
  public TotalFileMetaDataChunksDownloadedPercent: number;

  public TotalFileDetailChunks: number;
  public TotalFileDetailChunksDownloaded: number;
  public TotalFileDetailChunksDownloadedPercent: number;

  public FileDetailDownloadComplete = false;
  public FileMetaDataDownloadComplete = false;


  public RootFileDownloadProcessing = false;
  public RootFileDownloadComplete = false;

  public DownloadInWarningState = false;
  public AttemptsInWarningState = 0;
  public WarningStateSource = ''; // move to enum later

  public FileDownloadComplete = false;

  public ResetWarningState () {
    this.DownloadInWarningState = false;
    this.AttemptsInWarningState = 0;
    this.WarningStateSource = '';
  }
  constructor() { }
}
