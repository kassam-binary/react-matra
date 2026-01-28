# Troubleshooting Build Issues

## Issue: "Cannot use import statement outside a module"

This error occurs when using ES module syntax in rollup.config.js but Node.js treats it as CommonJS.

### Solution 1: Add "type": "module" to package.json (RECOMMENDED)

```json
{
  "name": "@yourorg/react-matra-biometric",
  "version": "1.0.0",
  "type": "module",
  ...
}
```

This tells Node.js to treat `.js` files as ES modules.

### Solution 2: Rename rollup.config.js to rollup.config.mjs

```bash
mv rollup.config.js rollup.config.mjs
```

The `.mjs` extension explicitly marks it as an ES module.

### Solution 3: Use CommonJS syntax in rollup.config.js

Replace the config file with CommonJS syntax:

```javascript
const babel = require('@rollup/plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx']
    }),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env', '@babel/preset-react'],
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx']
    }),
    commonjs(),
    terser()
  ],
  external: ['react', 'react-dom', 'axios', 'reactstrap', 'sweetalert2']
};
```

## Issue: npm install hangs or takes too long

### Solutions:

1. **Clear npm cache:**
```bash
npm cache clean --force
```

2. **Delete node_modules and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

3. **Use --legacy-peer-deps flag:**
```bash
npm install --legacy-peer-deps
```

4. **Try different registry:**
```bash
npm install --registry=https://registry.npmjs.org/
```

## Issue: Peer dependency warnings

These are usually safe to ignore, but if you want to resolve them:

### Solution 1: Use --legacy-peer-deps
```bash
npm install --legacy-peer-deps
```

### Solution 2: Use --force
```bash
npm install --force
```

## Issue: Build succeeds but dist folder is empty

### Check:

1. **Verify src/index.js exists and exports the component**
2. **Check rollup.config.js input path**
3. **Ensure all dependencies are installed**

### Solution:
```bash
npm run build -- --verbose
```

This will show detailed build output.

## Issue: "Module not found" errors after building

### Solution 1: Check external dependencies

Make sure all external dependencies are listed correctly in `rollup.config.js`:

```javascript
external: ['react', 'react-dom', 'axios', 'reactstrap', 'sweetalert2']
```

### Solution 2: Verify package.json exports

```json
{
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts"
}
```

## Issue: Babel errors during build

### Solution: Update .babelrc

```json
{
  "presets": [
    ["@babel/preset-env", {
      "modules": false
    }],
    "@babel/preset-react"
  ]
}
```

## Issue: "Cannot find module '@rollup/plugin-babel'"

### Solution: Install missing dependencies

```bash
npm install --save-dev @rollup/plugin-babel @rollup/plugin-commonjs @rollup/plugin-node-resolve @rollup/plugin-terser rollup-plugin-peer-deps-external
```

## Quick Fix Script

Create a file `fix-build.sh`:

```bash
#!/bin/bash

echo "🔧 Fixing build issues..."

# Clean everything
echo "1. Cleaning node_modules and cache..."
rm -rf node_modules package-lock.json dist
npm cache clean --force

# Reinstall
echo "2. Reinstalling dependencies..."
npm install --legacy-peer-deps

# Build
echo "3. Building package..."
npm run build

echo "✅ Done! Check for any errors above."
```

Run it:
```bash
chmod +x fix-build.sh
./fix-build.sh
```

## Windows PowerShell Version

Create `fix-build.ps1`:

```powershell
Write-Host "🔧 Fixing build issues..." -ForegroundColor Green

# Clean everything
Write-Host "1. Cleaning node_modules and cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules, package-lock.json, dist -ErrorAction SilentlyContinue
npm cache clean --force

# Reinstall
Write-Host "2. Reinstalling dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Build
Write-Host "3. Building package..." -ForegroundColor Yellow
npm run build

Write-Host "✅ Done! Check for any errors above." -ForegroundColor Green
```

Run it:
```powershell
.\fix-build.ps1
```

## Verification Steps

After successful build, verify:

```bash
# 1. Check dist folder exists and has files
ls dist/

# Should see:
# - index.js
# - index.esm.js
# - index.js.map
# - index.esm.js.map

# 2. Test the build
npm pack

# This creates a .tgz file you can test install
```

## Still Having Issues?

1. **Check Node version:**
   ```bash
   node --version
   # Should be v14 or higher
   ```

2. **Check npm version:**
   ```bash
   npm --version
   # Should be v6 or higher
   ```

3. **Enable verbose logging:**
   ```bash
   npm run build -- --verbose
   ```

4. **Check for conflicting global packages:**
   ```bash
   npm list -g --depth=0
   ```

## Need More Help?

- Share the complete error message
- Include your Node and npm versions
- Share relevant parts of package.json
- Show the output of `npm run build -- --verbose`
