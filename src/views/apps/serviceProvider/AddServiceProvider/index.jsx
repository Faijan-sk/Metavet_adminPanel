// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** useJwt
import userJwt from './../../../../enpoints/jwt/useJwt'
import { useState } from 'react'

const FormLayoutsIcons = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+91',
        phoneNumber: '',
        userType: 1,
        serviceType: 'Pet_Groomer'
    })

    const handleChange = e => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async e => {
        e.preventDefault()

        const payload = {
            email: formData.email,
            countryCode: formData.countryCode,
            phoneNumber: formData.phoneNumber,
            firstName: formData.firstName,
            lastName: formData.lastName,
            userType: Number(formData.userType),
            serviceType: formData.serviceType
        }

        console.log('Payload →', payload)

        // API call
        // await userJwt.register(payload)
    }

    return (
        <Card>
            <CardHeader title='Create Client' />
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={5}>
                        {/* First Name */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label='First Name'
                                name='firstName'
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder='Asnother'
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='tabler:user' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        {/* Last Name */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label='Last Name'
                                name='lastName'
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder='User'
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='tabler:user' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        {/* Email */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type='email'
                                label='Email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                placeholder='uad@test.com'
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='tabler:mail' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        {/* Country Code */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label='Country Code'
                                name='countryCode'
                                value={formData.countryCode}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='tabler:flag' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        {/* Phone Number */}
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label='Phone Number'
                                name='phoneNumber'
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder='1141962850'
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='tabler:phone' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        {/* User Type */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label='User Type'
                                name='userType'
                                value={formData.userType}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='tabler:id' />
                                        </InputAdornment>
                                    )
                                }}
                            >
                                <MenuItem value={1}>Client</MenuItem>
                                <MenuItem value={2}>Doctor</MenuItem>
                                <MenuItem value={3}>Service Provider</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Service Type */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label='Service Type'
                                name='serviceType'
                                value={formData.serviceType}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='tabler:briefcase' />
                                        </InputAdornment>
                                    )
                                }}
                            >
                                <MenuItem value='Pet_Groomer'>Pet Groomer</MenuItem>
                                <MenuItem value='Pet_Walker'>Pet Walker</MenuItem>
                                <MenuItem value='Pet_Behaviourist'>Pet Behaviourist</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Submit */}
                        <Grid item xs={12}>
                            <Button type='submit' variant='contained' size='large'>
                                Create Client
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    )
}

export default FormLayoutsIcons
