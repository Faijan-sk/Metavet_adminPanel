// pages/doctorManagement/doctorProfile/[doctorId].jsx
import { useRouter } from 'next/router'

import GroomerKyc from 'src/views/apps/kycManagement/metavetToGroomerKyc/Detail'
import WalkerKyc from "src/views/apps/kycManagement/metavetToWalkerKYC/Details"

const DoctorProfilePage = () => {
    const router = useRouter()
    console.clear()

    const walkerId = router.query.walkerKycId

    if (!walkerId) return <p>Loading...</p>

    // pass the doctorId as groomerKycId prop
    return <WalkerKyc walkerId={walkerId} />
}

DoctorProfilePage.acl = {
    action: 'read',
    subject: 'doctor-management'
}

export default DoctorProfilePage
