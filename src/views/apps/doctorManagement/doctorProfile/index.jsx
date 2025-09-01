import React, { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import LinearProgress from '@mui/material/LinearProgress'
import DialogContentText from '@mui/material/DialogContentText'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import UserSuspendDialog from 'src/views/apps/user/view/UserSuspendDialog'
import UserSubscriptionDialog from 'src/views/apps/user/view/UserSubscriptionDialog'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** JWT Hook Import
import useJwt from 'src/enpoints/jwt/useJwt'

const roleColors = {
  admin: 'error',
  editor: 'info',
  author: 'warning',
  maintainer: 'success',
  subscriber: 'primary'
}

const statusColors = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

function Index({ doctorId }) {
  // ** States
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openEdit, setOpenEdit] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const [approving, setApproving] = useState(false) // <-- new state for API loading

  // Handle Edit dialog
  const handleEditClickOpen = () => setOpenEdit(true)
  const handleEditClose = () => setOpenEdit(false)

  // Approve Doctor
  const handleApprove = async () => {
    try {
      setApproving(true)
      await useJwt.updateDoctorStatus(doctor.id, 'APPROVED') // 👈 API call
      setDoctor(prev => ({ ...prev, status: 'approved' })) // update local state
      handleEditClose()
    } catch (err) {
      console.error(err)
      alert('Failed to approve doctor')
    } finally {
      setApproving(false)
    }
  }

  // Fetch doctor details
  useEffect(() => {
    if (!doctorId) return

    const fetchDoctor = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await useJwt.getDoctorById(doctorId) // <-- API Call
        const doc = res?.data

        if (doc) {
          setDoctor({
            id: doc.doctorId,
            email: doc.user?.email,
            username: doc.user?.username,
            phoneNumber: doc.user?.fullPhoneNumber,
            firstName: doc.user?.firstName,
            lastName: doc.user?.lastName,
            fullName: `${doc.user?.firstName || ''} ${doc.user?.lastName || ''}`.trim(),
            status: doc.doctorProfileStatus?.toLowerCase(),
            speciality: doc.specialization,
            experience: doc.experienceYears,
            licenseNumber: doc.licenseNumber,
            licenseIssueDate: doc.licenseIssueDate,
            licenseExpiryDate: doc.licenseExpiryDate,
            qualification: doc.qualification,
            address: doc.address,
            consultationFees: doc.consultationFee,
            bio: doc.bio,
            avatar: null
          })
        } else {
          setDoctor(null)
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch doctor details')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [doctorId])

  if (loading) return <LinearProgress />
  if (error) return <Typography color='error'>{error}</Typography>
  if (!doctor) return <Typography>No doctor found</Typography>

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            {/* Avatar + Basic Info */}
            <CardContent sx={{ pt: 13.5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              {doctor.avatar ? (
                <CustomAvatar
                  src={doctor.avatar}
                  variant='rounded'
                  alt={doctor.fullName}
                  sx={{ width: 150, height: 150, mb: 4 }}
                />
              ) : (
                <CustomAvatar
                  skin='light'
                  variant='rounded'
                  color={doctor.avatarColor || 'primary'}
                  sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
                >
                  {getInitials(doctor.fullName || 'NA')}
                </CustomAvatar>
              )}
              <Typography variant='h5' sx={{ mb: 3 }}>
                {doctor.fullName || 'First Name Last Name'}
              </Typography>
              <Typography variant='body1' sx={{ mb: 3 }}>
                {doctor.bio || 'Bio not available'}
              </Typography>
              <CustomChip
                rounded
                skin='light'
                size='small'
                label={doctor.speciality}
                color={roleColors[doctor.speciality] || 'primary'}
                sx={{ textTransform: 'capitalize' }}
              />
            </CardContent>

            <Divider sx={{ my: '0 !important', mx: 6 }} />

            {/* Details Section */}
            <CardContent sx={{ pb: 4 }}>
              <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
                Details
              </Typography>

              <Grid container spacing={4} sx={{ pt: 4 }}>
                {/* Left Column */}
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ mr: 2, mb: 3, fontWeight: 500 }}>Basic Details :</Typography>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Name:</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>@{doctor.username}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Email:</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{doctor.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Phone Number:</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{doctor.phoneNumber}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Status:</Typography>
                    <CustomChip
                      rounded
                      skin='light'
                      size='small'
                      label={doctor.status}
                      color={statusColors[doctor.status] || 'secondary'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Speciality :</Typography>
                    <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                      {doctor.speciality}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Experience :</Typography>
                    <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                      {doctor.experience || 'N/A'} years
                    </Typography>
                  </Box>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>License Number:</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{doctor.licenseNumber || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>License Issue Date:</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{doctor.licenseIssueDate || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>License Expiry Date:</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{doctor.licenseExpiryDate || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Qualification :</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{doctor.qualification || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex' }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Address:</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{doctor.address || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex' }}>
                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Consultation fees :</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{doctor.consultationFees || 'N/A'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>

            <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant='contained' sx={{ mr: 2 }} onClick={handleEditClickOpen}>
                Approve
              </Button>
              <Button color='error' variant='outlined' onClick={() => setSuspendDialogOpen(true)}>
                Reject
              </Button>
            </CardActions>

            {/* Approve Dialog */}
            <Dialog
              open={openEdit}
              onClose={handleEditClose}
              aria-labelledby='user-view-edit'
              aria-describedby='user-view-edit-description'
              sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650 } }}
            >
              <DialogTitle
                id='user-view-edit'
                sx={{
                  textAlign: 'center',
                  fontSize: '1.5rem !important',
                  px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                  pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
                }}
              >
                Approve Doctor
              </DialogTitle>

              <DialogContent
                sx={{
                  pb: theme => `${theme.spacing(8)} !important`,
                  px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
                }}
              >
                <DialogContentText variant='body2' id='user-view-edit-description' sx={{ textAlign: 'center', mb: 7 }}>
                  Are you sure you want to approve doctor{' '}
                  <Typography component='span' sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {doctor.firstName} {doctor.lastName}
                  </Typography>
                  ?
                </DialogContentText>
              </DialogContent>

              <DialogActions
                sx={{
                  justifyContent: 'center',
                  px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                  pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
                }}
              >
                <Button variant='contained' sx={{ mr: 2 }} onClick={handleApprove} disabled={approving}>
                  {approving ? 'Approving...' : 'Yes, Approve'}
                </Button>
                <Button variant='outlined' color='secondary' onClick={handleEditClose}>
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>

            <UserSuspendDialog open={suspendDialogOpen} setOpen={setSuspendDialogOpen} />
            <UserSubscriptionDialog open={subscriptionDialogOpen} setOpen={setSubscriptionDialogOpen} />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default Index
