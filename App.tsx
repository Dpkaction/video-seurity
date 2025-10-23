
import React from 'react';
import KeyGenerator from './components/KeyGenerator';
import Encryptor from './components/Encryptor';
import Decryptor from './components/Decryptor';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-primary tracking-tight">
            Aegis Crypt
          </h1>
          <p className="text-brand-text-muted mt-2 text-lg">
            Client-Side Video Encryption & Authenticity Platform
          </p>
        </header>

        <main className="space-y-8">
          <KeyGenerator />
          <Encryptor />
          <Decryptor />
        </main>

        <footer className="text-center mt-12 text-brand-text-muted text-sm">
          <p>&copy; {new Date().getFullYear()} Aegis Crypt. All operations are performed locally in your browser.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
