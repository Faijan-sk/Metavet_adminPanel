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
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const router = useRouter()

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError('')
        const { data } = await jwt.getAllDoctors()
        // Defensive: data.data might be undefined
        const list = Array.isArray(data?.data) ? data.data : []
        const sortedDoctors = list.sort((a, b) => {
          const dateA = new Date(a?.updatedAt || a?.createdAt || 0)
          const dateB = new Date(b?.updatedAt || b?.createdAt || 0)
          return dateB - dateA
        })
        setDoctors(sortedDoctors)
      } catch (err) {
        setError(err?.message || String(err) || 'Failed to fetch doctors')
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  const handleChangePage = (event, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  // Use doctorUid as primary key / id consistently — fallback to doctorId if not present
  const handleViewDoctor = doctorUidOrId => {
    const id = doctorUidOrId
    router.push(`/doctorManagement/doctorProfile/${id}`)
  }

  // normalize filters to strings and lowercase for safe comparison
  const nameFilterLower = (nameFilter || '').toString().trim().toLowerCase()
  const specialityFilterLower = (specialityFilter || '').toString().trim().toLowerCase()
  const statusFilterNormalized = (statusFilter || '').toString().trim()

  // memoize filtered + sorted list
  const filteredDoctors = useMemo(() => {
    const filtered = doctors
      .filter(doc => {
        // Safely access names
        const first = (doc?.firstName || '').toString().toLowerCase()
        const last = (doc?.lastName || '').toString().toLowerCase()
        if (!nameFilterLower) return true
        return first.includes(nameFilterLower) || last.includes(nameFilterLower)
      })
      .filter(doc => {
        const spec = (doc?.specialization || doc?.businessName || '').toString().toLowerCase()
        if (!specialityFilterLower) return true
        return spec.includes(specialityFilterLower)
      })
      .filter(doc => {
        if (!statusFilterNormalized) return true
        // Compare either by exact match or case-insensitive
        const status = (doc?.doctorProfileStatus || '').toString()
        return status === statusFilterNormalized
      })

    // sort according to sortOrder prop
    return filtered.sort((a, b) => {
      const dateA = new Date(a?.updatedAt || a?.createdAt || 0)
      const dateB = new Date(b?.updatedAt || b?.createdAt || 0)
      return sortOrder === 'LATEST' ? dateB - dateA : dateA - dateB
    })
  }, [doctors, nameFilterLower, specialityFilterLower, statusFilterNormalized, sortOrder])

  // slice for pagination
  const visibleDoctors = filteredDoctors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Legal Name</TableCell>
              <TableCell>Business Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: 'red' }}>
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No doctors found
                </TableCell>
              </TableRow>
            ) : (
              visibleDoctors.map(doctor => {
                const key = doctor?.doctorUid || doctor?.doctorId || `${doctor?.email}-${doctor?.phoneNumber}`
                const displayName = `${doctor?.firstName || ''} ${doctor?.lastName || ''}`.trim()
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={key}>
                    <TableCell>{displayName || '—'}</TableCell>
                    <TableCell>{doctor?.specialization || doctor?.businessName || '—'}</TableCell>
                    <TableCell>{doctor?.email || '—'}</TableCell>
                    <TableCell>{doctor?.phoneNumber || '—'}</TableCell>
                    <TableCell>{doctor?.doctorProfileStatus || '—'}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleViewDoctor(doctor?.doctorUid || doctor?.doctorId)}
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
        count={filteredDoctors.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  )
}

export default DoctorList
