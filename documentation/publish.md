# Publishing the Papaya SDK to npm

This document outlines the steps to publish the Papaya SDK to npm.

## Prerequisites

Before publishing the SDK, ensure you have:

1. Node.js and npm installed (version 14 or higher recommended)
2. An npm account with access to the `@papaya_fi` organization
3. Logged in to npm on your command line (`npm login`)
4. All code changes committed and pushed to the repository

## Preparing for Publication

1. Update version number in `package.json`

   ```bash
   # For patch releases (bug fixes)
   npm version patch

   # For minor releases (new features, backward compatible)
   npm version minor

   # For major releases (breaking changes)
   npm version major
   ```

   This will automatically:
   - Update the version in package.json
   - Create a git tag for the version
   - Commit the changes

2. Ensure all tests pass:

   ```bash
   npm test
   ```

3. Build the package:

   ```bash
   npm run build
   ```

## Publishing to npm

1. Make sure your npm configuration uses HTTPS:

   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

2. Publish the package with public access:

   ```bash
   npm publish --access public
   ```

3. Verify the publication:

   ```bash
   npm view @papaya_fi/sdk
   ```

   Note: It might take a few minutes (or even an hour) for the package to be fully available in the npm registry.

## Troubleshooting

If you encounter issues during publishing:

1. **Authentication issues**: Re-login with `npm login`

2. **Scope access issues**: Ensure you have access to the `@papaya_fi` organization:
   ```bash
   npm access ls-packages
   ```

3. **Package not found after publishing**: This is normal. npm can take some time to fully index new packages. Wait 30 minutes and try again.

4. **Version conflicts**: If npm indicates the version already exists, update the version number in package.json.

5. **HTTP vs HTTPS**: Ensure you're using HTTPS for the npm registry:
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

## Release Checklist

Before each release, ensure:

- [ ] All tests are passing
- [ ] Documentation is updated
- [ ] Changelog is updated (if applicable)
- [ ] Version number is incremented appropriately
- [ ] Package builds successfully
- [ ] README and examples reflect current functionality

## Post-Publication

After successfully publishing:

1. Create a GitHub release with release notes
2. Notify users/stakeholders about the new version
3. Update documentation site (if separate from the repo)
4. Verify the package can be installed correctly:

   ```bash
   mkdir test-install && cd test-install
   npm init -y
   npm install @papaya_fi/sdk
   ```

## Unpublishing (if necessary)

Npm allows unpublishing within 72 hours of publication:

```bash
npm unpublish @papaya_fi/sdk@<version>
```

**Important**: Unpublishing can break dependent packages. Use with caution. 