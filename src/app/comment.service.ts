import { Injectable } from '@angular/core';
import {RippleService} from './ripple.service';
import { Comment } from './comment';
import { RippleFileService } from './ripple-file.service';
import { IndImmConfigService } from './ind-imm-config.service';
import { ChunkingUtility } from './chunking-utility';
import { CommentModel } from './comment-model';
@Injectable({
  providedIn: 'root'
})
export class CommentService {
  rippleService: RippleService;
  rippleFileService: RippleFileService;
  config: IndImmConfigService;
  chunkingUtility: ChunkingUtility;

  constructor(private rippleSer: RippleService, private rippleFilSer: RippleFileService, cfg: IndImmConfigService) {
    this.rippleService = rippleSer;
    this.rippleFileService = rippleFilSer;
    this.config = cfg;
    this.chunkingUtility = new ChunkingUtility();
  }

  public async AddComment(comment: Comment, sender: string, secret: string, destination: string) {
    try {
      this.rippleService.AccountForSequence = sender;
      await this.rippleService.CheckSequence();

      await this.rippleFileService.CreateComment(comment, secret, sender, destination);
      return true;
    } catch {
      return false;
    }
  }

  public async GetComments(rootTx: string, addressCommentOn: string, minLedger: number) {
    await this.rippleService.ForceConnectIfNotConnected();
    while (!this.rippleService.Connected) {
      await this.chunkingUtility.sleep(1000);
    }

    const max = this.rippleService.maxLedgerVersion;

    const unfilteredResults: any[] = await this.rippleService.api.getTransactions(addressCommentOn,
      {minLedgerVersion: minLedger, maxLedgerVersion: max});

      const retSet: CommentModel[] = [];


      for (let i = 0; i < unfilteredResults.length; i++) {
        if ('memos' in unfilteredResults[i].specification) {
            const cmt: CommentModel  = JSON.parse(unfilteredResults[i].specification.memos[0].data);
            if (cmt.RootTx === rootTx) {
              cmt.Time = new Date(unfilteredResults[i].outcome.timestamp);
              retSet.push(cmt);
            }
          }
        }

      return retSet;
  }

  public async GetLegacyCommentAddress() {
    if (this.config.IsDev) {
      return 'rhbGq81VvStY2vpp8kSF3CoA4zy4o4ZtSu';
    } else {
      return 'rkySYx989kzMFJfcz6mesAqi2WCbvMW54';
    }
  }


  public async GetRandomAddressForComment(): Promise<string> {
    if (this.config.IsDev) {
      return 'rE4zX2TyAXgQSDsQ7qYDC6NkernTFcqYAq';
    } else {
      return 'rwieXDroRogz8EQq5hTGMgxi5k7Cvae2dZ';
    }
  }
}
