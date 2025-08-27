import { Box } from '@mui/material'
import React from 'react'
import DoctorManagement from '../../views/apps/doctorManagement'

function index() {
  return <DoctorManagement />
}

index.acl = {
  action: 'read',
  subject: 'doctor-management'
}

export default index
