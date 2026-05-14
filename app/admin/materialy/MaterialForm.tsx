'use client';

import { useState, useRef } from 'react';
import { MaterialKind } from '@prisma/client';
import { createMaterial } from '@/app/admin/actions';

interface Topic {
  id: string;
  title: string;
}

interface MaterialFormProps {
  topics: Topic[];
}

export function MaterialForm({ topics }: MaterialFormProps) {
  const [kind, setKind] = useState<MaterialKind>(MaterialKind.LINK);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubmitting(true);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Use form ref to create FormData
    const form = formRef.current;
    if (!form) {
      console.error('Form element not found');
      setIsSubmitting(false);
      return;
    }
    
    const formData = new FormData(form);
    
    // Add selected file if any
    if (selectedFile) {
      formData.set('file', selectedFile);
    }
    
    console.log('Submitting form data...');
    
    try {
      await createMaterial(formData);
      console.log('Material created successfully');
    } catch (error) {
      console.error('Error creating material:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-4 grid gap-4" encType="multipart/form-data">
      <div>
        <label className="label">Okruh</label>
        <select 
          className="input" 
          name="topicId" 
          required
          disabled={isSubmitting}
        >
          <option value="">Vyberte okruh...</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>{topic.title}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="label">Název</label>
        <input 
          className="input" 
          name="title" 
          required 
          disabled={isSubmitting}
          placeholder="Zadejte název materiálu..."
        />
      </div>
      
      <div>
        <label className="label">Typ</label>
        <select 
          className="input" 
          name="kind" 
          value={kind}
          onChange={(e) => setKind(e.target.value as MaterialKind)}
          disabled={isSubmitting}
        >
          <option value={MaterialKind.LINK}>Odkaz</option>
          <option value={MaterialKind.FILE}>Soubor</option>
          <option value={MaterialKind.NOTE}>Poznámka</option>
        </select>
      </div>
      
      {kind === MaterialKind.LINK && (
        <div>
          <label className="label">URL pro odkaz</label>
          <input 
            className="input" 
            name="url" 
            placeholder="https://..." 
            disabled={isSubmitting}
          />
        </div>
      )}
      
      {kind === MaterialKind.FILE && (
        <div>
          <label className="label">Soubor pro upload</label>
          
          {/* Custom file upload UI */}
          <div className="space-y-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors
                ${selectedFile 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file size (10MB limit)
                    if (file.size > 10 * 1024 * 1024) {
                      alert('Soubor je příliš velký. Maximální velikost je 10MB.');
                      setSelectedFile(null);
                      e.target.value = '';
                      return;
                    }
                    // Validate file type
                    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.rar'];
                    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
                    if (!allowedExtensions.includes(extension)) {
                      alert(`Nepovolený typ souboru: ${extension}`);
                      setSelectedFile(null);
                      e.target.value = '';
                      return;
                    }
                    setSelectedFile(file);
                  }
                }}
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
                    Max. 10MB • PDF, DOC, DOCX, TXT, MD, JPG, PNG, GIF, ZIP, RAR
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {kind === MaterialKind.NOTE && (
        <div>
          <label className="label">Obsah poznámky</label>
          <textarea 
            className="input min-h-32" 
            name="content" 
            disabled={isSubmitting}
            placeholder="Zapište obsah poznámky..."
          />
        </div>
      )}
      
      <div>
        <label className="label">Popis</label>
        <textarea 
          className="input min-h-20" 
          name="description" 
          disabled={isSubmitting}
          placeholder="Volitelný popis materiálu..."
        />
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          className="btn" 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Ukládání...
            </span>
          ) : (
            'Přidat materiál'
          )}
        </button>
        
        {selectedFile && (
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="text-sm text-red-600 hover:text-red-700"
            disabled={isSubmitting}
          >
            Zrušit výběr souboru
          </button>
        )}
      </div>
    </form>
  );
}