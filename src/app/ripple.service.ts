import { Injectable } from '@angular/core';
import { ChunkingUtility } from './chunking-utility';
import { GeneralResult } from './general-result';
import { IndImmConfigService } from './ind-imm-config.service';
import {ToastrService} from 'ngx-toastr';
declare var ripple: any;

@Injectable({
  providedIn: 'root'
})
export class RippleService  {
  api: any = null;
  public maxLedgerVersion: number;
  public earliestLedgerVersion: number;
  public Config: IndImmConfigService;
  toaster: ToastrService;
  public Connected = false;
  constructor(cfg: IndImmConfigService, tstr: ToastrService) {
    this.toaster = tstr;
    this.Config = cfg;
    // this.ConnectAPI();
   }

   public async ForceConnectIfNotConnected() {
     if (!this.Connected) {
       await this.ConnectAPI();
     }
   }

   public async ConnectAPI() {
    this.api = new ripple.RippleAPI({ server: this.Config.GetRippleServer() });

      this.api.connect()
      .then(() => {
          return this.api.getServerInfo();
        }).then((server_info) => {

          console.log(server_info.completeLedgers);
          const ledgers = server_info.completeLedgers.split('-');
          this.earliestLedgerVersion = Number(ledgers[0]);
          this.maxLedgerVersion = Number(ledgers[1]);
          this.api.on('ledger', ledger => {
            this.maxLedgerVersion = Number(ledger.ledgerVersion);
          });
          console.log('Most recent hash: ' + server_info.validatedLedger.hash);
          this.toaster.show('Connected to Ripple (' + this.Config.GetEnvironmentName() + '): '
           + this.Config.GetRippleServer(),
           'SUCCESS', {
            closeButton: true,
            disableTimeOut: true,
            toastClass: 'ngx-toastr tstr-success'
           });
           this.Connected = true;
           return;
        }).catch((error) => {
          this.toaster.error('Error Connecting to Ripple (' + this.Config.GetEnvironmentName() + '): '
          + this.Config.GetRippleServer(),
          'ERROR', {
            closeButton: true,
            disableTimeOut: true
          });
          console.log(error);
        }
      );

  }

  public async ReInit() {
    this.toaster.show('Re-Initializing to server: ' + this.Config.GetRippleServer());
    try {
      this.api.disconnect();
    } catch {

    }
    await this.ConnectAPI();
  }

  public async  DoesAccountExist(address) {
    try {
      const acct = await this.api.getAccountInfo(address);
      return true;
    } catch (e) {
      this.toaster.error(e.message,
          'ERROR', {
            closeButton: true,
            disableTimeOut: true
          });
      return false;
    }
  }
  public async GetXRPBalance(address) {
    try {
      const balances = await this.api.getBalances(address);
      for (let i = 0; i < balances.length; i++) {
        if (balances[i].currency === 'XRP')  {
          return balances[i].value;
        }
      }
      return 0;
    } catch (e) {
      this.toaster.error(e.message,
          'ERROR', {
            closeButton: true,
            disableTimeOut: true
          });
      return 0;
    }
  }

  public async IsSenderSecretValid(sender, secret) {
    try {
      // refactor to not use try catch
      const tx = await this.Prepare('test', sender);
      await this.SignAndSubmit(tx, secret);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  public async SignAndSubmit(trx, secret: string) {
    const response = this.api.sign(trx, secret);
    const txID = response.id;

    console.log('Identifying hash:', txID);
    const txBlob = response.signedTransaction;
    console.log('Signed blob:', txBlob);

    await this.doSubmit(txBlob).then((resultForSubmit) => {
        this.maxLedgerVersion = Number(resultForSubmit);
    });
    return txID;
  }

  public async doSubmit(txBlob) {
    const latestLedgerVersion = await this.api.getLedgerVersion();
    const result = await this.api.submit(txBlob);

    console.log('Tentative result code:', result.resultCode);
    console.log('Tentative result message:', result.resultMessage);

    return latestLedgerVersion + 1;
  }

  public async ValidateTransaction(txToValidate, minLedgerVersion) {
    const result: GeneralResult = new GeneralResult();

    console.log('Validating Hash: ' + txToValidate);

    try {
        const tx = await this.api.getTransaction(txToValidate, {minLedgerVersion: minLedgerVersion});

        console.log('Transaction result:', tx.outcome.result);
        console.log('Balance changes:', JSON.stringify(tx.outcome.balanceChanges));
        console.log('Entire tx:');
        console.log(tx);

        result.success = true;
        result.data = tx.outcome.ledgerVersion;
    } catch (error) {
        console.log('Couldn\'t get transaction outcome:', error);
        result.success = false;
    }
    return result;
  }

  public async Prepare(objectToPrepare, sender) {
    const chunkingUtility = new ChunkingUtility();

    const postAsHex = chunkingUtility.StringToHex(JSON.stringify(objectToPrepare));

    const preparedTx = await this.api.prepareTransaction({
      'TransactionType': 'Payment',
      'Account': sender,
      'Amount': this.api.xrpToDrops('0.000001'),
      'Memos': [
        {
            'Memo': {
                'MemoData': postAsHex.toUpperCase(),
                'MemoType': '6e646d2d76302e39'.toUpperCase()
            }
        }
      ],
      'Destination' : this.Config.DestinationAddress()
      // 'Destination' : 'rwDaZS6khko4v6jEV9wgVpxMyEWw9o1JPb'
      }, {
      'maxLedgerVersionOffset': 75
    });

    console.log('Prepared transaction instructions:', preparedTx.txJSON);
    console.log('Transaction cost:', preparedTx.instructions.fee, 'XRP');
    console.log('Transaction expires after ledger:', preparedTx.instructions.maxLedgerVersion);
    return preparedTx.txJSON;
  }
}
