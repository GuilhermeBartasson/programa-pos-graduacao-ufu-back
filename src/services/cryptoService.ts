import * as crypto from 'crypto';

interface HashWithSaltResponse {
    hash: string,
    salt: string
}

class CryptoService {

    public static privateDecrypt(text: string): string {
        const privateKey: crypto.KeyObject = crypto.createPrivateKey({ key: process.env.PRIVATE_KEY as string });

        const decryptedPassword: string = 
            crypto.privateDecrypt({ 
                key: privateKey, passphrase: '', 
                padding: crypto.constants.RSA_PKCS1_PADDING
            }, Buffer.from(text, 'base64')).toString();

        return decryptedPassword;
    }

    public static hashAndReturnSalt(text: string): HashWithSaltResponse {
        const salt: string = this.generateSalt();
        const hasher: crypto.Hash = crypto.createHash('sha256');

        hasher.update(text + salt);
        const hash = hasher.digest('hex');

        return { hash, salt };
    }

    public static hash(text: string): string {
        const hasher: crypto.Hash = crypto.createHash('sha256');

        hasher.update(text);

        return hasher.digest('hex');
    }

    public static generateSalt(): string {
        return crypto.randomBytes(16).toString('hex');
    }

}

export { CryptoService, HashWithSaltResponse };