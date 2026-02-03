import React from 'react'
import MetavetCharges from "./../../views/apps/metavetCharges/index"

function index() {
    return (
        <MetavetCharges />
    )
}
index.acl = {
    action: 'read',
    subject: 'doctor-management'
}


export default index