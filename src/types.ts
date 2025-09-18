export interface Song {
  title: string;
  artist?: string;
  lyrics: string[];
  searchTerms: string[];
}

export interface KaraokeSession {
  currentSong?: Song;
  currentLineIndex: number;
  isPlaying: boolean;
  scrollSpeed: number; // lines per minute
  scrollInterval?: NodeJS.Timeout;
}

export interface LyricMatch {
  song: Song;
  lineIndex: number;
  confidence: number;
}