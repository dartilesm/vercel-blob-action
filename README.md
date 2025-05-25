# Upload to Vercel Blob

This GitHub Action allows you to upload files or entire folders to Vercel Blob storage by specifying a source path and destination path. It provides an easy way to manage blob storage in your Vercel projects through GitHub Actions workflows.

## Inputs

### `source`

**Required** The source path of the file or folder you want to upload to Vercel Blob storage.

- **File**: Upload a single file
- **Folder**: Upload all files within the folder (including subdirectories)

### `destination`

**Required** The destination path where the file(s) should be stored in Vercel Blob storage.

- **For files**: The exact destination path for the file
- **For folders**: The base path where all files will be uploaded (maintaining folder structure)

### `read-write-token`

**Required** Your Vercel Blob read-write token (`BLOB_READ_WRITE_TOKEN`). This should be stored as a GitHub secret for security.

## Outputs

This action does not provide any outputs for privacy and security reasons. To access your uploaded files, check your Vercel dashboard under Storage → Blob.

## Environment Variables

This action requires a Vercel Blob read-write token. The action will automatically set the `BLOB_READ_WRITE_TOKEN` environment variable for the Vercel Blob SDK to use. You can obtain this token from your Vercel dashboard:

1. Go to your Vercel dashboard
2. Navigate to Storage → Blob
3. Create or copy your `BLOB_READ_WRITE_TOKEN`
4. Add it as a GitHub secret in your repository

## Usage

### Single File Upload

Upload a single file to Vercel Blob storage:

```yaml
name: Upload Single File

on:
  push:
    branches: [main]

jobs:
  upload-file:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Upload file to Vercel Blob
        uses: dartilesm/vercel-blob-action@v2
        with:
          source: "path/to/file.txt"
          destination: "uploads/file.txt"
          read-write-token: ${{ secrets.BLOB_READ_WRITE_TOKEN }}
```

### Folder Upload

Upload an entire folder (including subdirectories) to Vercel Blob storage:

```yaml
name: Upload Build Folder

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
          mkdir -p dist/assets
          echo "Main file" > dist/index.html
          echo "Stylesheet" > dist/assets/style.css
          echo "Script" > dist/assets/script.js

      - name: Upload entire build folder to Vercel Blob
        uses: dartilesm/vercel-blob-action@v2
        with:
          source: "dist/"
          destination: "builds/${{ github.sha }}"
          read-write-token: ${{ secrets.BLOB_READ_WRITE_TOKEN }}
```

This will upload all files maintaining the folder structure:

- `dist/index.html` → `builds/{sha}/index.html`
- `dist/assets/style.css` → `builds/{sha}/assets/style.css`
- `dist/assets/script.js` → `builds/{sha}/assets/script.js`

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

## Development

This action is built with TypeScript and uses a build process to bundle all dependencies into a single JavaScript file. This means consumers don't need to install dependencies when using the action.

### Prerequisites

- Node.js 20 or later
- npm or bun

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/dartilesm/vercel-blob-action.git
   cd vercel-blob-action
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

### Building

The action uses TypeScript and needs to be built before it can be used:

```bash
npm run build
# or
bun run build
```

This command:

1. Compiles TypeScript to JavaScript (`tsc`)
2. Bundles all dependencies into a single file using `@vercel/ncc`
3. Outputs the bundled file to `dist/index.js`

### Development Workflow

1. Make changes to `src/index.ts`
2. Commit your changes (the pre-commit hook will automatically build and stage the dist files)
3. Test the action locally or in a workflow

**Note:** A pre-commit hook automatically runs `npm run build` and stages the built files, ensuring the `dist/` directory is always in sync with your source code.

### Scripts

- `npm run build` - Build the action for production
- `npm run dev` - Watch mode for development (TypeScript compilation only)

### Project Structure

```
├── src/
│   └── index.ts          # Main action source code
├── dist/
│   ├── index.js          # Built and bundled action (committed)
│   └── index.js.map      # Source map for debugging
├── action.yml            # Action metadata
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

**Note:** The `dist/` directory is committed to the repository because GitHub Actions need the built JavaScript file to run the action.

## License

This project is licensed under the ISC License.
