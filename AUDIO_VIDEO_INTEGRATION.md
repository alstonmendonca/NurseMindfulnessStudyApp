# Audio and Video Integration Guide

## Overview
The app has been simplified to only show the Calm Corner functionality on the home screen. Users will see:

1. **Relaxing Sounds** section with audio files
2. **Guided Breathing** section with video files

## How to Add Google Drive Links

### Step 1: Prepare Your Google Drive Files

1. Upload your audio and video files to Google Drive
2. Make them publicly accessible:
   - Right-click the file → "Share"
   - Click "Change to anyone with the link"
   - Set permission to "Viewer"
3. Get the shareable link

### Step 2: Convert Google Drive Links

Google Drive links look like:
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

Convert them to direct download links:
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

### Step 3: Update the Media Items

Edit `src/screens/HomeScreen.tsx` and find the `mediaItems` array around line 25:

```typescript
const mediaItems: MediaItem[] = [
  {
    id: 'audio1',
    name: 'White Noise',
    url: 'https://drive.google.com/uc?export=download&id=YOUR_AUDIO_FILE_ID_1',
    type: 'audio'
  },
  {
    id: 'audio2', 
    name: 'Brown Noise',
    url: 'https://drive.google.com/uc?export=download&id=YOUR_AUDIO_FILE_ID_2',
    type: 'audio'
  },
  // ... add more audio files
  {
    id: 'video1',
    name: 'Guided Breathing - 5 minutes',
    url: 'https://drive.google.com/uc?export=download&id=YOUR_VIDEO_FILE_ID_1',
    type: 'video'
  },
  // ... add more video files
];
```

### Step 4: Add More Media Items

You can add as many audio and video items as you want. Just follow the same pattern:

```typescript
{
  id: 'unique_id_here',          // Unique identifier
  name: 'Display Name Here',     // What users will see
  url: 'your_google_drive_link', // Direct download link
  type: 'audio' // or 'video'
}
```

## Current App Flow

1. **Login** → **Demographic Survey** (one-time) → **Home Screen (Calm Corner)**
2. **Home Screen** shows audio and video options
3. Users can play audio files and open videos
4. **Logout** button is available in bottom-right corner

## Features Removed

- ✅ Daily check-ins
- ✅ Shift selector  
- ✅ Research surveys
- ✅ Journal functionality
- ✅ All other screens except Home and Demographic Survey

## Next Steps

1. **Add your Google Drive links** following the guide above
2. **Test the app** to ensure audio/video playback works
3. **Customize** the media names and add more items as needed

## Notes

- Audio files will show a 🎧 icon
- Video files will show a ▶️ icon  
- Currently shows placeholder alerts - you may want to implement actual media players
- The app maintains the same login/auth system and demographic survey requirement
