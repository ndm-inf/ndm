import { TestBed } from '@angular/core/testing';

import { RippleService } from './ripple.service';

describe('RippleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RippleService = TestBed.get(RippleService);
    expect(service).toBeTruthy();
  });
});
