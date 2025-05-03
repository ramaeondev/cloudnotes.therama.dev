import { Component, OnInit } from '@angular/core';
import { PreviewService } from '../../services/preview.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class FilePreviewComponent {


  constructor(
    public previewService: PreviewService, private sanitizer: DomSanitizer
  ) { }

  getSafeUrl(url: string): SafeResourceUrl {
    const fileUrl = `${url}#toolbar=0&navpanes=0&scrollbar=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
  }

  closeAllPreviews() {
    this.previewService.closeAllPreviews();
  }
}