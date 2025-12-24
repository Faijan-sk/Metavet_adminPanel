// File: components/DoctorList.jsx
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

                const res = await jwt.getAllKycBihaviouristToClient()

                console.log("response data of api", res.data)

                let parsedData = res?.data

                if (typeof res?.data === 'string') {
                    console.log('⚠️ Response is STRING, parsing...')
                    parsedData = JSON.parse(res.data)
                    console.log('✅ Parsed Data:', parsedData)
                }

                let root = null

                if (parsedData?.data?.records) {
                    root = parsedData.data
                } else if (parsedData?.records) {
                    root = parsedData
                } else if (Array.isArray(parsedData?.data)) {
                    root = { records: parsedData.data }
                } else if (Array.isArray(parsedData)) {
                    root = { records: parsedData }
                }

                const list = Array.isArray(root?.records) ? root.records : []

                setKycs(list)
            } catch (err) {
                console.error('❌ Error fetching KYC records:', err)
                setError(err?.message || 'Failed to fetch KYC records')
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

    // ✅ UPDATED: reference-style safe navigation
    const handleView = id => {
        if (!id) return
        router.push({
            pathname: '/kycManagement/behaviouristToClientDetail',
            query: { id },
        })
    }

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
                return (
                    first.includes(nameFilterLower) ||
                    last.includes(nameFilterLower) ||
                    full.includes(nameFilterLower)
                )
            })
            .filter(item => {
                if (!specialityFilterLower) return true
                const species = (item?.pet?.petSpecies || '').toString().toLowerCase()
                return species.includes(specialityFilterLower)
            })
            .filter(item => {
                if (!statusFilterNormalized) return true
                const status = (item?.kycStatus || '').toString()
                return status === statusFilterNormalized
            })

        return filtered.sort((a, b) => {
            const dateA = new Date(a?.updatedAt || a?.createdAt || 0)
            const dateB = new Date(b?.updatedAt || b?.createdAt || 0)
            return sortOrder === 'LATEST' ? dateB - dateA : dateA - dateB
        })
    }, [kycs, nameFilterLower, specialityFilterLower, statusFilterNormalized, sortOrder])

    const visibleKycs = filteredKycs.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    )

    return (
        <>
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label='kyc table'>
                    <TableHead>
                        <TableRow>
                            <TableCell>Owner Name</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Pet Name</TableCell>
                            <TableCell>Pet Species</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align='right'>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align='center'>
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={7} align='center' sx={{ color: 'red' }}>
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : filteredKycs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align='center'>
                                    No records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleKycs.map(item => {
                                const key =
                                    item?.uid ||
                                    item?.id ||
                                    item?.petUid ||
                                    `${item?.pet?.owner?.email || ''}-${item?.pet?.owner?.fullPhoneNumber || ''}`

                                const ownerFirst = item?.pet?.owner?.firstName || ''
                                const ownerLast = item?.pet?.owner?.lastName || ''
                                const ownerName = `${ownerFirst} ${ownerLast}`.trim() || '—'

                                const petName = item?.pet?.petName || '—'
                                const petSpecies = item?.pet?.petSpecies || '—'
                                const email = item?.pet?.owner?.email || '—'
                                const phone = item?.pet?.owner?.fullPhoneNumber || '—'
                                const status = item?.kycStatus || '—'

                                // ✅ UPDATED: reference-style id resolve
                                const idToSend =
                                    item?.uid ||
                                    item?.id ||
                                    item?.petUid

                                return (
                                    <TableRow hover role='checkbox' tabIndex={-1} key={key}>
                                        <TableCell>{ownerName}</TableCell>
                                        <TableCell>{phone}</TableCell>
                                        <TableCell>{email}</TableCell>
                                        <TableCell>{petName}</TableCell>
                                        <TableCell>{petSpecies}</TableCell>
                                        <TableCell>{status}</TableCell>
                                        <TableCell align='right'>
                                            <Button
                                                variant='text'
                                                size='small'
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
                component='div'
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
