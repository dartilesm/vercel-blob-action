import * as core from '@actions/core';
import fs from 'fs';
import { put } from '@vercel/blob';

async function run() {
  try {
    const sourcePath = core.getInput('source', { required: true });
    const destinationPath = core.getInput('destination', { required: true });
    const token = core.getInput('read-write-token', { required: true });

    if (!token) {
      throw new Error('Vercel Blob read-write token is required. Please set the read-write-token input with your BLOB_READ_WRITE_TOKEN.');
    }

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file does not exist: ${sourcePath}`);
    }

    core.info(`Uploading file from ${sourcePath} to ${destinationPath}`);

    const fileStream = fs.createReadStream(sourcePath);

    // Set the token as an environment variable for the Vercel Blob SDK
    process.env.BLOB_READ_WRITE_TOKEN = token;

    const result = await put(destinationPath, fileStream, {
      access: 'public'
    });

    core.info(`File uploaded successfully to ${result.url}`);
    core.setOutput('url', result.url);
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();