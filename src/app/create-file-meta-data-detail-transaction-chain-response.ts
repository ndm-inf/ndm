import {FileMetaDataDetail} from './file-meta-data-detail';

export class CreateFileMetaDataDetailTransactionChainResponse {
    public FileMetaDataDetails: FileMetaDataDetail[];
    public TxIds: string[];
    public RootTx: string;
}
