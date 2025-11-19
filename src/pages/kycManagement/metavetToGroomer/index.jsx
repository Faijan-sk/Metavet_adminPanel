// pages/doctorManagement/doctorProfile/[doctorId].jsx
import { useRouter } from 'next/router'

import GroomerKyc from 'src/views/apps/kycManagement/metavetToGroomerKyc/Detail'

const DoctorProfilePage = () => {
    const router = useRouter()
    console.clear()
    console.log("**********groomer uid ********* uid ", router.query.groomerKycId)

    const groomerId = router.query.groomerKycId

    if (!groomerId) return <p>Loading...</p>

    // pass the doctorId as groomerKycId prop
    return <GroomerKyc groomerKycId={groomerId} />
}

DoctorProfilePage.acl = {
    action: 'read',
    subject: 'doctor-management'
}

export default DoctorProfilePage
