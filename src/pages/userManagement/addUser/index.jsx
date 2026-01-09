import React from 'react'
import Adduser from '../../../views/apps/userManagement/addUser/index'

function index() {
  return <Adduser />
}
index.acl = {
  action: 'read',
  subject: 'doctor-management'
}

export default index
