import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SupabaseClient } from '@supabase/supabase-js';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';
import { Folder, FolderTreeResponse } from '../models/folder.interface';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private readonly CREATE_FOLDER_URL = environment.supabase_url.replace(/\/$/, '') + '/functions/v1/create-folder';
  private readonly CREATE_ROOT_FOLDER_URL = environment.supabase_url.replace(/\/$/, '') + '/functions/v1/create-root-folder';
  private readonly GET_FOLDER_STRUCTURE_URL = `${environment.supabase_url}/functions/v1/fetch-folder-structure`;
  private readonly FETCH_FILES_AND_FOLDERS_URL = `${environment.supabase_url}/functions/v1/fetch-files-folders`;
  private readonly FETCH_FILES_AND_FOLDERS_PROPERTIES_URL = `${environment.supabase_url}/functions/v1/get-folder-properties`;

  private readonly supabase: SupabaseClient;

  constructor(
    private readonly http: HttpClient,
    private readonly supabaseService: SupabaseService
  ) {
    this.supabase = this.supabaseService.supabase;  // Get the SupabaseClient
  }

  async createFolder(name: string, parentFolderId: string | null = null): Promise<any> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error || !user) throw new Error('Not authenticated');

    const token = (await this.supabase.auth.getSession()).data.session?.access_token;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const body = {
      name,
      user_id: user.id,
      parent_folder_id: parentFolderId,
    };

    return firstValueFrom(this.http.post(this.CREATE_FOLDER_URL, body, { headers }));
  }

  async createRootFolder(): Promise<void> {
    const token = (await this.supabase.auth.getSession()).data.session?.access_token;
    if (!token) throw new Error('Access token missing');
  
    const res = await fetch(this.CREATE_ROOT_FOLDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Root' }),
    });
  
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(`${res.status} - ${error.error || 'Failed to create root folder'}`);
    }
  }
  
  async getFolderStructure(userId: string): Promise<Folder[]> {
    const token = (await this.supabaseService.supabase.auth.getSession()).data.session?.access_token;

    if (!token) throw new Error('Access token missing');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const res = await firstValueFrom(this.http.get<{ folderTree: Folder[] }>(`${this.GET_FOLDER_STRUCTURE_URL}?user_id=${userId}`, { headers }));

    return res.folderTree;
  }



renameFolder(id: string, newName: string) {
  return firstValueFrom(this.http.put(`${this.GET_FOLDER_STRUCTURE_URL}/rename-folder/${id}`, { name: newName }));
}

deleteFolder(id: string) {
  return firstValueFrom(this.http.delete(`${this.GET_FOLDER_STRUCTURE_URL}/delete-folder/${id}`));
}

async fetchFoldersAndFiles(): Promise<FolderTreeResponse> {
  try {
    const response = await firstValueFrom(
      this.http.get<FolderTreeResponse>(this.FETCH_FILES_AND_FOLDERS_URL)
    );
    return response;
  } catch (error) {
    console.error('Error fetching folder and file data:', error);
    throw error;
  }
}

getProperties(path: string):Observable<any>{
  return this.http.post<Observable<any>>(this.FETCH_FILES_AND_FOLDERS_PROPERTIES_URL,{  "folder_path": path});
}
}
