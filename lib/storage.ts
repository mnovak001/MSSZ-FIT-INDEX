import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Allowed file extensions for security
const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.md',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.zip',
  '.rar'
]);

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validates and saves a material file securely
 */
export async function saveMaterialFile(file: File): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Validate file extension
  const extension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error(`File type .${extension} is not allowed`);
  }

  // Validate file is not empty
  if (file.size === 0) {
    throw new Error('File cannot be empty');
  }

  // Create upload directory if it doesn't exist
  await mkdir(uploadDir, { recursive: true });

  // Generate safe filename
  // Remove all characters except alphanumeric, dash, underscore, and dot
  const safeBaseName = path
    .basename(file.name, extension)
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 80);

  // Use timestamp + random string to prevent collisions and enumeration
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8);
  const fileName = `${timestamp}-${randomPart}-${safeBaseName}${extension}`;
  
  const fullPath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  
  await writeFile(fullPath, buffer);
  
  return `/uploads/${fileName}`;
}