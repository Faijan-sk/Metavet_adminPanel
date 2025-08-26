// ** Auth Endpoints
export default {
  /*
   * user EendPoints
   */
  registerEndpoint: '/auth/register',
  loginEndpoint: '/auth/admin/login',
  otpVerifyEndPoint: '/auth/otp/verify-otp',

  /*
   * Doctor EndPoints
   */

  getAllDoctorEndPoint: '/auth/admin/doctors',

  // ** This will be prefixed in authorization header with token
  // ? e.g. Authorization: Bearer <token>
  tokenType: 'Bearer',

  // ** Value of this property will be used as key to store JWT token in storage
  storageTokenKeyName: 'access',
  storageRefreshTokenKeyName: 'refresh'
}
