import { AppServer, AppSession } from '@mentra/sdk';
import { ViewType } from '@mentra/sdk';
import { Song, songsDatabase, searchSongs, getSongsByCategory } from './songs-database';

interface KaraokeSession {
  currentSong: Song | null;
  currentLineIndex: number;
  currentWordIndex: number;
  isPlaying: boolean;
  liveCaptionsMode: boolean;
  showingMenu: boolean;
  lastProcessedText: string;
  processingTimestamp: number;
  selectedCategory?: string;
  scrollInterval?: NodeJS.Timeout;
  scrollIndex: number;
  currentSearchText: string;
  searchTimeout?: NodeJS.Timeout;
  lastSearchUpdate: number;
  isProcessing: boolean;
  displayUpdateTimeout?: NodeJS.Timeout;
}

class UltraFastKaraokeMentraApp extends AppServer {
  private karaokeSessions: Map<string, KaraokeSession> = new Map();
  
  // Precomputed word maps for instant matching
  private wordMaps: Map<string, Set<string>> = new Map();
  
  // Song title training data - ONLY from song titles
  private songTitleWords: Set<string> = new Set();
  private songTitleMap: Map<string, Song[]> = new Map();
  private fullSongTitles: Map<string, Song> = new Map();
  
  // Song title word validation - ONLY from songs database
  private songTitleWordSet: Set<string> = new Set();
  private songTitlePartials: Set<string> = new Set();

  // Priority songs list - these 20 songs will be shown first
  private prioritySongTitles: string[] = [
    "Gujju Bhuriya",
    "Amu kaka bapa na",
    "Dwarika no nath",
    "Vala aato valap",
    "Gori Tame",
    "Kanji Kado Morli Vado Gayo No Goval (Mathura Mathura Mathura Aeeyy)",
    "Fararar eto Fararar",
    "Mathura Ma Vagi Morli",
    "Ranchhod Rangila",
    "Chalde Aai Rulaai",
    "Gajiyo",
    "Har Har Shambu Shiv Mahadev",
    "Kanaiya Morli Vala Re",
    "I am very very sorry kana tane bhuli gai",
    "Moti Veraana",
    "Rasiyo Rupalo",
    "Dakor Na Thakor",
    "Nav Lakhlobaiyu",
    "Khel Khel Re Bhavani Maa",
    "Kalo Bhammariyado"
  ];

  constructor(options: any) {
    super(options);
    this.precomputeWordMaps();
    this.trainOnSongTitles();
    this.buildSongTitleWordSet();
  }

  // Get priority songs first, then remaining songs
  private getPrioritizedSongs(category?: string): Song[] {
    try {
      let allSongs = category ? getSongsByCategory(category) : songsDatabase;
      
      // Find priority songs that exist in the database
      const prioritySongs: Song[] = [];
      const remainingSongs: Song[] = [];
      
      // First, add priority songs in order
      for (const priorityTitle of this.prioritySongTitles) {
        const foundSong = allSongs.find(song => 
          song.title.toLowerCase().trim() === priorityTitle.toLowerCase().trim()
        );
        if (foundSong) {
          prioritySongs.push(foundSong);
        }
      }
      
      // Then add remaining songs
      for (const song of allSongs) {
        const isPriority = this.prioritySongTitles.some(priorityTitle => 
          song.title.toLowerCase().trim() === priorityTitle.toLowerCase().trim()
        );
        if (!isPriority) {
          remainingSongs.push(song);
        }
      }
      
      return [...prioritySongs, ...remainingSongs];
    } catch (error) {
      console.error('Error getting prioritized songs:', error);
      return category ? getSongsByCategory(category) : songsDatabase;
    }
  }

  // Build word set ONLY from song titles in songs-database.ts
  private buildSongTitleWordSet() {
    try {
      console.log('Building word set from song titles...');
      
      // Clear any existing data
      this.songTitleWordSet.clear();
      this.songTitlePartials.clear();
      
      // Extract words ONLY from song titles
      for (const song of songsDatabase) {
        const titleLower = song.title.toLowerCase();
        const titleNormalized = titleLower.replace(/[.,!?;()\-"']/g, '').trim();
        
        // Add full title as a phrase
        this.songTitlePartials.add(titleNormalized);
        
        // Break down title into individual words
        const titleWords = titleNormalized.split(/\s+/);
        for (const word of titleWords) {
          if (word.length > 0) {
            this.songTitleWordSet.add(word);
            
            // Add partial matches for each word (for progressive typing)
            for (let i = 2; i <= word.length; i++) {
              this.songTitlePartials.add(word.substring(0, i));
            }
          }
        }
        
        // Add partial title matches (for progressive song title matching)
        for (let i = 3; i <= titleNormalized.length; i++) {
          this.songTitlePartials.add(titleNormalized.substring(0, i));
        }
      }
      
      console.log(`Built word set with ${this.songTitleWordSet.size} unique words from song titles`);
      console.log(`Built ${this.songTitlePartials.size} partial matches`);
    } catch (error) {
      console.error('Error building song title word set:', error);
    }
  }

  // Check if text contains words from song titles ONLY
  private isSongTitleText(text: string): boolean {
    try {
      const cleanText = text.toLowerCase().replace(/[.,!?;()\-"']/g, '').trim();
      if (!cleanText) return false;
      
      // Check for non-Latin characters (Cyrillic, Chinese, etc.)
      const nonLatinRegex = /[^\x00-\x7F\u00C0-\u017F]/;
      if (nonLatinRegex.test(cleanText)) {
        return false;
      }
      
      // Check if the text matches any song title partials (progressive matching)
      if (this.songTitlePartials.has(cleanText)) {
        return true;
      }
      
      // Check individual words against song title words
      const words = cleanText.split(/\s+/);
      if (words.length === 0) return false;
      
      let songTitleWordCount = 0;
      for (const word of words) {
        if (word.length > 0) {
          // Exact word match
          if (this.songTitleWordSet.has(word)) {
            songTitleWordCount++;
          } else {
            // Check if word is a partial match of any song title word
            let isPartialMatch = false;
            for (const songWord of this.songTitleWordSet) {
              if (songWord.startsWith(word) || word.startsWith(songWord)) {
                isPartialMatch = true;
                break;
              }
            }
            if (isPartialMatch) {
              songTitleWordCount++;
            }
          }
        }
      }
      
      // If at least 70% of words are from song titles, consider it valid
      return (songTitleWordCount / words.length) >= 0.7;
    } catch (error) {
      console.error('Error checking song title text:', error);
      return false;
    }
  }

  // Filter and validate search text using ONLY song title words
  private validateSearchText(text: string): string {
    try {
      if (!text || !this.isSongTitleText(text)) {
        return '';
      }
      
      // Clean and normalize the text
      const cleanText = text.toLowerCase().replace(/[.,!?;()\-"']/g, '').trim();
      
      // Check if it's a progressive match for a song title
      if (this.songTitlePartials.has(cleanText)) {
        return cleanText;
      }
      
      // Only keep words that are in song titles
      const words = cleanText.split(/\s+/);
      const validWords = words.filter(word => {
        if (word.length === 0) return false;
        
        // Direct match with song title words
        if (this.songTitleWordSet.has(word)) {
          return true;
        }
        
        // Partial match with song title words
        for (const songWord of this.songTitleWordSet) {
          if (songWord.startsWith(word) || word.startsWith(songWord)) {
            return true;
          }
        }
        
        return false;
      });
      
      return validWords.join(' ');
    } catch (error) {
      console.error('Error validating search text:', error);
      return '';
    }
  }

  private trainOnSongTitles() {
    try {
      // Train the model on all song titles
      for (const song of songsDatabase) {
        const titleLower = song.title.toLowerCase();
        const titleNormalized = titleLower.replace(/[.,!?;()\-"']/g, '').trim();
        
        // Store full song title for exact matching
        this.fullSongTitles.set(titleNormalized, song);
        
        // Break down into words for partial matching
        const words = titleNormalized.split(/\s+/);
        for (const word of words) {
          if (word.length > 1) {
            this.songTitleWords.add(word);
            
            if (!this.songTitleMap.has(word)) {
              this.songTitleMap.set(word, []);
            }
            this.songTitleMap.get(word)!.push(song);
          }
        }
        
        // Also store variations and partial matches
        for (let i = 2; i <= Math.min(titleNormalized.length, 20); i++) {
          const partial = titleNormalized.substring(0, i);
          if (!this.songTitleMap.has(partial)) {
            this.songTitleMap.set(partial, []);
          }
          this.songTitleMap.get(partial)!.push(song);
        }
      }
    } catch (error) {
      console.error('Error training on song titles:', error);
    }
  }

  private precomputeWordMaps() {
    try {
      // Pre-normalize all words for instant matching
      for (const song of songsDatabase) {
        for (const line of song.lyrics) {
          const words = line.toLowerCase().replace(/[.,!?;()\-"']/g, '').split(/\s+/);
          for (const word of words) {
            if (word.length > 2) {
              if (!this.wordMaps.has(word)) {
                this.wordMaps.set(word, new Set());
              }
              // Add variations for fuzzy matching
              this.wordMaps.get(word)!.add(word);
              if (word.length > 3) {
                this.wordMaps.get(word)!.add(word.substring(0, 3));
                this.wordMaps.get(word)!.add(word.substring(0, 4));
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error precomputing word maps:', error);
    }
  }

  private getKaraokeSession(sessionId: string): KaraokeSession {
    try {
      if (this.karaokeSessions.has(sessionId)) {
        const existingSession = this.karaokeSessions.get(sessionId)!;
        if (existingSession.scrollInterval) {
          clearInterval(existingSession.scrollInterval);
        }
        if (existingSession.searchTimeout) {
          clearTimeout(existingSession.searchTimeout);
        }
        if (existingSession.displayUpdateTimeout) {
          clearTimeout(existingSession.displayUpdateTimeout);
        }
      }
      
      if (!this.karaokeSessions.has(sessionId)) {
        this.karaokeSessions.set(sessionId, {
          currentSong: null,
          currentLineIndex: 0,
          currentWordIndex: 0,
          isPlaying: false,
          liveCaptionsMode: false,
          showingMenu: true,
          lastProcessedText: '',
          processingTimestamp: 0,
          scrollIndex: 0,
          currentSearchText: '',
          lastSearchUpdate: 0,
          isProcessing: false
        });
      }
      return this.karaokeSessions.get(sessionId)!;
    } catch (error) {
      console.error('Error getting karaoke session:', error);
      // Return a default session to prevent crashes
      return {
        currentSong: null,
        currentLineIndex: 0,
        currentWordIndex: 0,
        isPlaying: false,
        liveCaptionsMode: false,
        showingMenu: true,
        lastProcessedText: '',
        processingTimestamp: 0,
        scrollIndex: 0,
        currentSearchText: '',
        lastSearchUpdate: 0,
        isProcessing: false
      };
    }
  }

  private stopScrolling(sessionId: string) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      if (karaokeSession.scrollInterval) {
        clearInterval(karaokeSession.scrollInterval);
        karaokeSession.scrollInterval = undefined;
      }
    } catch (error) {
      console.error('Error stopping scrolling:', error);
    }
  }

  private clearSearchTimeout(sessionId: string) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      if (karaokeSession.searchTimeout) {
        clearTimeout(karaokeSession.searchTimeout);
        karaokeSession.searchTimeout = undefined;
      }
    } catch (error) {
      console.error('Error clearing search timeout:', error);
    }
  }

  private clearDisplayTimeout(sessionId: string) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      if (karaokeSession.displayUpdateTimeout) {
        clearTimeout(karaokeSession.displayUpdateTimeout);
        karaokeSession.displayUpdateTimeout = undefined;
      }
    } catch (error) {
      console.error('Error clearing display timeout:', error);
    }
  }

  // Enhanced method to return to main menu with scrolling
  private returnToMainMenu(session: AppSession, sessionId: string) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      
      // Reset all session states
      karaokeSession.currentSong = null;
      karaokeSession.currentLineIndex = 0;
      karaokeSession.currentWordIndex = 0;
      karaokeSession.isPlaying = false;
      karaokeSession.liveCaptionsMode = false;
      karaokeSession.showingMenu = true;
      karaokeSession.selectedCategory = undefined;
      karaokeSession.currentSearchText = '';
      karaokeSession.isProcessing = false;
      
      // Stop any existing scrolling and search timeouts
      this.stopScrolling(sessionId);
      this.clearSearchTimeout(sessionId);
      this.clearDisplayTimeout(sessionId);
      
      // Start auto-scrolling menu with all songs
      this.startAutoScrollMenu(session, sessionId);
    } catch (error) {
      console.error('Error returning to main menu:', error);
      this.safeDisplay(session, 'Error occurred. Say "menu" to restart.');
    }
  }

  // Enhanced song detection using trained model with error handling
  private detectSongFromSearch(searchText: string, category?: string): Song | null {
    try {
      // First validate that the search text contains song title words
      const validatedText = this.validateSearchText(searchText);
      if (!validatedText) {
        return null;
      }
      
      const input = validatedText.toLowerCase().replace(/[.,!?;()\-"']/g, '').trim();
      
      if (!input || input.length < 2) return null;
      
      let displaySongs = this.getPrioritizedSongs(category);
      
      // First, try exact full title match
      for (const song of displaySongs) {
        const titleNormalized = song.title.toLowerCase().replace(/[.,!?;()\-"']/g, '').trim();
        if (titleNormalized === input) {
          return song;
        }
      }
      
      // Then try partial title matches (high confidence)
      for (const song of displaySongs) {
        const titleNormalized = song.title.toLowerCase().replace(/[.,!?;()\-"']/g, '').trim();
        if (titleNormalized.startsWith(input) && input.length >= Math.min(titleNormalized.length * 0.6, 5)) {
          return song;
        }
      }
      
      // Try word-by-word matching for multi-word searches
      const inputWords = input.split(/\s+/);
      if (inputWords.length > 1) {
        for (const song of displaySongs) {
          const titleWords = song.title.toLowerCase().replace(/[.,!?;()\-"']/g, '').split(/\s+/);
          let matchCount = 0;
          
          for (let i = 0; i < Math.min(inputWords.length, titleWords.length); i++) {
            if (titleWords[i].startsWith(inputWords[i]) || inputWords[i].startsWith(titleWords[i])) {
              matchCount++;
            }
          }
          
          // If we match the first few words and have significant coverage
          if (matchCount >= Math.min(inputWords.length, 3) && matchCount >= titleWords.length * 0.5) {
            return song;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error detecting song from search:', error);
      return null;
    }
  }

  // Check if search text looks like it's building toward a song title
  private isSearchProgressing(searchText: string): boolean {
    try {
      // First validate that the search text contains song title words
      const validatedText = this.validateSearchText(searchText);
      if (!validatedText) {
        return false;
      }
      
      const input = validatedText.toLowerCase().replace(/[.,!?;()\-"']/g, '').trim();
      
      if (!input || input.length < 2) return false;
      
      // Check if any song title starts with this input
      for (const song of songsDatabase.slice(0, 100)) { // Limit to prevent performance issues
        const titleNormalized = song.title.toLowerCase().replace(/[.,!?;()\-"']/g, '').trim();
        if (titleNormalized.startsWith(input) && input.length < titleNormalized.length) {
          return true;
        }
      }
      
      // Check if input contains words that are in song titles
      const inputWords = input.split(/\s+/);
      for (const word of inputWords) {
        if (word.length > 2 && this.songTitleWords.has(word)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking search progress:', error);
      return false;
    }
  }

  private startAutoScrollMenu(session: AppSession, sessionId: string, category?: string) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      
      this.stopScrolling(sessionId);
      
      let displaySongs = this.getPrioritizedSongs(category);
      
      if (displaySongs.length === 0) {
        this.safeDisplay(session, "No songs available in this category.");
        return;
      }
      
      karaokeSession.scrollIndex = 0;
      
      const updateMenu = () => {
        try {
          let menu = "";
          
          const startIndex = karaokeSession.scrollIndex;
          const endIndex = Math.min(startIndex + 5, displaySongs.length);
          
          for (let i = startIndex; i < endIndex; i++) {
            const song = displaySongs[i];
            menu += `${i + 1}. ${song.title}\n`;
          }
          
          menu += `\n🔢 Say 1-${displaySongs.length} • "live" for captions • "categories" for filter\n`;
          menu += `• "search [term]" to find songs • "scroll" to scroll • "menu" to return\n`;
          
          this.safeDisplay(session, menu);
          
          karaokeSession.scrollIndex = (endIndex >= displaySongs.length) ? 0 : endIndex;
        } catch (error) {
          console.error('Error updating menu:', error);
        }
      };
      
      updateMenu();
      
      karaokeSession.scrollInterval = setInterval(updateMenu, 5000);
    } catch (error) {
      console.error('Error starting auto scroll menu:', error);
      this.safeDisplay(session, 'Error loading menu. Say "menu" to retry.');
    }
  }

  // Safe display method with error handling
  private safeDisplay(session: AppSession, content: string, temporary = false) {
    try {
      if (!session || !session.layouts) {
        console.error('Invalid session or layouts');
        return;
      }
      
      session.layouts.showTextWall(content, { 
        view: ViewType.MAIN,
        durationMs: temporary ? 1000 : 0
      });
    } catch (error) {
      console.error('Error displaying content:', error);
      // Try a fallback display method
      try {
        if (session && session.layouts) {
          session.layouts.showTextWall('Display error occurred', { 
            view: ViewType.MAIN,
            durationMs: 1000
          });
        }
      } catch (fallbackError) {
        console.error('Fallback display also failed:', fallbackError);
      }
    }
  }

  // Debounced display update to prevent rapid updates
  private debouncedDisplayUpdate(session: AppSession, sessionId: string, content: string, delay = 100) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      
      this.clearDisplayTimeout(sessionId);
      
      karaokeSession.displayUpdateTimeout = setTimeout(() => {
        this.safeDisplay(session, content);
      }, delay);
    } catch (error) {
      console.error('Error in debounced display update:', error);
      this.safeDisplay(session, content);
    }
  }

  private generateInitialMenu(session: AppSession, sessionId: string, category?: string) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      let displaySongs = this.getPrioritizedSongs(category);
      
      let menu = "";
      
      const endIndex = Math.min(5, displaySongs.length);
      for (let i = 0; i < endIndex; i++) {
        const song = displaySongs[i];
        menu += `${i + 1}. ${song.title}\n`;
      }
      
      if (displaySongs.length > 5) {
        menu += `...and ${displaySongs.length - 5} more songs\n`;
      }
      
      menu += `\n🔢 Say 1-${displaySongs.length} • "live" for captions • "categories" for filter\n`;
      menu += `• "search [term]" to find songs • "scroll" to scroll • "menu" to return\n`;
      
      this.safeDisplay(session, menu);
    } catch (error) {
      console.error('Error generating initial menu:', error);
      this.safeDisplay(session, 'Error loading menu. Say "menu" to retry.');
    }
  }

  private generateSongMenu(category?: string): string {
    try {
      let menu = "";
      
      let displaySongs = this.getPrioritizedSongs(category);
      
      const maxDisplay = 5;
      displaySongs.slice(0, maxDisplay).forEach((song, index) => {
        menu += `${index + 1}. ${song.title}\n`;
      });
      
      if (displaySongs.length > maxDisplay) {
        menu += `...and ${displaySongs.length - maxDisplay} more songs\n`;
      }
      
      menu += `\n🔢 Say 1-${displaySongs.length} • "live" for captions • "categories" for filter\n`;
      menu += `• "search [term]" to find songs • "scroll" to scroll • "menu" to return\n`;
      
      return menu;
    } catch (error) {
      console.error('Error generating song menu:', error);
      return 'Error loading menu. Say "menu" to retry.';
    }
  }

  private generateCategoryMenu(): string {
    try {
      const categories = [...new Set(songsDatabase.map(s => s.category))].filter(Boolean);
      let menu = "📂 SONG CATEGORIES\n\n";
      
      categories.forEach((category, index) => {
        const count = getSongsByCategory(category!).length;
        menu += `${index + 1}. ${category} (${count} songs)\n`;
      });
      
      menu += `\n🔢 Say 1-${categories.length} or category name • "all" for all songs • "menu" for main\n`;
      
      return menu;
    } catch (error) {
      console.error('Error generating category menu:', error);
      return 'Error loading categories. Say "menu" to retry.';
    }
  }

  // Ultra-fast word matching using precomputed maps
  private ultraFastWordMatch(spoken: string, expected: string): boolean {
    try {
      const spokenClean = spoken.toLowerCase().replace(/[.,!?;()\-"']/g, '').trim();
      const expectedClean = expected.toLowerCase().replace(/[.,!?;()\-"']/g, '').trim();
      
      if (spokenClean === expectedClean) return true;
      
      const expectedSet = this.wordMaps.get(expectedClean);
      if (expectedSet) {
        for (const variation of expectedSet) {
          if (spokenClean.includes(variation) || variation.includes(spokenClean)) {
            return true;
          }
        }
      }
      
      if (spokenClean.length >= 2 && expectedClean.length >= 3) {
        return spokenClean.startsWith(expectedClean.substring(0, 2)) ||
               expectedClean.startsWith(spokenClean.substring(0, 2));
      }
      
      return false;
    } catch (error) {
      console.error('Error in word matching:', error);
      return false;
    }
  }

  private findSongByNumber(spokenNumber: string, category?: string): Song | null {
    try {
      const input = spokenNumber.toLowerCase().trim();
      console.log('Looking for number in:', input); // Debug log
      
      // Enhanced number detection - check for any number in the spoken text
      const numberWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
                           'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 
                           'eighteen', 'nineteen', 'twenty'];
      
      let detectedNumber = null;
      
      // First try to find digit numbers (1, 2, 3, etc.)
      const digitMatch = input.match(/\b(\d+)\b/);
      if (digitMatch) {
        detectedNumber = parseInt(digitMatch[1]);
      }
      
      // If no digit found, try word numbers
      if (!detectedNumber) {
        for (let i = 0; i < numberWords.length; i++) {
          if (input.includes(numberWords[i])) {
            detectedNumber = i + 1;
            break;
          }
        }
      }
      
      // Also try simple number detection for single words
      if (!detectedNumber) {
        const numberMap: { [key: string]: number } = {
          'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
          'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
          'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
          'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20
        };
        
        for (const [word, num] of Object.entries(numberMap)) {
          if (input === word || input.includes(word)) {
            detectedNumber = num;
            break;
          }
        }
      }
      
      console.log('Detected number:', detectedNumber); // Debug log
      
      if (detectedNumber) {
        const songsToUse = this.getPrioritizedSongs(category);
        console.log('Total songs available:', songsToUse.length); // Debug log
        
        if (detectedNumber >= 1 && detectedNumber <= songsToUse.length) {
          const selectedSong = songsToUse[detectedNumber - 1];
          console.log('Selected song:', selectedSong.title); // Debug log
          return selectedSong;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding song by number:', error);
      return null;
    }
  }

  private findCategory(spoken: string): string | null {
    try {
      const categories = [...new Set(songsDatabase.map(s => s.category))].filter(Boolean);
      const input = spoken.toLowerCase();
      
      for (const category of categories) {
        if (category && input.includes(category.toLowerCase())) {
          return category;
        }
      }
      
      const match = input.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/);
      if (match) {
        const numberMap: { [key: string]: number } = {
          'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
          'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
        };
        
        const num = isNaN(parseInt(match[1])) ? numberMap[match[1]] : parseInt(match[1]);
        if (num >= 1 && num <= categories.length) {
          return categories[num - 1] || null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding category:', error);
      return null;
    }
  }

  private updateKaraokeDisplay(session: AppSession, sessionId: string) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      if (!karaokeSession.currentSong) return;

      const song = karaokeSession.currentSong;
      const currentLine = song.lyrics[karaokeSession.currentLineIndex];
      
      if (!currentLine) {
        this.moveToNextLine(session, sessionId);
        return;
      }

      const words = currentLine.split(/\s+/);
      const currentWord = words[karaokeSession.currentWordIndex] || '';
      
      const display = words.map((word, idx) => 
        idx === karaokeSession.currentWordIndex ? `🔸${word.toUpperCase()}🔸` : word.toLowerCase()
      ).join(' ');
      
      const categoryTag = song.category ? ` [${song.category}]` : '';
      const languageTag = song.language ? ` (${song.language})` : '';
      
      this.safeDisplay(session, `🎵 ${song.title}${categoryTag}${languageTag}\n\n${display}`);
    } catch (error) {
      console.error('Error updating karaoke display:', error);
      this.safeDisplay(session, 'Display error. Say "menu" to restart.');
    }
  }

  private processSequentialWords(session: AppSession, sessionId: string, spoken: string): boolean {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      if (!karaokeSession.currentSong) return false;

      const currentLine = karaokeSession.currentSong.lyrics[karaokeSession.currentLineIndex];
      if (!currentLine) return false;

      const lineWords = currentLine.toLowerCase().split(/\s+/);
      const spokenWords = spoken.toLowerCase().split(/\s+/);
      
      let matched = 0;
      let wordIndex = karaokeSession.currentWordIndex;
      
      for (const spokenWord of spokenWords) {
        if (wordIndex >= lineWords.length) break;
        const expectedWord = lineWords[wordIndex].toLowerCase().replace(/[.,!?;()\-"']/g, '');
        if (expectedWord.length <= 2) {
          matched++;
          wordIndex++;
        } else if (this.ultraFastWordMatch(spokenWord, lineWords[wordIndex])) {
          matched++;
          wordIndex++;
        } else {
          break;
        }
      }
      
      if (matched > 0) {
        karaokeSession.currentWordIndex += matched;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error processing sequential words:', error);
      return false;
    }
  }

  protected async onSession(session: AppSession, sessionId: string, userId: string): Promise<void> {
    try {
      session.logger.info('🚀 Ultra-Fast Karaoke session started', { sessionId, userId });
      
      // Start with auto-scrolling menu instead of static menu
      this.startAutoScrollMenu(session, sessionId);
      
      session.events.onTranscription((data) => {
        const now = Date.now();
        
        try {
          if (data.text && data.text.trim()) {
            this.processVoiceInstantly(session, sessionId, data.text, data.isFinal, now);
          }
        } catch (error) {
          console.error('Transcription processing error:', error);
          this.safeDisplay(session, '⚠️ Continue speaking...', true);
        }
      });

      session.logger.info('✅ Ultra-fast transcription handler ready');
    } catch (error) {
      console.error('Error in onSession:', error);
      this.safeDisplay(session, 'Session error. Please refresh.');
    }
  }

  private processVoiceInstantly(session: AppSession, sessionId: string, spoken: string, isFinal: boolean, timestamp: number) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      
      // Prevent processing if already processing (debouncing)
      if (karaokeSession.isProcessing) {
        return;
      }
      
      // Skip duplicate processing
      if (spoken === karaokeSession.lastProcessedText && 
          timestamp - karaokeSession.processingTimestamp < 50) {
        return;
      }
      
      karaokeSession.isProcessing = true;
      karaokeSession.lastProcessedText = spoken;
      karaokeSession.processingTimestamp = timestamp;

      console.log('Processing voice input:', spoken); // Debug log

      // ENHANCED: Check for "menu" command from ANY state
      if (spoken.toLowerCase().includes('menu')) {
        this.returnToMainMenu(session, sessionId);
        karaokeSession.isProcessing = false;
        return;
      }

      if (karaokeSession.showingMenu) {
        // Update search text for song detection (but don't display it)
        karaokeSession.currentSearchText = spoken;
        karaokeSession.lastSearchUpdate = timestamp;
        
        // PRIORITY: Try number-based selection FIRST (more reliable)
        const selectedSong = this.findSongByNumber(spoken, karaokeSession.selectedCategory);
        if (selectedSong) {
          console.log('Number detected, starting song:', selectedSong.title); // Debug log
          this.stopScrolling(sessionId);
          karaokeSession.showingMenu = false;
          this.startKaraokeInstantly(session, sessionId, selectedSong);
          karaokeSession.isProcessing = false;
          return;
        }
        
        // Validate search text for song detection
        const validatedSearchText = this.validateSearchText(spoken);
        
        // Clear any existing search timeout
        this.clearSearchTimeout(sessionId);
        
        // Check for song title detection (secondary)
        const detectedSong = this.detectSongFromSearch(validatedSearchText, karaokeSession.selectedCategory);
        
        if (detectedSong && isFinal) {
          // Song detected and speech is final - start karaoke
          this.stopScrolling(sessionId);
          karaokeSession.showingMenu = false;
          this.startKaraokeInstantly(session, sessionId, detectedSong);
          karaokeSession.isProcessing = false;
          return;
        }

        if (spoken.toLowerCase().includes('live')) {
          this.stopScrolling(sessionId);
          karaokeSession.showingMenu = false;
          karaokeSession.liveCaptionsMode = true;
          this.safeDisplay(session, '🎙️ Live captions enabled\nStart singing!', true);
          karaokeSession.isProcessing = false;
          return;
        }

        if (spoken.toLowerCase().includes('categories')) {
          this.stopScrolling(sessionId);
          this.safeDisplay(session, this.generateCategoryMenu());
          karaokeSession.isProcessing = false;
          return;
        }

        const selectedCategory = this.findCategory(spoken);
        if (selectedCategory) {
          karaokeSession.selectedCategory = selectedCategory;
          this.startAutoScrollMenu(session, sessionId, selectedCategory);
          karaokeSession.isProcessing = false;
          return;
        }

        if (spoken.toLowerCase().includes('all')) {
          karaokeSession.selectedCategory = undefined;
          this.startAutoScrollMenu(session, sessionId);
          karaokeSession.isProcessing = false;
          return;
        }

        if (spoken.toLowerCase().includes('search')) {
          this.stopScrolling(sessionId);
          const searchTerm = spoken.toLowerCase().replace('search', '').trim();
          if (searchTerm) {
            const searchResults = searchSongs(searchTerm);
            if (searchResults.length > 0) {
              let searchMenu = `🔍 Search results for "${searchTerm}":\n\n`;
              searchResults.slice(0, 5).forEach((song, index) => {
                searchMenu += `${index + 1}. ${song.title}\n`;
              });
              if (searchResults.length > 5) {
                searchMenu += `...and ${searchResults.length - 5} more songs\n`;
              }
              searchMenu += `\n🔢 Say 1-${searchResults.length} • "menu" to return\n`;
              this.safeDisplay(session, searchMenu);
            } else {
              this.safeDisplay(session, `No songs found for "${searchTerm}"\n\n${this.generateSongMenu()}`);
            }
          }
          karaokeSession.isProcessing = false;
          return;
        }

        if (spoken.toLowerCase().includes('scroll')) {
          this.startAutoScrollMenu(session, sessionId, karaokeSession.selectedCategory);
          karaokeSession.isProcessing = false;
          return;
        }

        // If speech is progressing toward a song title, wait for completion
        if (validatedSearchText && this.isSearchProgressing(validatedSearchText)) {
          karaokeSession.searchTimeout = setTimeout(() => {
            try {
              const finalDetectedSong = this.detectSongFromSearch(this.validateSearchText(karaokeSession.currentSearchText), karaokeSession.selectedCategory);
              if (finalDetectedSong) {
                this.stopScrolling(sessionId);
                karaokeSession.showingMenu = false;
                this.startKaraokeInstantly(session, sessionId, finalDetectedSong);
              }
            } catch (error) {
              console.error('Error in search timeout:', error);
            }
          }, 2000); // Wait 2 seconds after user stops speaking
        }
        
        karaokeSession.isProcessing = false;
        return;
      }

      if (karaokeSession.liveCaptionsMode) {
        this.safeDisplay(session, `🎤 ${spoken}`);
        karaokeSession.isProcessing = false;
        return;
      }

      if (karaokeSession.currentSong && karaokeSession.isPlaying) {
        if (spoken.toLowerCase().includes('stop')) {
          karaokeSession.isPlaying = false;
          karaokeSession.showingMenu = true;
          this.startAutoScrollMenu(session, sessionId);
          karaokeSession.isProcessing = false;
          return;
        }

        this.processKaraokeWordInstantly(session, sessionId, spoken, isFinal);
        karaokeSession.isProcessing = false;
        return;
      }

      this.safeDisplay(session, `🎤 ${spoken}`);
      karaokeSession.isProcessing = false;
    } catch (error) {
      console.error('Error processing voice:', error);
      const karaokeSession = this.getKaraokeSession(sessionId);
      karaokeSession.isProcessing = false;
      this.safeDisplay(session, '⚠️ Processing error. Continue speaking...');
    }
  }

  private processKaraokeWordInstantly(session: AppSession, sessionId: string, spoken: string, isFinal: boolean) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      if (!karaokeSession.currentSong) return;

      const song = karaokeSession.currentSong;
      const currentLine = song.lyrics[karaokeSession.currentLineIndex];
      
      if (!currentLine) {
        this.moveToNextLine(session, sessionId);
        return;
      }

      if (this.processSequentialWords(session, sessionId, spoken)) {
        if (karaokeSession.currentWordIndex >= currentLine.split(/\s+/).length) {
          this.moveToNextLine(session, sessionId);
        } else {
          this.updateKaraokeDisplay(session, sessionId);
        }
        return;
      }

      const words = currentLine.split(/\s+/);
      if (karaokeSession.currentWordIndex >= words.length) {
        this.moveToNextLine(session, sessionId);
        return;
      }

      const expectedWord = words[karaokeSession.currentWordIndex];
      const expectedClean = expectedWord.toLowerCase().replace(/[.,!?;()\-"']/g, '');
      
      if (expectedClean.length <= 2) {
        karaokeSession.currentWordIndex++;
        
        if (karaokeSession.currentWordIndex >= words.length) {
          this.moveToNextLine(session, sessionId);
        } else {
          this.updateKaraokeDisplay(session, sessionId);
        }
        return;
      }

      if (this.ultraFastWordMatch(spoken, expectedWord)) {
        karaokeSession.currentWordIndex++;
        
        if (karaokeSession.currentWordIndex >= words.length) {
          this.moveToNextLine(session, sessionId);
        } else {
          this.updateKaraokeDisplay(session, sessionId);
        }
      } else {
        const spokenClean = spoken.toLowerCase().replace(/[.,!?;()\-"']/g, '');
        
        if (isFinal || (!spokenClean.includes(expectedClean.charAt(0)) && !expectedClean.includes(spokenClean.charAt(0)))) {
          karaokeSession.currentWordIndex++;
          
          if (karaokeSession.currentWordIndex >= words.length) {
            this.moveToNextLine(session, sessionId);
          } else {
            this.updateKaraokeDisplay(session, sessionId);
          }
        } else {
          this.updateKaraokeDisplay(session, sessionId);
        }
      }
    } catch (error) {
      console.error('Error processing karaoke word:', error);
      this.safeDisplay(session, '⚠️ Karaoke error. Say "menu" to restart.');
    }
  }

  private moveToNextLine(session: AppSession, sessionId: string) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      if (!karaokeSession.currentSong) return;

      const song = karaokeSession.currentSong;
      karaokeSession.currentLineIndex++;
      karaokeSession.currentWordIndex = 0;

      if (karaokeSession.currentLineIndex >= song.lyrics.length) {
        karaokeSession.isPlaying = false;
        karaokeSession.showingMenu = true;
        this.safeDisplay(session, `🎉 "${song.title}" finished!\n\nSay "menu" to return or a number for another song!`);
        return;
      }

      this.updateKaraokeDisplay(session, sessionId);
    } catch (error) {
      console.error('Error moving to next line:', error);
      this.safeDisplay(session, '⚠️ Line error. Say "menu" to restart.');
    }
  }

  private startKaraokeInstantly(session: AppSession, sessionId: string, song: Song) {
    try {
      const karaokeSession = this.getKaraokeSession(sessionId);
      
      karaokeSession.currentSong = song;
      karaokeSession.currentLineIndex = 0;
      karaokeSession.currentWordIndex = 0;
      karaokeSession.isPlaying = true;
      karaokeSession.liveCaptionsMode = false;
      karaokeSession.showingMenu = false;
      karaokeSession.currentSearchText = '';
      karaokeSession.isProcessing = false;
      
      this.clearSearchTimeout(sessionId);
      this.clearDisplayTimeout(sessionId);

      this.safeDisplay(session, `🎵 ${song.title}\n\n🚀 Get ready...`, true);

      setTimeout(() => {
        this.updateKaraokeDisplay(session, sessionId);
      }, 100);
    } catch (error) {
      console.error('Error starting karaoke:', error);
      this.safeDisplay(session, 'Error starting karaoke. Say "menu" to retry.');
    }
  }
}

const PACKAGE_NAME = process.env.PACKAGE_NAME || "org.justbreathebro.livelyrics";
const PORT = parseInt(process.env.PORT || "3000", 10);
const MENTRAOS_API_KEY = process.env.MENTRAOS_API_KEY;

if (!MENTRAOS_API_KEY) {
  console.error("❌ MENTRAOS_API_KEY environment variable is required");
  process.exit(1);
}

const server = new UltraFastKaraokeMentraApp({
  packageName: PACKAGE_NAME,
  apiKey: MENTRAOS_API_KEY,
  port: PORT
});

console.log("🚀 Starting ULTRA-FAST MentraOS Karaoke App...");
console.log(`📦 Package: ${PACKAGE_NAME}`);
console.log(`🌍 Port: ${PORT}`);
console.log("⚡ Optimized for production deployment with PRIORITY SONGS first!");
console.log("🎯 Deploy to Railway or Ubuntu server for best performance");
console.log("🎵 Auto-scrolling menu with priority songs shown first!");

server.start().catch(err => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});