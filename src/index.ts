/**
 * Vercel Blob Upload Action
 * 
 * This GitHub Action uploads files to Vercel Blob storage using the official Vercel Blob SDK.
 * It accepts a source file path, destination path, and read-write token as inputs.
 */

// Import required modules
import * as core from '@actions/core';  // GitHub Actions toolkit for inputs, outputs, and logging
import fs from 'fs';                    // Node.js file system module for file operations
import { put, type PutBlobResult } from '@vercel/blob';     // Vercel Blob SDK for uploading files

/**
 * Interface for action inputs
 */
interface ActionInputs {
  sourcePath: string;
  destinationPath: string;
  token: string;
}

/**
 * Gets and validates input parameters from the GitHub Action workflow
 * @returns Validated action inputs
 * @throws Error if required inputs are missing or invalid
 */
function getActionInputs(): ActionInputs {
  const sourcePath = core.getInput('source', { required: true });
  const destinationPath = core.getInput('destination', { required: true });
  const token = core.getInput('read-write-token', { required: true });

  // Validate that the token was provided
  // This is a critical security requirement for accessing Vercel Blob storage
  if (!token) {
    throw new Error('Vercel Blob read-write token is required. Please set the read-write-token input with your BLOB_READ_WRITE_TOKEN.');
  }

  // Validate that source path is provided
  if (!sourcePath) {
    throw new Error('Source path is required. Please set the source input.');
  }

  // Validate that destination path is provided
  if (!destinationPath) {
    throw new Error('Destination path is required. Please set the destination input.');
  }

  return {
    sourcePath,
    destinationPath,
    token
  };
}

/**
 * Validates that the source file exists
 * @param sourcePath - Path to the source file
 * @throws Error if the file doesn't exist
 */
function validateSourceFile(sourcePath: string): void {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file does not exist: ${sourcePath}`);
  }
}

/**
 * Uploads a file to Vercel Blob storage
 * @param sourcePath - Path to the source file
 * @param destinationPath - Destination path in Vercel Blob storage
 * @param token - Vercel Blob read-write token
 * @returns Promise resolving to the upload result
 */
async function uploadToVercelBlob(
  sourcePath: string, 
  destinationPath: string, 
  token: string
): Promise<PutBlobResult> {
  // Log the upload operation for debugging and monitoring
  core.info(`Uploading file from ${sourcePath} to ${destinationPath}`);

  // Create a readable stream from the source file
  // Streaming is more memory-efficient for large files
  const fileStream = fs.createReadStream(sourcePath);

  // Set the token as an environment variable for the Vercel Blob SDK
  // The SDK automatically reads BLOB_READ_WRITE_TOKEN from environment variables
  process.env.BLOB_READ_WRITE_TOKEN = token;

  // Upload the file to Vercel Blob storage
  // The put() function handles the actual upload and returns metadata about the uploaded blob
  const result = await put(destinationPath, fileStream);

  return result;
}

/**
 * Main function that executes the action
 * Handles file upload to Vercel Blob storage with proper error handling
 */
async function run(): Promise<void> {
  try {
    // Get and validate input parameters from the GitHub Action workflow
    const { sourcePath, destinationPath, token } = getActionInputs();

    // Check if the source file exists before attempting upload
    // This prevents unnecessary API calls and provides clear error messages
    validateSourceFile(sourcePath);

    // Upload the file to Vercel Blob storage
    const result = await uploadToVercelBlob(sourcePath, destinationPath, token);

    // Log successful upload and provide the blob URL
    core.info(`File uploaded successfully to ${result.url}`);

    // Set the blob URL as an output that can be used by subsequent workflow steps
    // Other steps can access this via: ${{ steps.step-id.outputs.url }}
    core.setOutput('url', result.url);

  } catch (error) {
    // Handle any errors that occur during the upload process
    // This will mark the action as failed and display the error message in the workflow
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    core.setFailed(`Action failed: ${errorMessage}`);
  }
}

// Execute the main function
// This is the entry point when the action runs
run(); 