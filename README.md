# Amber McDonald Portfolio

A personal portfolio built with React, TypeScript, and Vite. It includes an
about page and a photography gallery that loads album images automatically
from Cloudinary through a Vercel serverless function.

## Local development

Install the dependencies:

```bash
npm install
```

Create a private `.env.local` file with your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Then start the site and gallery API together:

```bash
npx vercel dev --local
```

The environment file is ignored by Git and should never be committed.
