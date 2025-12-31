import React from 'react'
import UserManagement from '../../views/apps/userManagement'

function index() {
  return <UserManagement />
}
index.acl = {
  action: 'read',
  subject: 'doctor-management'
}


export default index
