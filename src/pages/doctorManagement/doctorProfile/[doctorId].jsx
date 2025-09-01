// pages/doctorManagement/doctorProfile/[doctorId].jsx
import { useRouter } from 'next/router'
import DoctorProfile from 'src/views/apps/doctorManagement/doctorProfile'

const DoctorProfilePage = () => {
  const router = useRouter()
  const { doctorId } = router.query

  if (!doctorId) return <p>Loading...</p>

  return <DoctorProfile doctorId={doctorId} />
}

DoctorProfilePage.acl = {
  action: 'read',
  subject: 'doctor-management'
}

export default DoctorProfilePage
