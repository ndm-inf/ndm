import { TestBed } from '@angular/core/testing';

import { FileUploadManagerService } from './file-upload-manager.service';

describe('FileUploadManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileUploadManagerService = TestBed.get(FileUploadManagerService);
    expect(service).toBeTruthy();
  });
});
