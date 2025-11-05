// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Step from '@mui/material/Step'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import MenuItem from '@mui/material/MenuItem'
import StepLabel from '@mui/material/StepLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import jwt from '../../../../enpoints/jwt/useJwt'
import axios from 'axios'

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Components Imports
import StepperCustomDot from './StepperCustomDot'

// ** Styled Components
import StepperWrapper from 'src/@core/styles/mui/stepper'

const steps = [
  {
    title: 'Personal Information',
    subtitle: 'Enter your Basic Details'
  },
  {
    title: 'Qualification Info',
    subtitle: 'Setup Information'
  }
]

const defaultAccountValues = {
  'first-name': '',
  'last-name': '',
  mobile: '',
  email: '',
  countryCode: '+91',
  userType: 2
}

const defaultPersonalValues = {
  experienceYears: '',
  hospitalClinicName: '',
  hospitalClinicAddress: '',
  pincode: '',
  address: '',
  country: '',
  city: '',
  state: '',
  bio: '',
  consultationFee: '',
  isAvailable: true,
  gender: '',
  dateOfBirth: '',
  licenseNumber: '',
  licenseIssueDate: '',
  licenseExpiryDate: '',
  qualification: '',
  specialization: '',
  previousWorkplace: '',
  joiningDate: '',
  employmentType: '',
  isActive: true,
  emergencyContactNumber: ''
}

const accountSchema = yup.object().shape({
  'first-name': yup.string().required('First name is required'),
  'last-name': yup.string().required('Last name is required'),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^\d+$/, 'Mobile number must contain only digits')
    .min(7, 'Mobile number is too short'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  countryCode: yup.string().required('Country code is required'),
  userType: yup.number().required('User type is required')
})

const personalSchema = yup.object().shape({
  experienceYears: yup
    .number()
    .typeError('Experience must be a number')
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years')
    .required('Experience is required'),

  hospitalClinicName: yup
    .string()
    .min(3, 'Hospital/Clinic name must be at least 3 characters')
    .max(150, 'Hospital/Clinic name is too long')
    .nullable(),

  hospitalClinicAddress: yup
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(300, 'Address is too long')
    .nullable(),

  pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits')
    .nullable(),

  address: yup.string().min(5, 'Address is required').required('Address is required'),

  country: yup.string().required('Country is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),

  bio: yup.string().max(500, 'Bio cannot exceed 500 characters').nullable(),

  consultationFee: yup
    .number()
    .typeError('Consultation fee must be a number')
    .min(0, 'Consultation fee cannot be negative')
    .max(50000, 'Consultation fee cannot exceed 50000')
    .required('Consultation fee is required'),

  gender: yup.string().oneOf(['MALE', 'FEMALE', 'OTHER']).required('Gender is required'),

  dateOfBirth: yup.date().required('Date of birth is required'),

  licenseNumber: yup
    .string()
    .matches(/^[A-Z0-9]{6,20}$/, 'License number must be 6-20 alphanumeric uppercase')
    .required('License number is required'),

  licenseIssueDate: yup.date().required('License issue date is required'),
  licenseExpiryDate: yup.date().nullable(),

  qualification: yup.string().min(2, 'Qualification is required').required('Qualification is required'),
  specialization: yup.string().min(3, 'Specialization is required').required('Specialization is required'),

  previousWorkplace: yup.string().nullable(),

  joiningDate: yup.date().required('Joining date is required'),

  employmentType: yup.string().oneOf(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY']).required('Employment type is required'),

  isActive: yup.boolean(),

  emergencyContactNumber: yup
    .string()
    .matches(/^\d{7,15}$/, 'Enter a valid contact number')
    .nullable()
})

const StepperLinearWithValidation = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [createdUserId, setCreatedUserId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    reset: accountReset,
    control: accountControl,
    handleSubmit: handleAccountSubmit,
    formState: { errors: accountErrors }
  } = useForm({
    defaultValues: defaultAccountValues,
    resolver: yupResolver(accountSchema)
  })

  const {
    reset: personalReset,
    control: personalControl,
    handleSubmit: handlePersonalSubmit,
    formState: { errors: personalErrors }
  } = useForm({
    defaultValues: defaultPersonalValues,
    resolver: yupResolver(personalSchema)
  })

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    accountReset(defaultAccountValues)
    personalReset(defaultPersonalValues)
    setCreatedUserId(null)
  }

  // STEP 1: Register User API
  const onAccountSubmit = async accountValues => {
    setIsSubmitting(true)
    try {
      const payload = {
        email: accountValues.email,
        firstName: accountValues['first-name'],
        lastName: accountValues['last-name'],
        countryCode: accountValues.countryCode,
        phoneNumber: accountValues.mobile,
        userType: Number(accountValues.userType)
      }

      console.log('Register payload ->', payload)

      const res = await jwt.register(payload)
      const responseData = res.data

      console.log('Register response ->', responseData)

      if (!responseData || !responseData.data || !responseData.data.uid) {
        throw new Error('Invalid register response - uid not found')
      }

      const uid = responseData.data.uid
      const token = responseData.data.token

      // Store the uid for next step
      setCreatedUserId(uid)
      console.log('Stored userId:', uid)

      // Save token if available
      if (token) {
        try {
          if (typeof jwt.setToken === 'function') {
            jwt.setToken(token)
          } else {
            localStorage.setItem(jwt.jwtConfig.storageTokenKeyName, token)
          }
          if (axios && axios.defaults) {
            axios.defaults.headers.common.Authorization = `${jwt.jwtConfig.tokenType} ${token}`
          }
        } catch (innerErr) {
          console.warn('Token storage warning:', innerErr)
        }
      }

      toast.success('User registered successfully! Please complete your profile.')
      
      // Move to next step
      setActiveStep(prev => prev + 1)
    } catch (error) {
      console.error('Register error:', error)
      
      // Extract error message from nested structure
      let errorMessage = 'Failed to register user'
      
      if (error?.response?.data) {
        const errorData = error.response.data
        
        // Check for nested errors object (like {errors: {phoneNumber: "message"}})
        if (errorData.errors && typeof errorData.errors === 'object') {
          // Get first error from errors object
          const firstErrorKey = Object.keys(errorData.errors)[0]
          errorMessage = errorData.errors[firstErrorKey]
        } 
        // Check for direct message
        else if (errorData.message) {
          errorMessage = errorData.message
        }
        // If errorData is string
        else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } 
      // Fallback to error.message
      else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // STEP 2: Create Doctor Profile API
  const onPersonalSubmit = async personalValues => {
    if (!createdUserId) {
      toast.error('User ID not found! Please go back and complete registration first.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        userId: Number(createdUserId),
        experienceYears: Number(personalValues.experienceYears) || 0,
        hospitalClinicName: personalValues.hospitalClinicName || '',
        hospitalClinicAddress: personalValues.hospitalClinicAddress || '',
        address: personalValues.address || '',
        pincode: personalValues.pincode || '',
        city: personalValues.city || '',
        state: personalValues.state || '',
        country: personalValues.country || '',
        bio: personalValues.bio || '',
        consultationFee: Number(personalValues.consultationFee) || 0,
        isActive: Boolean(personalValues.isActive),
        gender: personalValues.gender || '',
        dateOfBirth: personalValues.dateOfBirth || null,
        licenseNumber: personalValues.licenseNumber || '',
        licenseIssueDate: personalValues.licenseIssueDate || null,
        licenseExpiryDate: personalValues.licenseExpiryDate || null,
        qualification: personalValues.qualification || '',
        specialization: personalValues.specialization || '',
        previousWorkplace: personalValues.previousWorkplace || '',
        joiningDate: personalValues.joiningDate || null,
        employmentType: personalValues.employmentType || '',
        emergencyContactNumber: personalValues.emergencyContactNumber || ''
      }

      console.log('Create doctor payload ->', payload)

      const res = await jwt.createDoctor(payload)
      const data = res.data

      console.log('Doctor created response ->', data)

      toast.success('Doctor profile created successfully!')
      
      // Move to completion step
      setActiveStep(prev => prev + 1)
    } catch (error) {
      console.error('Create doctor error:', error)
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        'Failed to create doctor profile'
      toast.error(`Profile creation failed: ${serverMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <form key={0} onSubmit={handleAccountSubmit(onAccountSubmit)}>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {steps[0].title}
                </Typography>
                <Typography variant='caption' component='p'>
                  {steps[0].subtitle}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Controller
                    name='first-name'
                    control={accountControl}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        value={value}
                        label='First Name'
                        onChange={onChange}
                        placeholder='Leonard'
                        error={Boolean(accountErrors['first-name'])}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {accountErrors['first-name'] && (
                    <FormHelperText sx={{ color: 'error.main' }}>
                      {accountErrors['first-name'].message}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Controller
                    name='last-name'
                    control={accountControl}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        value={value}
                        label='Last Name'
                        onChange={onChange}
                        placeholder='Carter'
                        error={Boolean(accountErrors['last-name'])}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {accountErrors['last-name'] && (
                    <FormHelperText sx={{ color: 'error.main' }}>
                      {accountErrors['last-name'].message}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <Controller
      name='countryCode'
      control={accountControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value}
          label='Country Code'
          placeholder='+91'
          disabled={isSubmitting}
          onChange={e => {
            const inputValue = e.target.value

            // Allow only + at start followed by digits, max 4 chars (+999)
            if (/^\+?\d{0,3}$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          onKeyPress={e => {
            // Allow only digits and + (only at start)
            const char = e.key
            const currentValue = e.target.value
            
            // Block everything except digits and +
            if (!/[\d+]/.test(char)) {
              e.preventDefault()
              return
            }
            
            // Allow + only at the beginning and only once
            if (char === '+' && (currentValue.length > 0 || currentValue.includes('+'))) {
              e.preventDefault()
            }
          }}
          inputProps={{
            maxLength: 4 // +999 maximum
          }}
        />
      )}
    />
    {accountErrors.countryCode && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {accountErrors.countryCode.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>
<Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <Controller
      name='mobile'
      control={accountControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value}
          label='Mobile Number'
          placeholder='1234567890'
          error={Boolean(accountErrors.mobile)}
          disabled={isSubmitting}
          onChange={e => {
            const inputValue = e.target.value

            // Allow only digits, max 10
            if (/^\d{0,10}$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          onKeyPress={e => {
            // Block everything except digits
            if (!/\d/.test(e.key)) {
              e.preventDefault()
            }
          }}
          inputProps={{
            maxLength: 10
          }}
        />
      )}
    />
    {accountErrors.mobile && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {accountErrors.mobile.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>

            <Grid item xs={12}>
  <FormControl fullWidth>
    <Controller
      name='email'
      control={accountControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          type='email'
          value={value}
          label='Email'
          placeholder='carterleonard@gmail.com'
          error={Boolean(accountErrors.email)}
          disabled={isSubmitting}
          onChange={e => {
            const inputValue = e.target.value

            // Allow only alphanumeric, @, and .
            if (/^[a-zA-Z0-9@.]*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          onKeyPress={e => {
            const char = e.key

            // Allow only letters, numbers, @, and .
            if (!/[a-zA-Z0-9@.]/.test(char)) {
              e.preventDefault()
            }
          }}
        />
      )}
    />
    {accountErrors.email && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {accountErrors.email.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button size='large' variant='outlined' color='secondary' disabled>
                  Back
                </Button>
                <Button 
                  size='large' 
                  type='submit' 
                  variant='contained'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Next'}
                </Button>
              </Grid>
            </Grid>
          </form>
        )

      case 1:
        return (
          <form key={1} onSubmit={handlePersonalSubmit(onPersonalSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {steps[1].title}
                </Typography>
                <Typography variant='caption' component='p'>
                  {steps[1].subtitle}
                </Typography>
                {/* {createdUserId && (
                  <Typography variant='caption' sx={{ color: 'success.main', display: 'block', mt: 1 }}>
                    User ID: {createdUserId}
                  </Typography>
                )} */}
              </Grid>

             <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <Controller
      name='experienceYears'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value}
          label='Experience (years)'
          placeholder='5'
          error={Boolean(personalErrors.experienceYears)}
          disabled={isSubmitting}
          onChange={e => {
            const inputValue = e.target.value

            // Allow only numbers 0-30
            if (/^\d{0,2}$/.test(inputValue)) {
              const numValue = parseInt(inputValue, 10)
              
              // Allow empty or valid range (0-30)
              if (inputValue === '' || (numValue >= 0 && numValue <= 30)) {
                onChange(inputValue)
              }
            }
          }}
          onKeyPress={e => {
            // Block everything except digits
            if (!/\d/.test(e.key)) {
              e.preventDefault()
            }
          }}
          inputProps={{
            maxLength: 2
          }}
        />
      )}
    />
    {personalErrors.experienceYears && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.experienceYears.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>

              <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <Controller
      name='consultationFee'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value}
          label='Consultation Fee'
          placeholder='500'
          error={Boolean(personalErrors.consultationFee)}
          disabled={isSubmitting}
          onChange={e => {
            const inputValue = e.target.value

            // Allow only numbers (digits only, no decimals or special chars)
            if (/^\d*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          onKeyPress={e => {
            // Block everything except digits
            if (!/\d/.test(e.key)) {
              e.preventDefault()
            }
          }}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*'
          }}
        />
      )}
    />
    {personalErrors.consultationFee && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.consultationFee.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>

              <Grid item xs={12}>
  <FormControl fullWidth>
    <Controller
      name='hospitalClinicName'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField 
          value={value} 
          label='Hospital / Clinic Name' 
          disabled={isSubmitting}
          onChange={e => {
            const inputValue = e.target.value

            // Allow only alphabets, numbers, comma, space, and dot
            if (/^[A-Za-z0-9,. ]*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          onKeyPress={e => {
            const char = e.key

            // Allow only letters, numbers, comma, space, and dot
            if (!/[A-Za-z0-9,. ]/.test(char)) {
              e.preventDefault()
            }
          }}
        />
      )}
    />
    {personalErrors.hospitalClinicName && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.hospitalClinicName.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>

           <Grid item xs={12}>
  <FormControl fullWidth>
    <Controller
      name='hospitalClinicAddress'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value}
          label='Hospital / Clinic Address'
          multiline
          minRows={2}
          disabled={isSubmitting}
          onChange={e => {
            const inputValue = e.target.value

            // Allow only alphabets, numbers, comma, space, and dot
            if (/^[A-Za-z0-9,. ]*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          onKeyPress={e => {
            const char = e.key

            // Allow only letters, numbers, comma, space, and dot
            if (!/[A-Za-z0-9,. ]/.test(char)) {
              e.preventDefault()
            }
          }}
        />
      )}
    />
    {personalErrors.hospitalClinicAddress && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.hospitalClinicAddress.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>

              <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <Controller
      name='address'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField 
          value={value} 
          label='Address' 
          disabled={isSubmitting}
          onChange={e => {
            const inputValue = e.target.value

            // Allow only alphabets, numbers, comma, space, and dot
            if (/^[A-Za-z0-9,. ]*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          onKeyPress={e => {
            const char = e.key

            // Allow only letters, numbers, comma, space, and dot
            if (!/[A-Za-z0-9,. ]/.test(char)) {
              e.preventDefault()
            }
          }}
        />
      )}
    />
    {personalErrors.address && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.address.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>

              <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <Controller
      name='pincode'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField 
          value={value} 
          label='Pincode' 
          placeholder='123456'
          disabled={isSubmitting}
          onChange={e => {
            const inputValue = e.target.value

            // Allow only digits, max 6
            if (/^\d{0,6}$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          onKeyPress={e => {
            // Block everything except digits
            if (!/\d/.test(e.key)) {
              e.preventDefault()
            }
          }}
          inputProps={{
            maxLength: 6
          }}
        />
      )}
    />
    {personalErrors.pincode && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.pincode.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>

              <Grid item xs={12} sm={4}>
  <FormControl fullWidth>
    <Controller
      name='country'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField 
          value={value} 
          label='Country' 
          disabled={isSubmitting}
          onChange={e => {
            const inputValue = e.target.value

            // Allow only alphabets and spaces
            if (/^[A-Za-z\s]*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          onKeyPress={e => {
            const char = e.key

            // Allow only letters and space
            if (!/[A-Za-z\s]/.test(char)) {
              e.preventDefault()
            }
          }}
        />
      )}
    />
    {personalErrors.country && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.country.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>

             <Grid item xs={12} sm={4}>
  <FormControl fullWidth>
    <Controller
      name='city'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value}
          label='City'
          onChange={(e) => {
            const inputValue = e.target.value
            // Allow only alphabets (A–Z or a–z)
            if (/^[A-Za-z]*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          disabled={isSubmitting}
        />
      )}
    />
    {personalErrors.city && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.city.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>


              <Grid item xs={12} sm={4}>
  <FormControl fullWidth>
    <Controller
      name='state'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value}
          label='State'
          onChange={(e) => {
            const inputValue = e.target.value
            // Allow only alphabets (A–Z or a–z)
            if (/^[A-Za-z]*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          disabled={isSubmitting}
        />
      )}
    />
    {personalErrors.state && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.state.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>


              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id='gender-label' error={Boolean(personalErrors.gender)}>
                    Gender
                  </InputLabel>
                  <Controller
                    name='gender'
                    control={personalControl}
                    render={({ field: { value, onChange } }) => (
                      <Select 
                        value={value} 
                        onChange={onChange} 
                        labelId='gender-label' 
                        label='Gender'
                        disabled={isSubmitting}
                      >
                        <MenuItem value='MALE'>Male</MenuItem>
                        <MenuItem value='FEMALE'>Female</MenuItem>
                        <MenuItem value='OTHER'>Other</MenuItem>
                      </Select>
                    )}
                  />
                  {personalErrors.gender && (
                    <FormHelperText sx={{ color: 'error.main' }}>
                      {personalErrors.gender.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name='dateOfBirth'
                  control={personalControl}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label='Date of Birth'
                      type='date'
                      value={value}
                      onChange={onChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      disabled={isSubmitting}
                    />
                  )}
                />
                {personalErrors.dateOfBirth && (
                  <FormHelperText sx={{ color: 'error.main' }}>
                    {personalErrors.dateOfBirth.message}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name='licenseIssueDate'
                  control={personalControl}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label='License Issue Date'
                      type='date'
                      value={value}
                      onChange={onChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      disabled={isSubmitting}
                    />
                  )}
                />
                {personalErrors.licenseIssueDate && (
                  <FormHelperText sx={{ color: 'error.main' }}>
                    {personalErrors.licenseIssueDate.message}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='licenseExpiryDate'
                  control={personalControl}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label='License Expiry Date'
                      type='date'
                      value={value}
                      onChange={onChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <Controller
      name='licenseNumber'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value ?? ''}
          label='License Number'
          onChange={(e) => {
            // take typed value, convert to uppercase
            const next = String(e.target.value).toUpperCase();
            // allow only A-Z and 0-9 (no spaces, no special chars)
            if (/^[A-Z0-9]*$/.test(next)) {
              onChange(next);
            }
          }}
          disabled={isSubmitting}
        />
      )}
    />
    {personalErrors.licenseNumber && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.licenseNumber.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>


              <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <Controller
      name='qualification'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value ?? ''}
          label='Qualification'
          onChange={(e) => {
            const inputValue = e.target.value
            // Allow only alphabets, commas, and spaces
            if (/^[A-Za-z,\s]*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          disabled={isSubmitting}
        />
      )}
    />
    {personalErrors.qualification && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.qualification.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>


             <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <Controller
      name='specialization'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value ?? ''}
          label='Specialization'
          onChange={(e) => {
            const inputValue = e.target.value
            // Allow only alphabets, commas, and spaces
            if (/^[A-Za-z,\s]*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          disabled={isSubmitting}
        />
      )}
    />
    {personalErrors.specialization && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.specialization.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>


              <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <Controller
      name='previousWorkplace'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value ?? ''}
          label='Previous Workplace'
          onChange={(e) => {
            const inputValue = e.target.value
            // Allow only alphabets, commas, and spaces
            if (/^[A-Za-z,\s]*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          disabled={isSubmitting}
        />
      )}
    />
    {personalErrors.previousWorkplace && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.previousWorkplace.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>


              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='employment-type-label' error={Boolean(personalErrors.employmentType)}>
                    Employment Type
                  </InputLabel>
                  <Controller
                    name='employmentType'
                    control={personalControl}
                    render={({ field: { value, onChange } }) => (
                      <Select 
                        value={value} 
                        onChange={onChange} 
                        labelId='employment-type-label'
                        label='Employment Type'
                        disabled={isSubmitting}
                      >
                        <MenuItem value='FULL_TIME'>Full Time</MenuItem>
                        <MenuItem value='PART_TIME'>Part Time</MenuItem>
                        <MenuItem value='CONTRACT'>Contract</MenuItem>
                        <MenuItem value='TEMPORARY'>Temporary</MenuItem>
                      </Select>
                    )}
                  />
                  {personalErrors.employmentType && (
                    <FormHelperText sx={{ color: 'error.main' }}>
                      {personalErrors.employmentType.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='joiningDate'
                  control={personalControl}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label='Joining Date'
                      type='date'
                      value={value}
                      onChange={onChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      disabled={isSubmitting}
                    />
                  )}
                />
                {personalErrors.joiningDate && (
                  <FormHelperText sx={{ color: 'error.main' }}>
                    {personalErrors.joiningDate.message}
                  </FormHelperText>
                )}
              </Grid>

             <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <Controller
      name='emergencyContactNumber'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value ?? ''}
          label='Emergency Contact'
          onChange={(e) => {
            const inputValue = e.target.value
            // Allow only numbers and max length = 10
            if (/^\d{0,10}$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          inputProps={{ maxLength: 10 }}
          disabled={isSubmitting}
        />
      )}
    />
    {personalErrors.emergencyContactNumber && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.emergencyContactNumber.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>


             <Grid item xs={12}>
  <FormControl fullWidth>
    <Controller
      name='bio'
      control={personalControl}
      render={({ field: { value, onChange } }) => (
        <TextField
          value={value ?? ''}
          label='Bio'
          onChange={(e) => {
            const inputValue = e.target.value
            // Allow only alphabets, numbers, commas, and spaces
            if (/^[A-Za-z0-9,\s]*$/.test(inputValue)) {
              onChange(inputValue)
            }
          }}
          multiline
          minRows={3}
          placeholder='Tell us about yourself...'
          disabled={isSubmitting}
        />
      )}
    />
    {personalErrors.bio && (
      <FormHelperText sx={{ color: 'error.main' }}>
        {personalErrors.bio.message}
      </FormHelperText>
    )}
  </FormControl>
</Grid>


              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  size='large' 
                  variant='outlined' 
                  color='secondary' 
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button 
                  size='large' 
                  type='submit' 
                  variant='contained'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Profile...' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </form>
        )
      default:
        return null
    }
  }

  const renderContent = () => {
    if (activeStep === steps.length) {
      return (
        <Fragment>
          <Typography variant='h6' sx={{ mb: 2 }}>
            All steps are completed!
          </Typography>
          <Typography variant='body2' sx={{ mb: 4 }}>
            Doctor profile has been created successfully.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button size='large' variant='contained' onClick={handleReset}>
              Register Another Doctor
            </Button>
          </Box>
        </Fragment>
      )
    } else {
      return getStepContent(activeStep)
    }
  }

  return (
    <Card>
      <CardContent>
        <StepperWrapper>
          <Stepper activeStep={activeStep}>
            {steps.map((step, index) => {
              const labelProps = {}
              if (index === activeStep) {
                labelProps.error = false
                if (
                  (accountErrors.email ||
                    accountErrors['first-name'] ||
                    accountErrors['last-name'] ||
                    accountErrors.mobile) &&
                  activeStep === 0
                ) {
                  labelProps.error = true
                } else if (
                  (personalErrors.experienceYears ||
                    personalErrors.consultationFee ||
                    personalErrors.gender ||
                    personalErrors.qualification) &&
                  activeStep === 1
                ) {
                  labelProps.error = true
                } else {
                  labelProps.error = false
                }
              }

              return (
                <Step key={index}>
                  <StepLabel {...labelProps} StepIconComponent={StepperCustomDot}>
                    <div className='step-label'>
                      <Typography className='step-number'>{`0${index + 1}`}</Typography>
                      <div>
                        <Typography className='step-title'>{step.title}</Typography>
                        <Typography className='step-subtitle'>{step.subtitle}</Typography>
                      </div>
                    </div>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </StepperWrapper>
      </CardContent>

      <Divider sx={{ m: '0 !important' }} />

      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}

export default StepperLinearWithValidation