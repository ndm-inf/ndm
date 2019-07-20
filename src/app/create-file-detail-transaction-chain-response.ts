import {FileDetail} from './file-detail';

export class CreateFileDetailTransactionChainResponse {
    public FileDetails: FileDetail[];
    public TxIds: string[];
    public RootTx: string;
}
