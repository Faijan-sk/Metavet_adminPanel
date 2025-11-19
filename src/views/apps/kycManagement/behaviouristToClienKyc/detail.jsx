// File: pages/kycManagement/behaviouristToClientDetail.js
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
import Chip from '@mui/material/Chip'

import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { getInitials } from 'src/@core/utils/get-initials'
import useJwt from 'src/enpoints/jwt/useJwt'

const statusColors = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error'
}

const showOrDash = val => {
    if (val === null || val === undefined || val === '') return '—'
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    return val
}

const commaList = val => {
    if (!val) return '—'
    if (Array.isArray(val)) return val.join(', ')
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean).join(', ')
    return String(val)
}

export default function BehaviouristToClientDetail() {
    const router = useRouter()
    const { id } = router.query

    const [kyc, setKyc] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [openApproveDialog, setOpenApproveDialog] = useState(false)
    const [approving, setApproving] = useState(false)

    useEffect(() => {
        if (!id) return
        const fetchKyc = async () => {
            try {
                setLoading(true)
                setError('')
                let res
                if (useJwt.getKycById) {
                    res = await useJwt.getKycById(id)
                } else {
                    res = await useJwt.getAllKycBehaviouristToClient()
                }
                const payload = res?.data ?? res
                if (Array.isArray(payload)) {
                    const found = payload.find(it => it.uid === id || String(it.id) === String(id) || it.petUid === id)
                    setKyc(found || null)
                } else {
                    setKyc(payload || null)
                }
            } catch (err) {
                setError(err?.message || String(err) || 'Failed to fetch KYC')
            } finally {
                setLoading(false)
            }
        }
        fetchKyc()
    }, [id])

    const handleApprove = async () => {
        if (!kyc) return
        try {
            setApproving(true)
            if (useJwt.updateKycStatus) {
                await useJwt.updateKycStatus(kyc.uid || kyc.id, 'APPROVED')
            } else {
                console.warn('updateKycStatus not implemented in useJwt')
            }
            setKyc(prev => ({ ...prev, kycStatus: 'APPROVED' }))
            setOpenApproveDialog(false)
        } catch (err) {
            console.error(err)
            alert('Failed to approve KYC')
        } finally {
            setApproving(false)
        }
    }

    if (loading) return <LinearProgress />
    if (error) return <Typography color="error">{error}</Typography>
    if (!kyc) return <Typography>No KYC found for id: {id}</Typography>

    const owner = kyc?.pet?.owner || {}
    const pet = kyc?.pet || {}

    return (
        <>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent sx={{ pt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <CustomAvatar
                                skin='light'
                                variant='rounded'
                                sx={{ width: 100, height: 100, mb: 2, fontSize: '2rem' }}
                            >
                                {getInitials(`${owner?.firstName || ''} ${owner?.lastName || ''}`)}
                            </CustomAvatar>

                            <Typography variant='h5' sx={{ mb: 0.5 }}>
                                {`${owner?.firstName || ''} ${owner?.lastName || ''}`.trim() || owner?.username || 'Owner'}
                            </Typography>
                            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
                                {owner?.email || '—'}
                            </Typography>

                            <CustomChip
                                rounded
                                skin='light'
                                size='small'
                                label={kyc?.kycStatus || '—'}
                                color={statusColors[kyc?.kycStatus] || 'primary'}
                                sx={{ textTransform: 'capitalize', mt: 1 }}
                            />
                        </CardContent>

                        <Divider sx={{ my: '0 !important', mx: 6 }} />

                        <CardContent sx={{ pb: 4 }}>
                            <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
                                KYC Summary
                            </Typography>

                            <Grid container spacing={4} sx={{ pt: 3 }}>
                                {/* Left column: Owner + Pet basic */}
                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ fontWeight: 600, mb: 1 }}>Owner</Typography>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Name:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{`${owner?.firstName || ''} ${owner?.lastName || ''}`.trim() || '—'}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Email:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{owner?.email || '—'}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 2 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Phone:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{owner?.fullPhoneNumber || ((owner?.countryCode || '') + (owner?.phoneNumber || '')) || '—'}</Typography>
                                    </Box>

                                    <Typography sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Pet</Typography>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Name:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{pet?.petName || pet?.petInfo || '—'}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Species:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{pet?.petSpecies || '—'}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Age:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{showOrDash(pet?.petAge)}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Breed:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{pet?.petBreed || '—'}</Typography>
                                    </Box>
                                </Grid>

                                {/* Right column: Behavior quick */}
                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ fontWeight: 600, mb: 1 }}>Behavior Overview</Typography>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Challenges:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{commaList(kyc?.behavioralChallenges)}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Frequency:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{showOrDash(kyc?.behaviorFrequency)}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Started:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{showOrDash(kyc?.behaviorStartTime)}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Progress:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{showOrDash(kyc?.behaviorProgress)}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Preferred Session:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{showOrDash(kyc?.preferredSessionType)}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography sx={{ fontWeight: 600, mb: 1 }}>Detailed Behavioural Info</Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <DetailRow label="Other Behavior Description" value={kyc?.otherBehaviorDescription} />
                                    <DetailRow label="Specific Situations" value={kyc?.specificSituationsDescription} />
                                    <DetailRow label="Known Triggers" value={kyc?.knownTriggers} />
                                    <DetailRow label="Behavior Progress Context" value={kyc?.behaviorProgressContext} />
                                    <DetailRow label="Aggressive Behaviors" value={commaList(kyc?.aggressiveBehaviors)} />
                                    <DetailRow label="Aggression / Bite Description" value={kyc?.aggressionBiteDescription} />
                                    <DetailRow label="Serious Incidents" value={kyc?.seriousIncidents} />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <DetailRow label="Worked With Trainer" value={showOrDash(kyc?.workedWithTrainer)} />
                                    <DetailRow label="Trainer Approaches" value={kyc?.trainerApproaches} />
                                    <DetailRow label="Current Training Tools" value={commaList(kyc?.currentTrainingTools)} />
                                    <DetailRow label="Other Training Tool" value={kyc?.otherTrainingTool} />
                                    <DetailRow label="Pet Motivation" value={showOrDash(kyc?.petMotivation)} />
                                    <DetailRow label="Favorite Rewards" value={kyc?.favoriteRewards} />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography sx={{ fontWeight: 600, mb: 1 }}>Daily / Home Details</Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <DetailRow label="Walks Per Day" value={kyc?.walksPerDay} />
                                    <DetailRow label="Off Leash Time" value={kyc?.offLeashTime} />
                                    <DetailRow label="Time Alone" value={kyc?.timeAlone} />
                                    <DetailRow label="Exercise / Stimulation" value={kyc?.exerciseStimulation} />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <DetailRow label="Other Pets" value={showOrDash(kyc?.otherPets)} />
                                    <DetailRow label="Other Pets Details" value={kyc?.otherPetsDetails} />
                                    <DetailRow label="Children In Home" value={showOrDash(kyc?.childrenInHome)} />
                                    <DetailRow label="Children Ages" value={kyc?.childrenAges} />
                                    <DetailRow label="Pet Response With Children" value={kyc?.petResponseWithChildren} />
                                    <DetailRow label="Home Environment" value={kyc?.homeEnvironment} />
                                    <DetailRow label="Home Environment Other" value={kyc?.homeEnvironmentOther} />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography sx={{ fontWeight: 600, mb: 1 }}>Outcome / Notes</Typography>
                            <Box sx={{ mb: 1 }}>
                                <Typography sx={{ mr: 2, fontWeight: 500 }}>Success Outcome:</Typography>
                                <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>{kyc?.successOutcome || '—'}</Typography>
                            </Box>

                            <Box sx={{ mb: 1 }}>
                                <Typography sx={{ mr: 2, fontWeight: 500 }}>Open To Adjustments:</Typography>
                                <Typography sx={{ color: 'text.secondary' }}>{showOrDash(kyc?.openToAdjustments)}</Typography>
                            </Box>

                            <Box sx={{ mb: 1 }}>
                                <Typography sx={{ mr: 2, fontWeight: 500 }}>Additional Notes:</Typography>
                                <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>{kyc?.additionalNotes || '—'}</Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography sx={{ mr: 2, fontWeight: 500 }}>Consent Accuracy:</Typography>
                                <Typography sx={{ color: 'text.secondary' }}>{showOrDash(kyc?.consentAccuracy)}</Typography>
                            </Box>
                        </CardContent>

                        {/* <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button variant='outlined' onClick={() => router.back()} sx={{ mr: 2 }}>
                                Back
                            </Button>
                            <Button variant='contained' sx={{ mr: 2 }} onClick={() => setOpenApproveDialog(true)}>
                                Approve
                            </Button>
                            <Button color='error' variant='outlined' onClick={() => alert('Reject flow not implemented')}>
                                Reject
                            </Button>
                        </CardActions> */}

                        <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)} aria-labelledby='approve-kyc'>
                            <DialogTitle id='approve-kyc'>Approve KYC</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to approve KYC for <strong>{owner?.firstName} {owner?.lastName}</strong>?
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleApprove} disabled={approving} variant="contained">
                                    {approving ? 'Approving...' : 'Yes, Approve'}
                                </Button>
                                <Button onClick={() => setOpenApproveDialog(false)} variant="outlined">Cancel</Button>
                            </DialogActions>
                        </Dialog>
                    </Card>
                </Grid>
            </Grid>
        </>
    )
}

/**
 * Small presentational component used above.
 * Placed here to keep the file self-contained.
 */
function DetailRow({ label, value }) {
    return (
        <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography sx={{ mr: 2, fontWeight: 500, minWidth: 180 }}>{label}:</Typography>
            <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>{value ?? '—'}</Typography>
        </Box>
    )
}
