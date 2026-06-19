import fs from 'fs';
import crypto from 'crypto';

const payload = JSON.parse(fs.readFileSync('test_output_token.json', 'utf8'));
const token = 'nonexistent';

const encKey = crypto.createHash('sha256').update(token + '-enc-v1').digest();
const iv = Buffer.from(payload.i, 'base64');
const decipher = crypto.createDecipheriv('aes-256-cbc', encKey, iv);
let decrypted = decipher.update(payload.e, 'base64', 'utf8');
decrypted += decipher.final('utf8');

console.log(decrypted.substring(0, 100));
