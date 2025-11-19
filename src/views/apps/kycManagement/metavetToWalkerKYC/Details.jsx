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

const makeFileUrl = (fileUrl, kyc = null) => {
    if (!fileUrl) return null
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl
    if (fileUrl.startsWith('/')) {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL
        if (base) return `${base.replace(/\/$/, '')}${fileUrl}`
        if (typeof window !== 'undefined') return `${window.location.origin}${fileUrl}`
        return fileUrl
    }
    const looksLikeWindowsPath = /^[a-zA-Z]:\\\\|\\\\\\/.test(fileUrl) || fileUrl.includes('\\')
    if (looksLikeWindowsPath) {
        const parts = fileUrl.split(/[/\\\\]+/)
        const filename = parts[parts.length - 1] || ''
        const filenameNoExt = filename.replace(/\.[^/.]+$/, '')
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
        const candidates = []
        if (base) {
            if (kyc?.uid) {
                if (filenameNoExt) candidates.push(`${base.replace(/\/$/, '')}/groomerkyc/uploaded_files/${kyc.uid}/${filenameNoExt}`)
                if (filename) candidates.push(`${base.replace(/\/$/, '')}/groomerkyc/uploaded_files/${kyc.uid}/${filename}`)
            }
            if (filename) candidates.push(`${base.replace(/\/$/, '')}/${filename}`)
        }
        return candidates.length ? candidates[0] : null
    }
    if (!fileUrl.startsWith('/')) {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL
        if (base) return `${base.replace(/\/$/, '')}/${fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl}`
        if (typeof window !== 'undefined') return `${window.location.origin}/${fileUrl}`
    }
    return fileUrl
}

const getFileType = url => {
    if (!url) return 'unknown'
    const u = url.split('?')[0]
    const ext = u.split('.').pop().toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image'
    return 'other'
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

function FileRow({ label, fileUrl, onClick, kyc }) {
    if (!fileUrl) return null

    return (
        <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
            <Typography sx={{ mr: 2, fontWeight: 600, minWidth: 200, color: 'text.secondary' }}>
                {label}
            </Typography>
            <Button
                size="small"
                startIcon={<AttachFileIcon />}
                onClick={() => onClick(label, fileUrl)}
                sx={{ textTransform: 'none' }}
            >
                View Document
            </Button>
        </Box>
    )
}

export default function MetavetToWalkerDetail({ walkerId }) {
    const router = useRouter()
    const [kyc, setKyc] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [openApproveDialog, setOpenApproveDialog] = useState(false)
    const [openRejectDialog, setOpenRejectDialog] = useState(false)
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)

    const [fileModalOpen, setFileModalOpen] = useState(false)
    const [fileModalSrc, setFileModalSrc] = useState(null)
    const [fileModalType, setFileModalType] = useState(null)
    const [fileModalLabel, setFileModalLabel] = useState('')

    useEffect(() => {
        if (!walkerId) {
            setKyc(null)
            setLoading(false)
            return
        }
        const fetchRecord = async () => {
            setLoading(true)
            setError('')
            setKyc(null)
            try {
                if (!jwt || typeof jwt.getMetavetToWalkerKycById !== 'function') {
                    throw new Error('API function jwt.getMetavetToWalkerKycById is not available')
                }
                const res = await jwt.getMetavetToWalkerKycById(walkerId)
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
    }, [walkerId])

    const handleApprove = async () => {
        if (!kyc) return
        try {
            setApproving(true)
            const updateFns = [
                'updateKycStatus',
                'updateMetavetToGroomerStatus',
                'updateGroomerKycStatus',
                'updateKyc',
                'approveGroomerKyc'
            ]
            let updated = false
            for (const fnName of updateFns) {
                if (jwt && typeof jwt[fnName] === 'function') {
                    try {
                        await jwt[fnName](kyc.uid ?? kyc.id, 'APPROVED')
                        updated = true
                        break
                    } catch (e) {
                        // try next
                    }
                }
            }
            if (!updated) {
                throw new Error('Approve API not implemented on jwt (check available functions)')
            }
            setKyc(prev => ({ ...prev, status: 'APPROVED' }))
            setOpenApproveDialog(false)
        } catch (err) {
            console.error(err)
            alert(err?.message || 'Failed to approve KYC')
        } finally {
            setApproving(false)
        }
    }

    const handleReject = async () => {
        if (!kyc) return
        try {
            setRejecting(true)
            const updateFns = [
                'updateKycStatus',
                'updateMetavetToGroomerStatus',
                'updateGroomerKycStatus',
                'updateKyc',
                'rejectGroomerKyc'
            ]
            let updated = false
            for (const fnName of updateFns) {
                if (jwt && typeof jwt[fnName] === 'function') {
                    try {
                        await jwt[fnName](kyc.uid ?? kyc.id, 'REJECTED')
                        updated = true
                        break
                    } catch (e) {
                        // try next
                    }
                }
            }
            if (!updated) {
                throw new Error('Reject API not implemented on jwt (check available functions)')
            }
            setKyc(prev => ({ ...prev, status: 'REJECTED' }))
            setOpenRejectDialog(false)
        } catch (err) {
            console.error(err)
            alert(err?.message || 'Failed to reject KYC')
        } finally {
            setRejecting(false)
        }
    }

    const openFileModal = (label, fileUrl) => {
        const full = makeFileUrl(fileUrl, kyc)
        if (!full) {
            alert('Cannot open this file in browser — backend must expose a public URL for this file.')
            return
        }
        setFileModalSrc(full)
        setFileModalType(getFileType(full))
        setFileModalLabel(label)
        setFileModalOpen(true)
    }

    const ownerName = kyc?.fullLegalName || kyc?.businessName || kyc?.email || 'Walker'

    if (loading) return <LinearProgress />
    if (error) return <Typography color="error">{error}</Typography>
    if (!kyc) return <Typography>No record found for id: {walkerId}</Typography>

    return (
        <>
            <Grid container spacing={6}>
                {/* Header Card */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent sx={{ pt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <CustomAvatar skin='light' variant='rounded' sx={{ width: 120, height: 120, mb: 3, fontSize: '2.5rem' }}>
                                {getInitials(ownerName)}
                            </CustomAvatar>

                            <Typography variant='h4' sx={{ mb: 1, fontWeight: 600 }}>{ownerName}</Typography>
                            <Typography variant='body1' sx={{ color: 'text.secondary', mb: 1 }}>{kyc?.email || '—'}</Typography>
                            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>{kyc?.phone || '—'}</Typography>

                            <CustomChip
                                rounded
                                skin='light'
                                size='medium'
                                label={kyc?.status || '—'}
                                color={statusColors[kyc?.status] || 'primary'}
                                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                            />
                        </CardContent>

                        {/* <CardActions sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
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
                        </CardActions> */}
                    </Card>
                </Grid>

                {/* Basic Information */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                                Basic Information
                            </Typography>
                            <InfoRow label="Full Legal Name" value={showOrDash(kyc?.fullLegalName)} />
                            <InfoRow label="Business Name" value={showOrDash(kyc?.businessName)} />
                            <InfoRow label="Email" value={showOrDash(kyc?.email)} />
                            <InfoRow label="Phone" value={showOrDash(kyc?.phone)} />
                            <InfoRow label="Address" value={showOrDash(kyc?.address)} />
                            <InfoRow label="Service Area" value={showOrDash(kyc?.serviceArea)} />
                            <InfoRow label="Years of Experience" value={showOrDash(kyc?.yearsExperience)} />
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
                            <InfoRow label="Walk Radius" value={showOrDash(kyc?.walkRadius)} />
                            <InfoRow label="Max Pets Per Walk" value={showOrDash(kyc?.maxPetsPerWalk)} />
                            <InfoRow label="Preferred Communication" value={showOrDash(kyc?.preferredCommunication)} />
                            <InfoRow label="Created At" value={formatDate(kyc?.createdAt)} />
                            <InfoRow label="Updated At" value={formatDate(kyc?.updatedAt)} />
                            <InfoRow label="Signature Date" value={formatDate(kyc?.signatureDate)} />
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

                            <Accordion defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Pet Care Certifications</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label="Has Certifications"
                                        value={showOrDash(kyc?.hasPetCareCertifications)}
                                        isBoolean={true}
                                    />
                                    <InfoRow label="Details" value={showOrDash(kyc?.hasPetCareCertificationsDetails)} />
                                    <FileRow
                                        label="Certificate Document"
                                        fileUrl={kyc?.petCareCertificationDoc || kyc?.certificationFilePath || kyc?.certificationFileURL}
                                        onClick={openFileModal}
                                        kyc={kyc}
                                    />
                                </AccordionDetails>
                            </Accordion>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Bonding & Insurance</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label="Bonded or Insured"
                                        value={showOrDash(kyc?.bondedOrInsured)}
                                        isBoolean={true}
                                    />
                                    <FileRow
                                        label="Bond/Insurance Document"
                                        fileUrl={kyc?.bondedOrInsuredDoc || kyc?.bondedFilePath || kyc?.bondedFileURL}
                                        onClick={openFileModal}
                                        kyc={kyc}
                                    />
                                </AccordionDetails>
                            </Accordion>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>First Aid Certification</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label="Has First Aid"
                                        value={showOrDash(kyc?.hasFirstAid)}
                                        isBoolean={true}
                                    />
                                    <FileRow
                                        label="First Aid Certificate"
                                        fileUrl={kyc?.petFirstAidCertificateDoc || kyc?.firstAidFilePath || kyc?.firstAidFileURL}
                                        onClick={openFileModal}
                                        kyc={kyc}
                                    />
                                </AccordionDetails>
                            </Accordion>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Criminal Background Check</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow label="Criminal Check" value={showOrDash(kyc?.criminalCheck)} />
                                    <FileRow
                                        label="Criminal Record Document"
                                        fileUrl={kyc?.crimialRecordDoc || kyc?.criminalCheckFilePath || kyc?.criminalCheckFileURL}
                                        onClick={openFileModal}
                                        kyc={kyc}
                                    />
                                </AccordionDetails>
                            </Accordion>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Liability Insurance</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label="Has Liability Insurance"
                                        value={showOrDash(kyc?.liabilityInsurance)}
                                        isBoolean={true}
                                    />
                                    <InfoRow label="Provider" value={showOrDash(kyc?.liabilityProvider)} />
                                    <InfoRow label="Policy Number" value={showOrDash(kyc?.liabilityPolicyNumber)} />
                                    <InfoRow label="Expiry Date" value={formatDate(kyc?.insuranceExpiry)} />
                                    <FileRow
                                        label="Insurance Document"
                                        fileUrl={kyc?.liabilityInsuaranceDoc || kyc?.liabilityFilePath || kyc?.liabilityFileURL}
                                        onClick={openFileModal}
                                        kyc={kyc}
                                    />
                                </AccordionDetails>
                            </Accordion>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Business License</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <InfoRow
                                        label="Has Business License"
                                        value={showOrDash(kyc?.hasBusinessLicenseDoc)}
                                        isBoolean={true}
                                    />
                                    <FileRow
                                        label="Business License Document"
                                        fileUrl={kyc?.businessLicenseDoc || kyc?.businessLicenseFilePath || kyc?.businessLicenseFileURL}
                                        onClick={openFileModal}
                                        kyc={kyc}
                                    />
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
                                label="Information is Accurate"
                                value={showOrDash(kyc?.declarationAccurate)}
                                isBoolean={true}
                            />
                            <InfoRow
                                label="Verification Authorized"
                                value={showOrDash(kyc?.declarationVerifyOk)}
                                isBoolean={true}
                            />
                            <InfoRow
                                label="Will Comply with Terms"
                                value={showOrDash(kyc?.declarationComply)}
                                isBoolean={true}
                            />
                            <Divider sx={{ my: 2 }} />
                            <InfoRow label="Signature" value={showOrDash(kyc?.signature)} />
                            <InfoRow label="Signature Date" value={formatDate(kyc?.signatureDate)} />
                        </CardContent>
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
                    <Button onClick={() => setOpenApproveDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleApprove} disabled={approving} variant="contained" color="success">
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
                    <Button onClick={() => setOpenRejectDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleReject} disabled={rejecting} variant="contained" color="error">
                        {rejecting ? 'Rejecting...' : 'Yes, Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* File Modal */}
            <Dialog fullWidth maxWidth="lg" open={fileModalOpen} onClose={() => setFileModalOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {fileModalLabel}
                    <IconButton onClick={() => setFileModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {fileModalType === 'pdf' ? (
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
                            <Button
                                variant="contained"
                                onClick={() => window.open(fileModalSrc, '_blank')}
                            >
                                Open in New Tab
                            </Button>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}