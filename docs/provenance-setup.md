# NPM Package Provenance Setup Guide

This guide explains how to set up NPM package provenance for your packages to provide cryptographic proof of package authenticity.

## What is Package Provenance?

Package provenance creates a verifiable chain of custody for your NPM packages. It proves that:

- The published package came from your specific GitHub repository
- It was built using your specific GitHub Actions workflow
- The build process hasn't been tampered with
- The package can be traced back to exact source code commits

## Prerequisites

- npm CLI version 9.5.0 or higher
- GitHub repository with GitHub Actions enabled
- npm publish token with appropriate permissions
- Public repository (required for Sigstore verification)

## Setup Steps

### 1. Update GitHub Actions Workflow

Copy the workflow template from `docs/workflow-templates/publish-with-provenance.yml` to `.github/workflows/publish.yml` in your package, or replace your existing publish workflow with the provenance-enabled version:

```yaml
name: Publish to NPM with Provenance

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest

    # Add permissions for OIDC token required for provenance
    permissions:
      id-token: write
      contents: read

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22.14.0"
          registry-url: "https://registry.npmjs.org"

      - name: Install dependencies
        run: npm ci

      - name: Build the project
        run: npm run build

      - name: Publish to NPM with provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.PUBLISH_TOKEN }}
        run: npm publish --provenance
```

### 2. Update package.json

Add provenance-related metadata to your package.json:

```json
{
  "name": "your-package-name",
  "version": "1.0.0",
  "description": "Your package description",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/your-repo.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/your-repo/issues"
  },
  "homepage": "https://github.com/your-username/your-repo#readme",
  "keywords": ["your", "keywords", "here"],
  "author": {
    "name": "Your Name",
    "url": "https://your-website.com"
  },
  "license": "MIT"
}
```

### 3. Update README

Add a security and provenance section to your README:

````markdown
## 🔒 Security & Provenance

This package is published with NPM package provenance, which provides cryptographic proof that this package was built from the source code in this repository using the GitHub Actions workflow.

To verify the provenance of this package:

```bash
npm audit signatures
```
````

This will verify that the package was signed by the trusted GitHub Actions environment and matches the source code in this repository.

````

### 4. Configure GitHub Secrets

Ensure you have the following secrets configured in your GitHub repository:

- `PUBLISH_TOKEN`: Your npm publish token with appropriate permissions

## Verification

After publishing, users can verify your package with:

```bash
# Install the package
npm install your-package-name

# Verify the provenance
npm audit signatures

# Expected output should show:
# ✓ your-package-name@1.0.0: provenance verified
````

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your repository has the required permissions for OIDC tokens
2. **Private Repository**: Provenance currently only works with public repositories
3. **npm Version**: Ensure you're using npm 9.5.0+ for verification
4. **Build Failures**: Check that your build process completes successfully

### Verification Failures

If `npm audit signatures` fails:

1. Check that the package was published with the `--provenance` flag
2. Verify your repository is public
3. Ensure the GitHub Actions workflow completed successfully
4. Check that you're using npm 9.5.0+ for verification

## Benefits

- **Supply Chain Security**: Prevents malicious package injection
- **Trust**: Users can verify package authenticity
- **Transparency**: Links packages to source code and build process
- **Compliance**: Meets security requirements for many organizations

## Limitations

- Only works with GitHub Actions (currently)
- Requires public repositories
- Requires npm CLI 9.5.0+ for verification
- Requires specific permissions in GitHub Actions

## Resources

- [NPM Package Provenance Documentation](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Blog: Introducing npm package provenance](https://github.blog/security/supply-chain-security/introducing-npm-package-provenance/)
- [SLSA Framework](https://slsa.dev/)
- [Sigstore Project](https://www.sigstore.dev/)
