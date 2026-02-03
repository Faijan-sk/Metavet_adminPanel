import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TextField,
    Button,
    Box
} from '@mui/material'

import UserList from "./roleList/index"
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import Divider from '@mui/material/Divider'
import PageHeader from 'src/@core/components/page-header'

function Index() {
    const router = useRouter()

    const [nameFilter, setNameFilter] = useState('')
    const [phoneFilter, setPhoneFilter] = useState('')
    const [emailFilter, setEmailFilter] = useState('')
    const [sortOrder, setSortOrder] = useState('LATEST')

    return (
        <>
            <Grid sx={{ mb: 4 }}>
                <PageHeader
                    title={
                        <Typography variant='h5'>
                            <MuiLink target='_blank'>
                                Metavet Charges
                            </MuiLink>
                        </Typography>
                    }
                    subtitle={<Typography variant='body2'>All Charges Details</Typography>}
                />
            </Grid>

            <Card>
                <CardHeader
                    title={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant='h6'>Role List</Typography>
                            {/* <Button
                                variant='contained'
                                onClick={() => router.push('/userManagement/addUser/')}
                            >
                                + Add Client
                            </Button> */}
                        </Box>
                    }
                />


                <Divider sx={{ m: '0 !important' }} />

                <CardContent>
                    <UserList
                        nameFilter={nameFilter}
                        phoneFilter={phoneFilter}
                        emailFilter={emailFilter}
                        sortOrder={sortOrder}
                    />
                </CardContent>
            </Card>
        </>
    )
}

export default Index
