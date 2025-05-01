// src/app/hooks/useCreateFolder.ts
import { inject, signal, WritableSignal } from '@angular/core';
import { FolderService } from '../services/folder.service';

type CreateFolderResponse = {
  success: boolean;
  folderId?: string;
};


export function useCreateFolder() {
  const folderService = inject(FolderService);
  const loading : WritableSignal<boolean> = signal(false);
  const error : WritableSignal<string | null> = signal(null);

  const createFolder = async (name: string, parentId: string | null = null): Promise<CreateFolderResponse> => {
    loading.set(true);
    error.set(null);

    try {
      const result = await folderService.createFolder(name, parentId);
      return result;
    } catch (err: any) {
      error.set(err?.message ?? 'Unknown error');
      throw err;
    } finally {
      loading.set(false);
    }
  };

  return {
    createFolder,
    loading,
    error,
  };
}
