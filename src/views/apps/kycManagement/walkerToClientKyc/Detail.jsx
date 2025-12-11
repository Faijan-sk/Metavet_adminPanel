// File: pages/kycManagement/walkerToClientDetail.js
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
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { getInitials } from 'src/@core/utils/get-initials'
import useJwt from 'src/enpoints/jwt/useJwt'

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

const formatDate = dateString => {
    if (!dateString) return '—'
    try {
        const d = new Date(dateString)
        if (isNaN(d)) return dateString
        return d.toLocaleDateString()
    } catch {
        return dateString
    }
}

export default function WalkerToClientDetail() {
    const router = useRouter()
    const { id } = router.query

    const [kyc, setKyc] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [openApproveDialog, setOpenApproveDialog] = useState(false)
    const [openRejectDialog, setOpenRejectDialog] = useState(false)
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' })

    // ==================== FETCH KYC BY UID ====================
    useEffect(() => {
        if (!id) return

        const fetchKyc = async () => {
            try {
                setLoading(true)
                setError('')

                // ✅ Directly call UID API
                const res = await useJwt.getWalkerToClientKycById(id)
                // res = { code, data, success, message, timestamp }

                const root = res?.code && res?.data ? res : res?.data ?? res
                const payload = root?.data ?? root

                if (!payload) {
                    setKyc(null)
                    return
                }

                // fullRecord me DB entity, payload me flattened fields
                const fullRecord = payload.fullRecord || {}

                const normalized = {
                    ...fullRecord, // id, uid, pet, etc.
                    ...payload     // signature, consent, preferredWalkType, status, etc.
                }

                setKyc(normalized)
            } catch (err) {
                console.error('Error fetching walker-to-client KYC by ID:', err)
                setError(err?.message || String(err) || 'Failed to fetch KYC')
            } finally {
                setLoading(false)
            }
        }

        fetchKyc()
    }, [id])

    // ==================== Status Update Helpers ====================
    const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }))

    const performStatusUpdate = async (targetStatus) => {
        if (!kyc) return
        const uid = kyc.uid || kyc.id
        if (!uid) {
            setSnackbar({ open: true, severity: 'error', message: 'KYC UID not available' })
            return
        }

        const isApprove = targetStatus === 'APPROVED'
        try {
            if (isApprove) setApproving(true)
            else setRejecting(true)

            // Use the exact method name from your frontend service file.
            // In your service you showed `updateWalkeToClientKycStatus(uId, status)`
            if (typeof useJwt.updateWalkeToClientKycStatus === 'function') {
                await useJwt.updateWalkeToClientKycStatus(uid, targetStatus)
            } else if (typeof useJwt.updateWalkerToClientKycStatus === 'function') {
                // fallback if name differs
                await useJwt.updateWalkerToClientKycStatus(uid, targetStatus)
            } else if (typeof useJwt.updateKycStatus === 'function') {
                // another possible fallback previously used in code
                await useJwt.updateKycStatus(uid, targetStatus)
            } else {
                throw new Error('No update status function available on useJwt')
            }

            // Optimistic UI update
            setKyc(prev => ({ ...prev, status: targetStatus, kycStatus: targetStatus }))
            setSnackbar({
                open: true,
                severity: 'success',
                message: `KYC ${isApprove ? 'approved' : 'rejected'} successfully`
            })
        } catch (err) {
            console.error('Error updating walker KYC status:', err)
            setSnackbar({
                open: true,
                severity: 'error',
                message: err?.message || 'Failed to update status'
            })
        } finally {
            if (isApprove) {
                setApproving(false)
                setOpenApproveDialog(false)
            } else {
                setRejecting(false)
                setOpenRejectDialog(false)
            }
        }
    }

    const handleApprove = async () => {
        await performStatusUpdate('APPROVED')
    }

    const handleReject = async () => {
        await performStatusUpdate('REJECTED')
    }

    // ==================== STATES ====================
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
                            <Typography
                                variant='body2'
                                sx={{ color: 'text.disabled', textTransform: 'uppercase' }}
                            >
                                Walker KYC Summary
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
                                            {showOrDash(pet?.petAge || kyc?.age)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Breed:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {pet?.petBreed || kyc?.breedType || '—'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Right column: Walk overview */}
                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                        Walk Overview
                                    </Typography>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Preferred Walk Type:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.preferredWalkType)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Preferred Walk Duration:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(
                                                kyc?.preferredWalkDuration || kyc?.customWalkDuration
                                            )}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Frequency:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.frequency)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Preferred Time:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.preferredTimeOfDay)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Preferred Start Date:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {formatDate(kyc?.preferredStartDate)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                            Starting Location:
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {showOrDash(kyc?.startingLocation)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Handling & Safety
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <DetailRow
                                        label='Leash Behavior'
                                        value={kyc?.leashBehavior}
                                    />
                                    <DetailRow
                                        label='Known Triggers'
                                        value={kyc?.knownTriggers}
                                    />
                                    <DetailRow
                                        label='Handling Notes'
                                        value={kyc?.handlingNotes}
                                    />
                                    <DetailRow
                                        label='Comforting Methods'
                                        value={kyc?.comfortingMethods}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <DetailRow
                                        label='Medical Conditions'
                                        value={showOrDash(kyc?.medicalConditions)}
                                    />
                                    <DetailRow
                                        label='Medications'
                                        value={showOrDash(kyc?.medications)}
                                    />
                                    <DetailRow
                                        label='Emergency Vet Info'
                                        value={kyc?.emergencyVetInfo}
                                    />
                                    <DetailRow
                                        label='Backup Contact'
                                        value={kyc?.backupContact}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Logistics & Consent
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <DetailRow
                                        label='Address / Meeting Point'
                                        value={kyc?.addressMeetingPoint}
                                    />
                                    <DetailRow
                                        label='Access Instructions'
                                        value={kyc?.accessInstructions}
                                    />
                                    <DetailRow
                                        label='Additional Services'
                                        value={commaList(kyc?.additionalServices)}
                                    />
                                    <DetailRow
                                        label='Post Walk Preferences'
                                        value={kyc?.postWalkPreferences}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <DetailRow label='Signature' value={kyc?.signature} />
                                    <DetailRow
                                        label='Signature Date'
                                        value={formatDate(kyc?.signatureDate)}
                                    />
                                    <DetailRow
                                        label='Consent Given'
                                        value={showOrDash(kyc?.consent)}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>

                        <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
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
                                disabled={kyc?.status === 'APPROVED' || approving || rejecting}
                            >
                                {approving ? 'Approving...' : 'Approve'}
                            </Button>
                            <Button
                                color='error'
                                variant='outlined'
                                onClick={() => setOpenRejectDialog(true)}
                                disabled={kyc?.status === 'REJECTED' || approving || rejecting}
                            >
                                {rejecting ? 'Rejecting...' : 'Reject'}
                            </Button>
                        </CardActions>

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
                                    ? This action can be reverted by updating status again.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleReject}
                                    disabled={rejecting}
                                    variant='contained'
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

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
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
