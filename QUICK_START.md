# 🚀 Quick Start Guide

Get your NPM package published in 10 minutes!

## ✅ Prerequisites Checklist

- [ ] Node.js installed (v14 or higher)
- [ ] NPM account created at https://www.npmjs.com/signup
- [ ] Git installed (optional but recommended)

## 📝 Step 1: Customize Package (2 minutes)

Edit `package.json`:

```json
{
  "name": "@yourorg/react-matra-biometric",  // ← Change this!
  "author": "Your Name <your.email@example.com>",  // ← Change this!
  "repository": {
    "url": "https://github.com/yourusername/react-matra-biometric.git"  // ← Change this!
  }
}
```

**Package Naming Tips:**
- Use lowercase only
- Hyphens allowed: `my-package-name`
- Scoped (recommended): `@yourorg/package-name`
- Must be unique on NPM

## 🔨 Step 2: Install & Build (3 minutes)

```bash
# Install dependencies
npm install

# Build the package
npm run build
```

You should see a `dist/` folder created with:
- `index.js`
- `index.esm.js`
- Source maps

## 🧪 Step 3: Test Locally (2 minutes)

```bash
# In your package directory
npm link

# Create a test project
cd ..
npx create-react-app test-app
cd test-app

# Link your package
npm link @yourorg/react-matra-biometric

# Install peer dependencies
npm install bootstrap reactstrap
```

Create a test file:

```jsx
// src/App.js
import React from 'react';
import { MatraFingerPrint } from '@yourorg/react-matra-biometric';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="container mt-5">
      <MatraFingerPrint
        action="verify"
        fingerData={(data) => console.log('Captured:', data)}
      />
    </div>
  );
}

export default App;
```

Test it:
```bash
npm start
```

## 🚀 Step 4: Publish to NPM (3 minutes)

```bash
# Go back to your package directory
cd ../react-matra-biometric

# Login to NPM
npm login
# Enter your username, password, and email

# Publish your package
npm publish --access public
```

**Success!** 🎉 Your package is now live at:
```
https://www.npmjs.com/package/@yourorg/react-matra-biometric
```

## 📦 Step 5: Use Your Published Package

Anyone can now install it:

```bash
npm install @yourorg/react-matra-biometric
```

## 🔄 Updating Your Package

When you make changes:

```bash
# 1. Make your code changes in src/

# 2. Update version (choose one):
npm version patch   # 1.0.0 → 1.0.1 (bug fixes)
npm version minor   # 1.0.0 → 1.1.0 (new features)
npm version major   # 1.0.0 → 2.0.0 (breaking changes)

# 3. Build
npm run build

# 4. Publish
npm publish
```

## ⚠️ Common Issues

### "Package name already exists"
**Solution:** Change the package name in `package.json` or use a scoped name like `@yourorg/package-name`

### "403 Forbidden"
**Solution:** Run `npm publish --access public` for scoped packages

### "Not logged in"
**Solution:** Run `npm login` and enter your credentials

### Build errors
**Solution:** 
```bash
rm -rf node_modules dist
npm install
npm run build
```

## 📋 Verification Checklist

After publishing, verify:
- [ ] Package appears on npmjs.com
- [ ] README is displayed correctly
- [ ] Installation works: `npm install @yourorg/react-matra-biometric`
- [ ] Component imports correctly
- [ ] All props work as expected

## 🎯 Next Steps

1. **Add GitHub Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/react-matra-biometric.git
   git push -u origin main
   ```

2. **Add a Badge to README:**
   ```markdown
   ![npm version](https://img.shields.io/npm/v/@yourorg/react-matra-biometric)
   ![downloads](https://img.shields.io/npm/dm/@yourorg/react-matra-biometric)
   ```

3. **Create Examples:**
   - Add CodeSandbox examples
   - Create demo website
   - Record usage video

4. **Add CI/CD:**
   - GitHub Actions for automated testing
   - Automated publishing on tag

5. **Promote Your Package:**
   - Share on social media
   - Write a blog post
   - Add to awesome lists

## 📚 Resources

- [NPM Docs](https://docs.npmjs.com/)
- [Publishing Guide](./PUBLISHING_GUIDE.md) (detailed)
- [Examples](./EXAMPLES.js)
- [Package Structure](./PACKAGE_STRUCTURE.md)

## 🆘 Need Help?

- NPM Support: https://www.npmjs.com/support
- Stack Overflow: Tag your questions with `npm` and `reactjs`
- GitHub Issues: (your repository)

---

**Congratulations!** 🎊 You've published your first NPM package!
