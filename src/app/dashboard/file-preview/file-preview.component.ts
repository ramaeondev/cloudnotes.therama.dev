// file-preview.component.ts
import { Component } from '@angular/core';
import { PreviewService } from '../../services/preview.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { combineLatest, map, Observable } from 'rxjs';

interface PreviewData {
  type: 'image' | 'pdf' | 'office' | 'video' | 'audio';
  url: string;
  downloadUrl?: string;
  fileName: string;
  fileType?: string;
}

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class FilePreviewComponent {
  isLoading = true;
  activePreview$: Observable<PreviewData | null>;

  constructor(
    public previewService: PreviewService, 
    private sanitizer: DomSanitizer
  ) {
    this.activePreview$ = combineLatest([
      this.previewService.imagePreview$,
      this.previewService.pdfPreview$,
      this.previewService.officePreview$,
      this.previewService.videoPreview$,
      this.previewService.audioPreview$
    ]).pipe(
      map(([image, pdf, office, video, audio]) => {
        if (image.showPreview) {
          return {
            type: 'image',
            url: image.imageUrl,
            downloadUrl: image.imageUrl,
            fileName: image.fileName,
            fileType: 'image/' + image.fileName.split('.').pop()?.toLowerCase()
          };
        }
        if (pdf.showPreview) {
          return {
            type: 'pdf',
            url: pdf.pdfUrl,
            downloadUrl: pdf.pdfUrl,
            fileName: pdf.fileName,
            fileType: 'application/pdf'
          };
        }
        if (office.showPreview) {
          return {
            type: 'office',
            url: office.officeUrl,
            downloadUrl: office.officeUrl,
            fileName: office.fileName,
            fileType: 'application/office'
          };
        }
        if (video.showPreview) {
          return {
            type: 'video',
            url: video.videoUrl,
            downloadUrl: video.videoUrl,
            fileName: video.fileName,
            fileType: video.fileType
          };
        }
        if (audio.showPreview) {
          return {
            type: 'audio',
            url: audio.audioUrl,
            downloadUrl: audio.audioUrl,
            fileName: audio.fileName,
            fileType: audio.fileType
          };
        }
        return null;
      })
    );
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `${url}#toolbar=0&navpanes=0&scrollbar=0`
    );
  }

  onContentLoaded(): void {
    this.isLoading = false;
  }

  downloadFile(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  closeAllPreviews(): void {
    this.isLoading = true;
    this.previewService.closeAllPreviews();
  }
}