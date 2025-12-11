import axios from 'axios'
import jwtDefaultConfig from './jwtDefaultConfig'

// axios.defaults.baseURL = 'http://localhost:8080/'

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL

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
        // ** Get token from window.localStorage
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
        //     window.localStorage.removeItem('userData')
        //     window.location.href = '/admin-panel/login'
        //     return Promise.reject(error)
        //   }
        //   if (!this.isAlreadyFetchingAccessToken) {
        //     this.isAlreadyFetchingAccessToken = true
        //     this.refreshToken().then((r) => {
        //       this.isAlreadyFetchingAccessToken = false
        //       // ** Update accessToken in window.localStorage
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
    if (typeof window === 'undefined') return null

    return window.localStorage.getItem(this.jwtConfig.storageTokenKeyName)
  }

  getRefreshToken() {
    if (typeof window === 'undefined') return null

    return window.localStorage.getItem(this.jwtConfig.storageRefreshTokenKeyName)
  }

  setToken(value) {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(this.jwtConfig.storageTokenKeyName, value)
  }

  setRefreshToken(value) {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(this.jwtConfig.storageRefreshTokenKeyName, value)
  }

  /*
   *     User Services
   */  
  register(data) {
  // data should be the payload object
  return axios.post(this.jwtConfig.registerEndpoint, data)
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
      .put(`/api/doctors/${doctorId}/status`, { status })
      .then(res => res.data)
      .catch(err => {
        console.error('Error updating doctor status:', err)

        throw err
      })
  }
  
//    createDoctor(payload) {
//   console.log('Calling create doctor API', payload)
//   return axios.post(this.jwtConfig.createDoctorEndPoint, payload, {
//     headers: {
//       Authorization: `${this.jwtConfig.tokenType} ${localStorage.getItem(this.jwtConfig.storageTokenKeyName)}`,
//       'Content-Type': 'application/json'
//     }
//   })
// }

createDoctor(payload) {

  return axios.post(this.jwtConfig.createDoctorEndPoint,payload)
}
  

getAllKycMetavetToGroomer(){
  return axios.get(this.jwtConfig.metavetToGroomerEndpoint)
}


getAllKycGroomerToClient(){
  return axios.get(this.jwtConfig.grommerToClientEndpoint)
}

getAllKycWalkerToClient(){
  return axios.get(this.jwtConfig.walkerToClientEndpoint)
}


getAllKycBehaviouristToClient(){
  return axios.get(this.jwtConfig.behaviouristToClientEndpoint)
}

getMetavetToGroomerKycById(uId) {
    const endpoint = this.jwtConfig.metavetToGroomerByUidEndpoint.replace('{uId}', uId)

    return axios
      .get(endpoint)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching doctor by ID:', error)

        throw error
      })
  }

getAllKycMetavetToWalker(){
  return axios.get(this.jwtConfig.metavetToWalkerEndpoint)
}

getMetavetToWalkerKycById(uId) {
    const endpoint = this.jwtConfig.metavetToWalkerByUidEndPoint.replace('{uId}', uId)

    return axios
      .get(endpoint)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching doctor by ID:', error)

        throw error
      })
  }

updateMetavetToWalkerKycStatus(uId, status) {
  const endpoint = this.jwtConfig.approveKyMetavetToWalkerEndpoint.replace('{uId}', uId)

  // status must be like: 'APPROVED' | 'REJECTED' | 'PENDING' | 'UNDER_REVIEW'
  return axios
    .patch(`${endpoint}?status=${status}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating walker KYC status:', error)

      throw error
    })
}

// ✅ Main method: Groomer KYC status update by UID
updateMetavetToGroomerKycStatus(uId, status) {
  const endpoint = this.jwtConfig.approveMetavetGroomerKycEndpoint.replace('{uId}', uId)

  return axios
    .patch(`${endpoint}?status=${status}`) // status: 'APPROVED' | 'REJECTED' | etc.
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating groomer KYC status:', error)
      throw error
    })
}

updateMetavetToBehaviouristKycStatus(uId, status) {
  const endpoint = this.jwtConfig.approveKyMetavetToBehaviouristEndpoint.replace('{uId}', uId)

  return axios
    .patch(`${endpoint}?status=${status}`) // status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating behaviourist KYC status:', error)
      throw error
    })
}





  getAllKycMetavetToBehaviourist(){
  return axios.get(this.jwtConfig.metavetToBehaviouristEndpoint)
}

getMetavetToBehaviouristKycById(uId) {
    const endpoint = this.jwtConfig.metavetToBehaviouristByUidEndPoint.replace('{uId}', uId)

    return axios
      .get(endpoint)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching doctor by ID:', error)

        throw error
      })
  }


getGroomerDocc(uId, docType) {
  // Endpoint me placeholders replace karenge
  const endpoint = this.jwtConfig.getMetaToGroomDocEndpoint
    .replace('{uid}', uId)
    .replace('{docType}', docType)

  // File aa rahi hogi, isliye responseType: 'blob' rakha hai
  return axios
    .get(endpoint, { responseType: 'blob' })
    .then(response => response.data) // yaha Blob milega
    .catch(error => {
      console.error('Error fetching groomer document:', error)
      throw error
    })
}

getWalkerDocc(uId, docType) {
  // Endpoint me placeholders replace karenge
  const endpoint = this.jwtConfig.getMetavetToWalkerDocEndPoint
    .replace('{uid}', uId)
    .replace('{docType}', docType)

  // File aa rahi hogi, isliye responseType: 'blob' rakha hai
  return axios
    .get(endpoint, { responseType: 'blob' })
    .then(response => response.data) // yaha Blob milega
    .catch(error => {
      console.error('Error fetching walker document:', error)
      throw error
    })
}

getBehaviouristDocc(uId, docType) {
  // Endpoint me placeholders replace karenge
  const endpoint = this.jwtConfig.getMetavetToBehaviouristrDocEndPoint
    .replace('{uid}', uId)
    .replace('{docType}', docType)

  // File aa rahi hogi, isliye responseType: 'blob' rakha hai
  return axios
    .get(endpoint, { responseType: 'blob' })
    .then(response => response.data) // yaha Blob milega
    .catch(error => {
      console.error('Error fetching Behaviourist document:', error)
      throw error
    })
}


updateMetavetToBehaviouristKycStatus(uId, status) {
  const endpoint = this.jwtConfig.approveKyMetavetToBehaviouristEndpoint.replace('{uId}', uId)

  return axios
    .patch(`${endpoint}?status=${status}`) // status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating behaviourist KYC status:', error)
      throw error
    })
}


getGroomerToClientKycById(id) {
  const endpoint = this.jwtConfig.groomerToClientByUid.replace('{uid}', id)

  return axios
    .get(endpoint)
    .then(response => response.data) // yahan se sirf data jaa raha hai
    .catch(error => {
      console.error('Error fetching client to Groomer Kyc by ID:', error)
      throw error
    })
}
getWalkerToClientKycById(id) {
  const endpoint = this.jwtConfig.walkerToClientByUid.replace('{uid}', id)

  return axios
    .get(endpoint)
    .then(response => response.data) // yahan se sirf data jaa raha hai
    .catch(error => {
      console.error('Error fetching client to Walker Kyc by ID:', error)
      throw error
    })
}
getAllKycBihaviouristToClient(){
  return axios.get(this.jwtConfig.getAllBehaviouristToClientKyc)
}

updateGroomerKycStatus(uId, status) {
if (!uId) throw new Error('uId is required')
if (!status) throw new Error('status is required')


const endpoint = this.jwtConfig.updateGroomerKycStatusEndpoint.replace('{uid}', uId)

return axios
.patch(endpoint, { status })
.then(response => response.data)
.catch(error => {
console.error('Error updating groomer KYC status:', error)
throw error
})
}

updateWalkeToClientKycStatus(uId, status) {
if (!uId) throw new Error('uId is required')
if (!status) throw new Error('status is required')


const endpoint = this.jwtConfig.updateWalkerToClientKycStatus.replace('{uid}', uId)

return axios
.patch(endpoint, { status })
.then(response => response.data)
.catch(error => {
console.error('Error updating groomer KYC status:', error)
throw error
})
}


}
