'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface FileNode {
  id: string;
  name: string;
  path: string;
  content: string;
}

interface Issue {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ReviewResult {
  summary: string;
  issues: Issue[];
  recommendations: string[];
}

const severityColor: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

interface Props {
  projectId: string;
  files: FileNode[];
  selectedFile: FileNode | null;
}

export default function ReviewPanel({ projectId, files, selectedFile }: Props) {
  const [mode, setMode] = useState('security');
  const [scope, setScope] = useState<'file' | 'project'>('project');
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReview = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      console.log('Sending review request:', {
        projectId,
        templateMode: mode,
        fileIds: scope === 'file' && selectedFile ? [selectedFile.id] : [],
      });
      const { data } = await api.post('/reviews/trigger', {
        projectId,
        templateMode: mode,
        fileIds: scope === 'file' && selectedFile ? [selectedFile.id] : [],
      });
      setResult(data);
    } catch (err: any) {
      console.error('Review error:', err.response?.data || err.message);
      setError('Review failed. Check your AI provider config.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Review Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full mt-1.5 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="security">Security Review</option>
          <option value="performance">Performance Review</option>
          <option value="quality">Code Quality Review</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Scope</label>
        <div className="flex gap-2 mt-1.5">
          {(['project', 'file'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition border ${
                scope === s
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {s === 'project' ? 'Entire Project' : 'Selected File'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleReview}
        disabled={loading || (scope === 'file' && !selectedFile)}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition"
      >
        {loading ? 'Analyzing...' : 'Run AI Review'}
      </button>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {result && (
        <div className="space-y-4 mt-2">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Summary</p>
            <p className="text-sm text-gray-300">{result.summary}</p>
          </div>

          {result.issues?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Issues</p>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <div key={i} className={`rounded-lg p-3 border text-xs ${severityColor[issue.severity] ?? 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold">{issue.title}</span>
                      <span className="uppercase text-xs opacity-80">{issue.severity}</span>
                    </div>
                    <p className="opacity-80">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Recommendations</p>
              <ul className="space-y-1">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-gray-400 flex gap-2">
                    <span className="text-blue-500">→</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}