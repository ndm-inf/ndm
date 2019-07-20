import { Injectable } from '@angular/core';
import {ConfigEnvironment} from './config-environment.enum';

@Injectable({
  providedIn: 'root'
})

export class IndImmConfigService {
  public Environment: ConfigEnvironment;
  public IsDev = true;

  constructor() {
  }

  public GetEnvironmentName(): string {
    if (!this.IsDev) {
      return 'PROD';
    } else {
      return 'DEV';
    }
  }

  public DestinationAddress(): string {
    if (!this.IsDev) {
      return 'rJ383ZRZ1o4KCZKtDH2MDFehhaXKaiaDBu'; // prod
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
