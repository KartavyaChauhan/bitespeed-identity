# Git Setup & GitHub Push Guide

This guide will help you push this project to GitHub and complete the deployment.

## Prerequisites

- Git installed on your machine
- GitHub account
- [Optional] GitHub Desktop or command line git

## Step 1: Create a Repository on GitHub

1. Go to [github.com](https://github.com) and log in
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Configure:
   - **Repository name**: `bitespeed-identity` (or your preferred name)
   - **Description**: `Bitespeed Identity Reconciliation Backend`
   - **Visibility**: Public (for submission) or Private (for personal)
   - **Do NOT initialize** with README, .gitignore, or license (we already have these)
5. Click **Create repository**
6. Copy the repository URL (HTTPS format recommended):
   ```
   https://github.com/YOUR-USERNAME/bitespeed-identity.git
   ```

## Step 2: Add Remote and Push Code

Open terminal/PowerShell in the project directory and run:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR-USERNAME/bitespeed-identity.git

# Verify remote is added
git remote -v

# Push code to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify on GitHub

1. Refresh your GitHub repository page
2. You should see all commits and files pushed
3. Verify the commit history shows:
   - ✅ Initial setup with TypeScript and Prisma configuration
   - ✅ Identity reconciliation service with merging logic
   - ✅ API controller and routes for /identify endpoint
   - ✅ Express.js application with middleware
   - ✅ Comprehensive README
   - ✅ Deployment configuration
   - ✅ Test utilities

## Step 4: Connect to Render for Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
1. Creating a PostgreSQL database on Render
2. Creating a Web Service on Render
3. Configuring environment variables
4. Monitoring your deployed application

## Branching Strategy (Optional)

For better project management, consider:

```bash
# Create development branch
git checkout -b develop

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to develop branch
git push -u origin develop

# Create pull request to main on GitHub
# Review, approve, and merge
```

## Updating README with Deployed URL

Once deployed on Render, update the README:

```bash
# Edit README.md
# Find the line: "**Deployed at**: [Add deployed URL here after deployment]"
# Replace with your actual URL: "**Deployed at**: https://bitespeed-identity.onrender.com"

git add README.md
git commit -m "docs: update deployed URL"
git push
```

## Troubleshooting

### Permission Denied (publickey)

**Solution**: Set up SSH keys
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Follow prompts and add key to GitHub account
```

### Fatal: Not a git repository

**Solution**: Ensure you're in the project directory
```bash
cd c:\Users\karta\bitespeed-identity
```

### Remote Already Exists

**Solution**: Remove and re-add
```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/bitespeed-identity.git
```

### Push Rejected

**Solution**: Pull before pushing
```bash
git pull origin main
git push origin main
```

## Submission Checklist

Before submitting to Bitespeed:

- [x] Code is in GitHub repository
- [x] Rich commit history with meaningful messages (7+ commits)
- [x] Application deployed and accessible via URL
- [ ] Update README with deployed URL
- [ ] Test the API endpoint works from the deployed URL
- [ ] Submit form at: https://forms.gle/hsQBJQ8tzbsp53D77

## Useful Commands

```bash
# Check git status
git status

# View commit history with more details
git log --oneline -10
git log --graph --oneline --all

# Check remote URLs
git remote -v

# Create and switch to new branch
git checkout -b feature/new-feature

# Push specific branch
git push origin feature/new-feature

# Pull latest changes
git pull origin main

# Stash uncommitted changes
git stash
```

## Additional Resources

- [GitHub Docs](https://docs.github.com/)
- [Pro Git Book](https://git-scm.com/book/en/v2)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Render Deployment Docs](https://render.com/docs)

---

**Need more help?** Check:
1. [README.md](./README.md) - Project setup and API documentation
2. [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
3. Render support: https://render.com/support
4. GitHub support: https://github.com/support
