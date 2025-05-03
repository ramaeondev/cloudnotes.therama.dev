import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})

export class FileUploadService {

  private readonly uploadEndpoint = environment.supabase_url.replace(/\/$/, '') + '/functions/v1/upload-files';
  private readonly getSingedUrl = environment.supabase_url.replace(/\/$/, '') + '/functions/v1/generate-s3-url-download';
  private readonly getSingedUrlPreview = environment.supabase_url.replace(/\/$/, '') + '/functions/v1/generate-s3-url-preview';

  constructor(private readonly http: HttpClient, private readonly supabase: SupabaseService) { }

  getFileType(s3Key: string): string {
    const extension = s3Key.split('.').pop()?.toLowerCase() || '';
    
    // Image types
    const images = ['webp', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'tiff'];
    if (images.includes(extension)) return 'image';
    
    // Documents
    const documents = ['pdf', 'txt'];
    if (documents.includes(extension)) return 'document';
    
    // Office files
    const officeFiles = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    if (officeFiles.includes(extension)) return 'office';
    
    // Code files
    const codeFiles = ['js', 'ts', 'html', 'css', 'json', 'xml'];
    if (codeFiles.includes(extension)) return 'code';
    
    return 'other';
  }

  
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

  handleFile(s3Key: string): Observable<string> {
    return this.http.post<{ url: string }>(this.getSingedUrl, { s3Key }).pipe(
      map(response => response.url),
      catchError((error) => {
        console.error('Error generating signed URL:', error);
        return throwError(() => new Error('Error generating signed URL'));
      })
    );
  }

  handlePreviewFile(s3Key: string): Observable<string> {
    return this.http.post<{ url: string }>(this.getSingedUrlPreview, { s3Key }).pipe(
      map(response => response.url),
      catchError((error) => {
        console.error('Error generating signed URL:', error);
        return throwError(() => new Error('Error generating signed URL'));
      })
    );
  }


}
