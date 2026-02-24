'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';
import '@/styles/modal.scss';

interface BaseModalProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BaseModal({ children, open, onOpenChange }: BaseModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content card-base">
          {children}
          <Dialog.Close asChild>
            <button className="modal-close-btn" aria-label="Close">
              ✕
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
