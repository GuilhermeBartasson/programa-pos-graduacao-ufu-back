import * as crypto from 'crypto';

interface HashWithSaltResponse {
    hash: string,
    salt: string
}

class CryptoService {

    public static privateDecrypt(text: string): string {
        let privateKey: crypto.KeyObject = crypto.createPrivateKey({ key: process.env.PRIVATE_KEY as string });

        let decryptedPassword: string = 
            crypto.privateDecrypt({ 
                key: privateKey, passphrase: '', 
                padding: crypto.constants.RSA_PKCS1_PADDING
            }, Buffer.from(text, 'base64')).toString();

        return decryptedPassword;
    }

    public static hashWithSalt(text: string): HashWithSaltResponse {
        let salt: string = this.generateSalt();
        let hasher: crypto.Hash = crypto.createHash('sha256');

        hasher.update(text + salt);
        let hash = hasher.digest('hex');

        return { hash, salt };
    }

    public static generateSalt(): string {
        return crypto.randomBytes(16).toString('hex');
    }

}

export { CryptoService, HashWithSaltResponse };