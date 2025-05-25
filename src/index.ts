/**
 * Vercel Blob Upload Action
 * 
 * This GitHub Action uploads files to Vercel Blob storage using the official Vercel Blob SDK.
 * It accepts a source file path, destination path, and read-write token as inputs.
 */

// Import required modules
import * as core from '@actions/core';  // GitHub Actions toolkit for inputs, outputs, and logging
import fs from 'fs';                    // Node.js file system module for file operations
import { put } from '@vercel/blob';     // Vercel Blob SDK for uploading files

/**
 * Main function that executes the action
 * Handles file upload to Vercel Blob storage with proper error handling
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

    // Check if the source file exists before attempting upload
    // This prevents unnecessary API calls and provides clear error messages
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file does not exist: ${sourcePath}`);
    }

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
    const result = await put(destinationPath, fileStream, {
      access: 'public'
    });

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