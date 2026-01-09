import React, { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Button from '@mui/material/Button'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'

// ** Utils
import { getInitials } from 'src/@core/utils/get-initials'

// ** JWT
import useJwt from 'src/enpoints/jwt/useJwt'

// ** Router
import { useRouter } from 'next/router'

const statusColors = {
    true: 'success',
    false: 'error'
}

function ClientProfile() {
    const router = useRouter()
    const { uid } = router.query

    const [client, setClient] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isDeleted, setIsDeleted] = useState('Delete Client')
    const [confirmOpen, setConfirmOpen] = useState(false)

    // ✅ Fetch client by UID
    useEffect(() => {
        if (!uid) return

        const fetchClient = async () => {
            try {
                setLoading(true)
                setError('')

                const res = await useJwt.getClientByUid(uid)
                const user = res?.data

                if (user?.deleted === true) {
                    setIsDeleted('Client is deleted')
                }

                if (user) {
                    setClient({
                        id: user.id,
                        uid: user.uid,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                        email: user.email,
                        username: user.username,
                        phone: user.fullPhoneNumber,
                        countryCode: user.countryCode,
                        enabled: user.enabled,
                        userType: user.userTypeAsString,
                        profileCompleted: user.profileCompleted,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        role: user.authorities?.[0]?.authority || 'ROLE_CLIENT'
                    })
                } else {
                    setClient(null)
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch client')
            } finally {
                setLoading(false)
            }
        }

        fetchClient()
    }, [uid])

    const handleDelete = async () => {
        try {
            setIsDeleted('Deleting...')

            // ⏳ 1 second delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            await useJwt.softDeleteClient(uid)

            setIsDeleted('Client is deleted')
            setConfirmOpen(false)
        } catch (error) {
            console.error(error)
            setIsDeleted('Failed to delete client')
            setConfirmOpen(false)
        }
    }

    if (loading) return <LinearProgress />
    if (error) return <Typography color='error'>{error}</Typography>
    if (!client) return <Typography>No client found</Typography>

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    {/* Avatar + Header */}
                    <CardContent
                        sx={{
                            pt: 13.5,
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column'
                        }}
                    >
                        <CustomAvatar
                            skin='light'
                            variant='rounded'
                            sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
                        >
                            {getInitials(client.fullName || 'NA')}
                        </CustomAvatar>

                        <Typography variant='h5' sx={{ mb: 2 }}>
                            {client.fullName}
                        </Typography>

                        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
                            {client.email}
                        </Typography>

                        <CustomChip
                            rounded
                            skin='light'
                            size='small'
                            label={client.enabled ? 'Active' : 'Inactive'}
                            color={statusColors[client.enabled]}
                        />
                    </CardContent>

                    <Divider sx={{ my: '0 !important', mx: 6 }} />

                    {/* Details */}
                    <CardContent sx={{ pb: 4 }}>
                        <Typography
                            variant='body2'
                            sx={{ color: 'text.disabled', textTransform: 'uppercase' }}
                        >
                            Client Details
                        </Typography>

                        <Grid container spacing={4} sx={{ pt: 4 }}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', mb: 3 }}>
                                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Username:</Typography>
                                    <Typography sx={{ color: 'text.secondary' }}>
                                        @{client.username}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', mb: 3 }}>
                                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Phone:</Typography>
                                    <Typography sx={{ color: 'text.secondary' }}>
                                        {client.phone}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', mb: 3 }}>
                                    <Typography sx={{ mr: 2, fontWeight: 500 }}>User Type:</Typography>
                                    <Typography sx={{ color: 'text.secondary' }}>
                                        {client.userType}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', mb: 3 }}>
                                    <Typography sx={{ mr: 2, fontWeight: 500 }}>UID:</Typography>
                                    <Typography sx={{ color: 'text.secondary' }}>
                                        {client.uid}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', mb: 3 }}>
                                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Created At:</Typography>
                                    <Typography sx={{ color: 'text.secondary' }}>
                                        {client.createdAt}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex' }}>
                                    <Typography sx={{ mr: 2, fontWeight: 500 }}>Updated At:</Typography>
                                    <Typography sx={{ color: 'text.secondary' }}>
                                        {client.updatedAt}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>

                    {/* Delete Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
                        <Button
                            color='error'
                            variant='contained'
                            onClick={() => setConfirmOpen(true)}
                            disabled={isDeleted === 'Client is deleted'}
                        >
                            {isDeleted}
                        </Button>
                    </Box>

                    {/* Confirmation Dialog */}
                    <Dialog
                        open={confirmOpen}
                        onClose={() => setConfirmOpen(false)}
                        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650 } }}
                    >
                        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem' }}>
                            Delete Client
                        </DialogTitle>

                        <DialogContent>
                            <DialogContentText sx={{ textAlign: 'center', mt: 2 }}>
                                Are you sure you want to delete client{' '}
                                <Typography component='span' sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                    {client.fullName}
                                </Typography>
                                ?
                            </DialogContentText>
                        </DialogContent>

                        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                            <Button
                                variant='contained'
                                color='error'
                                onClick={handleDelete}
                                disabled={isDeleted === 'Deleting...'}
                            >
                                {isDeleted === 'Deleting...' ? 'Deleting...' : 'Yes, Delete'}
                            </Button>

                            <Button
                                variant='outlined'
                                color='secondary'
                                onClick={() => setConfirmOpen(false)}
                            >
                                Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Card>
            </Grid>
        </Grid>
    )
}

export default ClientProfile
