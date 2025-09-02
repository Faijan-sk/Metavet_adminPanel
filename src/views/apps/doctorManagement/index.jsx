import { Card, CardContent, CardHeader, Grid, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import React from 'react'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { useRouter } from 'next/router'
import DoctorList from './DoctorList/index'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'

// ** MUI Imports
import TextField from '@mui/material/TextField'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

function Index() {
  const router = useRouter()

  const handleAddDoctor = () => {
    router.push('/doctorManagement/addDoctor')
  }

  // states for filters
  const [status, setStatus] = React.useState('')
  const [sort, setSort] = React.useState('')

  const handleStatusChange = event => {
    setStatus(event.target.value)
  }

  const handleSortChange = event => {
    setSort(event.target.value)
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
          subtitle={<Typography variant='body2'>Tables of Permitted Doctor</Typography>}
        />
      </Grid>

      <Card>
        <CardHeader
          title='Doctors List'
          // action={
          //   <Button size='large' variant='contained' sx={{ minWidth: 120 }} onClick={handleAddDoctor}>
          //     New Request
          //   </Button>
          // }
        />

        {/* Search Filters */}
        <Grid container spacing={2} sx={{ px: 5, py: 3 }}>
          {/* Doctor Name */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label='Search by Name'
              placeholder='Enter doctor name'
              variant='outlined'
              size='small'
            />
          </Grid>

          {/* Speciality */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label='Search by Speciality'
              placeholder='Enter speciality'
              variant='outlined'
              size='small'
            />
          </Grid>

          {/* Sort (Latest / Oldest) */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size='small'>
              <InputLabel>Sort</InputLabel>
              <Select value={sort} onChange={handleSortChange} label='Sort'>
                <MenuItem value='LATEST'>Latest</MenuItem>
                <MenuItem value='OLDEST'>Oldest</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size='small'>
              <InputLabel>Status</InputLabel>
              <Select value={status} onChange={handleStatusChange} label='Status'>
                <MenuItem value='PENDING'>PENDING</MenuItem>
                <MenuItem value='APPROVED'>APPROVED</MenuItem>
                <MenuItem value='REJECTED'>REJECTED</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ m: '0 !important' }} />
        <CardContent>
          {/* Doctor List Table */}
          <DoctorList />
        </CardContent>
      </Card>
    </>
  )
}

export default Index
