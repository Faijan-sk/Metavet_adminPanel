import React from 'react'
import AddDoctor from './../../../views/apps/doctorManagement/addDoctor/index'

function index() {
  return <AddDoctor />
}
index.acl = {
  action: 'read',
  subject: 'doctor-management'
}

export default index
