import { Component, OnInit } from '@angular/core';
import { Files, Folder, FolderProperties, RenameObject, TreeNode } from '../models/folder.interface';
import { FolderService } from '../services/folder.service';
import { MatDialog } from '@angular/material/dialog';
import { SupabaseService } from '../services/supabase.service';
import { useCreateFolder } from '../utils/useCreateFolder';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UploadFilesDialogueComponent } from '../upload-files-dialogue/upload-files-dialogue.component';
import { getFileIcon } from '../utils/file-utils';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonDialogueComponent } from '../shared/common-dialogue/common-dialogue.component';
@Component({
  selector: 'app-folder-list',
  standalone: false,
  templateUrl: './folder-list.component.html',
  styleUrl: './folder-list.component.scss'
})
export class FolderListComponent implements OnInit {
  createFolder = useCreateFolder();
  newFolderName = new FormControl('');
  renameFolderName = new FormControl('');
  editingFolderId: string | null = null;
  folderMenuMap: { [folderId: string]: any } = {};
  newFolderNameMap: { [folderId: string]: string } = {};
  expandedFolders: Set<string> = new Set();
  folderTree: TreeNode[] = [];


  constructor(private readonly folderService: FolderService, private readonly dialog: MatDialog, 
    private readonly supabase: SupabaseService,private readonly toastr: ToastrService, private readonly spinner: NgxSpinnerService) {}
  
    ngOnInit(): void {
      this.loadFolderAndFileData();
    }


  async onCreate(folder: TreeNode, newFolderName:string ) {
    this.spinner.show();
    try {
      const result = await this.createFolder.createFolder(newFolderName, folder.id);
      console.log('Folder created!', result);
      this.toastr.success('Folder created successfully');
      await this.loadFolderAndFileData(); // Reload the folder list 
    } catch (e) {
      console.error('Error creating folder:', e);
      this.toastr.error('Error creating folder');
    } finally{
      this.spinner.hide();
    }
  }



  async deleteFolder(folder: Folder) {
    try {
      // Call Folder Service to delete folder here
      console.log('Folder deleted:', folder.id);
      await this.loadFolderAndFileData(); // Reload the folder list
        this.toastr.success('Folder deleted successfully');
    } catch (error) {
      console.error('Error deleting folder:', error);
      this.toastr.error('Error deleting folder');
    }
  }

  cancelRename() {
    this.editingFolderId = null;
  }


  async submitRename(folder: Folder) {
    await this.folderService.renameFolder(folder.id, this.renameFolderName.value ?? '');
    this.editingFolderId = null;
    this.loadFolderAndFileData();
    this.toastr.success('Folder renamed successfully');
  }

  toggleNode(folderId: string) {
    if (this.expandedFolders.has(folderId)) {
      this.expandedFolders.delete(folderId);
    } else {
      this.expandedFolders.add(folderId);
    }
  }
  
  isExpanded(folderId: string): boolean {
    return this.expandedFolders.has(folderId);
  }

  openUploadDialog(folder: TreeNode): void {
    console.log('Folder:', folder);
    const dialogRef = this.dialog.open(UploadFilesDialogueComponent, {
      data: { folder: folder },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadFolderAndFileData();
        this.toastr.success('File(s) uploaded successfully');
      } else if (result === false) {
        this.toastr.error('File upload failed. Please try again.');
      }
    });
  }

  async loadFolderAndFileData(): Promise<void> {
    this.spinner.show();
    try {
      const { folders, files } = await this.folderService.fetchFoldersAndFiles();
      this.folderTree = this.mapToTreeNodes(folders, files);
      console.log('Folder Tree:', this.folderTree);
    } catch (error) {
      console.error('Error loading folder and file data:', error);
    } finally {
      this.spinner.hide();
    }
  }

  mapToTreeNodes(folders: Folder[], files: Files[]): TreeNode[] {
    const folderMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];
  
    // Step 1: Initialize all folders as TreeNodes and put them in the map
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        id: folder.id,
        name: folder.name,
        type: 'folder',
        icon: 'fa-folder',
        children: [],
        originalData: folder
      });
    });
  
    // Step 2: Nest folders
    folders.forEach(folder => {
      const node = folderMap.get(folder.id)!;
      if (folder.parent_folder_id) {
        const parentNode = folderMap.get(folder.parent_folder_id);
        if (parentNode) {
          parentNode.children!.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });
  
    // Step 3: Attach files to the correct folder nodes
    files.forEach(file => {
      const parentNode = folderMap.get(file.folder_id);
      if (parentNode) {
        parentNode.children!.push({
          id: file.id,
          name: file.name,
          type: 'file',
          icon: getFileIcon(file.name),
          originalData: file
        });
      }
    });
  
    return rootNodes;
  }



  getFileMenuItems(node: TreeNode): { label: string, icon: string, action: () => void }[] {
    return [
      { 
        label: 'Download', 
        icon: 'fa-download', 
        action: () => this.downloadFile(node) 
      },
      { 
        label: 'Rename', 
        icon: 'fa-edit', 
        action: () => this.startEditing(node) 
      },
      { 
        label: 'Move', 
        icon: 'fa-folder-open', 
        action: () => this.moveItem(node) 
      },
      { 
        label: 'Delete', 
        icon: 'fa-trash-alt', 
        action: () => this.deleteItem(node) 
      },
      { 
        label: 'Share', 
        icon: 'fa-share-alt', 
        action: () => this.shareItem(node) 
      },
      { 
        label: 'Properties', 
        icon: 'fa-info-circle', 
        action: () => this.showFileProperties(node) 
      }
    ];
  }

  getFolderMenuItems(node: TreeNode): { label: string, icon: string, action: () => void, disabled?: boolean }[] {
    return [
      { 
        label: 'New Folder', 
        icon: 'fa-folder-plus', 
        action: () => this.openCreateNewFolderDialogue(node)
      },
      { 
        label: 'Upload File', 
        icon: 'fa-file-upload', 
        action: () => this.openUploadDialog(node)
      },
      { 
        label: 'Rename', 
        icon: 'fa-edit', 
        action: () => this.startEditing(node),
        disabled: node.originalData?.is_system
      },
      { 
        label: 'Move', 
        icon: 'fa-folder-open', 
        action: () => this.moveItem(node),
        disabled: node.originalData?.is_system 
      },
      { 
        label: 'Delete', 
        icon: 'fa-trash-alt', 
        action: () => this.deleteItem(node),
        disabled: node.originalData?.is_system
      },
      { 
        label: 'Properties', 
        icon: 'fa-info-circle', 
        action: () => this.showProperties(node)
      }
    ];
  }

  // Action methods
  downloadFile(node: TreeNode): void {
    console.log(`Downloading file: ${node.name}`);
  }

  renameItem(node: TreeNode): void {
    console.log(`Renaming item: ${node.name}`);
  }

  moveItem(node: TreeNode): void {
    console.log(`Moving item: ${node.name}`);
  }

  deleteItem(node: TreeNode): void {
    console.log(`Deleting item: ${node.name}`);
  }

  shareItem(node: TreeNode): void {
    console.log(`Sharing item: ${node.name}`);
  }

  showProperties(node: TreeNode): void {
    const s3KeyPrefix = (node.originalData && 's3_key_prefix' in node.originalData)
    ? node.originalData.s3_key_prefix
    : node?.originalData?.user_id + '/' + 'Root';
    this.spinner.show();
    this.folderService.getProperties(s3KeyPrefix).subscribe((data: FolderProperties)=>{
      console.log(data);
      this.spinner.hide();
      this.openPropertiesDialogue(node, data);
      })
    }

  async createRootFolder() {
    try {
      await this.folderService.createRootFolder();
      await this.supabase.updateUserMetadata({ is_root_folder_created: true });
    } catch (err) {
      console.error('Error creating root folder:', err);
    }
  }


  openPropertiesDialogue(node: TreeNode, data: FolderProperties) {
    const dialogRef = this.dialog.open(CommonDialogueComponent, {
      data: {
        id: 'folder_properties',
        title: 'Folder Properties',
        data: data,
        message: `Folder Path: ${node.originalData?.path}`,
        confirmText: 'OK',
        cancelText: 'Cancel'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  showFileProperties(node: TreeNode){
    const dialogRef = this.dialog.open(CommonDialogueComponent, {
      data: {
        id: 'file_properties',
        title: 'File Properties',
        data: node.originalData,
        message: `File Name: ${node.name}`,
        confirmText: 'OK',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  openCreateNewFolderDialogue(data: TreeNode) {
    const dialogRef = this.dialog.open(CommonDialogueComponent, {
      data: {
        id: 'create_new_folder',
        title: 'Create New Folder',
        message: 'Enter the name of the new folder:',
        confirmText: 'Create',
        cancelText: 'Cancel',
        data: data
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        this.onCreate(data, result);
      }
    });
  }

  startEditing(data: TreeNode) {
    console.log(data);
    const is_folder = data.type === 'folder';
    const title = `Rename ${is_folder ? 'Folder' : 'File'}`;
    const message = `Enter the new name for the ${is_folder ? 'folder' : 'file'}:`;

    const dialogRef = this.dialog.open(CommonDialogueComponent, {
      data: {
        id: 'rename_file_folder',
        title: title,
        message: message,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        data: data
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        this.renameFileOrFolder(data, result);
      }
    });
  }

  renameFileOrFolder(data: TreeNode, newName: string) {
    console.log(data);
    console.log(newName);
  
    let newFileName = '';
    let input: RenameObject;
  
    if (data.originalData && data.type === 'folder' && 's3_key_prefix' in data.originalData) {
      const currentPrefix = data.originalData.s3_key_prefix;
      const parentPath = currentPrefix.replace(/[^/]+\/$/, ''); // remove the last folder segment
      newFileName = `${parentPath}${newName}/`;
  
      input = {
        old_path: currentPrefix,
        new_path: newFileName,
        is_folder: true,
        folder_id: data.id
      };
    } 
    else if (data.originalData && data.type === 'file' && 's3_key' in data.originalData) {
      const currentKey = data.originalData.s3_key;
      const lastSlashIndex = currentKey.lastIndexOf('/');
      const lastDotIndex = currentKey.lastIndexOf('.');
  
      const path = currentKey.substring(0, lastSlashIndex + 1);
      const extension = lastDotIndex > lastSlashIndex ? currentKey.substring(lastDotIndex) : ''; // only extract if dot is after last slash
  
      newFileName = `${path}${newName}${extension}`;
  
      input = {
        old_path: currentKey,
        new_path: newFileName,
        is_folder: false
      };
    } 
    else {
      this.toastr.error('Invalid file or folder.');
      return;
    }
  
    if (!newFileName) {
      this.toastr.error('New name is invalid.');
      return;
    }
  
    this.spinner.show();
    this.folderService.renameFileOrFolder(input).subscribe({
      next: () => {
        this.spinner.hide();
        this.loadFolderAndFileData();
      },
      error: (error) => {
        console.error(error);
        this.spinner.hide();
      }
    });
  }
  
}