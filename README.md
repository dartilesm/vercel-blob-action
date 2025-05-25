# Vercel Blob Action

This GitHub Action allows you to interact with the Vercel Blob API by specifying a source and destination path. It is designed to facilitate the management of blobs in your Vercel projects.

## Inputs

- `source`: The source path of the blob you want to manage.
- `destination`: The destination path where the blob should be moved or copied.

## Usage

To use this action in your workflow, you can include it as follows:

```yaml
name: Example Workflow

on: [push]

jobs:
  upload_blob:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Upload Blob
        uses: your-username/vercel-blob-action@v1.0.0
        with:
          source: 'path/to/source'
          destination: 'path/to/destination'
```

## Example

Here is an example of how to specify the source and destination paths:

```yaml
- name: Upload Blob
  uses: your-username/vercel-blob-action@v1.0.0
  with:
    source: 'src/myBlob.txt'
    destination: 'dest/myBlob.txt'
```

## License

This project is licensed under the ISC License.