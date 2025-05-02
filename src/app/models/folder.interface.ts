// folder.interface.ts
export interface Folder {
  id: string;
  name: string;
  parent_folder_id: string | null;
  userId: string;
  s3KeyPrefix: string;
  path: string;
  is_system: boolean;
  isRoot: boolean;
  children?: Folder[];
  files?: Files[];
  type?: string;
  user_id: string;
  s3_key_prefix: string;
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
  is_system?: boolean;
  path:string;
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

export interface FolderProperties {
  folder_path: string;
  fileCount: number,
  totalSize: number,
  lastModified: string
}

export interface RenameObject {
  old_path: string;
  new_path: string,
  is_folder: boolean
}