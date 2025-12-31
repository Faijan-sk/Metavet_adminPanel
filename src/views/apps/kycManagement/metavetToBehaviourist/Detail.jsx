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
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AttachFileIcon from '@mui/icons-material/AttachFile'

import Chip from '@mui/material/Chip'

import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { getInitials } from 'src/@core/utils/get-initials'

import jwt from '../../../../enpoints/jwt/useJwt'

const statusColors = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error'
}

const showOrDash = val => {
    if (val === null || val === undefined || val === '') return '—'
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    if (Array.isArray(val)) return val.length ? val.join(', ') : '—'
    return String(val)
}

const formatDate = dateString => {
    if (!dateString) return '—'
    try {
        const d = new Date(dateString)
        if (isNaN(d)) return dateString
        return d.toLocaleString()
    } catch {
        return dateString
    }
}

function InfoRow({ label, value, isBoolean = false }) {
    return (
        <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
            <Typography sx={{ mr: 2, fontWeight: 600, minWidth: 200, color: 'text.secondary' }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isBoolean && value !== '—' ? (
                    value === 'Yes' ? (
                        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    ) : (
                        <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
                    )
                ) : null}
                <Typography sx={{ color: 'text.primary' }}>{value}</Typography>
            </Box>
        </Box>
    )
}

/**
 * ✅ DocType based row (uid + docType se backend hit karega)
 */
function FileRow({ label, docType, onClick, kyc }) {
    if (!kyc?.uid || !docType) return null

    return (
        <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
            <Typography sx={{ mr: 2, fontWeight: 600, minWidth: 200, color: 'text.secondary' }}>
                {label}
            </Typography>
            <Button
                size='small'
                startIcon={<AttachFileIcon />}
                onClick={() => onClick(label, docType)}
                sx={{ textTransform: 'none' }}
            >
                View Document
            </Button>
        </Box>
    )
}

const humanizeEnum = s => {
    if (!s) return s
    return s
        .toLowerCase()
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
}

export default function MetavetToBehaviouristDetail({ behaviouristId }) {
    const router = useRouter()
    const [kyc, setKyc] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [openApproveDialog, setOpenApproveDialog] = useState(false)
    const [openRejectDialog, setOpenRejectDialog] = useState(false)
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)

    // ✅ File modal states (walker jaisa)
    const [fileModalOpen, setFileModalOpen] = useState(false)
    const [fileModalSrc, setFileModalSrc] = useState(null)    // Object URL
    const [fileModalType, setFileModalType] = useState(null)  // 'pdf' | 'image' | 'other'
    const [fileModalLabel, setFileModalLabel] = useState('')
    const [fileLoading, setFileLoading] = useState(false)

    // ✅ Behaviourist KYC fetch
    useEffect(() => {
        console.clear()
        console.log('*********************behaviouristId', behaviouristId)
        if (!behaviouristId) {
            setKyc(null)
            setLoading(false)
            return
        }
        const fetchRecord = async () => {
            setLoading(true)
            setError('')
            setKyc(null)
            try {
                if (!jwt || typeof jwt.getMetavetToBehaviouristKycById !== 'function') {
                    throw new Error('API function jwt.getMetavetToBehaviouristKycById is not available')
                }
                const res = await jwt.getMetavetToBehaviouristKycById(behaviouristId)
                const payload = res?.data ?? res
                if (payload && typeof payload === 'object') {
                    setKyc(payload)
                } else {
                    setKyc(null)
                    setError('No KYC found')
                }
            } catch (err) {
                console.error(err)
                setError(err?.message || 'Failed to fetch KYC')
            } finally {
                setLoading(false)
            }
        }
        fetchRecord()
    }, [behaviouristId])

    // ✅ Object URL cleanup (memory leak avoid)
    useEffect(() => {
        return () => {
            if (fileModalSrc) {
                URL.revokeObjectURL(fileModalSrc)
            }
        }
    }, [fileModalSrc])

    const handleApprove = async () => {
        if (!kyc) return

        try {
            setApproving(true)

            if (!jwt || typeof jwt.updateMetavetToBehaviouristKycStatus !== 'function') {
                throw new Error('API function jwt.updateMetavetToBehaviouristKycStatus is not available')
            }

            // Backend call: PATCH /behaviouristkyc/uid/{uid}/status?status=APPROVED
            const res = await jwt.updateMetavetToBehaviouristKycStatus(kyc.uid, 'APPROVED')
            const updated = res?.data ?? res

            // UI update – backend ka data prefer karo agar mila
            setKyc(prev => ({ ...(prev || {}), ...(updated || {}), status: 'APPROVED' }))
            setOpenApproveDialog(false)
        } catch (err) {
            console.error(err)
            alert(err?.message || 'Failed to approve Behaviourist KYC')
        } finally {
            setApproving(false)
        }
    }

    const handleReject = async () => {
        if (!kyc) return

        try {
            setRejecting(true)

            if (!jwt || typeof jwt.updateMetavetToBehaviouristKycStatus !== 'function') {
                throw new Error('API function jwt.updateMetavetToBehaviouristKycStatus is not available')
            }

            // Backend call: PATCH /behaviouristkyc/uid/{uid}/status?status=REJECTED
            const res = await jwt.updateMetavetToBehaviouristKycStatus(kyc.uid, 'REJECTED')
            const updated = res?.data ?? res

            // UI update
            setKyc(prev => ({ ...(prev || {}), ...(updated || {}), status: 'REJECTED' }))
            setOpenRejectDialog(false)
        } catch (err) {
            console.error(err)
            alert(err?.message || 'Failed to reject Behaviourist KYC')
        } finally {
            setRejecting(false)
        }
    }

    /**
     * ✅ Blob based Behaviourist doc fetch
     *  GET /behaviouristkyc/uploaded_files/{uid}/{docType}
     */
    const openFileModal = async (label, docType) => {
        if (!kyc?.uid) {
            alert('User UID missing, cannot fetch document.')
            return
        }

        try {
            setFileModalLabel(label)
            setFileModalOpen(true)
            setFileLoading(true)

            // Purana URL clean
            if (fileModalSrc) {
                URL.revokeObjectURL(fileModalSrc)
                setFileModalSrc(null)
            }

            if (!jwt || typeof jwt.getBehaviouristDocc !== 'function') {
                throw new Error('API function jwt.getBehaviouristDocc is not available')
            }

            // yahan hit hoga:
            // {baseUrl}/behaviouristkyc/uploaded_files/{uid}/{docType}
            const blob = await jwt.getBehaviouristDocc(kyc.uid, docType)

            const objectUrl = URL.createObjectURL(blob)
            setFileModalSrc(objectUrl)

            const mime = blob?.type || ''

            if (mime === 'application/pdf') {
                setFileModalType('pdf')
            } else if (mime.startsWith('image/')) {
                setFileModalType('image')
            } else {
                setFileModalType('pdf') // default
            }
        } catch (err) {
            console.error(err)
            alert(err?.message || 'Failed to load document')
            setFileModalOpen(false)
        } finally {
            setFileLoading(false)
        }
    }

    const ownerName = kyc?.fullLegalName || kyc?.businessName || kyc?.email || 'Behaviourist'

    if (loading) return <LinearProgress />
    if (error) return <Typography color='error'>{error}</Typography>
    if (!kyc) return <Typography>No record found for id: {behaviouristId}</Typography>

    // prepare arrays (dedupe)
    const services = Array.isArray(kyc.servicesOffered) ? Array.from(new Set(kyc.servicesOffered)) : []
    const specs = Array.isArray(kyc.specializations) ? Array.from(new Set(kyc.specializations)) : []

    return (
        <>
            <Grid container spacing={6}>
                {/* Header Card */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent sx={{ pt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <CustomAvatar
                                skin='light'
                                variant='rounded'
                                sx={{ width: 120, height: 120, mb: 3, fontSize: '2.5rem' }}
                            >
                                {getInitials(ownerName)}
                            </CustomAvatar>

                            <Typography variant='h4' sx={{ mb: 1, fontWeight: 600 }}>
                                {ownerName}
                            </Typography>
                            <Typography variant='body1' sx={{ color: 'text.secondary', mb: 1 }}>
                                {kyc?.email || '—'}
                            </Typography>
                            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
                                {kyc?.phone || '—'}
                            </Typography>

                            <CustomChip
                                rounded
                                skin='light'
                                size='medium'
                                label={kyc?.status || '—'}
                                color={statusColors[kyc?.status] || 'primary'}
                                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                            />
                        </CardContent>
                        <CardActions sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
                            <Button variant='outlined' onClick={() => router.back()} sx={{ mr: 2 }}>
                                Back
                            </Button>
                            <Button
                                variant='contained'
                                color='success'
                                sx={{ mr: 2 }}
                                onClick={() => setOpenApproveDialog(true)}
                                disabled={kyc?.status === 'APPROVED'}
                            >
                                Approve
                            </Button>
                            <Button
                                color='error'
                                variant='contained'
                                onClick={() => setOpenRejectDialog(true)}
                                disabled={kyc?.status === 'REJECTED'}
                            >
                                Reject
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                {/* Basic Information */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                                Basic Information
                            </Typography>
                            <InfoRow label='Full Legal Name' value={showOrDash(kyc?.fullLegalName)} />
                            <InfoRow label='Business Name' value={showOrDash(kyc?.businessName)} />
                            <InfoRow label='Email' value={showOrDash(kyc?.email)} />
                            <InfoRow label='Phone' value={showOrDash(kyc?.phone)} />
                            <InfoRow label='Address' value={showOrDash(kyc?.address)} />
                            <InfoRow label='Service Area' value={showOrDash(kyc?.serviceArea)} />
                            <InfoRow label='Years of Experience' value={showOrDash(kyc?.yearsExperience)} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Service Details */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                                Service Details
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    sx={{
                                        mr: 2,
                                        fontWeight: 600,
                                        minWidth: 200,
                                        color: 'text.secondary',
                                        display: 'inline-block'
                                    }}
                                >
                                    Services Offered
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {services.length ? (
                                        services.map(s => <Chip key={s} label={humanizeEnum(s)} size='small' />)
                                    ) : (
                                        <Typography sx={{ color: 'text.primary' }}>—</Typography>
                                    )}
                                </Box>
                            </Box>

                            <InfoRow label='Other Services' value={showOrDash(kyc?.servicesOtherText)} />

                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    sx={{
                                        mr: 2,
                                        fontWeight: 600,
                                        minWidth: 200,
                                        color: 'text.secondary',
                                        display: 'inline-block'
                                    }}
                                >
                                    Specializations
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {specs.length ? (
                                        specs.map(s => <Chip key={s} label={humanizeEnum(s)} size='small' />)
                                    ) : (
                                        <Typography sx={{ color: 'text.primary' }}>—</Typography>
                                    )}
                                </Box>
                            </Box>

                            <InfoRow label='Service Radius' value={showOrDash(kyc?.serviceRadius)} />
                            <InfoRow label='Created At' value={formatDate(kyc?.createdAt)} />
                            <InfoRow label='Updated At' value={formatDate(kyc?.updatedAt)} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Certifications & Documents */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                                Certifications & Documents
                            </Typography>

                            {/* Behavioural Certification */}
                            <Accordion defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Behavioural Certification</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label='Has Behavioural Certificate'
                                        value={showOrDash(kyc?.hasBehaviouralCertifications)}
                                        isBoolean={true}
                                    />
                                    <InfoRow
                                        label='Details'
                                        value={showOrDash(kyc?.behaviouralCertificateDetails)}
                                    />
                                    {kyc?.hasBehaviouralCertifications === true && (
                                        <FileRow
                                            label='Behavioural Certificate'
                                            docType='behavioural_certificate' // <-- backend docType yaha match karvao
                                            onClick={openFileModal}
                                            kyc={kyc}
                                        />
                                    )}
                                </AccordionDetails>
                            </Accordion>

                            {/* Insurance */}
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Insurance</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label='Has Insurance'
                                        value={showOrDash(kyc?.hasInsurance)}
                                        isBoolean={true}
                                    />
                                    <InfoRow label='Provider' value={showOrDash(kyc?.insuranceProvider)} />
                                    <InfoRow
                                        label='Policy Number'
                                        value={showOrDash(kyc?.insurancePolicyNumber)}
                                    />
                                    <InfoRow
                                        label='Expiry Date'
                                        value={formatDate(kyc?.insuranceExpiry)}
                                    />
                                    {kyc?.hasInsurance === true && (
                                        <FileRow
                                            label='Insurance Document'
                                            docType='insurance'
                                            onClick={openFileModal}
                                            kyc={kyc}
                                        />
                                    )}
                                </AccordionDetails>
                            </Accordion>

                            {/* Criminal Background Check */}
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Criminal Background Check</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label='Criminal Check'
                                        value={showOrDash(kyc?.hasCriminalCheck)}
                                        isBoolean={true}
                                    />
                                    {kyc?.hasCriminalCheck === true && (
                                        <FileRow
                                            label='Criminal Record Document'
                                            docType='criminal_record'
                                            onClick={openFileModal}
                                            kyc={kyc}
                                        />
                                    )}
                                </AccordionDetails>
                            </Accordion>

                            {/* Liability Insurance */}
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Liability Insurance</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label='Has Liability Insurance'
                                        value={showOrDash(kyc?.liabilityInsurance)}
                                        isBoolean={true}
                                    />
                                    {kyc?.liabilityInsurance === true && (
                                        <FileRow
                                            label='Liability Insurance Document'
                                            docType='liability_insurance'
                                            onClick={openFileModal}
                                            kyc={kyc}
                                        />
                                    )}
                                </AccordionDetails>
                            </Accordion>

                            {/* Business License */}
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Business License</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label='Has Business License'
                                        value={showOrDash(kyc?.hasBusinessLicense)}
                                        isBoolean={true}
                                    />
                                    {kyc?.hasBusinessLicense === true && (
                                        <FileRow
                                            label='Business License Document'
                                            docType='business_license'
                                            onClick={openFileModal}
                                            kyc={kyc}
                                        />
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Declarations */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                                Declarations
                            </Typography>
                            <InfoRow
                                label='Information is Accurate'
                                value={showOrDash(kyc?.infoTrue)}
                                isBoolean={true}
                            />
                            <InfoRow
                                label='Consent to Verify'
                                value={showOrDash(kyc?.verifyOk)}
                                isBoolean={true}
                            />
                            <InfoRow
                                label='Will Comply with Terms'
                                value={showOrDash(kyc?.abideStandards)}
                                isBoolean={true}
                            />
                            <Divider sx={{ my: 2 }} />
                            <InfoRow label='Signature' value={showOrDash(kyc?.signature)} />
                            <InfoRow label='Signature Date' value={formatDate(kyc?.signatureDate)} />
                        </CardContent>


                        <CardActions sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
                            <Button variant='outlined' onClick={() => router.back()} sx={{ mr: 2 }}>
                                Back
                            </Button>
                            <Button
                                variant='contained'
                                color='success'
                                sx={{ mr: 2 }}
                                onClick={() => setOpenApproveDialog(true)}
                                disabled={kyc?.status === 'APPROVED'}
                            >
                                Approve
                            </Button>
                            <Button
                                color='error'
                                variant='contained'
                                onClick={() => setOpenRejectDialog(true)}
                                disabled={kyc?.status === 'REJECTED'}
                            >
                                Reject
                            </Button>
                        </CardActions>

                    </Card>
                </Grid>
            </Grid>

            {/* Approve Dialog */}
            <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}>
                <DialogTitle>Approve KYC</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to approve the KYC for <strong>{ownerName}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenApproveDialog(false)} variant='outlined'>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApprove}
                        disabled={approving}
                        variant='contained'
                        color='success'
                    >
                        {approving ? 'Approving...' : 'Yes, Approve'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
                <DialogTitle>Reject KYC</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to reject the KYC for <strong>{ownerName}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRejectDialog(false)} variant='outlined'>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReject}
                        disabled={rejecting}
                        variant='contained'
                        color='error'
                    >
                        {rejecting ? 'Rejecting...' : 'Yes, Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* File Modal */}
            <Dialog
                fullWidth
                maxWidth='lg'
                open={fileModalOpen}
                onClose={() => setFileModalOpen(false)}
            >
                <DialogTitle
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                    {fileModalLabel}
                    <IconButton onClick={() => setFileModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    sx={{
                        minHeight: 400,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    {fileLoading ? (
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />
                        </Box>
                    ) : !fileModalSrc ? (
                        <Typography>Unable to load document.</Typography>
                    ) : fileModalType === 'pdf' ? (
                        <iframe
                            title={fileModalLabel}
                            src={fileModalSrc}
                            style={{ width: '100%', height: '80vh', border: 'none' }}
                        />
                    ) : fileModalType === 'image' ? (
                        <img
                            alt={fileModalLabel}
                            src={fileModalSrc}
                            style={{ maxWidth: '100%', maxHeight: '80vh' }}
                        />
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ mb: 2 }}>
                                Preview not available for this file type.
                            </Typography>
                            <Button variant='contained' onClick={() => window.open(fileModalSrc, '_blank')}>
                                Open in New Tab
                            </Button>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
