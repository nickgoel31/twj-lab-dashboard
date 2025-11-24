// app/leads/DeleteConfirmModal.tsx

'use client';

import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, isPending }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-card text-card-foreground rounded-lg border p-6 w-full max-w-md">
        <div className="flex items-start space-x-4">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Delete Lead</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete this lead? All of their data, including interaction logs, will be permanently removed. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 sm:w-auto"
          >
            {isPending ? 'Deleting...' : 'Confirm Delete'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full justify-center rounded-md bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground shadow-sm hover:bg-accent sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}