import { RootFile } from './root-file';

export class FileModel extends RootFile {
    public FileAsBase64: string;
    public FileAsBase64Display: string;
    public MetaDataAsString: string;
    public FileSize: number;
}
