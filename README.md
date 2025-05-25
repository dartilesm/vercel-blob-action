# Upload to Vercel Blob

This GitHub Action allows you to upload files to Vercel Blob storage by specifying a source file and destination path. It provides an easy way to manage blob storage in your Vercel projects through GitHub Actions workflows.

## Inputs

### `source`

**Required** The source path of the file you want to upload to Vercel Blob storage.

### `destination`

**Required** The destination path where the file should be stored in Vercel Blob storage.

### `read-write-token`

**Required** Your Vercel Blob read-write token (`BLOB_READ_WRITE_TOKEN`). This should be stored as a GitHub secret for security.

## Outputs

### `url`

The URL of the uploaded blob file.

## Environment Variables

This action requires a Vercel Blob read-write token. The action will automatically set the `BLOB_READ_WRITE_TOKEN` environment variable for the Vercel Blob SDK to use. You can obtain this token from your Vercel dashboard:

1. Go to your Vercel dashboard
2. Navigate to Storage → Blob
3. Create or copy your `BLOB_READ_WRITE_TOKEN`
4. Add it as a GitHub secret in your repository

## Usage

To use this action in your workflow, add it as a step in your GitHub Actions workflow file:

```yaml
name: Upload to Vercel Blob

on: [push]

jobs:
  upload_blob:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Upload file to Vercel Blob
        uses: dartilesm/vercel-blob-action@v1
        with:
          source: "path/to/your/file.txt"
          destination: "uploads/file.txt"
          read-write-token: ${{ secrets.BLOB_READ_WRITE_TOKEN }}
```

## Example

Here's a complete example that uploads a build artifact to Vercel Blob storage:

```yaml
name: Build and Upload

on:
  push:
    branches: [main]

jobs:
  build-and-upload:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build project
        run: |
          # Your build commands here
          echo "Built file" > dist/output.txt

      - name: Upload to Vercel Blob
        uses: dartilesm/vercel-blob-action@v1
        with:
          source: "dist/output.txt"
          destination: "builds/output-${{ github.sha }}.txt"
          read-write-token: ${{ secrets.BLOB_READ_WRITE_TOKEN }}

      - name: Display blob URL
        run: echo "File uploaded to ${{ steps.upload.outputs.url }}"
```

## Setting up the Token

1. **Get your Vercel Blob token:**

   - Visit your [Vercel dashboard](https://vercel.com/dashboard)
   - Go to Storage → Blob
   - Create or copy your `BLOB_READ_WRITE_TOKEN`

2. **Add the token to GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `BLOB_READ_WRITE_TOKEN`
   - Value: Your Vercel Blob token

## License

This project is licensed under the ISC License.
