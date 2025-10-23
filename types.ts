
export interface EncryptedPackage {
  fileHash: string;
  wrappedKey: string;
  iv: string;
  encryptedVideo: string;
  videoFileName: string;
  videoFileType: string;
}
