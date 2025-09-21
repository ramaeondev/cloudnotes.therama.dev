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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PreviewService } from '../../services/preview.service';
import { SharedService } from '../../services/shared.service';
import { AudioPreviewData, CodeLanguage, CodePreviewData, ImagePreviewData, OfficePreviewData, PdfPreviewData, VideoPreviewData } from '../../models/preview.interface';
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
  
  getPreviewUrl(node: TreeNode): void {
    // Validate input
    if (!node?.originalData) {
      this.toastr.error('File information not available');
      return;
    }
  
    const originalData = node.originalData;
    
    // Check if folder
    if (this.isFolder(originalData)) {
      this.toastr.warning('Folders cannot be previewed');
      return;
    }
  
    // Validate S3 key
    const s3Key = originalData.s3_key;
    if (!s3Key) {
      this.toastr.error('File location not found');
      return;
    }
  
    console.log('Previewing file with S3 key:', s3Key);
    this.previewService.closeAllPreviews();
    this.spinner.show();
  
    this.fileService.handlePreviewFile(s3Key).subscribe({
      next: ({ url, contentType, filename }) => {
        this.spinner.hide();
        console.log('Preview URL:', url);
  
        // Use filename from response if available, otherwise extract from S3 key
        const displayName = filename || s3Key.split('/').pop() || 'file';
        
        // Determine how to handle based on content type
        if (contentType.startsWith('image/')) {
          this.handleImagePreview(url, displayName);
        } 
        else if (contentType === 'application/pdf') {
          this.handlePdfPreview(url, displayName);
        }
        else if (this.isOfficeFile(contentType)) {
          this.handleOfficePreview(url, displayName);
        }
        else if (contentType.startsWith('video/')) {
          this.handleVideoPreview(url, displayName, contentType);
        }
        else if (contentType.startsWith('audio/')) {
          this.handleAudioPreview(url, displayName, contentType);
        }
        else if (this.isTextFile(contentType, s3Key)) {
          this.handleCodePreview(url, displayName);
        }
        else {
          this.handleUnknownFileType(url);
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error(err.message || 'Preview failed. Please try again.');
      }
    });
  }
  
  // Helper methods for different file types
  private handleImagePreview(url: string, filename: string): void {
    // Create properly typed preview data
    const imagePreviewData: ImagePreviewData = {
      type: 'image', // Add the discriminant type
      imageUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
      fileName: filename,
      showPreview: true,
      fileType: this.getImageMimeType(filename) // Add proper image type
    };
  
    // Send to preview service
    this.previewService.sendImagePreview(imagePreviewData);
    this.navigateToPreview();
  }
  
  
  private handlePdfPreview(url: string, filename: string): void {
    // Create properly typed PDF preview data
    const pdfPreviewData: PdfPreviewData = {
      type: 'pdf', // Discriminant for union type
      pdfUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
      fileName: filename,
      showPreview: true,
      fileType: 'application/pdf' // Explicit MIME type
    };
  
    // Send to preview service
    this.previewService.sendPdfPreview(pdfPreviewData);
    this.navigateToPreview();
  }
  
  private handleOfficePreview(url: string, filename: string): void {
    // Create the Office Online viewer URL
    const officeViewerBase = 'https://view.officeapps.live.com/op/embed.aspx';
    const officeUrl = `${officeViewerBase}?src=${encodeURIComponent(url)}`;
  
    // Create typed preview data
    const officePreviewData: OfficePreviewData = {
      type: 'office', // Discriminant property
      officeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(officeUrl),
      fileName: filename,
      showPreview: true,
      fileType: this.getOfficeFileType(filename) // Added MIME type detection
    };
  
    // Send to preview service
    this.previewService.sendOfficePreview(officePreviewData);
    this.navigateToPreview();
  }
  
  /**
   * Detects Office file type from filename
   */
  private getOfficeFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const officeTypes: Record<string, string> = {
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
  
    return officeTypes[extension || ''] || 'application/octet-stream';
  }
  
  private handleVideoPreview(url: string, filename: string, contentType: string): void {
    // Validate and normalize the content type
    const normalizedType = this.normalizeVideoContentType(contentType, filename);
  
    // Create typed video preview data
    const videoPreviewData: VideoPreviewData = {
      type: 'video', // Discriminant property
      videoUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
      fileName: filename,
      showPreview: true,
      fileType: normalizedType,
      posterUrl: this.getVideoPosterUrl(filename) // Optional thumbnail preview
    };
  
    // Send to preview service
    this.previewService.sendVideoPreview(videoPreviewData);
    this.navigateToPreview();
  }
  
  /**
   * Normalizes video content type and validates against filename
   */
  private normalizeVideoContentType(contentType: string, filename: string): `video/${string}` {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    // Map of common video extensions to MIME types
    const videoTypes: Record<string, `video/${string}`> = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      ogv: 'video/ogg',
      mov: 'video/quicktime',
      mkv: 'video/x-matroska',
      avi: 'video/x-msvideo'
    };
  
    // Use the content type if valid, otherwise infer from extension
    return contentType.startsWith('video/') 
      ? contentType as `video/${string}`
      : videoTypes[extension] || 'video/mp4'; // Default to mp4
  }
  
  /**
   * Generates a thumbnail URL for the video (optional)
   */ 
  private getVideoPosterUrl(filename: string): SafeResourceUrl | null {
    // Implement your thumbnail generation logic here
    // This could be:
    // 1. A pre-generated thumbnail from your backend
    // 2. A frame extracted client-side (requires additional logic)
    // 3. A placeholder image
    return null;
  }
  
  private handleAudioPreview(url: string, filename: string, contentType: string): void {
    // Validate and normalize the content type
    const normalizedType = this.normalizeAudioContentType(contentType, filename);
  
    // Create typed audio preview data
    const audioPreviewData: AudioPreviewData = {
      type: 'audio', // Discriminant property
      audioUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
      fileName: filename,
      showPreview: true,
      fileType: normalizedType,
      coverArtUrl: this.getAudioCoverArtUrl(filename) // Optional cover art
    };
  
    // Send to preview service
    this.previewService.sendAudioPreview(audioPreviewData);
    this.navigateToPreview();
  }
  
  /**
   * Normalizes audio content type and validates against filename
   */
  private normalizeAudioContentType(contentType: string, filename: string): `audio/${string}` {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    // Map of common audio extensions to MIME types
    const audioTypes: Record<string, `audio/${string}`> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      aac: 'audio/aac',
      flac: 'audio/flac'
    };
  
    // Use the content type if valid, otherwise infer from extension
    return contentType.startsWith('audio/') 
      ? contentType as `audio/${string}`
      : audioTypes[extension] || 'audio/mpeg'; // Default to mp3
  }
  
  /**
   * Generates cover art URL for the audio (optional)
   */ 
  private getAudioCoverArtUrl(filename: string): SafeResourceUrl | null {
    // Implement your cover art logic here:
    // 1. From embedded ID3 tags (would require client-side parsing)
    // 2. From a pre-generated cover art service
    // 3. A placeholder image
    return null;
  }
  
  private handleUnknownFileType(url: string): void {
    // For unsupported types, download instead
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  private isOfficeFile(contentType: string): boolean {
    return contentType.includes('officedocument') || 
           contentType.includes('msword') ||
           contentType.includes('excel') ||
           contentType.includes('powerpoint');
  }
  
  private navigateToPreview(): void {
    this.router.navigate(['/file-preview']).catch(err => {
      console.warn('Navigation cancelled:', err);
      // Fallback to home if navigation fails
      this.router.navigate(['/']);
    });
  }

  private isTextFile(contentType: string, filename: string): boolean {
    const textTypes = [
      'text/plain',
      'application/json',
      'application/javascript',
      'text/css',
      'text/html',
      'application/xml'
    ];
    
    const extension = filename.split('.').pop()?.toLowerCase();
    const textExtensions : string[]= [
      'txt', 'json', 'js', 'ts', 'jsx', 'tsx', 
      'css', 'html', 'htm', 'xml', 'cpp', 'h', 
      'c', 'hpp', 'java', 'py', 'rb', 'php', 'sh'
    ];
    
    return textTypes.includes(contentType) || 
           (contentType === 'application/octet-stream' && 
            textExtensions.includes(extension || ''));
  }

  private handleCodePreview(url: string, filename: string): void {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const fileType = this.getCodeFileType(extension);
    
    // Create typed code preview data
    const codePreviewData: CodePreviewData = {
      type: 'code', // Discriminant property
      fileUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
      fileName: filename,
      fileType: fileType,
      showPreview: true,
      language: fileType, // More semantic property name
      lineNumbers: true,  // Optional feature flag
      maxLines: 500       // Safety limit
    };
  
    // Send to preview service
    this.previewService.sendCodePreview(codePreviewData);
    this.navigateToPreview();
  }
  
  private getCodeFileType(extension: string): CodeLanguage {
    const codeTypes: Record<string, CodeLanguage> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'scss': 'css',
      'cpp': 'cpp',
      'h': 'cpp',
      'hpp': 'cpp',
      'py': 'python',
      'java': 'java',
      'php': 'php',
      'sh': 'bash',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml'
    };
      return codeTypes[extension] || 'plaintext';
  }
/**
 * Helper method to determine image MIME type from filename
 */
private getImageMimeType(filename: string): `image/${string}` {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const imageTypes: Record<string, `image/${string}`> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp'
  };
  
  return imageTypes[extension] || 'image/jpeg'; // default to jpeg if unknown
}
}