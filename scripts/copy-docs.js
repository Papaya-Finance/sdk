const fs = require('fs');
const path = require('path');

// Define source and destination directories
const sourceDir = path.join(__dirname, '..', 'documentation');
const destDir = path.join(__dirname, '..', 'dist', 'documentation');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

// Get all files from source directory
const files = fs.readdirSync(sourceDir);

// Copy each file to destination
files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);
  
  // Skip if not a file
  if (!fs.statSync(sourcePath).isFile()) return;
  
  // Copy the file
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Copied: ${file}`);
});

console.log('Documentation files copied successfully!'); 