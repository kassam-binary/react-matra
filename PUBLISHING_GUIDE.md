# Publishing Guide

## Step-by-Step Instructions to Publish Your NPM Package

### 1. Prerequisites

Before publishing, make sure you have:
- ✅ Node.js and npm installed
- ✅ An NPM account (create one at https://www.npmjs.com/signup)
- ✅ Git repository set up (optional but recommended)

### 2. Update Package Configuration

Edit `package.json` and update:

```json
{
  "name": "@yourorg/react-matra-biometric",  // Change this!
  "version": "1.0.0",
  "author": "Your Name <your.email@example.com>",  // Change this!
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/react-matra-biometric.git"  // Change this!
  }
}
```

**Important naming conventions:**
- Scoped package (recommended): `@yourorg/package-name`
- Unscoped package: `package-name`
- Package names must be lowercase and can contain hyphens

### 3. Install Dependencies

```bash
npm install
```

### 4. Build the Package

```bash
npm run build
```

This will create the `dist/` folder with your compiled code.

### 5. Test Locally (Optional but Recommended)

Test your package locally before publishing:

```bash
# In your package directory
npm link

# In a test project
npm link @yourorg/react-matra-biometric
```

### 6. Login to NPM

```bash
npm login
```

Enter your NPM credentials when prompted.

### 7. Publish Your Package

#### For Public Package:
```bash
npm publish --access public
```

#### For Private Package (requires paid NPM account):
```bash
npm publish
```

#### For Scoped Package (first time):
```bash
npm publish --access public
```

### 8. Verify Publication

Visit your package page:
```
https://www.npmjs.com/package/@yourorg/react-matra-biometric
```

### 9. Update Package Versions

When you make changes and want to publish updates:

```bash
# Patch release (1.0.0 -> 1.0.1) - bug fixes
npm version patch

# Minor release (1.0.0 -> 1.1.0) - new features
npm version minor

# Major release (1.0.0 -> 2.0.0) - breaking changes
npm version major

# Then publish
npm publish
```

## Common Issues and Solutions

### Issue: Package Name Already Exists

**Solution:**
1. Choose a different package name
2. Use a scoped package: `@yourorg/package-name`

### Issue: 403 Forbidden

**Solutions:**
1. Make sure you're logged in: `npm whoami`
2. For scoped packages, use: `npm publish --access public`
3. Verify you have permission to publish under that organization

### Issue: Build Errors

**Solutions:**
1. Check that all dependencies are installed
2. Verify your Node version is compatible
3. Delete `node_modules` and `dist`, then reinstall:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

### Issue: Module Not Found After Install

**Solutions:**
1. Ensure `main`, `module`, and `types` fields in package.json point to correct files
2. Verify the `dist/` folder contains the built files
3. Check that `dist/` is not in `.npmignore`

## Testing Your Published Package

Create a test React project:

```bash
npx create-react-app test-biometric
cd test-biometric
npm install @yourorg/react-matra-biometric bootstrap reactstrap
```

Test the component:

```jsx
// src/App.js
import React, { useState } from 'react';
import { MatraFingerPrint } from '@yourorg/react-matra-biometric';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [data, setData] = useState(null);

  return (
    <div className="container mt-5">
      <MatraFingerPrint
        action="verify"
        fingerData={(capturedData) => {
          console.log('Captured:', capturedData);
          setData(capturedData);
        }}
      />
      {data && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

export default App;
```

## Package Structure

```
react-matra-biometric/
├── dist/                    # Built files (generated)
│   ├── index.js            # CommonJS bundle
│   ├── index.esm.js        # ES Module bundle
│   └── index.d.ts          # TypeScript definitions
├── src/                     # Source files
│   ├── MatraFingerPrint.jsx
│   └── index.js
├── .babelrc
├── .gitignore
├── .npmignore
├── LICENSE
├── README.md
├── package.json
└── rollup.config.js
```

## Best Practices

1. **Version Control**: Use semantic versioning (semver)
   - MAJOR: Breaking changes
   - MINOR: New features (backwards compatible)
   - PATCH: Bug fixes

2. **Documentation**: Keep README.md up to date with:
   - Installation instructions
   - Usage examples
   - API documentation
   - Troubleshooting guide

3. **Testing**: Test your package before publishing:
   - Use `npm link` for local testing
   - Create example projects
   - Test in different environments

4. **Changelog**: Maintain a CHANGELOG.md for version history

5. **Security**: Never commit sensitive data or API keys

## NPM Scripts Reference

```json
{
  "scripts": {
    "build": "rollup -c",              // Build the package
    "build:watch": "rollup -c -w",     // Build and watch for changes
    "prepublishOnly": "npm run build"  // Auto-build before publish
  }
}
```

## Useful NPM Commands

```bash
# View package info
npm view @yourorg/react-matra-biometric

# List package versions
npm view @yourorg/react-matra-biometric versions

# Unpublish a version (within 72 hours)
npm unpublish @yourorg/react-matra-biometric@1.0.0

# Deprecate a version
npm deprecate @yourorg/react-matra-biometric@1.0.0 "Use version 1.0.1 instead"

# Update package dependencies
npm update

# Check for outdated dependencies
npm outdated
```

## Resources

- NPM Documentation: https://docs.npmjs.com/
- Semantic Versioning: https://semver.org/
- Creating Node.js modules: https://docs.npmjs.com/creating-node-js-modules
- Package.json reference: https://docs.npmjs.com/cli/v8/configuring-npm/package-json

## Support

If you encounter issues during publishing:
1. Check NPM status: https://status.npmjs.org/
2. NPM support: https://www.npmjs.com/support
3. Stack Overflow: https://stackoverflow.com/questions/tagged/npm
