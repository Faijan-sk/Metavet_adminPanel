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

// FileRow: docType + click handler
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

export default function MetavetToGroomerDetail({ groomerKycId }) {
    const router = useRouter()
    const [kyc, setKyc] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [openApproveDialog, setOpenApproveDialog] = useState(false)
    const [openRejectDialog, setOpenRejectDialog] = useState(false)
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)

    const [fileModalOpen, setFileModalOpen] = useState(false)
    const [fileModalSrc, setFileModalSrc] = useState(null) // Object URL from blob
    const [fileModalType, setFileModalType] = useState(null) // 'pdf' | 'image' | 'other'
    const [fileModalLabel, setFileModalLabel] = useState('')
    const [fileLoading, setFileLoading] = useState(false)

    useEffect(() => {
        console.log('*********************groomerKycId', groomerKycId)
        if (!groomerKycId) {
            setKyc(null)
            setLoading(false)
            return
        }
        const fetchRecord = async () => {
            setLoading(true)
            setError('')
            setKyc(null)
            try {
                if (!jwt || typeof jwt.getMetavetToGroomerKycById !== 'function') {
                    throw new Error('API function jwt.getMetavetToGroomerKycById is not available')
                }
                const res = await jwt.getMetavetToGroomerKycById(groomerKycId)
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
    }, [groomerKycId])

    // Cleanup object URL
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

            if (!jwt || typeof jwt.updateMetavetToGroomerKycStatus !== 'function') {
                throw new Error('API function jwt.updateMetavetToGroomerKycStatus is not available')
            }

            await jwt.updateMetavetToGroomerKycStatus(kyc.uid, 'APPROVED')

            setKyc(prev => ({ ...prev, status: 'APPROVED' }))
            setOpenApproveDialog(false)
        } catch (err) {
            console.error(err)
            alert(err?.message || 'Failed to approve Groomer KYC')
        } finally {
            setApproving(false)
        }
    }

    const handleReject = async () => {
        if (!kyc) return

        try {
            setRejecting(true)

            if (!jwt || typeof jwt.updateMetavetToGroomerKycStatus !== 'function') {
                throw new Error('API function jwt.updateMetavetToGroomerKycStatus is not available')
            }

            await jwt.updateMetavetToGroomerKycStatus(kyc.uid, 'REJECTED')

            setKyc(prev => ({ ...prev, status: 'REJECTED' }))
            setOpenRejectDialog(false)
        } catch (err) {
            console.error(err)
            alert(err?.message || 'Failed to reject Groomer KYC')
        } finally {
            setRejecting(false)
        }
    }

    // Document open using jwt.getGroomerDocc → Blob → Object URL
    const openFileModal = async (label, docType) => {
        if (!kyc?.uid) {
            alert('User UID missing, cannot fetch document.')
            return
        }

        try {
            setFileModalLabel(label)
            setFileModalOpen(true)
            setFileLoading(true)

            if (fileModalSrc) {
                URL.revokeObjectURL(fileModalSrc)
                setFileModalSrc(null)
            }

            if (!jwt || typeof jwt.getGroomerDocc !== 'function') {
                throw new Error('API function jwt.getGroomerDocc is not available')
            }

            // yahan hit hoga:
            // {{baseUrl}}/groomerkyc/uploaded_files/{uid}/{docType}
            const blob = await jwt.getGroomerDocc(kyc.uid, docType)

            const objectUrl = URL.createObjectURL(blob)
            setFileModalSrc(objectUrl)

            const mime = blob?.type || ''

            if (mime === 'application/pdf') {
                setFileModalType('pdf')
            } else if (mime.startsWith('image/')) {
                setFileModalType('image')
            } else {
                setFileModalType('pdf')
            }
        } catch (err) {
            console.error(err)
            alert(err?.message || 'Failed to load document')
            setFileModalOpen(false)
        } finally {
            setFileLoading(false)
        }
    }

    const ownerName = kyc?.fullLegalName || kyc?.businessName || kyc?.email || 'Groomer'

    if (loading) return <LinearProgress />
    if (error) return <Typography color='error'>{error}</Typography>
    if (!kyc) return <Typography>No record found for id: {groomerKycId}</Typography>

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
                            <InfoRow label='Service Location Type' value={showOrDash(kyc?.serviceLocationType)} />
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
                            <InfoRow label='Services Offered' value={showOrDash(kyc?.servicesOffered)} />
                            <InfoRow label='Other Services' value={showOrDash(kyc?.servicesOtherText)} />
                            <InfoRow label='Service Prices' value={showOrDash(kyc?.servicesPrices)} />
                            <InfoRow
                                label='Avg Appointment Duration'
                                value={showOrDash(kyc?.averageAppointmentDuration)}
                            />
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

                            {/* Business License */}
                            <Accordion defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Business License</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label='Has Business License'
                                        value={showOrDash(kyc?.hasBusinessLicense)}
                                        isBoolean={true}
                                    />
                                    {/* ✅ Sirf tab dikhana jab hasBusinessLicense true ho */}
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

                            {/* Grooming Certification */}
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Grooming Certification</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label='Has Grooming Certificate'
                                        value={showOrDash(kyc?.hasGroomingCert)}
                                        isBoolean={true}
                                    />
                                    <InfoRow label='Details' value={showOrDash(kyc?.groomingCertDetails)} />
                                    {/* ✅ hasGroomingCert false/null ho to View Document hide */}
                                    {kyc?.hasGroomingCert === true && (
                                        <FileRow
                                            label='Grooming Certificate'
                                            docType='grooming_certificate'
                                            onClick={openFileModal}
                                            kyc={kyc}
                                        />
                                    )}
                                </AccordionDetails>
                            </Accordion>

                            {/* First Aid Certification */}
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>First Aid Certification</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label='Has First Aid Certificate'
                                        value={showOrDash(kyc?.hasFirstAidCert)}
                                        isBoolean={true}
                                    />
                                    {kyc?.hasFirstAidCert === true && (
                                        <FileRow
                                            label='First Aid Certificate'
                                            docType='first_aid_certificate'
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
                                    <InfoRow label='Policy Number' value={showOrDash(kyc?.insurancePolicyNumber)} />
                                    <InfoRow label='Expiry Date' value={formatDate(kyc?.insuranceExpiry)} />
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
                                        value={showOrDash(kyc?.criminalCheck)}
                                        isBoolean={true}
                                    />
                                    {kyc?.criminalCheck === true && (
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
                                    <InfoRow label='Provider' value={showOrDash(kyc?.liabilityProvider)} />
                                    <InfoRow label='Policy Number' value={showOrDash(kyc?.liabilityPolicyNumber)} />
                                    <InfoRow label='Expiry Date' value={formatDate(kyc?.liabilityExpiry)} />
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

                            {/* Incident Policy (no docs) */}
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Incident Policy</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label='Has Incident Policy'
                                        value={showOrDash(kyc?.hasIncidentPolicy)}
                                        isBoolean={true}
                                    />
                                    <InfoRow label='Details' value={showOrDash(kyc?.incidentPolicyDetails)} />
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
                                value={showOrDash(kyc?.declarationAccuracy)}
                                isBoolean={true}
                            />
                            <InfoRow
                                label='Consent to Verify'
                                value={showOrDash(kyc?.declarationConsentVerify)}
                                isBoolean={true}
                            />
                            <InfoRow
                                label='Will Comply with Terms'
                                value={showOrDash(kyc?.declarationComply)}
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
                    <Button onClick={handleApprove} disabled={approving} variant='contained' color='success'>
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
                    <Button onClick={handleReject} disabled={rejecting} variant='contained' color='error'>
                        {rejecting ? 'Rejecting...' : 'Yes, Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* File Modal */}
            <Dialog fullWidth maxWidth='lg' open={fileModalOpen} onClose={() => setFileModalOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {fileModalLabel}
                    <IconButton onClick={() => setFileModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    sx={{ minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
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
                            <Typography sx={{ mb: 2 }}>Preview not available for this file type.</Typography>
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
