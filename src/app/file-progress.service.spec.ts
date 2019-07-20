import { TestBed } from '@angular/core/testing';

import { FileProgressService } from './file-progress.service';

describe('FileProgressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileProgressService = TestBed.get(FileProgressService);
    expect(service).toBeTruthy();
  });
});
