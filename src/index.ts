/**
 * Vercel Blob Upload Action
 * 
 * This GitHub Action uploads files to Vercel Blob storage using the official Vercel Blob SDK.
 * It accepts a source file path, destination path, and read-write token as inputs.
 */

// Import required modules
import * as core from '@actions/core';  // GitHub Actions toolkit for inputs, outputs, and logging
import fs from 'fs';                    // Node.js file system module for file operations
import path from 'path';                // Node.js path module for path operations
import { put } from '@vercel/blob';     // Vercel Blob SDK for uploading files

/**
 * Recursively gets all files in a directory
 * @param dirPath - Directory path to scan
 * @param fileList - Array to store file paths (used for recursion)
 * @returns Array of file paths
 */
function getAllFiles(dirPath: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively get files from subdirectories
      getAllFiles(filePath, fileList);
    } else {
      // Add file to the list
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Uploads a single file to Vercel Blob storage
 * @param filePath - Path to the file to upload
 * @param destinationPath - Destination path in Vercel Blob storage
 * @returns Promise resolving to the upload result
 */
async function uploadFile(filePath: string, destinationPath: string): Promise<void> {
  const fileStream = fs.createReadStream(filePath);
  
  await put(destinationPath, fileStream, {
    access: 'public'
  });
}

/**
 * Main function that executes the action
 * Handles file or folder upload to Vercel Blob storage with proper error handling
 */
async function run(): Promise<void> {
  try {
    // Get input parameters from the GitHub Action workflow
    // These are defined in action.yml and passed from the workflow file
    const sourcePath = core.getInput('source', { required: true });
    const destinationPath = core.getInput('destination', { required: true });
    const token = core.getInput('read-write-token', { required: true });

    // Validate that the token was provided
    // This is a critical security requirement for accessing Vercel Blob storage
    if (!token) {
      throw new Error('Vercel Blob read-write token is required. Please set the read-write-token input with your BLOB_READ_WRITE_TOKEN.');
    }

    // Check if the source path exists before attempting upload
    // This prevents unnecessary API calls and provides clear error messages
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    // Set the token as an environment variable for the Vercel Blob SDK
    // The SDK automatically reads BLOB_READ_WRITE_TOKEN from environment variables
    process.env.BLOB_READ_WRITE_TOKEN = token;

    const stat = fs.statSync(sourcePath);

    // Handle single file upload
    if (stat.isFile()) {
      core.info(`Uploading file from ${sourcePath} to ${destinationPath}`);
      await uploadFile(sourcePath, destinationPath);
      core.info('File uploaded successfully to Vercel Blob. Check your Vercel dashboard to access the file.');
      return;
    }

    // Handle folder upload
    if (stat.isDirectory()) {
      core.info(`Uploading folder from ${sourcePath} to ${destinationPath}`);
      
      const files = getAllFiles(sourcePath);
      
      if (files.length === 0) {
        core.warning('No files found in the specified directory.');
        return;
      }

      core.info(`Found ${files.length} files to upload`);

      // Upload each file
      for (const filePath of files) {
        // Calculate relative path from source directory
        const relativePath = path.relative(sourcePath, filePath);
        // Create destination path by joining the destination with the relative path
        const fileDestination = path.posix.join(destinationPath, relativePath);
        
        core.info(`Uploading: ${relativePath} → ${fileDestination}`);
        await uploadFile(filePath, fileDestination);
      }

      core.info(`Successfully uploaded ${files.length} files to Vercel Blob. Check your Vercel dashboard to access the files.`);
      return;
    }

    // If neither file nor directory, throw error
    throw new Error(`Source path is neither a file nor a directory: ${sourcePath}`);

  } catch (error) {
    // Handle any errors that occur during the upload process
    // This will mark the action as failed and display the error message in the workflow
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    core.setFailed(errorMessage);
  }
}

// Execute the main function
// This is the entry point when the action runs
run(); 