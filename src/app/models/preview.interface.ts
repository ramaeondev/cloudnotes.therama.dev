export interface ImagePreview {
  imageUrl: string;
  fileName: string;
  showPreview: boolean;
}

export interface PdfPreview {
  pdfUrl: any;  // Using 'any' for DomSanitizer bypass
  fileName: string;
  showPreview: boolean;
}

export interface OfficePreview {
  officeUrl: any;  // Using 'any' for DomSanitizer bypass
  fileName: string;
  showPreview: boolean;
}

export interface VideoPreview {
  videoUrl: any;  // Using 'any' for DomSanitizer bypass
  fileName: string;
  showPreview: boolean;
  fileType?: string;
}

export interface AudioPreview {
  audioUrl: string;
  fileName: string;
  showPreview: boolean;
  fileType?: string;
}

export interface DefaultPreview {
  url: string;
  fileName: string;
}