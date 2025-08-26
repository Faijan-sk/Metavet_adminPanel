import { Card, CardContent, CardHeader } from '@mui/material'
import React from 'react'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { useRouter } from 'next/router'

function Index() {
  const router = useRouter()

  const handleAddUser = () => {
    router.push('/userManagement/addUser')
  }

  return (
    <Card>
      <CardHeader
        title='User Management'
        action={
          <Button size='large' variant='contained' sx={{ minWidth: 120 }} onClick={handleAddUser}>
            Add User
          </Button>
        }
      />
      <Divider sx={{ m: '0 !important' }} />
      <CardContent>
        {/* Your form or content goes here */}
        Add User Content
      </CardContent>
    </Card>
  )
}

export default Index
