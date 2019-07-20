import * as sjcl from 'sjcl';

export class ChunkingUtility {

    public async start(fileAsBase64: string) {
        const imageAsBase64Array = await this.chunkStringToBase64Array(900, fileAsBase64);
        return await this.dechunkBase64ArrayToString(imageAsBase64Array);
    }

    public async GetSha256(file) {
        const bitArray = sjcl.hash.sha256.hash(file);

        const digest_sha256 = sjcl.codec.hex.fromBits(bitArray);

        return digest_sha256;
    }

    public async chunkStringToBase64Array(chunkSize, imageAsBase64) {
        const imageCharLength = imageAsBase64.length;
        const numberOfChunks = Math.ceil(imageCharLength / chunkSize);
        const returnChunkImageArray  = [];

        console.log('Begin chunking');
        console.log('Image character length: ' + imageCharLength);
        console.log('Number of chunks needed: ' + numberOfChunks);
        console.log('SHA256: ' + await this.GetSha256(imageAsBase64));

        const currentChunkCounter = 0;
        for (let i = 0; i < numberOfChunks; i++) {

            let currentChunk = '';

            if (i === numberOfChunks - 1) {
                currentChunk = imageAsBase64.substring(i * chunkSize);
            } else {
                currentChunk = imageAsBase64.substring(i * chunkSize, i * chunkSize + chunkSize);
            }

            returnChunkImageArray.push(currentChunk);
        }
        return returnChunkImageArray;
    }

    public async dechunkBase64ArrayToString(imageAsBase64Array) {
        let imageAsBase64String = '';

        console.log('Begin dechunking');
        console.log('Number of Chunks: ' + imageAsBase64Array.length);

        for (let i = 0; i < imageAsBase64Array.length; i++) {
            imageAsBase64String = imageAsBase64String + imageAsBase64Array[i];
        }

        console.log('SHA256: ' + await this.GetSha256(imageAsBase64String));


        return imageAsBase64String;
    }

    public async bin2String(array) {
        let result = '';
        for (let i = 0; i < array.length; i++) {
          result += String.fromCharCode(parseInt(array[i], 2));
        }
        return result;
      }

    public async binb2rstr(input) {
        const str = [];
        for (let i = 0, n = input.length * 32; i < n; i += 8) {
            // tslint:disable-next-line:no-bitwise
            const code = (input[i >> 5] >>> (24 - i % 32)) & 0xFF;
            const val = String.fromCharCode(code);
            str.push(val);
        }
        return str.join('');
    }

    public StringToHex(stringToConvert) {
        // stringToConvert = encodeURI(stringToConvert);
        let hex, i;

        let result = '';
        for (i = 0; i < stringToConvert.length; i++) {
            hex = stringToConvert.charCodeAt(i).toString(16);
            result += hex; // ('000' + hex).slice(-4);
        }

        return result;
    }

    public async sleep(ms: number) {
        return new Promise(resolve => (setTimeout(resolve, ms)));
    }
}
