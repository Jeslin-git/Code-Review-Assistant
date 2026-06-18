'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { clearToken } from '@/lib/auth';
import { FolderPlus, Trash2, LogOut, Code2, Calendar } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch User's Projects
  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Handle Project Creation
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreateLoading(true);
    setError('');
    try {
      await api.post('/projects', { name, description });
      setName('');
      setDescription('');
      setIsModalOpen(false);
      fetchProjects(); // Refresh listing
    } catch (err) {
      setError('Failed to create project. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  // 3. Handle Project Deletion
  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stops card click navigation triggering
    if (!confirm('Are you sure you want to delete this project? All associated files and reviews will be permanently wiped.')) return;

    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  // 4. Handle Logout
  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Navbar header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Code2 className="h-6 w-6 text-blue-500" />
            <span className="font-bold text-lg text-white tracking-tight">CodeReview.AI</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-sm text-gray-400 hover:text-red-400 transition bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Workspaces</h1>
            <p className="text-gray-400 text-sm mt-1">Select a project or establish a new workspace repository context.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-blue-600/20"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Dynamic Data Loader Block */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-gray-900 rounded-xl border border-gray-800" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/20 max-w-xl mx-auto">
            <FolderPlus className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No active workspaces found</h3>
            <p className="text-gray-400 text-sm mt-1 px-4">Create your first workspace context to upload code files and execute targeted AI reviews.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/project/${project.id}`)}
                className="group relative bg-gray-900 hover:bg-gray-800/80 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition duration-200 cursor-pointer flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition truncate">
                      {project.name}
                    </h2>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-800 transition"
                      title="Delete Workspace"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {project.description || 'No description provided.'}
                  </p>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 gap-1.5 pt-4 border-t border-gray-800/60">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE WORKSPACE MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-1">Create Workspace</h2>
            <p className="text-sm text-gray-400 mb-4">Initialize a tracking folder container for repository review branches.</p>
            
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., E-Commerce Gateway API"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Summarize structural context or engine architecture limitations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition bg-gray-800 border border-gray-700 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition disabled:opacity-50"
                >
                  {createLoading ? 'Building...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}