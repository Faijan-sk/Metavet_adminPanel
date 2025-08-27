import { Card, CardContent, CardHeader, Grid } from '@mui/material'
import React from 'react'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { useRouter } from 'next/router'
import DoctorList from './DoctorList/index'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

function Index() {
  const router = useRouter()

  const handleAddDoctor = () => {
    router.push('/doctorManagement/addDoctor')
  }

  return (
    <>
      <Grid sx={{ mb: 4 }}>
        <PageHeader
          title={
            <Typography variant='h5'>
              <MuiLink href='https://mui.com/material-ui/react-table/' target='_blank'>
                Doctor Management
              </MuiLink>
            </Typography>
          }
          subtitle={<Typography variant='body2'>Tabls of Permitted Doctor</Typography>}
        />
      </Grid>

      <Card>
        <CardHeader
          title='Doctors List'
          action={
            <Button size='large' variant='contained' sx={{ minWidth: 120 }} onClick={handleAddDoctor}>
              New Request
            </Button>
          }
        />
        <Divider sx={{ m: '0 !important' }} />
        <CardContent>
          {/* Your form or content goes here */}
          <DoctorList />
        </CardContent>
      </Card>
    </>
  )
}

export default Index
