import React from 'react'
import DoctorProfile from './../../../views/apps/doctorManagement/doctorProfile/index'

function index() {
  return
  <DoctorProfile />
}
index.acl = {
  action: 'read',
  subject: 'doctor-management'
}

export default index
