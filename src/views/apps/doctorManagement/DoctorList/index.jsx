import { useState, useEffect } from 'react'
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

const DoctorList = ({ nameFilter, specialityFilter, statusFilter, sortOrder }) => {
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
        setError(null)
        const { data } = await jwt.getAllDoctors()
        const sortedDoctors = (data.data || []).sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt)
          const dateB = new Date(b.updatedAt || b.createdAt)
          return dateB - dateA
        })
        setDoctors(sortedDoctors)
      } catch (err) {
        setError(err.message || 'Failed to fetch doctors')
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

  const handleViewDoctor = doctorId => router.push(`/doctorManagement/doctorProfile/${doctorId}`)

  // ** Apply live filtering and sorting
  const filteredDoctors = doctors
    .filter(
      doc =>
        doc.firstName.toLowerCase().includes(nameFilter.toLowerCase()) ||
        doc.lastName.toLowerCase().includes(nameFilter.toLowerCase())
    )
    .filter(doc => doc.specialization.toLowerCase().includes(specialityFilter.toLowerCase()))
    .filter(doc => (statusFilter ? doc.doctorProfileStatus === statusFilter : true))
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt)
      const dateB = new Date(b.updatedAt || b.createdAt)
      return sortOrder === 'LATEST' ? dateB - dateA : dateA - dateB
    })

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label='sticky table'>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Specialization</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align='right'>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ color: 'red' }}>
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  No doctors found
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(doctor => (
                <TableRow hover role='checkbox' tabIndex={-1} key={doctor.doctorUid}>
                  <TableCell>
                    {doctor.firstName} {doctor.lastName}
                  </TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>{doctor.phoneNumber}</TableCell>
                  <TableCell>{doctor.doctorProfileStatus}</TableCell>
                  <TableCell align='right'>
                    <Button variant='text' size='small' onClick={() => handleViewDoctor(doctor.doctorId)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component='div'
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
