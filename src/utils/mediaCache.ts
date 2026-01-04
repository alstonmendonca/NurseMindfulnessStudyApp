import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DIRECTORY = `${FileSystem.cacheDirectory}media/`;
const CACHE_INDEX_KEY = '@media_cache_index';

interface CacheEntry {
  remoteUrl: string;
  localPath: string;
  downloadedAt: number;
  fileSize?: number;
}

interface CacheIndex {
  [key: string]: CacheEntry;
}

class MediaCacheService {
  private cacheIndex: CacheIndex = {};
  private isInitialized: boolean = false;
  private downloadQueue: Map<string, Promise<string | null>> = new Map();

  // Initialize the cache service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Ensure cache directory exists
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIRECTORY, { intermediates: true });
      }

      // Load cache index from storage
      const indexJson = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (indexJson) {
        this.cacheIndex = JSON.parse(indexJson);
        // Verify cached files still exist
        await this.verifyCacheIntegrity();
      }

      this.isInitialized = true;
      console.log('📁 Media cache initialized');
    } catch (error) {
      console.error('Error initializing media cache:', error);
      this.cacheIndex = {};
    }
  }

  // Verify cached files still exist and remove stale entries
  private async verifyCacheIntegrity(): Promise<void> {
    const keysToRemove: string[] = [];

    for (const [key, entry] of Object.entries(this.cacheIndex)) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
        if (!fileInfo.exists) {
          keysToRemove.push(key);
        }
      } catch {
        keysToRemove.push(key);
      }
    }

    if (keysToRemove.length > 0) {
      for (const key of keysToRemove) {
        delete this.cacheIndex[key];
      }
      await this.saveCacheIndex();
      console.log(`🧹 Removed ${keysToRemove.length} stale cache entries`);
    }
  }

  // Save cache index to AsyncStorage
  private async saveCacheIndex(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(this.cacheIndex));
    } catch (error) {
      console.error('Error saving cache index:', error);
    }
  }

  // Generate a unique cache key from URL
  private getCacheKey(url: string): string {
    // Create a simple hash from the URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Extract file extension from URL
    const urlPath = url.split('?')[0]; // Remove query params
    const extension = urlPath.split('.').pop()?.toLowerCase() || 'mp3';
    
    return `media_${Math.abs(hash)}.${extension}`;
  }

  // Check if a URL is cached
  async isCached(url: string): Promise<boolean> {
    await this.initialize();
    const key = this.getCacheKey(url);
    
    if (this.cacheIndex[key]) {
      // Verify file still exists
      try {
        const fileInfo = await FileSystem.getInfoAsync(this.cacheIndex[key].localPath);
        return fileInfo.exists;
      } catch {
        return false;
      }
    }
    return false;
  }

  // Get cached file path or null
  async getCachedPath(url: string): Promise<string | null> {
    await this.initialize();
    const key = this.getCacheKey(url);
    
    if (this.cacheIndex[key]) {
      const entry = this.cacheIndex[key];
      try {
        const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
        if (fileInfo.exists) {
          console.log(`✅ Cache hit: ${url.substring(0, 50)}...`);
          return entry.localPath;
        }
      } catch {
        // File doesn't exist, remove from index
        delete this.cacheIndex[key];
        await this.saveCacheIndex();
      }
    }
    return null;
  }

  // Get media URL - returns cached path if available, otherwise returns original URL and starts download
  async getMediaUrl(remoteUrl: string): Promise<{ url: string; isLocal: boolean }> {
    await this.initialize();

    // Check if already cached
    const cachedPath = await this.getCachedPath(remoteUrl);
    if (cachedPath) {
      return { url: cachedPath, isLocal: true };
    }

    // Start background download (don't wait)
    this.downloadInBackground(remoteUrl);

    // Return remote URL for streaming
    return { url: remoteUrl, isLocal: false };
  }

  // Download file in background
  private async downloadInBackground(url: string): Promise<void> {
    const key = this.getCacheKey(url);
    
    // Don't start duplicate downloads
    if (this.downloadQueue.has(key)) {
      return;
    }

    const downloadPromise = this.downloadFile(url);
    this.downloadQueue.set(key, downloadPromise);

    try {
      await downloadPromise;
    } finally {
      this.downloadQueue.delete(key);
    }
  }

  // Download and cache a file
  async downloadFile(url: string): Promise<string | null> {
    await this.initialize();
    const key = this.getCacheKey(url);
    const localPath = `${CACHE_DIRECTORY}${key}`;

    // Check if already downloading or cached
    if (this.cacheIndex[key]) {
      const existing = await this.getCachedPath(url);
      if (existing) return existing;
    }

    try {
      console.log(`⬇️ Downloading: ${url.substring(0, 50)}...`);
      
      const downloadResult = await FileSystem.downloadAsync(url, localPath);
      
      if (downloadResult.status === 200) {
        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        
        // Save to cache index
        this.cacheIndex[key] = {
          remoteUrl: url,
          localPath: localPath,
          downloadedAt: Date.now(),
          fileSize: fileInfo.exists ? (fileInfo as any).size : undefined,
        };
        await this.saveCacheIndex();
        
        console.log(`✅ Cached: ${key}`);
        return localPath;
      } else {
        console.error(`Download failed with status ${downloadResult.status}`);
        return null;
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      // Clean up partial download
      try {
        await FileSystem.deleteAsync(localPath, { idempotent: true });
      } catch {}
      return null;
    }
  }

  // Clear all cached media
  async clearCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(CACHE_DIRECTORY, { idempotent: true });
      await FileSystem.makeDirectoryAsync(CACHE_DIRECTORY, { intermediates: true });
      this.cacheIndex = {};
      await this.saveCacheIndex();
      console.log('🗑️ Media cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get cache stats
  async getCacheStats(): Promise<{ fileCount: number; totalSize: number }> {
    await this.initialize();
    
    let totalSize = 0;
    let fileCount = 0;

    for (const entry of Object.values(this.cacheIndex)) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
        if (fileInfo.exists) {
          fileCount++;
          totalSize += (fileInfo as any).size || 0;
        }
      } catch {}
    }

    return { fileCount, totalSize };
  }

  // Format bytes to human readable
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const mediaCache = new MediaCacheService();
