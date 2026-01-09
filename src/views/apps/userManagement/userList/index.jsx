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

const DoctorList = ({
  nameFilter = '',
  phoneFilter = '',
  emailFilter = '',
  sortOrder = 'LATEST'
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
        const response = await jwt.getAllClients()
        const users = response?.data?.data || []

        const filteredUsers = users.filter(user => user.userType === 1)
        setDoctors(filteredUsers)
      } catch (err) {
        setError(err.message || 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // ✅ IMPORTANT FIX: Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [nameFilter, phoneFilter, emailFilter, sortOrder])

  const filteredDoctors = doctors
    .filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      const email = user.email?.toLowerCase() || ''
      const phone = String(user.phoneNumber || '')

      return (
        fullName.includes(nameFilter.toLowerCase()) &&
        email.includes(emailFilter.toLowerCase()) &&
        phone.includes(phoneFilter)
      )
    })
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt)
      const dateB = new Date(b.updatedAt || b.createdAt)
      return sortOrder === 'LATEST' ? dateB - dateA : dateA - dateB
    })

  const handleViewDoctor = uid => {
    router.push(`/userManagement/userProfile?uid=${uid}`)
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell align='right'>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align='center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align='center'>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(user => (
                  <TableRow hover key={user.uid}>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell align='right'>
                      <Button size='small' onClick={() => handleViewDoctor(user.uid)}>
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
        component='div'
        count={filteredDoctors.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={e => {
          setRowsPerPage(+e.target.value)
          setPage(0)
        }}
        rowsPerPageOptions={[10, 25, 100]}
      />
    </>
  )
}

export default DoctorList
