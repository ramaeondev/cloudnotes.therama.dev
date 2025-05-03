import { Component, OnDestroy, OnInit } from '@angular/core';
import { PreviewService } from '../../services/preview.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ImagePreview } from '../../models/preview.interface';

@Component({
  selector: 'app-image-preview',
  standalone: true,
  templateUrl: './image-preview.component.html',
  styleUrl: './image-preview.component.scss'
})
export class ImagePreviewComponent implements OnInit, OnDestroy {

  imageUrl: string = '';
  fileName: string = '';
  showPreview: boolean = false;

  constructor(private readonly previewService: PreviewService, private readonly router: Router, private readonly toaster: ToastrService) {}
  ngOnInit() {
    this.previewService.imagePreview$.subscribe((data: ImagePreview) => {
      this.imageUrl = data.imageUrl;
      this.showPreview = data.showPreview;
      this.fileName = data.fileName;
    })
  }

  ngOnDestroy(): void {
    this.closePreview()  
  }

  closePreview() {
    this.previewService.sendImagePreview({ imageUrl: '', fileName: '', showPreview: false });
    this.router.navigate(['dashboard']);
  }

  downloadImage() {
    const link = document.createElement('a');
    link.href = this.imageUrl;
    link.download = this.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  copyImageUrl() {
    navigator.clipboard.writeText(this.imageUrl).then(() => {
      this.toaster.success('Image URL copied to clipboard!', 'Success');
    }).catch(err => {
      console.error('Failed to copy image URL: ', err);
    });
  }
}
