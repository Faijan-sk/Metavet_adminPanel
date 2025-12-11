import React, { useState } from 'react'
import { useRouter } from 'next/router'

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Divider,
  Typography
} from '@mui/material'

import MuiLink from '@mui/material/Link'
import PageHeader from 'src/@core/components/page-header'

// components (keep paths as you had them)
import GroomerToClientKyc from "./groomerToClientKYC/index"
import MetavetToBehaviourist from './metavetToBehaviourist/index'
import BehaviouristToClient from "./behaviouristToClienKyc/index"
import MetavetToGroomer from "./metavetToGroomerKyc/index" // <-- ensure this import exists
import MetavetToWalker from "./metavetToWalkerKYC/index"
import WalkerToClient from "./walkerToClientKyc/index"

function Index() {
  const router = useRouter()

  // ** Filter states
  const [nameFilter, setNameFilter] = useState('')
  const [specialityFilter, setSpecialityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // show Metavet_to_Groomer by default
  const [sortOrder, setSortOrder] = useState('Metavet_to_Groomer') // default selection key
  const kycOptions = {
    Metavet_to_Groomer: 'Metavet To Groomer KYC',
    Metavet_to_Walker: 'Metavet To Walker KYC',
    Metavet_to_Behaviourist: 'Metavet To Behaviour KYC',
    Behaviourist_to_Client: 'Behaviourist To Client KYC',
    Walker_to_Client: 'Walker To Client KYC',
    Groomer_to_Client: 'Groomer To Client KYC'
  }
  const [kycType, setKycType] = useState(kycOptions['Metavet_to_Groomer']) // readable label for selected KYC

  // centralized handler for Select change
  const handleChange = (event) => {
    const value = event.target.value
    setSortOrder(value)
    setKycType(kycOptions[value] || '')
  }

  // render the selected component
  const renderKycComponent = () => {
    switch (sortOrder) {
      case 'Metavet_to_Groomer':
        return <MetavetToGroomer />
      case 'Metavet_to_Walker':
        return <MetavetToWalker />
      case 'Metavet_to_Behaviourist':
        return <MetavetToBehaviourist />
      case 'Behaviourist_to_Client':
        return <BehaviouristToClient />
      case 'Walker_to_Client':
        return <WalkerToClient />
      case 'Groomer_to_Client':
        return <GroomerToClientKyc />
      default:
        return null
    }
  }

  return (
    <>
      <Grid sx={{ mb: 4 }}>
        <PageHeader
          title={
            <Typography variant='h5'>
              <MuiLink href='https://mui.com/material-ui/react-table/' target='_blank'>
                KYC Management
              </MuiLink>
            </Typography>
          }
          subtitle={<Typography variant='body2'>Tables of submitted kyc</Typography>}
        />
      </Grid>

      <Card>
        <CardHeader
          title={
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='kyc-type-label'>Kyc Type</InputLabel>

                  <Select
                    labelId='kyc-type-label'
                    value={sortOrder}
                    label='Kyc Type'
                    onChange={handleChange}
                  >
                    <MenuItem value='Metavet_to_Groomer'>Metavet To Groomer KYC</MenuItem>
                    <MenuItem value='Metavet_to_Walker'>Metavet To Walker KYC</MenuItem>
                    <MenuItem value='Metavet_to_Behaviourist'>Metavet To Behaviour KYC</MenuItem>
                    <MenuItem value='Groomer_to_Client'>Groomer To Client KYC</MenuItem>
                    <MenuItem value='Walker_to_Client'>Walker To Client KYC</MenuItem>
                    {/* <MenuItem value='Behaviourist_to_Client'>Behaviourist To Client KYC</MenuItem> */}
                  </Select>
                </FormControl>
              </Grid>
            </Box>
          }
        />

        <Divider sx={{ m: '0 !important' }} />

        <CardContent>
          {/* optionally show the readable label */}
          {kycType && (
            <Typography variant='subtitle2' sx={{ mb: 2 }}>
              Showing: {kycType}
            </Typography>
          )}

          {/* render the selected component */}
          {renderKycComponent()}
        </CardContent>
      </Card>
    </>
  )
}

export default Index
