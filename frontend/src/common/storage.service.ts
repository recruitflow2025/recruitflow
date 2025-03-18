import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private isBrowser: boolean;
  private storageChangeSubject = new BehaviorSubject<{ key: string; value: string | null }>({
    key: '',
    value: null,
  });

  // Observable to notify subscribers when storage changes
  storageChange$ = this.storageChangeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Get an item from localStorage.
   * @param key - The key of the item to retrieve.
   * @returns The value as a string or null if the key does not exist.
   */
  getItem(key: string): any {
    if (this.isBrowser) {
      return localStorage.getItem(key);
    }
    return null;
  }

  /**
   * Get an item from localStorage and parse it as JSON.
   * @param key - The key of the item to retrieve.
   * @returns The parsed JSON object or null if the key does not exist.
   */
  getItemAsJson<T>(key: string): T | null {
    const item = this.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as T;
      } catch (error) {
        console.error(`Error parsing JSON for key "${key}":`, error);
        return null;
      }
    }
    return null;
  }

  /**
   * Set an item in localStorage.
   * @param key - The key of the item to set.
   * @param value - The value to store.
   */
  setItem(key: string, value: string): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(key, value);
        this.storageChangeSubject.next({ key, value }); // Notify subscribers
      } catch (error) {
        console.error(`Error setting item in localStorage for key "${key}":`, error);
      }
    }
  }

  /**
   * Set an item in localStorage as a JSON string.
   * @param key - The key of the item to set.
   * @param value - The value to store (will be stringified).
   */
  setItemAsJson(key: string, value: any): void {
    try {
      const jsonValue = JSON.stringify(value);
      this.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error stringifying JSON for key "${key}":`, error);
    }
  }

  /**
   * Remove an item from localStorage.
   * @param key - The key of the item to remove.
   */
  removeItem(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
      this.storageChangeSubject.next({ key, value: null }); // Notify subscribers
    }
  }

  /**
   * Clear all items from localStorage.
   */
  clear(): void {
    if (this.isBrowser) {
      localStorage.clear();
      this.storageChangeSubject.next({ key: '', value: null }); // Notify subscribers
    }
  }
}