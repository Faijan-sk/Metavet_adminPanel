// pages/doctorManagement/doctorProfile/[doctorId].jsx
import { useRouter } from 'next/router'
import DoctorProfile from 'src/views/apps/doctorManagement/doctorProfile'
import Details from "src/views/apps/kycManagement/groomerToClientKYC/Details"
const DoctorProfilePage = () => {




    return <Details />
}

DoctorProfilePage.acl = {
    action: 'read',
    subject: 'doctor-management'
}

export default DoctorProfilePage
