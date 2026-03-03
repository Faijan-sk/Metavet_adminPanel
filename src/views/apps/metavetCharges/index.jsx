import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    Box
} from '@mui/material'

import MetavetChargesList from "./roleList/index"
import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import Divider from '@mui/material/Divider'
import PageHeader from 'src/@core/components/page-header'
import useJwt from './../../../enpoints/jwt/useJwt'

function Index() {
    const [charges, setCharges] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCharges = async () => {
            try {
                setLoading(true)
                const response = await useJwt.getAllMetavetCharges()
                const data = response?.data?.data || response?.data || []
                setCharges(data)
            } catch (err) {
                console.error('Failed to fetch charges:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchCharges()
    }, [])

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
                        </Box>
                    }
                />

                <Divider sx={{ m: '0 !important' }} />

                <CardContent>
                    {loading ? (
                        <Typography align='center'>Loading...</Typography>
                    ) : (
                        <MetavetChargesList charges={charges} />
                    )}
                </CardContent>
            </Card>
        </>
    )
}

export default Index