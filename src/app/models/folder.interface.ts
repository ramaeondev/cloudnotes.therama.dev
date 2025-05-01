// folder.interface.ts
export interface Folder {
  id: string;
  name: string;
  parent_folder_id: string | null;
  userId: string;
  s3KeyPrefix: string;
  path: string;
  isSystem: boolean;
  isRoot: boolean;
  children?: Folder[];
  files?: Files[];
  type?: string;
}

export interface Files {
  id: string;
  name: string;
  folder_id: string;
  s3_key: string;
  created_at: string;
  updated_at: string;
  size: number;
  file_type: string | null;
  user_id: string;
  is_deleted: boolean;
  is_archived: boolean;
  content_type: string;
  type?: string;
}

export interface FolderTreeResponse {
  folders: Folder[];
  files: Files[];
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  icon: string; // Add icon property
  children?: TreeNode[]; // Only for folders
  originalData?: Folder | Files; // Optional: link to raw data if needed
}
