'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiKeyManager } from '@/utils/apiKeyManager';
import { useUserTier } from '@/lib/useUserTier';
import toast from 'react-hot-toast';

interface ApiKeyManagerProps {
  onApiKeySet?: (hasKey: boolean) => void;
}

export function ApiKeyManager({ onApiKeySet }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  // Default to session-only storage; users opt in to persisting the key
  const [persistent, setPersistent] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  // Whether a custom key is actually saved in the browser. Distinct from
  // hasStoredKey because hasApiKey() always returns true in development.
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const { accountsEnabled, loading: tierLoading } = useUserTier();

  // A key is only truly REQUIRED when accounts are disabled: with accounts
  // enabled, paid tiers use the server key with no browser key at all, so
  // forcing the modal (with no Cancel) would wall off a feature they paid for.
  const keyRequired = apiKeyManager.isProductionMode() && !accountsEnabled;

  useEffect(() => {
    const hasKey = apiKeyManager.hasApiKey();
    setHasStoredKey(hasKey);
    setHasCustomKey(!!apiKeyManager.getApiKey());

    if (keyRequired && !hasKey) {
      setShowModal(true);
    }

    onApiKeySet?.(hasKey);
  }, [onApiKeySet, keyRequired]);

  // Modal a11y: focus the key input on open and close on Escape
  useEffect(() => {
    if (!showModal) return;

    keyInputRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

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
    setHasCustomKey(true);
    setShowModal(false);
    setApiKey('');
    toast.success('API key saved successfully!');
    onApiKeySet?.(true);
  };

  const handleRemoveKey = () => {
    apiKeyManager.removeApiKey();
    setHasStoredKey(false);
    setHasCustomKey(false);
    toast.success('API key removed');
    onApiKeySet?.(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveKey();
    }
  };

  if (!apiKeyManager.isProductionMode() && !showModal) {
    // A saved browser key overrides the environment key (it is attached as
    // the Authorization header), so say so and offer Update/Remove controls.
    return hasCustomKey ? (
      <div className="paper flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center">
          <span className="font-mono text-xs font-semibold text-pass mr-2 shrink-0" aria-hidden="true">[key]</span>
          <span className="font-mono text-xs text-ink-soft">
            Development mode: using your saved custom API key
          </span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-pen hover:text-pen-deep underline underline-offset-2 transition-colors"
          >
            Update
          </button>
          <button
            onClick={handleRemoveKey}
            className="text-sm text-fail hover:text-ink underline underline-offset-2 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    ) : (
      <div className="paper flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center">
          <span className="font-mono text-xs font-semibold text-pen mr-2 shrink-0" aria-hidden="true">[key]</span>
          <span className="font-mono text-xs text-ink-soft">
            Development mode: using environment API key
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm text-pen hover:text-pen-deep underline underline-offset-2 transition-colors"
        >
          Set custom key
        </button>
      </div>
    );
  }

  return (
    <>
      {hasStoredKey && !showModal && (
        <div className="paper flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center">
            <span className="font-mono text-xs font-semibold text-pass mr-2 shrink-0" aria-hidden="true">[key]</span>
            <span className="font-mono text-xs text-ink-soft">API key configured</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-pen hover:text-pen-deep underline underline-offset-2 transition-colors"
            >
              Update
            </button>
            <button
              onClick={handleRemoveKey}
              className="text-sm text-fail hover:text-ink underline underline-offset-2 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Accounts mode, no key stored: AI is bring-your-own-key on every plan. */}
      {!hasStoredKey && !showModal && accountsEnabled && !tierLoading && (
        <div className="paper flex items-center justify-between gap-4 p-4 flex-wrap">
          <div className="flex items-center">
            <span className="font-mono text-xs font-semibold text-pen mr-2 shrink-0" aria-hidden="true">[key]</span>
            <span className="font-mono text-xs text-ink-soft">
              Add your own OpenAI API key to use AI features.
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-pen hover:text-pen-deep underline underline-offset-2 transition-colors"
          >
            Set API key
          </button>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.15 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="api-key-modal-title"
              className="paper p-6 max-w-md w-full"
            >
              <div className="mb-4">
                <p className="eyebrow mb-1.5">Bring your own key</p>
                <h2 id="api-key-modal-title" className="font-display text-xl font-semibold tracking-tight text-ink">
                  OpenAI API key
                </h2>
              </div>

              <p className="text-ink-soft mb-4 text-sm leading-relaxed">
                To use AI features, please provide your OpenAI API key.
                You can get one from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pen hover:text-pen-deep underline underline-offset-2 transition-colors"
                >
                  OpenAI Platform
                </a>
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    ref={keyInputRef}
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="sk-..."
                    className="input-flat w-full px-4 py-3 pr-12 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 font-mono text-xs text-ink-soft hover:text-ink transition-colors"
                  >
                    {showKey ? 'hide' : 'show'}
                  </button>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="persistent"
                    checked={persistent}
                    onChange={(e) => setPersistent(e.target.checked)}
                    className="mr-2 rounded-[2px] border-rule accent-pen"
                  />
                  <label htmlFor="persistent" className="text-sm text-ink-soft">
                    Remember key (stored locally)
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveKey}
                    className="btn-pen flex-1 py-2 px-4 text-sm"
                  >
                    Save key
                  </button>
                  {!keyRequired && (
                    <button
                      onClick={() => setShowModal(false)}
                      className="btn-ghost flex-1 py-2 px-4 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-bench border border-rule rounded-[3px]">
                <p className="text-xs text-ink-soft leading-relaxed">
                  <strong className="text-ink">Privacy:</strong> Your API key is stored only in your browser and sent over HTTPS to our API solely to forward your requests to OpenAI. It is never stored on our servers.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
