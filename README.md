# MentraOS Karaoke App for Even Realities G1 AR Glasses

A voice-activated karaoke application that displays scrolling lyrics on AR glasses. Users can start songs by saying the title or by singing any line from a song.

## Features

- **Voice-Activated Song Selection**: Say a song title to start karaoke
- **Smart Lyric Matching**: Start singing any line and the app will sync to that point
- **Auto-Scrolling Lyrics**: Lyrics scroll automatically at adjustable speed
- **Local Lyrics Database**: No internet required - all lyrics stored locally
- **Speed Control**: Say "faster" or "slower" to adjust scrolling speed
- **Stop Command**: Say "stop" to end the current song

## Song Library

The app includes lyrics for popular Gujarati, Hindi, and regional songs including:
- Mogal Thay Madi
- Bhuvapani
- Hu Ru Ru
- Charan Ni Sarkar
- Dwarika No Nath
- Tali Pado
- Baby Ne Bournvita
- Kajra Re
- Pardesiya
- Ramta Jogi
- And many more!

## Usage

1. Put on your Even Realities G1 AR glasses
2. Launch the "Live Lyrics" app from MentraOS
3. Say a song title or start singing any line from a song
4. Enjoy karaoke with auto-scrolling lyrics!

## Voice Commands

- **Start a song**: Say the song title (e.g., "Mogal Thay Madi")
- **Sync with singing**: Start singing any line and the app will jump to that point
- **Speed control**: Say "faster" or "slower" to adjust scrolling speed
- **Stop**: Say "stop" to end the current song

## Technical Details

- Built with TypeScript and MentraOS SDK
- Uses Fuse.js for fuzzy text matching
- Local lyrics database with smart search
- Configurable scrolling speed (default: 30 lines/minute)

## Installation

1. Replace the code in your existing MentraOS app with the files from this repository
2. Install dependencies: `bun install`
3. Set environment variables in `.env`
4. Deploy to your MentraOS console

## Environment Variables

```
PACKAGE_NAME=org.justinmatamala.livelyrics
MENTRAOS_API_KEY=your_api_key_here
PORT=3000
```