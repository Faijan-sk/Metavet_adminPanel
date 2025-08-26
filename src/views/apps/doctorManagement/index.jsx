import { Card, CardContent, CardHeader } from '@mui/material'
import React from 'react'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { useRouter } from 'next/router'
import DoctorList from './DoctorList/index'
function Index() {
  const router = useRouter()

  const handleAddDoctor = () => {
    router.push('/doctorManagement/addDoctor')
  }

  return (
    <Card>
      <CardHeader
        title='Doctor Management'
        action={
          <Button size='large' variant='contained' sx={{ minWidth: 120 }} onClick={handleAddDoctor}>
            Add Doctor
          </Button>
        }
      />
      <Divider sx={{ m: '0 !important' }} />
      <CardContent>
        {/* Your form or content goes here */}
        <DoctorList />
      </CardContent>
    </Card>
  )
}

export default Index
