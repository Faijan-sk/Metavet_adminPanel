import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import jwt from '../../../../enpoints/jwt/useJwt'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import Button from '@mui/material/Button'

const GroomerKycList = ({
    nameFilter = '',
    specialityFilter = '',
    statusFilter = '',
    sortOrder = 'LATEST',
}) => {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [kycs, setKycs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const router = useRouter()

    useEffect(() => {
        const fetchKycs = async () => {
            try {
                setLoading(true)
                setError('')
                const res = await jwt.getAllKycMetavetToGroomer()
                const payload = res?.data ?? res
                const list = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : Array.isArray(res?.data)
                            ? res.data
                            : []
                setKycs(list)
            } catch (err) {
                setError(err?.message || String(err) || 'Failed to fetch KYC records')
            } finally {
                setLoading(false)
            }
        }

        fetchKycs()
    }, [])

    const handleChangePage = (event, newPage) => setPage(newPage)
    const handleChangeRowsPerPage = event => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }

    const handleView = identifier => {
        if (!identifier) return

        router.push(`/kycManagement/metavetToGroomer/${encodeURIComponent(identifier)}`)
    }

    const nameFilterLower = (nameFilter || '').toString().trim().toLowerCase()
    const specialityFilterLower = (specialityFilter || '').toString().trim().toLowerCase()
    const statusFilterNormalized = (statusFilter || '').toString().trim()

    const filteredKycs = useMemo(() => {
        const filtered = kycs
            .filter(item => {
                if (!nameFilterLower) return true
                const fullName = (item?.fullLegalName || item?.businessName || '').toString().toLowerCase()
                return fullName.includes(nameFilterLower)
            })
            .filter(item => {
                if (!specialityFilterLower) return true
                const serviceLocationType = (item?.serviceLocationType || '').toString().toLowerCase()
                const businessName = (item?.businessName || '').toString().toLowerCase()
                const servicesOffered = Array.isArray(item?.servicesOffered)
                    ? item.servicesOffered.join(' ').toString().toLowerCase()
                    : (item?.servicesOffered || '').toString().toLowerCase()
                return (
                    serviceLocationType.includes(specialityFilterLower) ||
                    businessName.includes(specialityFilterLower) ||
                    servicesOffered.includes(specialityFilterLower)
                )
            })
            .filter(item => {
                if (!statusFilterNormalized) return true
                const status = (item?.status || '').toString()
                return status === statusFilterNormalized
            })

        return filtered.sort((a, b) => {
            const dateA = new Date(a?.updatedAt || a?.signatureDate || a?.createdAt || 0)
            const dateB = new Date(b?.updatedAt || b?.signatureDate || b?.createdAt || 0)
            return sortOrder === 'LATEST' ? dateB - dateA : dateA - dateB
        })
    }, [kycs, nameFilterLower, specialityFilterLower, statusFilterNormalized, sortOrder])

    const visibleKycs = filteredKycs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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

    return (
        <>
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="groomer kyc table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Groomer Name / Business</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Service Type</TableCell>
                            <TableCell>Years Exp</TableCell>
                            <TableCell>Signature Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ color: 'red' }}>{error}</TableCell>
                            </TableRow>
                        ) : filteredKycs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">No records found</TableCell>
                            </TableRow>
                        ) : (
                            visibleKycs.map((item, idx) => {
                                // prefer uid -> id -> email -> phone -> fallback key
                                const uid = item?.uid || item?.id || item?.email || item?.phone || `${item?.businessName || 'groomer'}-${idx}`
                                const key = uid
                                const legalName = (item?.fullLegalName || item?.businessName || '—').toString().trim()
                                const email = item?.email || '—'
                                const phone = item?.phone || '—'
                                const serviceType = item?.serviceLocationType || '—'
                                const yearsExperience = typeof item?.yearsExperience === 'number' ? item.yearsExperience : (item?.yearsExperience || '—')
                                const signatureDate = item?.signatureDate || item?.signature_date || item?.updatedAt || '—'
                                const status = item?.status || '—'

                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={key}>
                                        <TableCell>{legalName}</TableCell>
                                        <TableCell>{phone}</TableCell>
                                        <TableCell>{email}</TableCell>
                                        <TableCell>{serviceType}</TableCell>
                                        <TableCell>{yearsExperience}</TableCell>
                                        <TableCell>{formatDate(signatureDate)}</TableCell>
                                        <TableCell>{status}</TableCell>
                                        <TableCell align="right">
                                            <Button variant="text" size="small" onClick={() => handleView(uid)}>
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={filteredKycs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    )
}

export default GroomerKycList
