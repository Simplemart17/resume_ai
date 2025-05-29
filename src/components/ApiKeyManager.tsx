'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiKey, FiEye, FiEyeOff, FiCheck, FiX, FiInfo } from 'react-icons/fi';
import { apiKeyManager } from '@/utils/apiKeyManager';
import toast from 'react-hot-toast';

interface ApiKeyManagerProps {
  onApiKeySet?: (hasKey: boolean) => void;
}

export function ApiKeyManager({ onApiKeySet }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const hasKey = apiKeyManager.hasApiKey();
    setHasStoredKey(hasKey);
    
    // In production, show modal if no API key is found
    if (apiKeyManager.isProductionMode() && !hasKey) {
      setShowModal(true);
    }
    
    onApiKeySet?.(hasKey);
  }, [onApiKeySet]);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!apiKeyManager.validateApiKey(apiKey)) {
      toast.error('Invalid API key format. OpenAI keys start with "sk-"');
      return;
    }

    apiKeyManager.setApiKey(apiKey, persistent);
    setHasStoredKey(true);
    setShowModal(false);
    setApiKey('');
    toast.success('API key saved successfully!');
    onApiKeySet?.(true);
  };

  const handleRemoveKey = () => {
    apiKeyManager.removeApiKey();
    setHasStoredKey(false);
    toast.success('API key removed');
    onApiKeySet?.(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveKey();
    }
  };

  if (!apiKeyManager.isProductionMode() && !showModal) {
    return (
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <FiInfo className="text-blue-500 mr-2" />
          <span className="text-sm text-blue-700">
            Development mode: Using environment API key
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Set custom key
        </button>
      </div>
    );
  }

  return (
    <>
      {hasStoredKey && !showModal && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <FiCheck className="text-green-500 mr-2" />
            <span className="text-sm text-green-700">API key configured</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              Update
            </button>
            <button
              onClick={handleRemoveKey}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center mb-4">
                <FiKey className="text-indigo-600 mr-3 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">
                  OpenAI API Key Required
                </h2>
              </div>

              <p className="text-gray-600 mb-4 text-sm">
                To use AI features, please provide your OpenAI API key. 
                You can get one from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline"
                >
                  OpenAI Platform
                </a>
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKey ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="persistent"
                    checked={persistent}
                    onChange={(e) => setPersistent(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="persistent" className="text-sm text-gray-600">
                    Remember key (stored locally)
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveKey}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Save Key
                  </button>
                  {!apiKeyManager.isProductionMode() && (
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Privacy:</strong> Your API key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
