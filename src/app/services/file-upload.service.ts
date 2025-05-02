import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { firstValueFrom, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';
@Injectable({
  providedIn: 'root',
})
export class FileUploadService {

  private readonly uploadEndpoint = environment.supabase_url.replace(/\/$/, '') + '/functions/v1/upload-files';

  constructor(private readonly http: HttpClient, private readonly supabase: SupabaseService) {}

  async uploadFiles(files: File[], folderId: string) {
    const formData = new FormData();
    const userId = (await this.supabase.supabase.auth.getSession()).data.session?.user?.id;
    if (!userId) throw new Error('Not authenticated');
    formData.append('user_id', userId);
    formData.append('folder_id', folderId);
    files.forEach((file) => formData.append('file', file)); 

    return await firstValueFrom(
      this.http
        .post(this.uploadEndpoint, formData)
        .pipe(catchError(this.handleError))
    );
  }
  
  private handleError(error: any) {
    console.error(error);
    return throwError(() => error);
  }
}
