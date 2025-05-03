import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ImagePreview, PdfPreview, OfficePreview, VideoPreview, AudioPreview } from '../models/preview.interface';


@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  // Image Preview
  private imagePreviewSubject = new BehaviorSubject<ImagePreview>({
    imageUrl: '',
    fileName: '',
    showPreview: false
  });
  imagePreview$ = this.imagePreviewSubject.asObservable();

  // PDF Preview
  private pdfPreviewSubject = new BehaviorSubject<PdfPreview>({
    pdfUrl: null,
    fileName: '',
    showPreview: false
  });
  pdfPreview$ = this.pdfPreviewSubject.asObservable();

  // Office Preview
  private officePreviewSubject = new BehaviorSubject<OfficePreview>({
    officeUrl: null,
    fileName: '',
    showPreview: false
  });
  officePreview$ = this.officePreviewSubject.asObservable();

  // Video Preview
  private videoPreviewSubject = new BehaviorSubject<VideoPreview>({
    videoUrl: null,
    fileName: '',
    showPreview: false
  });
  videoPreview$ = this.videoPreviewSubject.asObservable();

  // Audio Preview
  private audioPreviewSubject = new BehaviorSubject<AudioPreview>({
    audioUrl: '',
    fileName: '',
    showPreview: false
  });
  audioPreview$ = this.audioPreviewSubject.asObservable();

  // Methods to update preview states
  sendImagePreview(data: ImagePreview) {
    this.imagePreviewSubject.next(data);
  }

  sendPdfPreview(data: PdfPreview) {
    this.pdfPreviewSubject.next(data);
  }

  sendOfficePreview(data: OfficePreview) {
    this.officePreviewSubject.next(data);
  }

  sendVideoPreview(data: VideoPreview) {
    // Add file type if needed
    const extension = data.fileName.split('.').pop()?.toLowerCase();
    data.fileType = `video/${extension}`;
    this.videoPreviewSubject.next(data);
  }

  sendAudioPreview(data: AudioPreview) {
    // Add file type if needed
    const extension = data.fileName.split('.').pop()?.toLowerCase();
    data.fileType = `audio/${extension}`;
    this.audioPreviewSubject.next(data);
  }

  // Method to close all previews
  closeAllPreviews() {
    this.imagePreviewSubject.next({ imageUrl: '', fileName: '', showPreview: false });
    this.pdfPreviewSubject.next({ pdfUrl: null, fileName: '', showPreview: false });
    this.officePreviewSubject.next({ officeUrl: null, fileName: '', showPreview: false });
    this.videoPreviewSubject.next({ videoUrl: null, fileName: '', showPreview: false });
    this.audioPreviewSubject.next({ audioUrl: '', fileName: '', showPreview: false });
    this._hasActivePreview.next(false);
  }

  private _hasActivePreview = new BehaviorSubject<boolean>(false);
  hasActivePreview$ = this._hasActivePreview.asObservable();
}