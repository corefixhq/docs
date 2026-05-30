# Corefix Documentation

A complete VitePress documentation site for the DeepTraq Security Scanner.

## ✨ Features

- **Navigation Bar** - Easy navigation with top-level and dropdown menus
- **Sidebar Navigation** - Organized documentation structure with collapsible sections
- **Local Search** - Full-text search functionality
- **Custom Logo** - Branded logo in navbar and favicon
- **Footer** - Copyright and site information
- **Responsive Design** - Works on all screen sizes
- **Dark Mode** - Built-in dark mode support
- **Syntax Highlighting** - Code blocks with syntax highlighting

## 📁 Project Structure

```
planning/
├── .vitepress/
│   ├── config.mts           # Main VitePress configuration
│   └── theme/
│       ├── index.ts         # Theme setup
│       └── custom.css       # Custom styling
├── docs/                     # Your existing markdown documentation
│   ├── standalone-usage.md
│   ├── web-cicd-integration.md
│   ├── web-standalone-usage.md
│   ├── projects.md
│   ├── reports.md
│   ├── account-usage.mdx
│   ├── ai-enrichment.mdx
│   ├── models.md
│   ├── chrome-extension-guide.md
│   ├── cicd-integration.md
│   ├── aws-scan-pipeline-setup.md
│   └── pricing-and-usage.mdx
├── public/
│   └── logo.png             # Your logo (replace with actual logo)
├── index.md                 # Home page
├── guide.md                 # Getting started guide
├── package.json             # NPM configuration
└── README.md                # This file
```

## 🚀 Getting Started

### Installation

Dependencies are already installed. To start the development server:

```bash
npm run docs:dev
```

The site will be available at `http://localhost:5173/`

### Available Commands

```bash
# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build locally
npm run docs:preview
```

## 🎨 Customization

### Update Your Logo

Replace `/public/logo.png` with your actual logo file. The logo will appear in:

- Navigation bar (left side)
- Favicon
- Home page hero section

### Customize Navigation

Edit `.vitepress/config.mts` to modify:

- **Top Navigation Bar** (`nav` array) - Main navigation links
- **Sidebar** (`sidebar` array) - Documentation structure
- **Social Links** (`socialLinks` array) - GitHub, Twitter, etc.

### Customize Footer

In `.vitepress/config.mts`, update the `footer` object:

```typescript
footer: {
  message: 'Built with VitePress',
  copyright: '© 2024 Corefix. All rights reserved.'
}
```

### Customize Colors

Edit `.vitepress/theme/custom.css` to change:

- Brand colors (primary button, links)
- Dark mode colors
- Component styling

### Search Configuration

Search is configured with local search (built-in). It searches through:

- Page titles
- Headings
- Content text

The search is optimized to:

- Prioritize level 1 headings
- Combine search terms with AND logic
- Show detailed results

## 📄 Documentation Files

All your existing markdown files in `/docs` are automatically included in the sidebar navigation:

### Getting Started

- **Standalone Usage** - Run scanner with Docker
- **Web CI/CD Integration** - Integrate with pipelines
- **Web Standalone** - Web-based deployment

### Features

- **Projects** - Project management
- **Reports** - Report generation
- **Account Usage** - Usage tracking
- **AI Enrichment** - AI-powered insights
- **Models** - Security models

### Integration

- **CI/CD Integration** - CI/CD setup
- **Chrome Extension** - Browser extension guide
- **AWS Scan Pipeline** - AWS pipeline setup

### Reference

- **Pricing & Usage** - Pricing information

## 🔧 Advanced Configuration

### Edit Links

To enable "Edit this page" links, update the `editLink` in `.vitepress/config.mts`:

```typescript
editLink: {
  pattern: 'https://github.com/yourusername/repo/edit/main/docs/:path',
  text: 'Edit this page'
}
```

### Add External Links to Nav

Update the `nav` array in `.vitepress/config.mts`:

```typescript
nav: [
  { text: "Home", link: "/" },
  { text: "GitHub", link: "https://github.com/yourorg" },
  // ... other links
];
```

### Change Site Title and Description

Update in `.vitepress/config.mts`:

```typescript
export default defineConfig({
  title: "Your Site Title",
  description: "Your site description",
  // ...
});
```

## 📚 Building and Deploying

### Build for Production

```bash
npm run docs:build
```

This creates a `.vitepress/dist` folder with static HTML files ready to deploy.

### Deploy Options

The built site can be deployed to:

- **Vercel** - Zero-config deployment
- **Netlify** - Drag & drop deployment
- **GitHub Pages** - Free hosting with GitHub
- **AWS S3 + CloudFront** - Scalable CDN
- **Any static hosting** - Traditional hosting providers

### Deploy to GitHub Pages

1. Update `base` in `.vitepress/config.mts` to your repo name:

   ```typescript
   base: "/repo-name/";
   ```

2. Add to `package.json`:
   ```json
   "scripts": {
     "docs:deploy": "npm run docs:build && git add .vitepress/dist && git commit -m 'deploy' && git push"
   }
   ```

## 🎯 Next Steps

1. **Replace Logo**: Add your actual logo to `/public/logo.png`
2. **Update Content**: Edit markdown files in `/docs` as needed
3. **Customize Navigation**: Update `.vitepress/config.mts` with your structure
4. **Add Social Links**: Update `socialLinks` in config
5. **Update Footer**: Customize copyright information
6. **Deploy**: Build and deploy to your hosting platform

## 📖 VitePress Documentation

For more information about VitePress features and configuration, visit:

- [VitePress Official Docs](https://vitepress.dev/)
- [Markdown Extensions](https://vitepress.dev/guide/markdown)
- [Theme Customization](https://vitepress.dev/guide/extending-default-theme)

## 🆘 Troubleshooting

### Port Already in Use

If port 5173 is already in use, start with a different port:

```bash
npm run docs:dev -- --port 3000
```

### Search Not Working

Search is local and indexes content during build. Make sure:

1. Files have proper headings
2. Content is in markdown format
3. You've rebuilt the site

### Images Not Loading

Place images in the `/public` folder and reference them as:

```markdown
![Alt text](/image-name.png)
```

## 📞 Support

For issues or questions about VitePress, check:

- [VitePress GitHub Issues](https://github.com/vuejs/vitepress/issues)
- [VitePress Discussions](https://github.com/vuejs/vitepress/discussions)
