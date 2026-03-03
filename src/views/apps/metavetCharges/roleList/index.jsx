import { useState } from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem' // Naya import
import Select from '@mui/material/Select'     // Naya import
import FormControl from '@mui/material/FormControl'
import CircularProgress from '@mui/material/CircularProgress'
import useJwt from './../../../../enpoints/jwt/useJwt'

const MetavetChargesList = ({ charges = [], refreshData }) => {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [loading, setLoading] = useState(false)
    const [editRowId, setEditRowId] = useState(null)
    const [editData, setEditData] = useState({
        userType: '',
        feesType: '',
        feesValue: ''
    })

    const handleEditClick = (item) => {
        setEditRowId(item.uid)
        setEditData({
            userType: item.userType,
            feesType: item.feesType,
            feesValue: item.feesValue
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditData(prev => ({ ...prev, [name]: value }))
    }

    const handleUpdate = async () => {
        setLoading(true)
        const payload = {
            userType: editData.userType,
            feesType: editData.feesType,
            feesValue: Number(editData.feesValue)
        }

        try {
            const response = await useJwt.updateMetvetCharges(payload)

            if (response && (response.status === 200 || response.status === 201)) {
                setEditRowId(null)
                if (refreshData) refreshData()
                router.refresh();
            }
            window.location.reload();


        } catch (error) {
            // Aapke API error format ke hisaab se handling
            const apiError = error.response?.data
            const errorMessage = apiError?.message || "Something went wrong"
            const statusCode = apiError?.statusCode || 500

            console.error(`Error ${statusCode}:`, errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Role Name</TableCell>
                            <TableCell>Fees Type</TableCell>
                            <TableCell>Metavet Fees</TableCell>
                            <TableCell align='right'>Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {charges.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align='center'>No charges found</TableCell>
                            </TableRow>
                        ) : (
                            charges
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(item => {
                                    const isEditing = editRowId === item.uid

                                    return (
                                        <TableRow hover key={item.uid}>
                                            <TableCell>
                                                <strong>{item.userType}</strong>
                                            </TableCell>

                                            <TableCell>
                                                {isEditing ? (
                                                    <FormControl fullWidth variant="standard">
                                                        <Select
                                                            name="feesType"
                                                            value={editData.feesType}
                                                            onChange={handleInputChange}
                                                            disabled={loading}
                                                            size="small"
                                                        >
                                                            <MenuItem value="percent">Percent</MenuItem>
                                                            <MenuItem value="flat">Flat</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : item.feesType}
                                            </TableCell>

                                            <TableCell>
                                                {isEditing ? (
                                                    <TextField
                                                        size="small"
                                                        variant="standard"
                                                        type="number"
                                                        name="feesValue"
                                                        value={editData.feesValue}
                                                        onChange={handleInputChange}
                                                        disabled={loading}
                                                    />
                                                ) : item.feesValue}
                                            </TableCell>

                                            <TableCell align='right'>
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', alignItems: 'center' }}>
                                                        {loading ? (
                                                            <CircularProgress size={20} />
                                                        ) : (
                                                            <>
                                                                <p
                                                                    className='text-success'
                                                                    style={{ cursor: 'pointer', fontWeight: 'bold', margin: 0 }}
                                                                    onClick={handleUpdate}
                                                                >
                                                                    Save
                                                                </p>
                                                                <p
                                                                    className='text-danger'
                                                                    style={{ cursor: 'pointer', margin: 0 }}
                                                                    onClick={() => setEditRowId(null)}
                                                                >
                                                                    Cancel
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p
                                                        style={{ cursor: 'pointer', margin: 0, fontWeight: '500' }}
                                                        className='text-primary'
                                                        onClick={() => handleEditClick(item)}
                                                    >
                                                        Update
                                                    </p>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component='div'
                count={charges.length}
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

export default MetavetChargesList