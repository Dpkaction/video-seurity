
import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import * as cryptoService from '../services/cryptoService';
import { downloadFile } from '../utils/helpers';
import ClipboardIcon from './icons/ClipboardIcon';
import DownloadIcon from './icons/DownloadIcon';

const KeyDisplay: React.FC<{ title: string; keyData: string }> = ({ title, keyData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(keyData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fileName = title.toLowerCase().replace(' ', '-') + '.json';
    downloadFile(keyData, fileName, 'application/json');
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold text-brand-text mb-2">{title}</h3>
      <div className="relative">
        <textarea
          readOnly
          value={keyData}
          className="w-full h-32 p-2 bg-brand-bg border border-gray-600 rounded-md text-sm text-brand-text-muted font-mono"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <button onClick={handleCopy} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-brand-text-muted" title="Copy to Clipboard">
            {copied ? <span className="text-xs text-brand-primary">Copied!</span> : <ClipboardIcon className="w-4 h-4" />}
          </button>
          <button onClick={handleDownload} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-brand-text-muted" title="Download Key">
            <DownloadIcon className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  );
};

const KeyGenerator: React.FC = () => {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateKeys = async () => {
    setIsLoading(true);
    setError('');
    setPublicKey('');
    setPrivateKey('');
    try {
      const keyPair = await cryptoService.generateRsaKeyPair();
      const pubKey = await cryptoService.exportKey(keyPair.publicKey);
      const privKey = await cryptoService.exportKey(keyPair.privateKey);
      setPublicKey(pubKey);
      setPrivateKey(privKey);
    } catch (e) {
      setError('Failed to generate keys. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Generate Keys" step={1}>
        <p className="text-brand-text-muted">
            Create a new public/private key pair. The public key is for encrypting, and the private key is for decrypting. 
            <span className="font-bold text-brand-secondary"> Keep your private key safe and do not share it.</span>
        </p>
      <div className="mt-4">
        <Button onClick={handleGenerateKeys} isLoading={isLoading}>
          Generate New Key Pair
        </Button>
      </div>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {publicKey && privateKey && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <KeyDisplay title="Public Key (JWK)" keyData={publicKey} />
          <KeyDisplay title="Private Key (JWK)" keyData={privateKey} />
        </div>
      )}
    </Card>
  );
};

export default KeyGenerator;
