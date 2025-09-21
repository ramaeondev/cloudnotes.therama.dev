import { Component } from '@angular/core';
import { PreviewService } from '../../services/preview.service';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { map, Observable } from 'rxjs';
import { 
  FilePreviewData,
} from '../../models/preview.interface';
import { ToastrService } from 'ngx-toastr';

interface ComponentPreviewData {
  type: 'image' | 'pdf' | 'office' | 'video' | 'audio' | 'code';
  url: SafeResourceUrl;
  downloadUrl?: SafeResourceUrl | string;
  fileName: string;
  fileType?: string;
  // Additional optional properties for specific types
  posterUrl?: SafeResourceUrl | null;
  showControls?: boolean;
  autoplay?: boolean;
  language?: string;
  lineNumbers?: boolean;
  content?: string;
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
  activePreview$: Observable<ComponentPreviewData | null>;

  constructor(
    public previewService: PreviewService, private readonly toastr: ToastrService
  ) {
    this.activePreview$ = this.previewService.preview$.pipe(
      map(preview => {
        if (!preview) return null;

        const commonData = {
          fileName: preview.fileName,
          fileType: this.getFileType(preview),
          downloadUrl: this.getDownloadUrl(preview),
          showControls: true,
          autoplay: false
        };

        switch (preview.type) {
          case 'image':
            return {
              ...commonData,
              type: 'image',
              url: preview.imageUrl,
            };

          case 'pdf':
            return {
              ...commonData,
              type: 'pdf',
              url: preview.pdfUrl,
            };

          case 'office':
            return {
              ...commonData,
              type: 'office',
              url: preview.officeUrl,
            };

          case 'video':
            return {
              ...commonData,
              type: 'video',
              url: preview.videoUrl,
              posterUrl: preview.posterUrl,
              showControls: preview.showControls ?? true,
              autoplay: preview.autoplay ?? false
            };

          case 'audio':
            return {
              ...commonData,
              type: 'audio',
              url: preview.audioUrl,
              showControls: preview.showControls ?? true,
              autoplay: preview.autoplay ?? false
            };

          case 'code':
            return {
              ...commonData,
              type: 'code',
              url: preview.fileUrl,
              language: preview.language,
              lineNumbers: preview.lineNumbers ?? true,
              content: preview.content
            };

          default:
            return null;
        }
      })
    );
  }

  private getFileType(preview: FilePreviewData): string | undefined {
    if ('fileType' in preview) return preview.fileType;
    if ('imageUrl' in preview) return 'image/' + preview.fileName.split('.').pop()?.toLowerCase();
    if ('pdfUrl' in preview) return 'application/pdf';
    return undefined;
  }

  private getDownloadUrl(preview: FilePreviewData): SafeResourceUrl | string {
    switch (preview.type) {
      case 'image': return preview.imageUrl;
      case 'pdf': return preview.pdfUrl;
      case 'office': return preview.officeUrl;
      case 'video': return preview.videoUrl;
      case 'audio': return preview.audioUrl;
      case 'code': return preview.fileUrl;
      default: return '';
    }
  }

  onContentLoaded(): void {
    this.isLoading = false;
  }

  closeAllPreviews(): void {
    this.isLoading = true;
    this.previewService.closeAllPreviews();
  }

  copyCodeContent(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      // Show success notification
      this.toastr.success('Code copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy code:', err);
      this.toastr.error('Failed to copy code');
    });
  }

  
}