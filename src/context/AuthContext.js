// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** JWT Service Import
import jwt from 'src/enpoints/jwt/useJwt'

// ** Config
import authConfig from 'src/configs/auth'

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  // ** Setup Axios Interceptors
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = window.localStorage.getItem('accessToken')
      const storedUser = window.localStorage.getItem('userData')

      console.log('🔍 InitAuth - Token:', storedToken ? 'Found' : 'Not found')
      console.log('🔍 InitAuth - User data:', storedUser ? 'Found' : 'Not found')

      if (storedToken && storedUser) {
        setLoading(true)

        try {
          // Parse stored user data first
          const userData = JSON.parse(storedUser)
          console.log('📋 Parsed user data:', userData)

          // Set user immediately from localStorage for faster UI
          setUser({
            ...userData,
            role: userData.role || 'admin',
            permissions: userData.permissions || ['read', 'write'],
            id: userData.id || userData.userId || 1,
            fullName: userData.fullName || userData.name || 'User',
            username: userData.username || userData.userName || userData.email,
            email: userData.email || userData.userName
          })

          // Then verify with server if meEndpoint exists
          // if (authConfig.meEndpoint) { ... }
        } catch (parseError) {
          console.error('❌ Error parsing stored user data:', parseError)
          localStorage.removeItem('userData')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('accessToken')
          setUser(null)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const handleLogin = (params, errorCallback) => {
    setLoading(true)

    jwt
      .login({
        userName: params.userName,
        password: params.password
      })
      .then(res => {
        if (res.data.success) {
          const userData = {
            ...res.data.userData,
            role: res.data.userData.role || 'admin',
            permissions: res.data.userData.permission || ['read', 'write', 'delete'],
            id: res.data.userData.id || res.data.userData.userId || 1,
            fullName: res.data.userData.fullName || res.data.userData.name || 'User',
            username: res.data.userData.username || res.data.userData.userName || params.userName,
            email: res.data.userData.email || params.userName,
            avatar: res.data.userData.avatar || null
          }

          console.log('👤 Processed user data:', userData)

          window.localStorage.setItem('accessToken', res.data.accessToken)
          window.localStorage.setItem('userData', JSON.stringify(userData))

          if (res.data.refreshToken) {
            window.localStorage.setItem('refreshToken', res.data.refreshToken)
          }

          setUser(userData)
          setLoading(false)

          console.log('✅ Login successful, user set:', userData)

          const returnUrl = router.query.returnUrl
          const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

          console.log('🔄 Redirecting to:', redirectURL)

          router.replace(redirectURL)
        } else {
          console.log('❌ Login failed:', res.data.message)
          setLoading(false)

          if (errorCallback) errorCallback({ message: res.data.message || 'Login failed' })
        }
      })
      .catch(error => {
        console.error('💥 JWT login error:', error)
        setLoading(false)

        let errorMessage = 'Login failed. Please try again.'

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }

        console.log('📝 Error message:', errorMessage)

        if (errorCallback) errorCallback({ message: errorMessage })
      })
  }

  const handleLogout = () => {
    console.log('🚪 Logging out...')

    setUser(null)
    setLoading(false)

    window.localStorage.removeItem('userData')
    window.localStorage.removeItem('refreshToken')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    window.localStorage.removeItem('accessToken')

    console.log('🧹 Cleared all auth data')

    router.push('/login')
  }

  const handleRegister = (params, errorCallback) => {
    console.log('📝 Registration attempt:', params)
    setLoading(true)

    jwt
      .register({
        fullName: params.fullName,
        username: params.username,
        email: params.email,
        password: params.password,
        role: params.role || 'admin'
      })
      .then(res => {
        console.log('📨 Registration response:', res)
        setLoading(false)

        if (res.data.success) {
          console.log('✅ Registration successful, auto-login...')

          handleLogin(
            {
              userName: params.username,
              password: params.password
            },
            errorCallback
          )
        } else {
          console.log('❌ Registration failed:', res.data.message)

          if (errorCallback) errorCallback({ message: res.data.message || 'Registration failed' })
        }
      })
      .catch(err => {
        console.error('💥 Registration error:', err)
        setLoading(false)

        const errorMessage = err.response?.data?.message || 'Registration failed'
        console.log('📝 Registration error message:', errorMessage)

        if (errorCallback) errorCallback({ message: errorMessage })
      })
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 AuthContext Values:', {
      user: user
        ? {
            id: user.id,
            username: user.username,
            role: user.role,
            permissions: user.permissions
          }
        : null,
      loading
    })
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
