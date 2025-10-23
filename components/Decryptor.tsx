
import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';
import * as cryptoService from '../services/cryptoService';
import { EncryptedPackage } from '../types';
import { formatBytes } from '../utils/helpers';
import CheckIcon from './icons/CheckIcon';
import XCircleIcon from './icons/XCircleIcon';

type VerificationStatus = 'pending' | 'success' | 'failed';

const Decryptor: React.FC = () => {
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [decryptedVideoUrl, setDecryptedVideoUrl] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{name: string, type: string, size: number} | null>(null);

  useEffect(() => {
    return () => {
      if (decryptedVideoUrl) {
        URL.revokeObjectURL(decryptedVideoUrl);
      }
    };
  }, [decryptedVideoUrl]);

  const resetState = () => {
      setError('');
      setVerificationStatus('pending');
      if (decryptedVideoUrl) {
          URL.revokeObjectURL(decryptedVideoUrl);
      }
      setDecryptedVideoUrl(null);
      setVideoInfo(null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPackageFile(file);
      resetState();
    }
  };

  const handleDecrypt = async () => {
    if (!packageFile || !privateKey) {
      setError('Please select an encrypted package and provide your private key.');
      return;
    }

    setIsLoading(true);
    resetState();

    try {
      setStatus('Parsing private key...');
      const importedPrivateKey = await cryptoService.importPrivateKey(privateKey);
      
      setStatus('Reading encrypted package...');
      const packageContent = await packageFile.text();
      const encryptedPackage: EncryptedPackage = JSON.parse(packageContent);

      setStatus('Decrypting video and verifying hash...');
      const { decryptedVideo, fileName, fileType } = await cryptoService.decryptPackage(encryptedPackage, importedPrivateKey);

      const videoBlob = new Blob([decryptedVideo], { type: fileType });
      const url = URL.createObjectURL(videoBlob);

      setDecryptedVideoUrl(url);
      setVideoInfo({ name: fileName, type: fileType, size: decryptedVideo.byteLength });
      setVerificationStatus('success');

    } catch (e: any) {
      setError(`Decryption failed: ${e.message}. Check the private key or file integrity.`);
      setVerificationStatus('failed');
      console.error(e);
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  return (
    <Card title="Decrypt & Verify Authenticity" step={3}>
      <p className="text-brand-text-muted mb-4">
        Upload your encrypted <code>.enc</code> package and provide the corresponding private key to decrypt the video and verify its authenticity by checking its hash.
      </p>
      <div className="space-y-4">
        <div>
          <label htmlFor="package-upload" className="block text-sm font-medium text-brand-text mb-1">Encrypted Package (.enc)</label>
          <input
            id="package-upload"
            type="file"
            accept=".enc"
            onChange={handleFileChange}
            className="block w-full text-sm text-brand-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-brand-bg hover:file:bg-cyan-300"
          />
          {packageFile && <p className="text-xs text-brand-text-muted mt-1">{packageFile.name}</p>}
        </div>
        <div>
          <label htmlFor="private-key" className="block text-sm font-medium text-brand-text mb-1">Private Key (JWK)</label>
          <textarea
            id="private-key"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="Paste your private key JSON here..."
            className="w-full h-32 p-2 bg-brand-bg border border-gray-600 rounded-md text-sm text-brand-text-muted font-mono"
          />
        </div>
        <div>
          <Button onClick={handleDecrypt} isLoading={isLoading} disabled={!packageFile || !privateKey}>
            Decrypt & Verify
          </Button>
        </div>
      </div>

      {isLoading && <Spinner message={status} />}
      {error && verificationStatus === 'failed' && <p className="mt-4 text-red-400">{error}</p>}

      {verificationStatus === 'success' && decryptedVideoUrl && videoInfo && (
        <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-lg">
          <div className="flex items-center">
            <CheckIcon className="w-8 h-8 text-green-400 mr-3"/>
            <div>
                <h3 className="text-lg font-semibold text-green-300">Verification Successful</h3>
                <p className="text-green-300/80">Video is authentic and untampered.</p>
            </div>
          </div>
          <div className="mt-4">
            <video controls src={decryptedVideoUrl} className="w-full max-w-md mx-auto rounded-lg" />
            <div className="text-center mt-2 text-sm text-brand-text-muted">
                <p>{videoInfo.name} ({formatBytes(videoInfo.size)})</p>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'failed' && (
         <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-lg">
            <div className="flex items-center">
                <XCircleIcon className="w-8 h-8 text-red-400 mr-3"/>
                <div>
                    <h3 className="text-lg font-semibold text-red-300">Verification Failed</h3>
                    <p className="text-red-300/80">Video integrity compromised or invalid key/file provided.</p>
                </div>
            </div>
        </div>
      )}
    </Card>
  );
};

export default Decryptor;
