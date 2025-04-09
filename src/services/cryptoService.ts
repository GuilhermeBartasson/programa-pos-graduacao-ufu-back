import * as crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import config from '../config/default.json';
import NodeRSA from 'node-rsa';

interface HashWithSaltResponse {
    hash: string,
    salt: string
}

class CryptoService {

    public static privateDecrypt(text: string): string {
        const keyRSA: NodeRSA = new NodeRSA(
            process.env.PRIVATE_KEY!.replace(/\\n/g, '\n'), 'private', { encryptionScheme: 'pkcs1' }
        )

        keyRSA.setOptions({ environment: 'browser' });

        return keyRSA.decrypt(text).toString();
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

    public static generateJwtToken(data: any): string {
        return jsonwebtoken.sign(data, process.env.PRIVATE_KEY as string, { algorithm: 'RS256', expiresIn: config.server.tokenExpireTime });
    }

    public static verifyJwtToken(token: string): boolean {
        try {
            jsonwebtoken.verify(token, process.env.PUBLIC_KEY as string, { algorithms: ['RS256'] });
        } catch (err: any) {
            console.error(err);
            return false;
        }

        return true;
    }

}

export { CryptoService, HashWithSaltResponse };