/**
 * Utility functions for file-related operations
 */

/**
 * Returns the appropriate Font Awesome icon class based on file extension
 * @param fileName The full filename including extension
 * @returns Font Awesome icon class string
 */
export function getFileIcon(fileName: string | null): string {
  if (!fileName) return 'fa-file';
  
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Map file extensions to Font Awesome icons
  switch (extension) {
    case 'pdf':
      return 'fa-file-pdf';
    case 'doc':
    case 'docx':
      return 'fa-file-word';
    case 'xls':
    case 'xlsx':
      return 'fa-file-excel';
    case 'ppt':
    case 'pptx':
      return 'fa-file-powerpoint';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
      return 'fa-file-image';
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'wmv':
      return 'fa-file-video';
    case 'mp3':
    case 'wav':
    case 'ogg':
      return 'fa-file-audio';
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return 'fa-file-archive';
    case 'html':
    case 'htm':
      return 'fa-file-code';
    case 'txt':
      return 'fa-file-alt';
    case 'js':
    case 'ts':
    case 'py':
    case 'java':
    case 'c':
    case 'cpp':
    case 'php':
    case 'css':
    case 'scss':
      return 'fa-file-code';
    default:
      return 'fa-file';
  }
}

/**
 * Returns appropriate folder icon based on folder state
 * @param isExpanded Whether the folder is expanded
 * @returns Font Awesome icon class string
 */
export function getFolderIcon(isExpanded: boolean): string {
  return isExpanded ? 'fa-folder-open' : 'fa-folder';
}