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
  approveMetavetGroomerKycEndpoint : '/groomerkyc/uid/{uId}/status',
  getMetaToGroomDocEndpoint : '/groomerkyc/uploaded_files/{uid}/{docType}',
  
  metavetToWalkerByUidEndPoint : '/walkerkyc/uid/{uId}',
  metavetToWalkerEndpoint: '/walkerkyc/all',
  approveKyMetavetToWalkerEndpoint : '/walkerkyc/uid/{uId}/status',
  getMetavetToWalkerDocEndPoint : '/walkerkyc/uploaded_files/{uid}/{docType}',

  metavetToBehaviouristEndpoint : '/behaviouristkyc/all',
  metavetToBehaviouristByUidEndPoint : '/behaviouristkyc/uid/{uId}',
  behaviouristToClientEndpoint : '/api/behaviorist-kyc',
  approveKyMetavetToBehaviouristEndpoint : '/behaviouristkyc/uid/{uId}/status',
getMetavetToBehaviouristrDocEndPoint : '/behaviouristkyc/uploaded_files/{uid}/{docType}',



  grommerToClientEndpoint: '/api/groomer-kyc',
  walkerToClientEndpoint: '/api/walker-kyc',
  

}
