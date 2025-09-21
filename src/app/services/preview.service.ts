import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  FilePreviewData,
  ImagePreviewData,
  PdfPreviewData,
  OfficePreviewData,
  VideoPreviewData,
  AudioPreviewData,
  CodePreviewData,
} from '../models/preview.interface';

@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  // Main preview state subject
  private previewSubject = new BehaviorSubject<FilePreviewData | null>(null);
  public preview$ = this.previewSubject.asObservable();

  // Active preview flag
  private hasActivePreviewSubject = new BehaviorSubject<boolean>(false);
  public hasActivePreview$ = this.hasActivePreviewSubject.asObservable();

  // Image Preview
  sendImagePreview(data: Omit<ImagePreviewData, 'type'>): void {
    this.previewSubject.next({
      type: 'image',
      imageUrl: data.imageUrl, // Already sanitized
      fileName: data.fileName,
      showPreview: true,
      fileType: data.fileType
    });
    this.updateActivePreview(true);
  }

  // PDF Preview
  sendPdfPreview(data: Omit<PdfPreviewData, 'type'>): void {
    this.previewSubject.next({
      type: 'pdf',
      pdfUrl: data.pdfUrl, // Already sanitized
      fileName: data.fileName,
      showPreview: true,
      fileType: 'application/pdf'
    });
    this.updateActivePreview(true);
  }

  // Office Preview
  sendOfficePreview(data: Omit<OfficePreviewData, 'type'>): void {
    this.previewSubject.next({
      type: 'office',
      officeUrl: data.officeUrl, // Already sanitized
      fileName: data.fileName,
      showPreview: true,
      fileType: data.fileType
    });
    this.updateActivePreview(true);
  }

  // Video Preview
  sendVideoPreview(data: Omit<VideoPreviewData, 'type'>): void {
    this.previewSubject.next({
      type: 'video',
      videoUrl: data.videoUrl, // Already sanitized
      fileName: data.fileName,
      showPreview: true,
      fileType: data.fileType,
      posterUrl: data.posterUrl, // Already sanitized
      showPoster: data.showPoster ?? true,
      showControls: data.showControls ?? true,
      autoplay: data.autoplay ?? false,
      loop: data.loop ?? false,
      muted: data.muted ?? false,
      preload: data.preload || 'metadata'
    });
    this.updateActivePreview(true);
  }

  // Audio Preview
  sendAudioPreview(data: Omit<AudioPreviewData, 'type'>): void {
    this.previewSubject.next({
      type: 'audio',
      audioUrl: data.audioUrl, // Already sanitized
      fileName: data.fileName,
      showPreview: true,
      fileType: data.fileType,
      coverArtUrl: data.coverArtUrl, // Already sanitized
      showCoverArt: data.showCoverArt ?? true,
      showControls: data.showControls ?? true,
      autoplay: data.autoplay ?? false,
      loop: data.loop ?? false,
      muted: data.muted ?? false,
      preload: data.preload || 'metadata'
    });
    this.updateActivePreview(true);
  }

  // Code Preview
  sendCodePreview(data: Omit<CodePreviewData, 'type'>): void {
    this.previewSubject.next({
      type: 'code',
      fileUrl: data.fileUrl, // Already sanitized
      fileName: data.fileName,
      showPreview: true,
      fileType: data.fileType,
      language: data.language,
      lineNumbers: data.lineNumbers ?? true,
      maxLines: data.maxLines || 1000,
      content: data.content
    });
    this.updateActivePreview(true);
  }

  // Close all previews
  closeAllPreviews(): void {
    this.previewSubject.next(null);
    this.updateActivePreview(false);
  }

  private updateActivePreview(state: boolean): void {
    this.hasActivePreviewSubject.next(state);
  }
}