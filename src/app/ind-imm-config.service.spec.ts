import { TestBed } from '@angular/core/testing';

import { IndImmConfigService } from './ind-imm-config.service';

describe('IndImmConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IndImmConfigService = TestBed.get(IndImmConfigService);
    expect(service).toBeTruthy();
  });
});
