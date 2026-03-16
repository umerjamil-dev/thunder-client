import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { insforge } from './insforge';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthConfig {
  type: 'none' | 'bearer' | 'basic' | 'apikey';
  bearerToken?: string;
  basicUsername?: string;
  basicPassword?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyLocation?: 'header' | 'query';
}

export interface ApiRequest {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  bodyType: 'none' | 'json' | 'form-data' | 'raw';
  auth: AuthConfig;
}

export interface ApiResponse {
  status: number | null;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  time: number;
  size: string;
  loading: boolean;
  error: string | null;
}

export interface Tab {
  id: string;
  name: string;
  isDirty?: boolean;
  request: ApiRequest;
  response: ApiResponse;
}

export interface Collection {
  id: string;
  name: string;
  requests: ApiRequest[];
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValue[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatar?: string;
}

export interface WorkspaceMember {
  id: string;
  email: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending';
}

export interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'team';
  collections: Collection[];
  history: ApiRequest[];
  environments: Environment[];
  members: WorkspaceMember[];
}

interface ApiStore {
  // Session State
  user: User | null;
  isAuthenticated: boolean;
  
  // Workspace State
  workspaces: Workspace[];
  activeWorkspaceId: string;
  
  // Local/UI State
  tabs: Tab[];
  activeTabId: string | null;
  activeEnvironmentId: string | null;
  sidebarSearchTerm: string;
  tempEmailForVerification: string | null;
  
  // Actions
  setTempEmail: (email: string | null) => void;
  initializeSession: () => Promise<void>;
  login: (user: User) => void;
  logout: () => void;
  
  // Tab Management
  addTab: (request?: Partial<ApiRequest>) => void;
  closeTab: (id: string, e?: React.MouseEvent) => void;
  setActiveTabId: (id: string | null) => void;
  updateActiveTabRequest: (updates: Partial<ApiRequest>) => void;
  updateActiveTabResponse: (updates: Partial<ApiResponse>) => void;
  renameTab: (id: string, newName: string) => void;
  
  // Workspace Sync
  syncWorkspaces: () => Promise<void>;

  // Current Workspace Operations
  addToHistory: (request: ApiRequest) => void;
  clearHistory: () => void;
  addCollection: (name: string) => void;
  saveToCollection: (collectionId: string, request: ApiRequest) => void;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, newName: string) => void;
  addEnvironment: (name: string) => void;
  updateEnvironment: (id: string, variables: KeyValue[]) => void;
  deleteEnvironment: (id: string) => void;
  setActiveEnvironmentId: (id: string | null) => void;

  // Global Workspace Management
  createWorkspace: (name: string, type: 'personal' | 'team') => Promise<void>;
  setActiveWorkspaceId: (id: string) => void;
  addWorkspaceMember: (workspaceId: string, email: string) => void;
  removeWorkspaceMember: (workspaceId: string, memberId: string) => void;

  // Search
  setSidebarSearchTerm: (term: string) => void;
}

const createDefaultRequest = (name = 'New Request'): ApiRequest => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  url: '',
  method: 'GET',
  headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }],
  params: [],
  body: '',
  bodyType: 'none',
  auth: { type: 'none' },
});

const defaultResponse: ApiResponse = {
  status: null,
  statusText: '',
  data: null,
  headers: {},
  time: 0,
  size: '0 B',
  loading: false,
  error: null,
};

const defaultPersonalWorkspace: Workspace = {
  id: 'default-personal',
  name: 'My Workspace',
  type: 'personal',
  collections: [],
  history: [],
  environments: [],
  members: [],
};

export const useApiStore = create<ApiStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      workspaces: [defaultPersonalWorkspace],
      activeWorkspaceId: 'default-personal',
      tabs: [],
      activeTabId: null,
      activeEnvironmentId: null,
      sidebarSearchTerm: '',
      tempEmailForVerification: null,

      setTempEmail: (email) => set({ tempEmailForVerification: email }),

      initializeSession: async () => {
        const { data, error } = await insforge.auth.getCurrentSession();
        if (data?.session?.user) {
          const { user } = data.session;
          set({ 
            user: {
              id: user.id,
              name: (user.metadata as any)?.name || user.email?.split('@')[0] || '',
              email: user.email || '',
              emailVerified: user.emailVerified,
              avatar: (user.metadata as any)?.avatar_url
            },
            isAuthenticated: true 
          });
          await get().syncWorkspaces();
        }
      },

      login: (user) => set({ user, isAuthenticated: true }),
      
      logout: async () => {
        await insforge.auth.signOut();
        set({ user: null, isAuthenticated: false, activeTabId: null, tabs: [], tempEmailForVerification: null });
      },

      syncWorkspaces: async () => {
        try {
          const { data: dbWorkspaces, error } = await insforge.database
            .from('workspaces')
            .select('*, collections(*), history(*), environments(*), members(*)');
          
          if (dbWorkspaces) {
            set({ workspaces: dbWorkspaces as Workspace[] });
          }
        } catch (e) {
          console.error('Failed to sync workspaces:', e);
        }
      },

      setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id, activeTabId: null, tabs: [] }),

      createWorkspace: async (name, type) => {
        try {
          const { data, error } = await insforge.database
            .from('workspaces')
            .insert([{ name, type }])
            .select()
            .single();

          if (data) {
            const newWorkspace: Workspace = {
              ...(data as any),
              collections: [],
              history: [],
              environments: [],
              members: [],
            };
            set((state) => ({ 
              workspaces: [...state.workspaces, newWorkspace],
              activeWorkspaceId: data.id,
              tabs: [],
              activeTabId: null
            }));
          }
        } catch (e) {
          // Fallback to local if DB fails
          const newWorkspace: Workspace = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            type,
            collections: [],
            history: [],
            environments: [],
            members: [],
          };
          set((state) => ({ 
            workspaces: [...state.workspaces, newWorkspace],
            activeWorkspaceId: newWorkspace.id,
          }));
        }
      },

      addTab: (requestUpdates) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newRequest = { ...createDefaultRequest(), ...requestUpdates };
        const newTab: Tab = {
          id,
          name: newRequest.name || 'New Request',
          request: newRequest,
          response: { ...defaultResponse },
        };
        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: id,
        }));
      },

      closeTab: (id, e) => {
        if (e) e.stopPropagation();
        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== id);
          let newActiveId = state.activeTabId;
          if (state.activeTabId === id) {
            newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
          }
          return { tabs: newTabs, activeTabId: newActiveId };
        });
      },

      setActiveTabId: (id) => set({ activeTabId: id }),

      updateActiveTabRequest: (updates) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === state.activeTabId 
              ? { 
                  ...t, 
                  request: { ...t.request, ...updates },
                  name: (updates.name !== undefined) ? updates.name : t.name 
                } 
              : t
          ),
        }));
      },

      updateActiveTabResponse: (updates) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === state.activeTabId ? { ...t, response: { ...t.response, ...updates } } : t
          ),
        }));
      },

      renameTab: (id, newName) => {
        set((state) => ({
          tabs: state.tabs.map(t => t.id === id ? { ...t, name: newName } : t)
        }));
      },

      // Workspace Specific Operations (Local first, then could be synced)
      addToHistory: async (request) => {
        const { data, error } = await insforge.database
          .from('history')
          .insert([{ ...request, workspace_id: get().activeWorkspaceId }])
          .select()
          .single();

        set((state) => ({
          workspaces: state.workspaces.map(w => 
            w.id === state.activeWorkspaceId 
              ? { ...w, history: [data || request, ...w.history].slice(0, 50) } 
              : w
          )
        }));
      },

      clearHistory: async () => {
        await insforge.database
          .from('history')
          .delete()
          .eq('workspace_id', get().activeWorkspaceId);

        set((state) => ({
          workspaces: state.workspaces.map(w => 
            w.id === state.activeWorkspaceId ? { ...w, history: [] } : w
          )
        }));
      },

      addCollection: async (name) => {
        const { data, error } = await insforge.database
          .from('collections')
          .insert([{ name, workspace_id: get().activeWorkspaceId }])
          .select()
          .single();

        if (data) {
          const newCollection: Collection = { ...(data as any), requests: [] };
          set((state) => ({
            workspaces: state.workspaces.map(w => 
              w.id === state.activeWorkspaceId 
                ? { ...w, collections: [...w.collections, newCollection] } 
                : w
            )
          }));
        }
      },

      saveToCollection: (collectionId, request) => {
        set((state) => ({
          workspaces: state.workspaces.map(w => 
            w.id === state.activeWorkspaceId 
              ? {
                  ...w,
                  collections: w.collections.map(c => 
                    c.id === collectionId 
                      ? { ...c, requests: [...c.requests, { ...request, id: Math.random().toString(36).substr(2, 9) }] } 
                      : c
                  )
                } 
              : w
          )
        }));
      },

      deleteCollection: (id) => set((state) => ({
        workspaces: state.workspaces.map(w => 
          w.id === state.activeWorkspaceId 
            ? { ...w, collections: w.collections.filter(c => c.id !== id) } 
            : w
        )
      })),

      renameCollection: (id, newName) => set((state) => ({
        workspaces: state.workspaces.map(w => 
          w.id === state.activeWorkspaceId 
            ? {
                ...w,
                collections: w.collections.map(c => c.id === id ? { ...c, name: newName } : c)
              } 
            : w
        )
      })),

      addEnvironment: (name) => {
        const newEnv: Environment = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          variables: [],
        };
        set((state) => ({
          workspaces: state.workspaces.map(w => 
            w.id === state.activeWorkspaceId 
              ? { ...w, environments: [...w.environments, newEnv] } 
              : w
          )
        }));
      },

      updateEnvironment: (id, variables) => set((state) => ({
        workspaces: state.workspaces.map(w => 
          w.id === state.activeWorkspaceId 
            ? {
                ...w,
                environments: w.environments.map(e => e.id === id ? { ...e, variables } : e)
              } 
            : w
        )
      })),

      deleteEnvironment: (id) => set((state) => ({
        activeEnvironmentId: state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
        workspaces: state.workspaces.map(w => 
          w.id === state.activeWorkspaceId 
            ? { ...w, environments: w.environments.filter(e => e.id !== id) } 
            : w
        )
      })),

      setActiveEnvironmentId: (id) => set({ activeEnvironmentId: id }),

      addWorkspaceMember: (workspaceId, email) => set((state) => ({
        workspaces: state.workspaces.map(w => 
          w.id === workspaceId 
            ? { 
                ...w, 
                members: [...w.members, { id: Math.random().toString(36).substr(2, 9), email, role: 'member', status: 'pending' }] 
              } 
            : w
        )
      })),

      removeWorkspaceMember: (workspaceId, memberId) => set((state) => ({
        workspaces: state.workspaces.map(w => 
          w.id === workspaceId 
            ? { ...w, members: w.members.filter(m => m.id !== memberId) } 
            : w
        )
      })),

      setSidebarSearchTerm: (term) => set({ sidebarSearchTerm: term }),
    }),
    {
      name: 'api-client-storage-v4',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
        activeEnvironmentId: state.activeEnvironmentId
      }),
    }
  )
);

// Helper function to resolve variables
export const resolveVariables = (text: string, variables: KeyValue[]): string => {
  let resolved = text;
  variables.forEach(v => {
    if (v.enabled && v.key) {
      const regex = new RegExp(`{{${v.key}}}`, 'g');
      resolved = resolved.replace(regex, v.value);
    }
  });
  return resolved;
};
