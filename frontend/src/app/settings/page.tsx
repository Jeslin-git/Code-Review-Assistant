'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { clearToken } from '@/lib/auth';
import { ArrowLeft, LogOut, Settings } from 'lucide-react';

interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  modelName: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    modelName: '',
    isActive: true,
  });

  useEffect(() => {
    fetchActiveProvider();
  }, []);

  const fetchActiveProvider = async () => {
    try {
      const { data } = await api.get('/ai-providers/active');
      if (data) {
        setFormData({
          name: data.name || '',
          baseUrl: data.baseUrl || '',
          apiKey: data.apiKey || '',
          modelName: data.modelName || '',
          isActive: data.isActive || true,
        });
      }
    } catch (err) {
      console.error('Failed to fetch AI provider', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/ai-providers/configure', formData);
      setSuccess('AI provider configured successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save AI provider configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-40 h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Settings className="h-5 w-5 text-blue-500" />
          <span className="font-bold text-white">AI Settings</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-400 transition text-sm"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-6 text-white">Configure AI Provider</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-200">
                {success}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Provider Name
                </label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a provider</option>
                  <option value="OpenAI">OpenAI</option>
                  <option value="LM Studio">LM Studio</option>
                  <option value="Ollama">Ollama</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  name="baseUrl"
                  placeholder="https://api.openai.com/v1 or http://localhost:1234/v1"
                  value={formData.baseUrl}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  name="modelName"
                  placeholder="gpt-4, gpt-4o-mini, mistral-large, etc."
                  value={formData.modelName}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key (optional for local models)
                </label>
                <input
                  type="password"
                  name="apiKey"
                  placeholder="sk-... or leave blank for local models"
                  value={formData.apiKey}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                  Set as active provider
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg py-2.5 text-sm transition border border-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <h3 className="text-sm font-bold text-gray-300 mb-3">Provider Examples:</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>
                  <strong>OpenAI:</strong> URL: https://api.openai.com/v1, Model: gpt-4o-mini
                </p>
                <p>
                  <strong>LM Studio:</strong> URL: http://localhost:1234/v1, Model: (your local model)
                </p>
                <p>
                  <strong>Ollama:</strong> URL: http://localhost:11434/v1, Model: mistral
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
