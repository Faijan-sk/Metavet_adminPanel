// pages/doctorManagement/doctorProfile/[doctorId].jsx

import { useRouter } from 'next/router'
import Details from "src/views/apps/kycManagement/metavetToWalkerKYC/Details"

const DoctorProfilePage = () => {
    const router = useRouter()
    const { doctorId } = router.query   // <-- dynamic id read karo

    if (!doctorId) return <p>Loading...</p>

    return <Details groomerKycId={doctorId} />  // <-- id Detail ko do
}

DoctorProfilePage.acl = {
    action: 'read',
    subject: 'doctor-management'
}

export default DoctorProfilePage
