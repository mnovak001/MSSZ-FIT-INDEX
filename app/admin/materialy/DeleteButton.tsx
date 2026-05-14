'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteButton({ materialId }: { materialId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tento materiál?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Chyba při mazání');
      }
      
      // Full page navigation to trigger server re-render
      window.location.href = '/admin/materialy';
    } catch (error) {
      console.error('Error deleting material:', error);
      alert(error instanceof Error ? error.message : 'Chyba při mazání');
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="btn btn-secondary text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {isDeleting ? 'Mazání...' : 'Smazat'}
    </button>
  );
}
