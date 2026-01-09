// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** useJwt
import userJwt from './../../../../enpoints/jwt/useJwt'
import { useState } from 'react'
import { useRouter } from 'next/router'   // ✅ correct import

const FormLayoutsIcons = () => {
  const router = useRouter()               // ✅ initialize router

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    userType: 1
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
      userType: Number(formData.userType)
    }

    try {
      await userJwt.register(payload)   // ✅ API call success
      router.push('/userManagement') // ✅ redirect after success
    } catch (error) {
      console.error(error)
    }
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
                placeholder='Asnother'
                onChange={e => {
                  const value = e.target.value
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    handleChange(e)
                  }
                }}
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
                placeholder='User'
                onChange={e => {
                  const value = e.target.value
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    handleChange(e)
                  }
                }}
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
                placeholder='uad@test.com'
                onChange={e => {
                  const value = e.target.value
                  if (/^[a-zA-Z0-9@._-]*$/.test(value)) {
                    handleChange(e)
                  }
                }}
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
                onChange={e => {
                  const value = e.target.value
                  if (/^\+?\d{0,3}$/.test(value)) {
                    handleChange(e)
                  }
                }}
                placeholder='+91'
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
                placeholder='1141962850'
                onChange={e => {
                  const value = e.target.value
                  if (/^\d{0,10}$/.test(value)) {
                    handleChange(e)
                  }
                }}
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='tabler:phone' />
                    </InputAdornment>
                  )
                }}
              />
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
