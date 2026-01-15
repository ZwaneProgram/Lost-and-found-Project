# Lost & Found Board

A modern Lost & Found Board application built with React, Vite, and Tailwind CSS. Perfect for schools and organizations to help reconnect lost items with their owners.

## Features

- 🔍 **Post Lost Items**: Report lost items with descriptions, location, and images
- ✨ **Post Found Items**: Report found items that need to be claimed
- 🖼️ **Image Upload**: Upload photos with automatic optimization (compressed to <3MB)
- 🔄 **Real-time Updates**: See new posts instantly without refreshing
- 🔎 **Search & Filter**: Search by title, description, or location. Filter by type (Lost/Found)
- ✅ **Status Management**: Mark items as claimed or resolved
- 📱 **Responsive Design**: Works great on desktop, tablet, and mobile

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Fast Build Tool
- **Supabase** - Cloud PostgreSQL database (free tier: 500MB)
- **Cloudinary** - Image hosting (free tier: 25GB storage)
- **Tailwind CSS** - Styling
- **React Icons** - Icons
- **Browser Image Compression** - Image Optimization

## Prerequisites

Before you begin, make sure you have:
- Node.js installed (v16 or higher)
- npm or yarn package manager
- A Supabase account (free tier available - see setup guide)
- A Cloudinary account (free tier available - see setup guide)

```env
# Supabase Configuration (get from https://supabase.com/dashboard)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Cloudinary Configuration (get from https://cloudinary.com/)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
VITE_CLOUDINARY_UPLOAD_PRESET=lost-found-board
```

## Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up Supabase** 
3. **Set up Cloudinary**

3. **Start the development server:**

```bash
npm run dev
```

4. **Open your browser:**

The app will be available at `http://localhost:5173` (or the port shown in terminal)

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
lost-found-board/
├── src/
│   ├── components/          # React components
│   │   ├── ItemCard.tsx     # Individual item card
│   │   └── ItemForm.tsx     # Form to add/edit items
│   ├── services/            # Backend services
│   │   ├── database.ts      # Database operations (exports Supabase functions)
│   │   ├── supabase.ts      # Supabase client and database operations
│   │   └── storage.ts       # Cloudinary image upload operations
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   └── imageOptimizer.ts # Image compression utility
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles with Tailwind
├── .env                     # Environment variables (create this)
├── supabase-setup.sql       # SQL script to create database table
├── SUPABASE_SETUP.md        # Supabase setup guide
├── CLOUDINARY_SETUP.md      # Cloudinary setup guide
├── package.json
└── README.md
```

## Free Plan Limits

### Supabase (Database)
- **Free tier**: 500MB database, 2GB bandwidth/month
- **Real-time subscriptions**: Instant updates across devices
- **Unlimited API requests**: No rate limits!
- Perfect for school projects!

### Cloudinary (Image Hosting)
- **Free tier**: 25GB storage, 25GB bandwidth/month
- **25,000 transformations/month**: Auto-optimize images
- **10MB max file size**: We optimize to <3MB anyway
- **Unlimited uploads**: No upload limits!
- Perfect for school projects!

## Image Optimization

Images are automatically:
- Resized to max 1920px width/height
- Compressed to under 3MB (target: 2.5MB)
- Optimized for web use
- Validated before upload

## Troubleshooting

### Posts Not Syncing Across Devices
- Verify your Supabase URL and anon key are correct in `.env`
- Make sure you ran the SQL script from `supabase-setup.sql`
- Check browser console for Supabase connection errors
- Verify both devices are using the same Supabase project

### Image Upload Fails
- Check that your Cloudinary Cloud Name and Upload Preset are set in `.env`
- Verify upload preset is set to **Unsigned** mode in Cloudinary dashboard
- Verify images are valid image files (PNG, JPG, etc.)
- Check browser console for specific error messages
- Try uploading a smaller image (should auto-optimize to <3MB)

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check that TypeScript types are correct
- Verify all environment variables are set

## License

This project is open source and available for educational use.

If you encounter any issues:
1. Check browser console for JavaScript errors
2. Verify all environment variables are set correctly
3. Check Supabase dashboard for database errors
4. Verify Cloudinary configuration is correct

---
