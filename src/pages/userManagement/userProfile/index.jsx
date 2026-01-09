import React from 'react'
import ProfilePage from "./../../../../src/views/apps/userManagement/userProfile/UserProfile"

function index() {
    return (
        <div><ProfilePage /></div>

    )
}
index.acl = {
    action: 'read',
    subject: 'doctor-management'
}

export default index