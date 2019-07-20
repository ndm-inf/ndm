import { TestBed } from '@angular/core/testing';

import { FileDownloadManagerService } from './file-download-manager.service';

describe('FileDownloadManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileDownloadManagerService = TestBed.get(FileDownloadManagerService);
    expect(service).toBeTruthy();
  });
});
