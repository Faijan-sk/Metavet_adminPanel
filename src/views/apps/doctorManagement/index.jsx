import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Box
} from '@mui/material'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import DoctorList from './DoctorList/index'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import Divider from '@mui/material/Divider'
import PageHeader from 'src/@core/components/page-header'


function Index() {
  const router = useRouter()

  // ** Filter states
  const [nameFilter, setNameFilter] = useState('')
  const [specialityFilter, setSpecialityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('LATEST')

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
        {/* Header Row with Title and Approve Button */}
        <CardHeader
          title={
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant='h6'>Doctors List</Typography>
              <Button
                variant='contained'
                sx={{ ml: 2 }}
                onClick={() => router.push('/doctorManagement/addDoctor/')}
              >
                Approve
              </Button>
            </Box>
          }
        />

        {/* Search Filters */}
        <Grid container spacing={2} sx={{ px: 5, py: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label='Search by Name'
              placeholder='Enter doctor name'
              variant='outlined'
              size='small'
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label='Search by Speciality'
              placeholder='Enter speciality'
              variant='outlined'
              size='small'
              value={specialityFilter}
              onChange={e => setSpecialityFilter(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size='small'>
              <InputLabel>Sort</InputLabel>
              <Select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                label='Sort'
              >
                <MenuItem value='LATEST'>Latest</MenuItem>
                <MenuItem value='OLDEST'>Oldest</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size='small'>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                label='Status'
              >
                <MenuItem value='PENDING'>PENDING</MenuItem>
                <MenuItem value='APPROVED'>APPROVED</MenuItem>
                <MenuItem value='REJECTED'>REJECTED</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ m: '0 !important' }} />

        <CardContent>
          <DoctorList
            nameFilter={nameFilter}
            specialityFilter={specialityFilter}
            statusFilter={statusFilter}
            sortOrder={sortOrder}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default Index
