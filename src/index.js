import * as core from '@actions/core';
import fs from 'fs';
import { put } from '@vercel/blob';

async function run() {
  try {
    const sourcePath = core.getInput('source', { required: true });
    const destinationPath = core.getInput('destination', { required: true });
    const token = core.getInput('vercelToken', { required: true });

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file does not exist: ${sourcePath}`);
    }

    const fileStream = fs.createReadStream(sourcePath);

    const result = await put(destinationPath, fileStream, {
      token,
    });

    core.info(`File uploaded to ${result.url}`);
    core.setOutput('url', result.url);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();