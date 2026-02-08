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
    
    // Extract file extension from the URL path (not query params)
    const urlPath = url.split('?')[0]; // Remove query params
    const lastSegment = urlPath.split('/').pop() || ''; // Get filename part only
    const dotParts = lastSegment.split('.');
    // Only use extension if it looks like a valid media extension (2-4 chars, no slashes)
    let extension = 'mp3';
    if (dotParts.length > 1) {
      const ext = dotParts.pop()?.toLowerCase() || '';
      if (/^[a-z0-9]{2,4}$/.test(ext)) {
        extension = ext;
      }
    }
    
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

  // Download media file and return local path. All media must be downloaded before playing.
  // Returns cached path instantly if already downloaded, otherwise downloads with progress.
  async getMediaUrl(
    remoteUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; isLocal: boolean }> {
    await this.initialize();

    // Check if already cached
    const cachedPath = await this.getCachedPath(remoteUrl);
    if (cachedPath) {
      onProgress?.(1);
      return { url: cachedPath, isLocal: true };
    }

    // Download the file (blocking) with progress tracking
    const key = this.getCacheKey(remoteUrl);
    const localPath = `${CACHE_DIRECTORY}${key}`;

    // Check if already downloading - wait for existing download
    if (this.downloadQueue.has(key)) {
      const existingPath = await this.downloadQueue.get(key);
      if (existingPath) {
        onProgress?.(1);
        return { url: existingPath, isLocal: true };
      }
    }

    try {
      console.log(`⬇️ Downloading: ${remoteUrl.substring(0, 80)}...`);

      const downloadResumable = FileSystem.createDownloadResumable(
        remoteUrl,
        localPath,
        {},
        (downloadProgress) => {
          if (downloadProgress.totalBytesExpectedToWrite > 0) {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            onProgress?.(progress);
          }
        }
      );

      const downloadPromise = downloadResumable.downloadAsync().then(async (result) => {
        if (result && result.status === 200) {
          const fileInfo = await FileSystem.getInfoAsync(localPath);
          this.cacheIndex[key] = {
            remoteUrl: remoteUrl,
            localPath: localPath,
            downloadedAt: Date.now(),
            fileSize: fileInfo.exists ? (fileInfo as any).size : undefined,
          };
          await this.saveCacheIndex();
          console.log(`✅ Cached: ${key}`);
          return localPath;
        }
        return null;
      });

      this.downloadQueue.set(key, downloadPromise);
      const resultPath = await downloadPromise;
      this.downloadQueue.delete(key);

      if (resultPath) {
        onProgress?.(1);
        return { url: resultPath, isLocal: true };
      } else {
        throw new Error('Download failed - no result path');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      this.downloadQueue.delete(key);
      // Clean up partial download
      try {
        await FileSystem.deleteAsync(localPath, { idempotent: true });
      } catch {}
      throw error;
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
