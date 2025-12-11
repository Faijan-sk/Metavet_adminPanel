// File: pages/kycManagement/groomerToClientDetail.js
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import LinearProgress from '@mui/material/LinearProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'

import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { getInitials } from 'src/@core/utils/get-initials'
import useJwt from '../../../../enpoints/jwt/useJwt'

const statusColors = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    UNDER_REVIEW: 'info'
}

const showOrDash = val => {
    if (val === null || val === undefined || val === '') return '—'
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    return val
}

const commaList = val => {
    if (!val) return '—'
    if (Array.isArray(val)) return val.join(', ')
    if (typeof val === 'string') {
        return val
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .join(', ')
    }
    return String(val)
}

export default function GroomerToClientDetail() {
    const router = useRouter()
    const { id } = router.query

    const [kyc, setKyc] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [openApproveDialog, setOpenApproveDialog] = useState(false)
    const [openRejectDialog, setOpenRejectDialog] = useState(false)
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [message, setMessage] = useState(null)

    // ==================== FETCH KYC BY ID ====================
    useEffect(() => {
        if (!id) return

        const fetchKyc = async () => {
            try {
                setLoading(true)
                setError('')
                setMessage(null)

                // 🔹 SERVICE CALL
                const res = await useJwt.getGroomerToClientKycById(id)

                // Agar service .then(r => r.data) karti hai to:
                // res = { code, data, success, message, timestamp }
                const root = res?.code && res?.data ? res : res?.data ?? res

                const payload = root?.data ?? root

                if (!payload) {
                    setKyc(null)
                    return
                }

                // 🔹 payload.fullRecord me full DB entity hai (pet, owner, etc.)
                const fullRecord = payload.fullRecord || {}

                const normalized = {
                    ...fullRecord,
                    ...payload
                }

                setKyc(normalized)
            } catch (err) {
                console.error('Error fetching groomer-to-client KYC by ID:', err)
                setError(err?.message || String(err) || 'Failed to fetch KYC')
            } finally {
                setLoading(false)
            }
        }

        fetchKyc()
    }, [id])

    // utility to pick a reasonable UID for backend (controller expects UID string)
    const getKycUid = () => {
        if (!kyc) return null
        return kyc.uid || kyc.kycUid || kyc.petUid || kyc.id || null
    }

    // ==================== APPROVE HANDLER ====================
    const handleApprove = async () => {
        if (!kyc) return

        try {
            setApproving(true)
            setMessage(null)

            const uid = getKycUid()
            if (!uid) throw new Error('KYC UID not found')

            if (typeof useJwt.updateGroomerKycStatus === 'function') {
                await useJwt.updateGroomerKycStatus(uid, 'APPROVED')
            } else if (typeof useJwt.updateKycStatus === 'function') {
                // backward compatibility
                await useJwt.updateKycStatus(uid, 'APPROVED')
            } else {
                console.warn('No update status method found on useJwt')
                throw new Error('Update method not implemented in useJwt')
            }

            setKyc(prev => ({
                ...prev,
                status: 'APPROVED',
                kycStatus: 'APPROVED'
            }))

            setMessage({ type: 'success', text: 'KYC approved successfully.' })
            setOpenApproveDialog(false)
        } catch (err) {
            console.error('Approve error:', err)
            setMessage({ type: 'error', text: err?.message || 'Failed to approve KYC' })
        } finally {
            setApproving(false)
        }
    }

    // ==================== REJECT HANDLER ====================
    const handleReject = async () => {
        if (!kyc) return

        try {
            setRejecting(true)
            setMessage(null)

            const uid = getKycUid()
            if (!uid) throw new Error('KYC UID not found')

            if (typeof useJwt.updateGroomerKycStatus === 'function') {
                await useJwt.updateGroomerKycStatus(uid, 'REJECTED')
            } else if (typeof useJwt.updateKycStatus === 'function') {
                await useJwt.updateKycStatus(uid, 'REJECTED')
            } else {
                console.warn('No update status method found on useJwt')
                throw new Error('Update method not implemented in useJwt')
            }

            setKyc(prev => ({
                ...prev,
                status: 'REJECTED',
                kycStatus: 'REJECTED'
            }))

            setMessage({ type: 'success', text: 'KYC rejected.' })
            setOpenRejectDialog(false)
        } catch (err) {
            console.error('Reject error:', err)
            setMessage({ type: 'error', text: err?.message || 'Failed to reject KYC' })
        } finally {
            setRejecting(false)
        }
    }

    // ==================== LOADING / ERROR STATES ====================
    if (loading) return <LinearProgress />
    if (error) return <Typography color='error'>{error}</Typography>
    if (!kyc) return <Typography>No KYC found for id: {id}</Typography>

    const owner = kyc?.pet?.owner || {}
    const pet = kyc?.pet || {}

    return (
        <>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent
                            sx={{
                                pt: 6,
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'column'
                            }}
                        >
                            <CustomAvatar
                                skin='light'
                                variant='rounded'
                                sx={{ width: 100, height: 100, mb: 2, fontSize: '2rem' }}
                            >
                                {getInitials(
                                    `${owner?.firstName || ''} ${owner?.lastName || ''}`
                                )}
                            </CustomAvatar>

                            <Typography variant='h5' sx={{ mb: 0.5 }}>
                                {`${owner?.firstName || ''} ${owner?.lastName || ''}`.trim() ||
                                    owner?.username ||
                                    'Owner'}
                            </Typography>
                            <Typography
                                variant='body2'
                                sx={{ color: 'text.secondary', mb: 1 }}
                            >
                                {owner?.email || '—'}
                            </Typography>

                            <CustomChip
                                rounded
                                skin='light'
                                size='small'
                                label={kyc?.status || kyc?.kycStatus || '—'}
                                color={
                                    statusColors[kyc?.status || kyc?.kycStatus] || 'primary'
                                }
                                sx={{ textTransform: 'capitalize', mt: 1 }}
                            />
                        </CardContent>

                        <Divider sx={{ my: '0 !important', mx: 6 }} />

                        <CardContent sx={{ pb: 4 }}>
                            {message && (
                                <Box sx={{ mb: 2 }}>
                                    <Alert severity={message.type === 'error' ? 'error' : 'success'}>
                                        {message.text}
                                    </Alert>
                                </Box>
                            )}

                            <Typography
                                variant='body2'
                                sx={{ color: 'text.disabled', textTransform: 'uppercase' }}
                            >
                                Groomer KYC Summary
                            </Typography>

                            <Grid container spacing={4} sx={{ pt: 3 }}>
                                {/* Left column: Owner + Pet basic */}
                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ fontWeight: 600, mb: 1 }}>Owner</Typography>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Name:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {`${owner?.firstName || ''} ${owner?.lastName || ''}`.trim() ||
                                                '—'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Email:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {owner?.email || '—'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 2 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Phone:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {owner?.fullPhoneNumber ||
                                                (owner?.countryCode || '') + (owner?.phoneNumber || '') ||
                                                '—'}
                                        </Typography>
                                    </Box>

                                    <Typography sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                                        Pet
                                    </Typography>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Name:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {pet?.petName || pet?.petInfo || '—'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Species:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {pet?.petSpecies || '—'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Age:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(pet?.petAge)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Breed:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {pet?.petBreed || '—'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Right column: Grooming quick */}
                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                        Grooming Overview
                                    </Typography>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Grooming Frequency:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.groomingFrequency)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Last Grooming:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.lastGroomingDate)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Preferred Style:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.preferredStyle)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Avoid / Focus Areas:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.avoidFocusAreas)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Grooming Location:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.groomingLocation)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Health & Behaviour
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Health Conditions:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {commaList(kyc?.healthConditions)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            On Medication:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.onMedication)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Medication Details:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.medicationDetails)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Had Injuries / Surgery:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.hadInjuriesSurgery)}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Behavior Issues:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {commaList(kyc?.behaviorIssues)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Calming Methods:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.calmingMethods)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Triggers:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.triggers)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Services & Appointment
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <DetailRow
                                        label='Services'
                                        value={commaList(kyc?.services)}
                                    />
                                    <DetailRow
                                        label='Other Service'
                                        value={kyc?.otherService}
                                    />
                                    <DetailRow
                                        label='Add-Ons'
                                        value={commaList(kyc?.addOns)}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <DetailRow
                                        label='Appointment Date'
                                        value={kyc?.appointmentDate}
                                    />
                                    <DetailRow
                                        label='Appointment Time'
                                        value={kyc?.appointmentTime}
                                    />
                                    <DetailRow
                                        label='Additional Notes'
                                        value={kyc?.additionalNotes}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>

                        <CardActions
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <Button
                                variant='outlined'
                                onClick={() => router.back()}
                                sx={{ mr: 2 }}
                            >
                                Back
                            </Button>
                            <Button
                                variant='contained'
                                sx={{ mr: 2 }}
                                onClick={() => setOpenApproveDialog(true)}
                                disabled={kyc?.status === 'APPROVED' || approving}
                            >
                                {approving ? 'Processing…' : 'Approve'}
                            </Button>
                            <Button
                                color='error'
                                variant='outlined'
                                onClick={() => setOpenRejectDialog(true)}
                                disabled={kyc?.status === 'REJECTED' || rejecting}
                            >
                                {rejecting ? 'Processing…' : 'Reject'}
                            </Button>
                        </CardActions>

                        {/* Approve Dialog */}
                        <Dialog
                            open={openApproveDialog}
                            onClose={() => setOpenApproveDialog(false)}
                            aria-labelledby='approve-kyc'
                        >
                            <DialogTitle id='approve-kyc'>Approve KYC</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to approve KYC for{' '}
                                    <strong>
                                        {owner?.firstName} {owner?.lastName}
                                    </strong>
                                    ?
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleApprove}
                                    disabled={approving}
                                    variant='contained'
                                >
                                    {approving ? 'Approving...' : 'Yes, Approve'}
                                </Button>
                                <Button
                                    onClick={() => setOpenApproveDialog(false)}
                                    variant='outlined'
                                >
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Reject Dialog */}
                        <Dialog
                            open={openRejectDialog}
                            onClose={() => setOpenRejectDialog(false)}
                            aria-labelledby='reject-kyc'
                        >
                            <DialogTitle id='reject-kyc'>Reject KYC</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to reject KYC for{' '}
                                    <strong>
                                        {owner?.firstName} {owner?.lastName}
                                    </strong>
                                    ? This action can be used to notify the owner that their KYC was rejected.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleReject}
                                    disabled={rejecting}
                                    variant='contained'
                                    color='error'
                                >
                                    {rejecting ? 'Rejecting...' : 'Yes, Reject'}
                                </Button>
                                <Button
                                    onClick={() => setOpenRejectDialog(false)}
                                    variant='outlined'
                                >
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Card>
                </Grid>
            </Grid>
        </>
    )
}

/* Small presentational helper */
function DetailRow({ label, value }) {
    return (
        <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography
                sx={{ mr: 2, fontWeight: 500, minWidth: 160 }}
            >
                {label}:
            </Typography>
            <Typography
                sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}
            >
                {value ?? '—'}
            </Typography>
        </Box>
    )
}
