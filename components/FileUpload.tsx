'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  maxSize?: number; // in bytes, default 10MB
}

export function FileUpload({ onFileSelect, maxSize = 10 * 1024 * 1024 }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      setError(`Soubor je příliš velký. Maximální velikost: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return false;
    }

    // Check for empty file
    if (file.size === 0) {
      setError('Soubor nesmí být prázdný');
      return false;
    }

    // Check file type
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.rar'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      setError(`Nepovolený typ souboru: ${extension}`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      onFileSelect(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors
          ${dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : selectedFile 
              ? 'border-green-500 bg-green-50' 
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleInputChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.zip,.rar"
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-left">
              <p className="font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-sm text-slate-600">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-blue-600">Klikněte pro výběr</span> nebo přetáhněte soubor
            </p>
            <p className="text-xs text-slate-500">
              Max. {(maxSize / 1024 / 1024).toFixed(1)}MB • PDF, DOC, DOCX, TXT, MD, JPG, PNG, GIF, ZIP, RAR
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}