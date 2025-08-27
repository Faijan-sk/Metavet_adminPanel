// ** React Imports
import { useEffect, useState } from 'react'

// ** JWT Hook Import
import useJwt from 'src/enpoints/jwt/useJwt'

// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import Button from '@mui/material/Button'

// Table Columns
const columns = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'licenseNumber', label: 'License Number', minWidth: 150 },
  { id: 'specialization', label: 'Speciality', minWidth: 170 },
  { id: 'experienceYears', label: 'Experience (Years)', minWidth: 150, align: 'center' },
  { id: 'appointmentStatus', label: 'Status', minWidth: 120, align: 'center' },
  { id: 'action', label: 'Action', minWidth: 100, align: 'center' }
]

const TableStickyHeader = () => {
  // ** States
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [pendingDoctors, setPendingDoctors] = useState([])

  const [error, setError] = useState('')

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data } = await useJwt.getPendingDoctor()

        setPendingDoctors(data || [])
      } catch (error) {
        console.error('Error fetching doctors:', error)
        setError(error.message || 'Failed to fetch doctors')
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  console.log('the pending donctor ist :', pendingDoctors)

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label='sticky table'>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column.id} align={column.align || 'left'} sx={{ minWidth: column.minWidth }}>
                  {column.label}
                </TableCell>
              ))}
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
            ) : pendingDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  No Doctors Found
                </TableCell>
              </TableRow>
            ) : (
              pendingDoctors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(doctor => (
                <TableRow hover key={doctor.doctorId}>
                  <TableCell>
                    {doctor.user?.firstName} {doctor.user?.lastName}
                  </TableCell>
                  <TableCell>{doctor.licenseNumber}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell align='center'>{doctor.experienceYears}</TableCell>
                  <TableCell align='center'>{doctor.appointmentStatus}</TableCell>
                  <TableCell align='center'></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component='div'
        count={pendingDoctors.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  )
}

export default TableStickyHeader
