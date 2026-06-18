'use client';

interface FileNode {
  id: string;
  name: string;
  path: string;
  content: string;
}

interface Props {
  files: FileNode[];
  selectedFile: FileNode | null;
  onSelect: (file: FileNode) => void;
}

export default function FileTree({ files, selectedFile, onSelect }: Props) {
  if (files.length === 0) {
    return (
      <div className="p-4 text-gray-600 text-sm text-center mt-8">
        <p>No files yet.</p>
        <p className="mt-1 text-xs">Upload a ZIP to get started.</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <p className="text-xs text-gray-500 uppercase tracking-wider px-2 py-2 font-semibold">Files</p>
      {files.map((file) => (
        <button
          key={file.id}
          onClick={() => onSelect(file)}
          className={`w-full text-left px-3 py-1.5 rounded-lg text-sm truncate transition ${
            selectedFile?.id === file.id
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
          title={file.path}
        >
          {file.name}
        </button>
      ))}
    </div>
  );
}