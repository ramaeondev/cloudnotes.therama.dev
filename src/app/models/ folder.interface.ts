// folder.interface.ts
export interface Folder {
    id: string;
    name: string;
    parentFolderId: string | null;
    userId: string;
    s3KeyPrefix: string;
    path: string;
    isSystem: boolean;
    isRoot: boolean;
    children?: Folder[];
    files?: Note[];
  }
  export interface Note {
    id: string;
    name: string;
    content?: string;
    folder_id: string;
  }