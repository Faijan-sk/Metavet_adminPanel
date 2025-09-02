// ** Auth Endpoints
export default {
  /*
   * user EndPoints
   */
  registerEndpoint: '/auth/register',
  loginEndpoint: '/auth/admin/login',
  otpVerifyEndPoint: '/auth/otp/verify-otp',

  /*
   * Doctor EndPoints
   */
  getAllDoctorEndPoint: '/auth/admin/doctors',
  getPendingDoctorEndPoint: '/api/doctors/status/PENDING',
  getApprovedDoctorEndPoint: '/api/doctors/appointment-status/APPROVED',
  getDoctorByIdEndPoint: 'api/doctors/{doctorId}',
  updateDoctorStatusEndPoint: 'api/doctors/{doctorId}/status',

  // ** This will be prefixed in authorization header with token
  // ? e.g. Authorization: Bearer <token>
  tokenType: 'Bearer',

  // ** Value of this property will be used as key to store JWT token in storage
  storageTokenKeyName: 'accessToken',
  storageRefreshTokenKeyName: 'refresh'
}
