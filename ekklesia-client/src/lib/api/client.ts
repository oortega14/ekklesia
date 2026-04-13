import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios'

// ── Module-level token storage ───────────────────────────────────────
// AuthContext calls setAccessToken() and setAuthCallbacks() after mount.
let _accessToken: string | null = null
let _onRefreshToken: (() => Promise<string | null>) | null = null
let _onLogout: (() => void) | null = null

export function setAccessToken(token: string | null) {
  _accessToken = token
}

export function setAuthCallbacks(callbacks: {
  onRefreshToken: () => Promise<string | null>
  onLogout: () => void
}) {
  _onRefreshToken = callbacks.onRefreshToken
  _onLogout = callbacks.onLogout
}

// ── Axios instance ────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: inject Bearer token ─────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`
  }
  return config
})

// ── Response interceptor: handle 401 with refresh + retry ────────────
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function flushQueue(err: unknown, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) =>
    err ? reject(err) : resolve(token!)
  )
  pendingQueue = []
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // Queue concurrent 401s while refreshing
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers!.Authorization = `Bearer ${token}`
        return apiClient(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const newToken = _onRefreshToken ? await _onRefreshToken() : null
      if (!newToken) {
        flushQueue(new Error('Token refresh failed'))
        _onLogout?.()
        return Promise.reject(error)
      }
      flushQueue(null, newToken)
      original.headers!.Authorization = `Bearer ${newToken}`
      return apiClient(original)
    } catch (refreshErr) {
      flushQueue(refreshErr)
      _onLogout?.()
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
