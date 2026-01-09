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
import UserList from './userList/index'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import Divider from '@mui/material/Divider'
import PageHeader from 'src/@core/components/page-header'

function Index() {
  const router = useRouter()

  const [nameFilter, setNameFilter] = useState('')
  const [phoneFilter, setPhoneFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('LATEST')

  return (
    <>
      <Grid sx={{ mb: 4 }}>
        <PageHeader
          title={
            <Typography variant='h5'>
              <MuiLink href='https://mui.com/material-ui/react-table/' target='_blank'>
                Client Management
              </MuiLink>
            </Typography>
          }
          subtitle={<Typography variant='body2'>All Client Details</Typography>}
        />
      </Grid>

      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='h6'>Client List</Typography>
              <Button
                variant='contained'
                onClick={() => router.push('/userManagement/addUser/')}
              >
                + Add Client
              </Button>
            </Box>
          }
        />

        {/* 🔍 Filters */}
        <Grid container spacing={2} sx={{ px: 5, py: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size='small'
              label='Search by Name'
              placeholder='Enter Client name'
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size='small'
              label='Search by Email'
              placeholder='Enter Email ID'
              value={emailFilter}
              onChange={e => setEmailFilter(e.target.value)}
            />
          </Grid>


          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size='small'
              label='Search by Mobile Number'
              placeholder='Enter Number'
              value={phoneFilter}
              onChange={e => setPhoneFilter(e.target.value)}
            />
          </Grid>



          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size='small'>
              <InputLabel>Sort</InputLabel>
              <Select
                value={sortOrder}
                label='Sort'
                onChange={e => setSortOrder(e.target.value)}
              >
                <MenuItem value='LATEST'>Latest</MenuItem>
                <MenuItem value='OLDEST'>Oldest</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ m: '0 !important' }} />

        <CardContent>
          <UserList
            nameFilter={nameFilter}
            phoneFilter={phoneFilter}
            emailFilter={emailFilter}
            sortOrder={sortOrder}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default Index
