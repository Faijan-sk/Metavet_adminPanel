// import { L } from "@fullcalendar/list/internal-common";

// ** Auth Endpoints
export default {
  /*
   * user EndPoints
   */
  registerEndpoint: '/api/auth/register',
  loginEndpoint: '/api/auth/admin/login',
  otpVerifyEndPoint: '/auth/otp/verify-otp',



  /*
   * Doctor EndPoints
   */
  createDoctorEndPoint: '/api/auth/doctor/create',
  getAllDoctorEndPoint: 'api/auth/admin/doctors',
  getPendingDoctorEndPoint: '/api/doctors/status/PENDING',
  getApprovedDoctorEndPoint: '/api/doctors/appointment-status/APPROVED',
  getDoctorByIdEndPoint: 'api/doctors/{doctorId}',
  updateDoctorStatusEndPoint: 'api/doctors/{doctorId}/status',

  // ** This will be prefixed in authorization header with token
  // ? e.g. Authorization: Bearer <token>
  tokenType: 'Bearer',

  // ** Value of this property will be used as key to store JWT token in storage
  storageTokenKeyName: 'accessToken',
  storageRefreshTokenKeyName: 'refresh',

  //kyc Endpoint 
  metavetToGroomerEndpoint : '/groomerkyc/all',
  metavetToGroomerByUidEndpoint : '/groomerkyc/uid/{uId}',

  
  metavetToWalkerByUidEndPoint : '/api/walkerkyc/uid/{uId}',
  metavetToWalkerEndpoint: '/api/walkerkyc/all',


  metavetToBehaviouristEndpoint : '/api/behaviouristkyc/all',
   metavetToBehaviouristByUidEndPoint : '/api/behaviouristkyc/uid/{uId}',
  behaviouristToClientEndpoint : '/api/behaviorist-kyc',




  grommerToClientEndpoint: '/api/groomer-kyc',
  walkerToClientEndpoint: '/api/walker-kyc',
  

}
