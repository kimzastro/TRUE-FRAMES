export interface Subject {
  id: string; // e.g., 'cse'
  name: string; // e.g., 'Computer Science & Engineering'
  description: string;
  icon?: string; // Custom profile picture icon preset ID
}

export interface Material {
  id: string;
  title: string;
  subjectId: string;
  semester: number; // 1 to 8
  category: "pyqs" | "notes" | "short_notes";
  tags: string[];
  driveLink: string;
  uploadDate: string;
  fileName?: string;
  fileSize?: number;
}

export interface Registration {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  registrationDate: string;
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'subject'; subjectId: string }
  | { type: 'semester'; subjectId: string; semester: number }
  | { type: 'category'; subjectId: string; semester: number; category: "pyqs" | "notes" | "short_notes" };

export type ThemeMode = "light" | "dark" | "system";
