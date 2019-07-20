import { TestBed } from '@angular/core/testing';

import { FileDownloadProgressService } from './file-download-progress.service';

describe('FileDownloaProgressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileDownloadProgressService = TestBed.get(FileDownloadProgressService);
    expect(service).toBeTruthy();
  });
});
