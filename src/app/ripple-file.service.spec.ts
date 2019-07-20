import { TestBed } from '@angular/core/testing';

import { RippleFileService } from './ripple-file.service';

describe('RippleFileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RippleFileService = TestBed.get(RippleFileService);
    expect(service).toBeTruthy();
  });
});
