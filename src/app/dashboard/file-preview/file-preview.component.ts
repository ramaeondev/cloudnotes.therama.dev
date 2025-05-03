import { Component, OnInit } from '@angular/core';
import { PreviewService } from '../../services/preview.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

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

  getSafeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closeAllPreviews() {
    this.previewService.closeAllPreviews();
  }
}