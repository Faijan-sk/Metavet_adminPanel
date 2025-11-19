import React from 'react'
import KycManagement from "../../views/apps/kycManagement/index"

function index() {
  return (
   
    
    <KycManagement/>
   
 
    
        
    
  )
}
index.acl = {
  action: 'read',
  subject: 'doctor-management'
}


export default index