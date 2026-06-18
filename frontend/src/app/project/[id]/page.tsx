'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import FileTree from '@/components/FileTree';
import ReviewPanel from '@/components/ReviewPanel';
import ChatPanel from '@/components/ChatPanel';
import HistoryPanel from '@/components/HistoryPanel';
import { Code2, LogOut, ArrowLeft, Upload } from 'lucide-react';
import { clearToken } from '@/lib/auth';

interface FileNode {
  id: string;
  name: string;
  path: string;
  content: string;
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'history' | 'chat'>('review');
  const [uploading, setUploading] = useState(false);
  const [projectName, setProjectName] = useState('');

  const fetchFiles = async () => {
    try {
      const { data } = await api.get(`/files/${id}`);
      setFiles(data);
    } catch (err) {
      console.error('Failed to fetch files', err);
    }
  };

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProjectName(data.name);
    } catch (err) {
      console.error('Failed to fetch project', err);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchFiles();
  }, [id]);

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await api.post(`/files/upload/zip/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchFiles();
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-40 h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Code2 className="h-5 w-5 text-blue-500" />
          <span className="font-bold text-white">{projectName || 'Loading...'}</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg cursor-pointer transition">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload ZIP'}
            <input type="file" accept=".zip" onChange={handleZipUpload} className="hidden" />
          </label>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition text-sm">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: File Tree */}
        <div className="w-64 border-r border-gray-800 bg-gray-900 overflow-y-auto">
          <FileTree files={files} selectedFile={selectedFile} onSelect={setSelectedFile} />
        </div>

        {/* Center: File Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-950 p-4">
          {selectedFile ? (
            <div>
              <p className="text-xs text-gray-500 mb-2">{selectedFile.path}</p>
              <pre className="bg-gray-900 rounded-xl p-4 text-sm text-gray-300 overflow-x-auto border border-gray-800 whitespace-pre-wrap">
                {selectedFile.content}
              </pre>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              <p>Select a file to preview</p>
            </div>
          )}
        </div>

        {/* Right: Tabs Panel */}
        <div className="w-96 border-l border-gray-800 bg-gray-900 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {(['review', 'history', 'chat'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'review' && (
              <ReviewPanel projectId={id} files={files} selectedFile={selectedFile} />
            )}
            {activeTab === 'history' && <HistoryPanel projectId={id} />}
            {activeTab === 'chat' && <ChatPanel projectId={id} />}
          </div>
        </div>
      </div>
    </div>
  );
}