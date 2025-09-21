import { SafeResourceUrl } from '@angular/platform-browser';

// Base interface for common properties
interface BasePreviewData {
  fileName: string;
  showPreview: boolean;
}

export interface ImagePreviewData extends BasePreviewData {
  type: 'image';
  imageUrl: SafeResourceUrl;
  fileType?: `image/${string}`;
}

export interface PdfPreviewData extends BasePreviewData {
  type: 'pdf';
  pdfUrl: SafeResourceUrl;  // Proper type instead of 'any'
  fileType: 'application/pdf';
}

export interface OfficePreviewData extends BasePreviewData {
  type: 'office';
  officeUrl: SafeResourceUrl;  // Proper type instead of 'any'
  fileType?: 'application/msword' | 'application/vnd.ms-excel' | 'application/vnd.ms-powerpoint' | string;
}

export interface VideoPreviewData extends BasePreviewData {
  type: 'video';
  videoUrl: SafeResourceUrl;  // Proper type instead of 'any'
  fileType: `video/${string}`;
  posterUrl?: SafeResourceUrl | null; // Optional thumbnail
  showPoster?: boolean; // Optional flag to show poster
  showControls?: boolean; // Optional flag to show controls
  autoplay?: boolean; // Optional flag for autoplay
  loop?: boolean; // Optional flag for looping
  muted?: boolean; // Optional flag for muted
  preload?: 'auto' | 'metadata' | 'none'; // Optional preload attribute
  volume?: number; // Optional volume level
  playbackRate?: number; // Optional playback rate
  duration?: number; // Optional duration of the audio
}

export interface AudioPreviewData extends BasePreviewData {
  type: 'audio';
  audioUrl: string | SafeResourceUrl;
  fileType: `audio/${string}`;
  coverArtUrl?: SafeResourceUrl | null; // Optional cover art
  showCoverArt?: boolean; // Optional flag to show cover art
  showControls?: boolean; // Optional flag to show controls
  autoplay?: boolean; // Optional flag for autoplay
  loop?: boolean; // Optional flag for looping
  muted?: boolean; // Optional flag for muted
  preload?: 'auto' | 'metadata' | 'none'; // Optional preload attribute
  volume?: number; // Optional volume level
  playbackRate?: number; // Optional playback rate
  duration?: number; // Optional duration of the audio
}

export interface CodePreviewData extends BasePreviewData {
  type: 'code';
  fileUrl: SafeResourceUrl;  
  fileType: string; // Can keep as string for backward compatibility
  language: CodeLanguage; // More specific type
  showPreview: boolean;
  lineNumbers?: boolean;
  maxLines?: number;
  content?: string; // Optional direct content
}

export interface DefaultPreviewData extends BasePreviewData {
  type: 'default';
  url: string | SafeResourceUrl;
}

export type FilePreviewData = 
  | ImagePreviewData
  | PdfPreviewData
  | OfficePreviewData
  | VideoPreviewData
  | AudioPreviewData
  | CodePreviewData
  | DefaultPreviewData;

// Utility type to extract the data type by preview type
export type PreviewDataType<T extends FilePreviewData['type']> = Extract<FilePreviewData, { type: T }>;

export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'html'
  | 'css'
  | 'cpp'
  | 'python'
  | 'java'
  | 'php'
  | 'bash'
  | 'markdown'
  | 'yaml'
  | 'plaintext';

