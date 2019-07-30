export class RootFile {
    public fileName: string;
    public mimeType: string;
    public sha256: string;
    public fileDetailTxId: string;
    public fileMetaDataDetailTxId: string;
    public fileDetailChunkCount: number;
    public fileMetaDataDetailChunkCount: number;
    public minLedgerVersion: number;
    public version: string;
    public cmtPtr: string;
}
