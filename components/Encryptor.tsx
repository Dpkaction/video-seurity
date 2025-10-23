
import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';
import * as cryptoService from '../services/cryptoService';
import { EncryptedPackage } from '../types';
import { downloadFile, formatBytes } from '../utils/helpers';
import DownloadIcon from './icons/DownloadIcon';

const Encryptor: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [publicKey, setPublicKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<EncryptedPackage | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setResult(null);
      setError('');
    }
  };

  const handleEncrypt = async () => {
    if (!videoFile || !publicKey) {
      setError('Please select a video file and provide a public key.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      setStatus('Parsing public key...');
      const importedPublicKey = await cryptoService.importPublicKey(publicKey);

      setStatus('Reading video file...');
      const videoBuffer = await videoFile.arrayBuffer();

      setStatus(`Hashing video (${formatBytes(videoBuffer.byteLength)})... this may take a moment.`);
      const encryptedPackage = await cryptoService.encryptVideo(videoBuffer, importedPublicKey, videoFile);

      setResult(encryptedPackage);
      setStatus('Encryption complete!');
    } catch (e: any) {
      setError(`Encryption failed: ${e.message}. Ensure the public key is valid.`);
      console.error(e);
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };
  
  const handleDownloadPackage = () => {
    if (result) {
        const fileName = `${result.videoFileName}.enc`;
        downloadFile(JSON.stringify(result, null, 2), fileName, 'application/json');
    }
  }

  return (
    <Card title="Encrypt & Hash Video" step={2}>
        <p className="text-brand-text-muted mb-4">
            Upload a video and provide the public key to create an encrypted package. This package includes a unique SHA-256 hash (fingerprint) of your video.
        </p>
      <div className="space-y-4">
        <div>
          <label htmlFor="video-upload" className="block text-sm font-medium text-brand-text mb-1">Video File</label>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-brand-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-brand-bg hover:file:bg-cyan-300"
          />
           {videoFile && <p className="text-xs text-brand-text-muted mt-1">{videoFile.name} ({formatBytes(videoFile.size)})</p>}
        </div>
        <div>
          <label htmlFor="public-key" className="block text-sm font-medium text-brand-text mb-1">Public Key (JWK)</label>
          <textarea
            id="public-key"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="Paste the public key JSON here..."
            className="w-full h-32 p-2 bg-brand-bg border border-gray-600 rounded-md text-sm text-brand-text-muted font-mono"
          />
        </div>
        <div>
          <Button onClick={handleEncrypt} isLoading={isLoading} disabled={!videoFile || !publicKey}>
            Encrypt Video
          </Button>
        </div>
      </div>

      {isLoading && <Spinner message={status} />}
      {error && <p className="mt-4 text-red-400">{error}</p>}
      
      {result && (
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-lg font-semibold text-brand-primary">Encryption Successful!</h3>
            <p className="text-brand-text-muted mt-2">Your video is now hashed and encrypted. Download the secure package below.</p>
            <div className="mt-4">
                <p className="text-sm font-semibold text-brand-text">Video Hash (SHA-256 Fingerprint):</p>
                <p className="text-xs font-mono break-all text-brand-text-muted bg-brand-bg p-2 rounded-md mt-1">{result.fileHash}</p>
            </div>
            <div className="mt-4">
                <Button onClick={handleDownloadPackage}>
                    <DownloadIcon className="mr-2" />
                    Download Encrypted Package (.enc)
                </Button>
            </div>
        </div>
      )}
    </Card>
  );
};

export default Encryptor;
