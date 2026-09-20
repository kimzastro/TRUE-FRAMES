export interface DriveLinkInfo {
  originalUrl: string;
  isGoogleDrive: boolean;
  fileId?: string;
  previewUrl: string;
  directDownloadUrl: string;
  viewUrl: string;
}

export function parseDriveLink(url: string): DriveLinkInfo {
  if (!url) {
    return {
      originalUrl: "",
      isGoogleDrive: false,
      previewUrl: "",
      directDownloadUrl: "",
      viewUrl: "",
    };
  }

  const cleanUrl = url.trim();

  // Match Google Drive file patterns:
  // 1. /file/d/FILE_ID/view, /edit, etc.
  // 2. id=FILE_ID
  // 3. /document/d/DOC_ID/edit
  // 4. /spreadsheets/d/SHEET_ID/edit
  // 5. /presentation/d/SLIDE_ID/edit
  const fileIdMatch = cleanUrl.match(
    /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/(?:document|spreadsheets|presentation)\/d\/)([a-zA-Z0-9_-]{15,})/
  );

  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    
    let previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    let viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    let directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    if (cleanUrl.includes("/document/d/")) {
      previewUrl = `https://docs.google.com/document/d/${fileId}/preview`;
      viewUrl = `https://docs.google.com/document/d/${fileId}/view`;
      directDownloadUrl = `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
    } else if (cleanUrl.includes("/spreadsheets/d/")) {
      previewUrl = `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
      viewUrl = `https://docs.google.com/spreadsheets/d/${fileId}/view`;
      directDownloadUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`;
    } else if (cleanUrl.includes("/presentation/d/")) {
      previewUrl = `https://docs.google.com/presentation/d/${fileId}/preview`;
      viewUrl = `https://docs.google.com/presentation/d/${fileId}/view`;
      directDownloadUrl = `https://docs.google.com/presentation/d/${fileId}/export/pdf`;
    }

    return {
      originalUrl: cleanUrl,
      isGoogleDrive: true,
      fileId,
      previewUrl,
      directDownloadUrl,
      viewUrl,
    };
  }

  return {
    originalUrl: cleanUrl,
    isGoogleDrive: cleanUrl.includes("drive.google.com") || cleanUrl.includes("docs.google.com"),
    previewUrl: cleanUrl,
    directDownloadUrl: cleanUrl,
    viewUrl: cleanUrl,
  };
}

export function formatBytes(bytes?: number, decimals = 2) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(dateString: string) {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
}

