import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Folder } from '../models/ folder.interface';
import { FolderService } from '../services/folder.service';
import { MatDialog } from '@angular/material/dialog';
import { SupabaseService } from '../services/supabase.service';
import { useCreateFolder } from '../utils/useCreateFolder';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
  
@Component({
  selector: 'app-folder-list',
  standalone: false,
  templateUrl: './folder-list.component.html',
  styleUrl: './folder-list.component.scss'
})
export class FolderListComponent implements OnInit {
  folders: Folder[] = [];
  userId!: string;
  createFolder = useCreateFolder();
  name: WritableSignal<string> = signal('My Folder');
  parentId: WritableSignal<string> = signal('');
  newFolderName = new FormControl('');
  renameFolderName = new FormControl('');
  editingFolderId: string | null = null;
  folderMenuMap: { [folderId: string]: any } = {};
  newFolderNameMap: { [folderId: string]: string } = {};
  expandedFolders: Set<string> = new Set();

  constructor(private folderService: FolderService, private dialog: MatDialog, private supabase: SupabaseService,private toastr: ToastrService) {}
  
  async ngOnInit(): Promise<void> {
    const { data: { user }, error } = await this.supabase.supabase.auth.getUser();
    this.userId = user?.id ?? '';
    this.loadFolders();
  }

  async loadFolders() {
    try {
      this.folders = await this.folderService.getFolderStructure(this.userId);
        // Re-init folder state maps
      this.folders.forEach(folder => {
        this.folderMenuMap[folder.id] = `menu-${folder.id}`;
        this.newFolderNameMap[folder.id] = '';
      });
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  }

  async onCreate(folder: Folder ) {
    this.parentId.set(folder.id);
    this.name.set('test'+ Math.floor(Math.random() * 1000));
    try {
      const result = await this.createFolder.createFolder(this.name(), this.parentId());
      console.log('Folder created!', result);
      this.toastr.success('Folder created successfully');
      await this.loadFolders(); // Reload the folder list 
    } catch (e) {
      console.error('Error creating folder:', this.createFolder.error());
      this.toastr.error('Error creating folder');
    }
  }

  async renameFolder(folder: Folder, newName: string) {
    try {
      // Call Folder Service to rename folder here
      console.log('Folder renamed:', folder.id, newName);
      await this.loadFolders(); // Reload the folder list
      this.toastr.success('Folder renamed successfully');
    } catch (error) {
      console.error('Error renaming folder:', error);
      this.toastr.error('Error renaming folder');
    }
  }

  async deleteFolder(folder: Folder) {
    try {
      // Call Folder Service to delete folder here
      console.log('Folder deleted:', folder.id);
      await this.loadFolders(); // Reload the folder list
        this.toastr.success('Folder deleted successfully');
    } catch (error) {
      console.error('Error deleting folder:', error);
      this.toastr.error('Error deleting folder');
    }
  }



  startRename(folder: Folder) {
    this.editingFolderId = folder.id;
    this.renameFolderName.setValue(folder.name);
  }

  cancelRename() {
    this.editingFolderId = null;
  }


  async submitRename(folder: Folder) {
    await this.folderService.renameFolder(folder.id, this.renameFolderName.value ?? '');
    this.editingFolderId = null;
    this.loadFolders();
    this.toastr.success('Folder renamed successfully');
  }

  toggleFolder(folderId: string) {
    if (this.expandedFolders.has(folderId)) {
      this.expandedFolders.delete(folderId);
    } else {
      this.expandedFolders.add(folderId);
    }
  }
  
  isExpanded(folderId: string): boolean {
    return this.expandedFolders.has(folderId);
  }
}
