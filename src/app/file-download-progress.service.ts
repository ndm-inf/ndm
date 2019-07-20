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

  public FileDownloadComplete = false;
  constructor() { }
}
