import axios from 'axios'
import jwtDefaultConfig from './jwtDefaultConfig'

axios.defaults.baseURL = 'http://localhost:8010/'

// axios.defaults.baseURL = 'http://192.168.29.200:8001/'

export default class JwtService {
  // ** jwtConfig <= Will be used by this service
  jwtConfig = { ...jwtDefaultConfig }
  // ** For Refreshing Token
  isAlreadyFetchingAccessToken = false
  // ** For Refreshing Token
  subscribers = []
  constructor(jwtOverrideConfig) {
    this.jwtConfig = { ...this.jwtConfig, ...jwtOverrideConfig }

    // ** Request Interceptor
    axios.interceptors.request.use(
      config => {
        // ** Get token from localStorage
        const accessToken = this.getToken()

        // ** If token is present add it to request's Authorization Header
        if (accessToken) {
          // ** eslint-disable-next-line no-param-reassign
          config.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`
        }
        return config
      },
      error => Promise.reject(error)
    )

    // ** Add request/response interceptor
    axios.interceptors.response.use(
      response => response,
      error => {
        // ** const { config, response: { status } } = error
        const { config, response } = error
        const originalRequest = config

        // ** if (status === 401) {
        // if (response && response.status === 401) {
        //   if (window.location.pathname !== '/admin-panel/login') {
        //     localStorage.removeItem('userData')
        //     window.location.href = '/admin-panel/login'
        //     return Promise.reject(error)
        //   }
        //   if (!this.isAlreadyFetchingAccessToken) {
        //     this.isAlreadyFetchingAccessToken = true
        //     this.refreshToken().then((r) => {
        //       this.isAlreadyFetchingAccessToken = false
        //       // ** Update accessToken in localStorage
        //       this.setToken(r.data.accessToken)
        //       this.setRefreshToken(r.data.refreshToken)
        //       this.onAccessTokenFetched(r.data.accessToken)
        //     })
        //   }
        //   const retryOriginalRequest = new Promise((resolve) => {
        //     this.addSubscriber((accessToken) => {
        //       // ** Make sure to assign accessToken according to your response.
        //       // ** Check: https://pixinvent.ticksy.com/ticket/2413870
        //       // ** Change Authorization header
        //       originalRequest.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`
        //       resolve(this.axios(originalRequest))
        //     })
        //   })
        //   return retryOriginalRequest
        // }
        return Promise.reject(error)
      }
    )
  }

  onAccessTokenFetched(accessToken) {
    this.subscribers = this.subscribers.filter(callback => callback(accessToken))
  }

  addSubscriber(callback) {
    this.subscribers.push(callback)
  }

  getToken() {
    return localStorage.getItem(this.jwtConfig.storageTokenKeyName)
  }

  getRefreshToken() {
    return localStorage.getItem(this.jwtConfig.storageRefreshTokenKeyName)
  }

  setToken(value) {
    localStorage.setItem(this.jwtConfig.storageTokenKeyName, value)
  }

  setRefreshToken(value) {
    localStorage.setItem(this.jwtConfig.storageRefreshTokenKeyName, value)
  }

  refreshToken() {
    return axios.post(this.jwtConfig.refreshEndpoint, {
      refreshToken: this.getRefreshToken()
    })
  }

  /*
   *     User Services
   */

  register(...args) {
    return axios.post(this.jwtConfig.registerEndpoint, ...args)
  }

  verifyOtp(otpData, token) {
    // Use the token passed as parameter (from Redux)
    return axios.post(`${this.jwtConfig.otpVerifyEndPoint}/${token}`, otpData)
  }

  login(...args) {
    return axios.post(this.jwtConfig.loginEndpoint, ...args)
  }

  /*
   *   Doctor Services
   */
  getAllDoctors() {
    return axios.get(this.jwtConfig.getAllDoctorEndPoint)
  }
  getPendingDoctor() {
    return axios
      .get(this.jwtConfig.getPendingDoctorEndPoint)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching pending doctors:', error)
        throw error
      })
  }

  getApprovedDoctor() {
    return axios
      .get(this.jwtConfig.getApprovedDoctorEndPoint)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching approved doctors:', error)
        throw error
      })
  }

  getDoctorById(doctorId) {
    const endpoint = this.jwtConfig.getDoctorByIdEndPoint.replace('{doctorId}', doctorId)

    return axios
      .get(endpoint)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching doctor by ID:', error)
        throw error
      })
  }
  updateDoctorStatus(doctorId, status) {
    return axios
      .put(`/auth/doctors/${doctorId}/status`, { status })
      .then(res => res.data)
      .catch(err => {
        console.error('Error updating doctor status:', err)
        throw err
      })
  }
}
