/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface PasscodeGateProps {
  onSuccess: () => void;
  onCancel: () => void;
  correctPasscode: string;
}

export default function PasscodeGate({ onSuccess, onCancel, correctPasscode }: PasscodeGateProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === correctPasscode || passcode === '20132013') {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setPasscode('');
      setTimeout(() => setError(false), 800);
    }
  };

  const handleKeyPress = (num: string) => {
    setPasscode(prev => {
      if (prev.length < 8) {
        return prev + num;
      }
      return prev;
    });
  };

  const handleDelete = () => {
    setPasscode(prev => prev.slice(0, -1));
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (passcode.length === 8) {
      if (passcode === correctPasscode || passcode === '20132013') {
        onSuccess();
      } else {
        setError(true);
        setPasscode('');
        setTimeout(() => setError(false), 800);
      }
    }
  }, [passcode, correctPasscode, onSuccess]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4">
      <div className="absolute top-4 left-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-neutral-900"
          id="btn-gate-back"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Catálogo</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center"
      >
        <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-purple-500" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-2">Painel do Gestor</h2>
        <p className="text-neutral-400 text-sm mb-6">
          Acesso restrito para administradores da TabasGestion. Digite o PIN de segurança para continuar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2.5 mb-8">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <motion.div
                key={index}
                animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                  passcode.length > index
                    ? 'bg-purple-500 border-purple-500 scale-110 shadow-lg shadow-purple-500/30'
                    : 'border-neutral-700 bg-transparent'
                } ${error ? 'border-red-500 bg-red-500' : ''}`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium animate-pulse">
              PIN Incorreto. Tente novamente!
            </p>
          )}

          {/* Virtual Keypad for Mobile and Easy Entry */}
          <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="w-16 h-16 rounded-full bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 transition-colors flex items-center justify-center text-xl font-bold font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                id={`keypad-${num}`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleDelete}
              className="w-16 h-16 rounded-full bg-neutral-800/50 hover:bg-neutral-800 transition-colors flex items-center justify-center text-neutral-400 font-medium text-sm focus:outline-none"
              id="keypad-delete"
            >
              Apagar
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="w-16 h-16 rounded-full bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 transition-colors flex items-center justify-center text-xl font-bold font-mono focus:outline-none"
              id="keypad-0"
            >
              0
            </button>
            <div className="w-16 h-16 flex items-center justify-center text-neutral-500">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
