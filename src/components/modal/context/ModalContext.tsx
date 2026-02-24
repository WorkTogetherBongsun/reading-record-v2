'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ModalConfig {
  Component: React.ComponentType<any>;
  props?: Record<string, any>;
  key: string;
}

interface ModalContextType {
  openModal: (config: ModalConfig) => void;
  closeModal: (key: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const openModal = useCallback((config: ModalConfig) => {
    setModals((prev) => [...prev, config]);
  }, []);

  const closeModal = useCallback((key: string) => {
    setModals((prev) => prev.filter((m) => m.key !== key));
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {/* 여기서 모달 렌더링 시스템을 연결할 예정입니다 */}
      <div id="modal-root">
        {modals.map((modal) => {
          const { key, ...modalProps } = modal;
          return (
            <ModalRenderer 
              key={key} 
              {...modalProps} 
              onClose={() => closeModal(key)} 
            />
          );
        })}
      </div>
    </ModalContext.Provider>
  );
}

// 렌더러 (BaseModal을 사용하여 실제 내용을 그림)
import BaseModal from '../BaseModal';
function ModalRenderer({ Component, props, onClose }: ModalConfig & { onClose: () => void }) {
  return (
    <BaseModal open={true} onOpenChange={(open) => !open && onClose()}>
      <Component {...props} onClose={onClose} />
    </BaseModal>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};
