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

/* ==================== HELPERS ==================== */

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
            .map(v => v.trim())
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

/* ==================== MAIN ==================== */

export default function BehaviouristToClientDetail() {
    const router = useRouter()
    const { id } = router.query

    const [kyc, setKyc] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [openApproveDialog, setOpenApproveDialog] = useState(false)
    const [openRejectDialog, setOpenRejectDialog] = useState(false)
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)

    const [snackbar, setSnackbar] = useState({
        open: false,
        severity: 'success',
        message: ''
    })

    /* ==================== FETCH ==================== */
    useEffect(() => {
        if (!id) return

        const fetchKyc = async () => {
            try {
                setLoading(true)
                setError('')

                const res = await useJwt.getBehaviouristToClientKycById(id)

                const root = res?.code && res?.data ? res : res?.data ?? res
                const payload = root?.data ?? root

                if (!payload) {
                    setKyc(null)
                    return
                }

                setKyc(payload)
            } catch (err) {
                console.error(err)
                setError(err?.message || 'Failed to fetch KYC')
            } finally {
                setLoading(false)
            }
        }

        fetchKyc()
    }, [id])

    /* ==================== STATUS UPDATE (ADDED ONLY) ==================== */

    const performStatusUpdate = async targetStatus => {
        if (!kyc?.uid) return

        try {
            targetStatus === 'APPROVED' ? setApproving(true) : setRejecting(true)

            await useJwt.updateBehaviouristToClientKycStatus(kyc.uid, targetStatus)

            setKyc(prev => ({
                ...prev,
                kycStatus: targetStatus
            }))

            setSnackbar({
                open: true,
                severity: 'success',
                message: `KYC ${targetStatus === 'APPROVED' ? 'approved' : 'rejected'} successfully`
            })
        } catch (err) {
            setSnackbar({
                open: true,
                severity: 'error',
                message: err?.message || 'Failed to update status'
            })
        } finally {
            setApproving(false)
            setRejecting(false)
            setOpenApproveDialog(false)
            setOpenRejectDialog(false)
        }
    }

    /* ==================== UI STATES ==================== */

    if (loading) return <LinearProgress />
    if (error) return <Typography color='error'>{error}</Typography>
    if (!kyc) return <Typography>No KYC found</Typography>

    const owner = kyc?.pet?.owner || {}
    const pet = kyc?.pet || {}

    /* ==================== UI ==================== */

    return (
        <>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Card>

                        {/* ===== HEADER ===== */}
                        <CardContent sx={{ pt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <CustomAvatar skin='light' variant='rounded' sx={{ width: 100, height: 100, mb: 2 }}>
                                {getInitials(`${owner?.firstName || ''} ${owner?.lastName || ''}`)}
                            </CustomAvatar>

                            <Typography variant='h5'>
                                {`${owner?.firstName || ''} ${owner?.lastName || ''}`.trim()}
                            </Typography>

                            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                                {owner?.email}
                            </Typography>

                            <CustomChip
                                rounded
                                skin='light'
                                size='small'
                                label={kyc?.kycStatus}
                                color={statusColors[kyc?.kycStatus]}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>

                        <Divider sx={{ mx: 6 }} />

                        {/* ===== OWNER + PET ===== */}
                        <CardContent>
                            <Typography sx={{ fontWeight: 600, mb: 2 }}>Owner & Pet</Typography>

                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <DetailRow label='Owner Name' value={pet?.ownerFullName} />
                                    <DetailRow label='Phone' value={owner?.fullPhoneNumber} />
                                    <DetailRow label='Pet Name' value={pet?.petName} />
                                    <DetailRow label='Species' value={pet?.petSpecies} />
                                    <DetailRow label='Breed' value={pet?.petBreed} />
                                    <DetailRow label='Age' value={pet?.petAge} />
                                    <DetailRow label='Gender' value={pet?.petGender} />
                                    <DetailRow label='Vaccinated' value={showOrDash(pet?.isVaccinated)} />
                                    <DetailRow label='Neutered' value={showOrDash(pet?.isNeutered)} />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <DetailRow label='Behavioral Challenges' value={kyc?.behavioralChallenges} />
                                    <DetailRow label='Behavior Start Time' value={kyc?.behaviorStartTime} />
                                    <DetailRow label='Frequency' value={kyc?.behaviorFrequency} />
                                    <DetailRow label='Known Triggers' value={kyc?.knownTriggers} />
                                    <DetailRow label='Progress' value={kyc?.behaviorProgress} />
                                    <DetailRow label='Progress Notes' value={kyc?.behaviorProgressContext} />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* ===== TRAINING ===== */}
                            <Typography sx={{ fontWeight: 600, mb: 2 }}>Training & Environment</Typography>

                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <DetailRow label='Worked With Trainer' value={showOrDash(kyc?.workedWithTrainer)} />
                                    <DetailRow label='Trainer Approaches' value={kyc?.trainerApproaches} />
                                    <DetailRow label='Training Tools' value={commaList(kyc?.currentTrainingToolsEnums)} />
                                    <DetailRow label='Pet Motivation' value={kyc?.petMotivation} />
                                    <DetailRow label='Favorite Rewards' value={kyc?.favoriteRewards} />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <DetailRow label='Walks Per Day' value={kyc?.walksPerDay} />
                                    <DetailRow label='Off Leash Time' value={kyc?.offLeashTime} />
                                    <DetailRow label='Time Alone' value={kyc?.timeAlone} />
                                    <DetailRow label='Exercise' value={kyc?.exerciseStimulation} />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* ===== HOME ===== */}
                            <Typography sx={{ fontWeight: 600, mb: 2 }}>Home & Preferences</Typography>

                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <DetailRow label='Other Pets' value={showOrDash(kyc?.otherPets)} />
                                    <DetailRow label='Children In Home' value={showOrDash(kyc?.childrenInHome)} />
                                    <DetailRow label='Home Environment' value={kyc?.homeEnvironment} />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <DetailRow label='Preferred Session' value={kyc?.preferredSessionType} />
                                    <DetailRow label='Expected Outcome' value={kyc?.successOutcome} />
                                    <DetailRow label='Open To Adjustments' value={kyc?.openToAdjustments} />
                                    <DetailRow label='Additional Notes' value={kyc?.additionalNotes} />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* ===== CONSENT ===== */}
                            <Typography sx={{ fontWeight: 600, mb: 2 }}>Consent</Typography>
                            <DetailRow label='Consent Given' value={showOrDash(kyc?.consentAccuracy)} />
                        </CardContent>

                        {/* ===== ACTIONS ===== */}
                        <CardActions sx={{ justifyContent: 'center' }}>
                            <Button variant='outlined' onClick={() => router.back()} sx={{ mr: 2 }}>
                                Back
                            </Button>

                            <Button variant='contained' sx={{ mr: 2 }} onClick={() => setOpenApproveDialog(true)}>
                                Approve
                            </Button>

                            <Button color='error' variant='outlined' onClick={() => setOpenRejectDialog(true)}>
                                Reject
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            {/* ==================== APPROVE CONFIRM ==================== */}
            <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}>
                <DialogTitle>Approve KYC</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to approve this KYC?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenApproveDialog(false)}>Cancel</Button>
                    <Button
                        variant='contained'
                        disabled={approving}
                        onClick={() => performStatusUpdate('APPROVED')}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== REJECT CONFIRM ==================== */}
            <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
                <DialogTitle>Reject KYC</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to reject this KYC?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
                    <Button
                        color='error'
                        variant='contained'
                        disabled={rejecting}
                        onClick={() => performStatusUpdate('REJECTED')}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== SNACKBAR ==================== */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </>
    )
}

/* ==================== ROW ==================== */
function DetailRow({ label, value }) {
    return (
        <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography sx={{ mr: 2, fontWeight: 500, minWidth: 200 }}>
                {label}:
            </Typography>
            <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                {value ?? '—'}
            </Typography>
        </Box>
    )
}
