import { Component, OnInit } from '@angular/core';
import { Files, Folder, FolderProperties, RenameObject, TreeNode } from '../../models/folder.interface';
import { FolderService } from '../../services/folder.service';
import { MatDialog } from '@angular/material/dialog';
import { SupabaseService } from '../../services/supabase.service';
import { useCreateFolder } from '../../utils/useCreateFolder';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UploadFilesDialogueComponent } from '../../upload-files-dialogue/upload-files-dialogue.component';
import { getFileIcon } from '../../utils/file-utils';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonDialogueComponent } from '../../shared/common-dialogue/common-dialogue.component';
import { FileService } from '../../services/file.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { PreviewService } from '../../services/preview.service';
import { SharedService } from '../../services/shared.service';
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
  fileTypes = {
    image: ['webp', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'tiff'],
    document: ['pdf', 'txt'],
    office: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    code: ['js', 'ts', 'html', 'css', 'json', 'xml'],
    audio: ['mp3', 'wav', 'ogg'],
    video: ['mp4', 'webm', 'mov']
  };

  constructor(private readonly folderService: FolderService, private readonly dialog: MatDialog, private readonly previewService: PreviewService, 
    private readonly router: Router,private readonly sanitizer: DomSanitizer, private readonly sharedService: SharedService,
    private readonly supabase: SupabaseService,private readonly toastr: ToastrService, private readonly spinner: NgxSpinnerService, private readonly fileService: FileService) {}
  
    ngOnInit(): void {
      this.loadFolderAndFileData();
      this.sharedService.trigger$.subscribe((value: boolean) => {
        if (value) {
          this.loadFolderAndFileData();
        }
      });
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
  
  onDownloadFile(node: TreeNode): void {
    const originalData = node.originalData;
    if (!originalData) {
      console.error('Original data is undefined');
      return;
    }
    if (this.isFolder(originalData)) {
      console.error('Cannot download a folder');
      return;
    }
    const s3Key = originalData.s3_key;
    if (!s3Key) {
      console.error('S3 key is undefined');
      return;
    }
    console.log('Downloading file with S3 key:', s3Key);
    this.spinner.show();
    this.fileService.handleFile(s3Key).subscribe({
      next: (url) => {
        this.spinner.hide();
        const fileName = s3Key.split('/').pop() || 'download';
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.target = '_blank'; // Open in new tab if download doesn't work
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          // Revoke the object URL to avoid memory leaks
          window.URL.revokeObjectURL(url);
        }, 100);
      },
      error: (err) => {
        console.error('Download failed:', err);
        this.spinner.hide();
        this.toastr.error('Download failed. Please try again.');
      }
    });
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

  showFolderProperties(node: TreeNode): void {
    const originalData = node.originalData;
    let s3KeyPrefix: string;
    if (!originalData) {
      console.error('Original data is undefined');
      return;
    }  
    if (this.isFolder(originalData)) {
    s3KeyPrefix = originalData.s3_key_prefix || `${originalData.user_id}/Root`;
    } else {
      return
    }

    this.spinner.show();
    this.folderService.getProperties(s3KeyPrefix).subscribe((data: FolderProperties)=>{
      console.log(data);
      this.spinner.hide();
      this.openPropertiesDialogue(node, data);
      })
    }

    isFolder(data: Folder | Files): data is Folder {
      return (data as Folder).s3_key_prefix !== undefined;
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
  
  getPreviewUrl(node: TreeNode) {
    const originalData = node.originalData;
    if (!originalData) {
      console.error('Original data is undefined');
      return;
    }
    if (this.isFolder(originalData)) {
      console.error('Cannot download a folder');
      return;
    }
    const s3Key = originalData.s3_key;
    if (!s3Key) {
      console.error('S3 key is undefined');
      return;
    }
    console.log('Downloading file with S3 key:', s3Key);
    this.spinner.show();
    let fileName = s3Key.split('/').pop() || 'download';
    let fileExtension = fileName.split('.').pop() || '';
    this.fileService.handlePreviewFile(s3Key).subscribe({
      next: (url) => {
        this.spinner.hide();
        console.log('Preview URL:', url);
        if (this.fileTypes.image.includes(fileExtension)) {
          // Image preview
          this.previewService.sendImagePreview({
            imageUrl: url,
            fileName: fileName,
            showPreview: true
          });
        }
        else if (fileExtension === 'pdf') {
          // PDF preview
          this.previewService.sendPdfPreview({
            pdfUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
            fileName: fileName,
            showPreview: true
          });
        }
        else if (this.fileTypes.office.includes(fileExtension)) {
          // Office preview using Microsoft Viewer
          const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
          this.previewService.sendOfficePreview({
            officeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(officeUrl),
            fileName: fileName,
            showPreview: true
          });
        }
        else if (this.fileTypes.video.includes(fileExtension)) {
          // Video preview
          this.previewService.sendVideoPreview({
            videoUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
            fileName: fileName,
            showPreview: true
          });
        }
        else if (this.fileTypes.audio.includes(fileExtension)) {
          // Audio preview
          this.previewService.sendAudioPreview({
            audioUrl: url,
            fileName: fileName,
            showPreview: true
          });
        }
        else {
          // Default behavior (download or open in new tab)
          window.open(url, '_blank');
        }
        this.router.navigate(['file-preview']);
      },
      error: (err) => {
        console.error('Download failed:', err);
        this.spinner.hide();
        this.toastr.error('Download failed. Please try again.');
      }
    });
  }
}