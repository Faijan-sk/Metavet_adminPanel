import React from 'react'
import AddDoctorForm from "../../../views/apps/doctorManagement/addDoctor/AddDoctorForm"

function index() {
  return (
    <>
    
    
    <AddDoctorForm />
    </>
    
        
    
  )
}
index.acl = {
  action: 'read',
  subject: 'doctor-management'
}


export default index