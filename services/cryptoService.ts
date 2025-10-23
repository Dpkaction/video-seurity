
import { EncryptedPackage } from '../types';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../utils/helpers';

const RSA_ALGORITHM = 'RSA-OAEP';
const HASH_ALGORITHM = 'SHA-256';
const AES_ALGORITHM = 'AES-GCM';

// Generate an RSA-OAEP key pair for wrapping/unwrapping the AES key
export async function generateRsaKeyPair(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    {
      name: RSA_ALGORITHM,
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: HASH_ALGORITHM,
    },
    true,
    ['wrapKey', 'unwrapKey']
  );
}

// Export a CryptoKey to its JWK string representation
export async function exportKey(key: CryptoKey): Promise<string> {
  const jwk = await window.crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(jwk, null, 2);
}

// Import a public key from its JWK string representation
export async function importPublicKey(jwkString: string): Promise<CryptoKey> {
    const jwk = JSON.parse(jwkString);
    return window.crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: RSA_ALGORITHM, hash: HASH_ALGORITHM },
        true,
        ['wrapKey']
    );
}

// Import a private key from its JWK string representation
export async function importPrivateKey(jwkString: string): Promise<CryptoKey> {
    const jwk = JSON.parse(jwkString);
    return window.crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: RSA_ALGORITHM, hash: HASH_ALGORITHM },
        true,
        ['unwrapKey']
    );
}

// Calculate the SHA-256 hash of an ArrayBuffer
export async function calculateSha256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest(HASH_ALGORITHM, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Encrypt a video file
export async function encryptVideo(videoBuffer: ArrayBuffer, publicKey: CryptoKey, videoFile: File): Promise<EncryptedPackage> {
  // 1. Calculate video hash
  const fileHash = await calculateSha256(videoBuffer);

  // 2. Generate AES key and IV
  const aesKey = await window.crypto.subtle.generateKey(
    { name: AES_ALGORITHM, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // 3. Encrypt video data
  const encryptedVideoBuffer = await window.crypto.subtle.encrypt(
    { name: AES_ALGORITHM, iv: iv },
    aesKey,
    videoBuffer
  );

  // 4. Wrap AES key with public RSA key
  const wrappedKeyBuffer = await window.crypto.subtle.wrapKey(
    'raw',
    aesKey,
    publicKey,
    { name: RSA_ALGORITHM }
  );
  
  // 5. Create package with Base64 encoded data
  return {
    fileHash,
    wrappedKey: arrayBufferToBase64(wrappedKeyBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    encryptedVideo: arrayBufferToBase64(encryptedVideoBuffer),
    videoFileName: videoFile.name,
    videoFileType: videoFile.type
  };
}

// Decrypt an encrypted package
export async function decryptPackage(encryptedPackage: EncryptedPackage, privateKey: CryptoKey): Promise<{decryptedVideo: ArrayBuffer, fileName: string, fileType: string}> {
  // 1. Decode Base64 data
  const wrappedKey = base64ToArrayBuffer(encryptedPackage.wrappedKey);
  const iv = base64ToArrayBuffer(encryptedPackage.iv);
  const encryptedVideo = base64ToArrayBuffer(encryptedPackage.encryptedVideo);

  // 2. Unwrap AES key with private RSA key
  const aesKey = await window.crypto.subtle.unwrapKey(
    'raw',
    wrappedKey,
    privateKey,
    { name: RSA_ALGORITHM },
    { name: AES_ALGORITHM, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // 3. Decrypt video data
  const decryptedVideo = await window.crypto.subtle.decrypt(
    { name: AES_ALGORITHM, iv: iv },
    aesKey,
    encryptedVideo
  );

  // 4. Verify hash
  const calculatedHash = await calculateSha256(decryptedVideo);
  if (calculatedHash !== encryptedPackage.fileHash) {
    throw new Error('Hash mismatch: Video integrity compromised!');
  }

  return { decryptedVideo, fileName: encryptedPackage.videoFileName, fileType: encryptedPackage.videoFileType };
}
