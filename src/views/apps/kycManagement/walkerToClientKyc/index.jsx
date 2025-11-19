// File: components/DoctorList.jsx
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import jwt from '../../../../enpoints/jwt/useJwt' // keep same as your file
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import Button from '@mui/material/Button'

const DoctorList = ({
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
                const res = await jwt.getAllKycWalkerToClient()
                // defensive handling: API might return either { data: [...] } or [...] directly
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

    // View action — navigate to walker detail page (query id)
    const handleView = id => {
        if (!id) return
        router.push({
            pathname: '/kycManagement/walkerToClientDetail',
            query: { id }
        })
    }

    // normalize filters
    const nameFilterLower = (nameFilter || '').toString().trim().toLowerCase()
    const specialityFilterLower = (specialityFilter || '').toString().trim().toLowerCase()
    const statusFilterNormalized = (statusFilter || '').toString().trim()

    const filteredKycs = useMemo(() => {
        const filtered = kycs
            .filter(item => {
                if (!nameFilterLower) return true
                const first = (item?.pet?.owner?.firstName || '').toString().toLowerCase()
                const last = (item?.pet?.owner?.lastName || '').toString().toLowerCase()
                const full = `${first} ${last}`.trim()
                return first.includes(nameFilterLower) || last.includes(nameFilterLower) || full.includes(nameFilterLower)
            })
            .filter(item => {
                if (!specialityFilterLower) return true
                // for walker KYC: check petSpecies, preferredWalkType, additionalServices etc.
                const spec =
                    (item?.pet?.petSpecies || item?.preferredWalkType || item?.additionalServices || '').toString().toLowerCase()
                return spec.includes(specialityFilterLower)
            })
            .filter(item => {
                if (!statusFilterNormalized) return true
                const status = (item?.status || item?.kycStatus || '').toString()
                return status === statusFilterNormalized
            })

        return filtered.sort((a, b) => {
            const dateA = new Date(a?.updatedAt || a?.createdAt || 0)
            const dateB = new Date(b?.updatedAt || b?.createdAt || 0)
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
                <Table stickyHeader aria-label="walker kyc table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Owner name</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Pet Name</TableCell>
                            <TableCell>Signature Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ color: 'red' }}>
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : filteredKycs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleKycs.map(item => {
                                const key =
                                    item?.uid || item?.id || item?.petUid || `${item?.pet?.owner?.email || ''}-${item?.pet?.owner?.phoneNumber || ''}`
                                const ownerFirst = item?.pet?.owner?.firstName || ''
                                const ownerLast = item?.pet?.owner?.lastName || ''
                                const ownerName = `${ownerFirst} ${ownerLast}`.trim() || '—'
                                const petName = item?.pet?.petName || item?.petNames || item?.pet?.petInfo || '—'
                                const email = item?.pet?.owner?.email || '—'
                                const phone = item?.pet?.owner?.fullPhoneNumber || `${item?.pet?.owner?.countryCode || ''}${item?.pet?.owner?.phoneNumber || ''}` || '—'
                                const status = item?.status || item?.kycStatus || '—'
                                const signatureDate = item?.signatureDate || item?.signature_date || '—'
                                const idToSend = item?.uid || item?.id || item?.petUid

                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={key}>
                                        <TableCell>{ownerName}</TableCell>
                                        <TableCell>{phone}</TableCell>
                                        <TableCell>{email}</TableCell>
                                        <TableCell>{petName}</TableCell>
                                        <TableCell>{formatDate(signatureDate)}</TableCell>
                                        <TableCell>{status}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={() => handleView(idToSend)}
                                            >
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

export default DoctorList
