import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'

const dayInMilliseconds = 24 * 60 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: dayInMilliseconds,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000
    }
  }
})

export const queryPersister = createSyncStoragePersister({
  key: 'arpit-one-query-cache',
  storage: typeof window === 'undefined' ? undefined : window.localStorage,
  throttleTime: 1000
})

export const queryCacheMaxAge = dayInMilliseconds
