// pages/doctorManagement/doctorProfile/[doctorId].jsx
import { useRouter } from 'next/router'

import GroomerKyc from 'src/views/apps/kycManagement/metavetToBehaviourist/Detail'

const DoctorProfilePage = () => {
    const router = useRouter()
    console.clear()
    console.log("**********groomer uid ********* uid ", router.query.behaviouristId)

    const behaviouristId = router.query.behaviouristId

    if (!behaviouristId) return <p>Loading...</p>

    // pass the doctorId as groomerKycId prop
    return <GroomerKyc behaviouristId={behaviouristId} />
}











DoctorProfilePage.acl = {
    action: 'read',
    subject: 'doctor-management'
}

export default DoctorProfilePage
