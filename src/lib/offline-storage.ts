import { Todo } from '@/types/todo'

const STORAGE_PREFIX = 'macheinfach'
const STORAGE_VERSION = '1.0'

interface StoredData {
  version: string
  lastSync: number
  todos: Todo[]
  user: {
    id: string
    name: string
    color: string
  }
}

export class OfflineStorage {
  private listId: string

  constructor(listId: string) {
    this.listId = listId
  }

  private getStorageKey(suffix: string): string {
    return `${STORAGE_PREFIX}-${suffix}-${this.listId}`
  }

  // Save todos to localStorage
  saveTodos(todos: Todo[]): void {
    try {
      const data: StoredData = {
        version: STORAGE_VERSION,
        lastSync: Date.now(),
        todos,
        user: this.getStoredUser() || {
          id: 'unknown',
          name: 'Unknown User',
          color: '#999999'
        }
      }
      localStorage.setItem(this.getStorageKey('data'), JSON.stringify(data))
      console.log(`💾 Saved ${todos.length} todos to localStorage`)
    } catch (error) {
      console.error('❌ Failed to save todos to localStorage:', error)
    }
  }

  // Load todos from localStorage
  loadTodos(): Todo[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey('data'))
      if (!stored) return []

      const data: StoredData = JSON.parse(stored)
      
      // Check version compatibility
      if (data.version !== STORAGE_VERSION) {
        console.warn('⚠️ Storage version mismatch, clearing data')
        this.clearTodos()
        return []
      }

      console.log(`📂 Loaded ${data.todos.length} todos from localStorage`)
      return data.todos || []
    } catch (error) {
      console.error('❌ Failed to load todos from localStorage:', error)
      return []
    }
  }

  // Save user info
  saveUser(user: { id: string; name: string; color: string }): void {
    try {
      localStorage.setItem(this.getStorageKey('user'), JSON.stringify(user))
      localStorage.setItem('macheinfach-username', user.name) // Keep global username
    } catch (error) {
      console.error('❌ Failed to save user to localStorage:', error)
    }
  }

  // Load user info
  getStoredUser(): { id: string; name: string; color: string } | null {
    try {
      const stored = localStorage.getItem(this.getStorageKey('user'))
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('❌ Failed to load user from localStorage:', error)
      return null
    }
  }

  // Clear all stored data for this list
  clearTodos(): void {
    try {
      localStorage.removeItem(this.getStorageKey('data'))
      console.log('🗑️ Cleared todos from localStorage')
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error)
    }
  }

  // Get storage stats
  getStorageStats(): {
    hasData: boolean
    todoCount: number
    lastSync: Date | null
    storageSize: number
  } {
    try {
      const stored = localStorage.getItem(this.getStorageKey('data'))
      if (!stored) {
        return {
          hasData: false,
          todoCount: 0,
          lastSync: null,
          storageSize: 0
        }
      }

      const data: StoredData = JSON.parse(stored)
      return {
        hasData: true,
        todoCount: data.todos.length,
        lastSync: new Date(data.lastSync),
        storageSize: new Blob([stored]).size
      }
    } catch (error) {
      return {
        hasData: false,
        todoCount: 0,
        lastSync: null,
        storageSize: 0
      }
    }
  }

  // Export data for backup
  exportData(): string {
    try {
      const data = localStorage.getItem(this.getStorageKey('data'))
      return data || '{}'
    } catch (error) {
      console.error('❌ Failed to export data:', error)
      return '{}'
    }
  }

  // Import data from backup
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      localStorage.setItem(this.getStorageKey('data'), jsonData)
      console.log('📥 Imported data to localStorage')
      return true
    } catch (error) {
      console.error('❌ Failed to import data:', error)
      return false
    }
  }
}

// Global helper functions
export const getGlobalUsername = (): string => {
  return localStorage.getItem('macheinfach-username') || ''
}

export const setGlobalUsername = (name: string): void => {
  localStorage.setItem('macheinfach-username', name)
}

const LOCAL_LIST_IDS_KEY = `${STORAGE_PREFIX}-localListIds`;
const LOCAL_LIST_NAMES_KEY = `${STORAGE_PREFIX}-localListNames`;

export const getLocalListIds = (): string[] => {
  try {
    const stored = localStorage.getItem(LOCAL_LIST_IDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ Failed to load local list IDs from localStorage:', error);
    return [];
  }
};

export const getLocalListNames = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(LOCAL_LIST_NAMES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('❌ Failed to load local list names from localStorage:', error);
    return {};
  }
};

export const setLocalListName = (listId: string, name: string): void => {
  try {
    const currentNames = getLocalListNames();
    currentNames[listId] = name;
    localStorage.setItem(LOCAL_LIST_NAMES_KEY, JSON.stringify(currentNames));
    console.log(`💾 Set list name for ${listId}: ${name}`);
  } catch (error) {
    console.error('❌ Failed to save local list name to localStorage:', error);
  }
};

export const getLocalListName = (listId: string): string => {
  const names = getLocalListNames();
  return names[listId] || listId; // Fallback to listId if no name set
};

export const addLocalListId = (listId: string): void => {
  try {
    const currentIds = getLocalListIds();
    if (!currentIds.includes(listId)) {
      const updatedIds = [...currentIds, listId];
      localStorage.setItem(LOCAL_LIST_IDS_KEY, JSON.stringify(updatedIds));
      console.log(`💾 Added list ID ${listId} to local lists`);
    }
  } catch (error) {
    console.error('❌ Failed to add local list ID to localStorage:', error);
  }
};

export const removeLocalListId = (listId: string): void => {
  try {
    const currentIds = getLocalListIds();
    const updatedIds = currentIds.filter(id => id !== listId);
    localStorage.setItem(LOCAL_LIST_IDS_KEY, JSON.stringify(updatedIds));
    console.log(`🗑️ Removed list ID ${listId} from local lists`);
  } catch (error) {
    console.error('❌ Failed to remove local list ID from localStorage:', error);
  }
};

// Clean up old storage data (for maintenance)
export const cleanupOldStorage = (): void => {
  try {
    const keys = Object.keys(localStorage)
    const oldKeys = keys.filter(key => 
      key.startsWith(STORAGE_PREFIX) && 
      !key.includes(STORAGE_VERSION)
    )
    
    oldKeys.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🧹 Removed old storage key: ${key}`)
    })
    
    if (oldKeys.length > 0) {
      console.log(`🧹 Cleaned up ${oldKeys.length} old storage entries`)
    }
  } catch (error) {
    console.error('❌ Failed to cleanup old storage:', error)
  }
}