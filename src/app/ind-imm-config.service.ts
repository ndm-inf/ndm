import { Injectable } from '@angular/core';
import {ConfigEnvironment} from './config-environment.enum';

@Injectable({
  providedIn: 'root'
})

export class IndImmConfigService {
  public Environment: ConfigEnvironment;
  public IsDev = false;

  constructor() {
  }

  public GetEnvironmentName(): string {
    if (!this.IsDev) {
      return 'PROD';
    } else {
      return 'DEV';
    }
  }

  public IndexDestinationAddress(): string {
    if (!this.IsDev) {
      return 'r3JSxad1Tu3Y6taRdg8VweZ3VA6a2AMHit'; // prod
    } else {
      return 'rnG5z3xL41RpLMnrHQXq49U851p57U1C4C';
    }
  }

  public DestinationAddress(): string {
    if (!this.IsDev) {
      return 'rw2htZCsyJk8yNRYDxjiv9QFiZ2yqCQCPJ'; // prod
    } else {
      return 'rwDaZS6khko4v6jEV9wgVpxMyEWw9o1JPb';
    }
  }

  public GetRippleServer(): string {
    if (!this.IsDev) {
      return 'wss://s1.ripple.com'; // 'wss://s2.ripple.com:51234';
    } else {
      return 'wss://s.altnet.rippletest.net:51233';
    }
  }
}
