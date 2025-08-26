// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Radio from '@mui/material/Radio'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Accordion from '@mui/material/Accordion'
import TextField from '@mui/material/TextField'
import FormLabel from '@mui/material/FormLabel'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import Payment from 'payment'
import Cards from 'react-credit-cards'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Component Imports
import CardWrapper from 'src/@core/styles/libs/react-credit-cards'

// ** Util Import
import { formatCVC, formatExpirationDate, formatCreditCardNumber } from 'src/@core/utils/format'

// ** Styles Import
import 'react-credit-cards/es/styles-compiled.css'

// Styled component for the Box wrappers in Delivery Options' accordion
const BoxWrapper = styled(Box)(({ theme }) => ({
  borderWidth: 1,
  display: 'flex',
  cursor: 'pointer',
  borderStyle: 'solid',
  padding: theme.spacing(5),
  borderColor: theme.palette.divider,
  '&:first-of-type': {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius
  },
  '&:last-of-type': {
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius
  }
}))

const FormLayoutsCollapsible = () => {
  // ** States
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')
  const [focus, setFocus] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [option, setOption] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [expanded, setExpanded] = useState('panel1')

  // Form data states - Basic Details
  const [basicDetails, setBasicDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    countryCode: '+1'
  })

  // Qualification form state - Single object
  const [qualificationDetails, setQualificationDetails] = useState({
    specialization: '',
    licenseNumber: '',
    licenseIssueDate: '',
    licenseExpiryDate: '',
    experienceYears: '',
    qualification: '',
    hospitalClinicName: '',
    hospitalClinicAddress: '',
    pincode: '',
    address: '',
    city: '',
    state: '',
    country: '',
    bio: '',
    consultationFee: '',
    gender: '',
    dateOfBirth: '',
    emergencyContactNumber: '',
    joiningDate: '',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME'
  })

  // Helper functions to update form fields
  const updateBasicDetails = (field, value) => {
    setBasicDetails(prev => ({ ...prev, [field]: value }))
  }

  const updateQualificationDetails = (field, value) => {
    setQualificationDetails(prev => ({ ...prev, [field]: value }))
  }

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const handleBlur = () => setFocus('')

  const handleInputChange = ({ target }) => {
    if (target.name === 'number') {
      target.value = formatCreditCardNumber(target.value, Payment)
      setCardNumber(target.value)
    } else if (target.name === 'expiry') {
      target.value = formatExpirationDate(target.value)
      setExpiry(target.value)
    } else if (target.name === 'cvc') {
      target.value = formatCVC(target.value, cardNumber, Payment)
      setCvc(target.value)
    }
  }

  const resetBasicDetails = () => {
    setBasicDetails({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      countryCode: '+1'
    })
  }

  const resetQualificationForm = () => {
    setQualificationDetails({
      specialization: '',
      licenseNumber: '',
      licenseIssueDate: '',
      licenseExpiryDate: '',
      experienceYears: '',
      qualification: '',
      hospitalClinicName: '',
      hospitalClinicAddress: '',
      pincode: '',
      address: '',
      city: '',
      state: '',
      country: '',
      bio: '',
      consultationFee: '',
      gender: '',
      dateOfBirth: '',
      emergencyContactNumber: '',
      joiningDate: '',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME'
    })
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary
          expandIcon={<Icon icon='tabler:chevron-down' />}
          id='form-layouts-collapsible-header-1'
          aria-controls='form-layouts-collapsible-content-1'
        >
          <Typography variant='subtitle1' sx={{ fontWeight: 500 }}>
            Basic Details
          </Typography>
        </AccordionSummary>
        <Divider sx={{ m: '0 !important' }} />
        <AccordionDetails sx={{ pt: 6, pb: 6 }}>
          <Grid container spacing={5}>
            {/* Name Row */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='First Name'
                placeholder='Enter your first name'
                value={basicDetails.firstName}
                onChange={e => updateBasicDetails('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Last Name'
                placeholder='Enter your last name'
                value={basicDetails.lastName}
                onChange={e => updateBasicDetails('lastName', e.target.value)}
              />
            </Grid>

            {/* Phone Number Row with proper spacing */}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id='country-code-label'>Country</InputLabel>
                <Select
                  label='Country'
                  value={basicDetails.countryCode}
                  onChange={e => updateBasicDetails('countryCode', e.target.value)}
                  labelId='country-code-label'
                  id='country-code-select'
                >
                  <MenuItem value='+1'>🇺🇸 +1 (USA)</MenuItem>
                  <MenuItem value='+91'>🇮🇳 +91 (India)</MenuItem>
                  <MenuItem value='+44'>🇬🇧 +44 (UK)</MenuItem>
                  <MenuItem value='+61'>🇦🇺 +61 (Australia)</MenuItem>
                  <MenuItem value='+86'>🇨🇳 +86 (China)</MenuItem>
                  <MenuItem value='+49'>🇩🇪 +49 (Germany)</MenuItem>
                  <MenuItem value='+33'>🇫🇷 +33 (France)</MenuItem>
                  <MenuItem value='+39'>🇮🇹 +39 (Italy)</MenuItem>
                  <MenuItem value='+34'>🇪🇸 +34 (Spain)</MenuItem>
                  <MenuItem value='+7'>🇷🇺 +7 (Russia)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label='Phone Number'
                placeholder='Enter your phone number'
                value={basicDetails.phoneNumber}
                onChange={e => updateBasicDetails('phoneNumber', e.target.value)}
                type='tel'
              />
            </Grid>

            {/* Email Row */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type='email'
                label='Email Address'
                placeholder='Enter your email address'
                value={basicDetails.email}
                onChange={e => updateBasicDetails('email', e.target.value)}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button size='large' type='submit' variant='contained' sx={{ minWidth: 120 }}>
                  Save Details
                </Button>
                <Button
                  type='button'
                  size='large'
                  variant='outlined'
                  color='secondary'
                  onClick={resetBasicDetails}
                  sx={{ minWidth: 120 }}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <AccordionSummary
          expandIcon={<Icon icon='tabler:chevron-down' />}
          id='form-layouts-collapsible-header-2'
          aria-controls='form-layouts-collapsible-content-2'
        >
          <Typography variant='subtitle1' sx={{ fontWeight: 500 }}>
            Qualification Details
          </Typography>
        </AccordionSummary>
        <Divider sx={{ m: '0 !important' }} />
        <AccordionDetails sx={{ pt: 6, pb: 6 }}>
          <Grid container spacing={5}>
            {/* Personal Information */}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel id='gender-radio-group-label'>Gender</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby='gender-radio-group-label'
                  name='gender'
                  value={qualificationDetails.gender}
                  onChange={e => updateQualificationDetails('gender', e.target.value)}
                >
                  <FormControlLabel value='MALE' control={<Radio />} label='Male' />
                  <FormControlLabel value='FEMALE' control={<Radio />} label='Female' />
                  <FormControlLabel value='OTHER' control={<Radio />} label='Other' />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Date of Birth'
                type='date'
                value={qualificationDetails.dateOfBirth}
                onChange={e => updateQualificationDetails('dateOfBirth', e.target.value)}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Emergency Contact Number'
                placeholder='Enter emergency contact number'
                value={qualificationDetails.emergencyContactNumber}
                onChange={e => updateQualificationDetails('emergencyContactNumber', e.target.value)}
                type='tel'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Consultation Fee (₹)'
                placeholder='Enter consultation fee'
                value={qualificationDetails.consultationFee}
                onChange={e => updateQualificationDetails('consultationFee', e.target.value)}
                type='number'
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            {/* Professional Information */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 2, mt: 3 }}>
                Professional Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Specialization'
                placeholder='e.g., Neurology, Cardiology'
                value={qualificationDetails.specialization}
                onChange={e => updateQualificationDetails('specialization', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Qualification'
                placeholder='e.g., MBBS, DM Neurology'
                value={qualificationDetails.qualification}
                onChange={e => updateQualificationDetails('qualification', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='License Number'
                placeholder='Enter medical license number'
                value={qualificationDetails.licenseNumber}
                onChange={e => updateQualificationDetails('licenseNumber', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Experience (Years)'
                placeholder='Enter years of experience'
                value={qualificationDetails.experienceYears}
                onChange={e => updateQualificationDetails('experienceYears', e.target.value)}
                type='number'
                inputProps={{ min: '0' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='License Issue Date'
                type='date'
                value={qualificationDetails.licenseIssueDate}
                onChange={e => updateQualificationDetails('licenseIssueDate', e.target.value)}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='License Expiry Date'
                type='date'
                value={qualificationDetails.licenseExpiryDate}
                onChange={e => updateQualificationDetails('licenseExpiryDate', e.target.value)}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Joining Date'
                type='date'
                value={qualificationDetails.joiningDate}
                onChange={e => updateQualificationDetails('joiningDate', e.target.value)}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='employment-status-label'>Employment Status</InputLabel>
                <Select
                  label='Employment Status'
                  value={qualificationDetails.employmentStatus}
                  onChange={e => updateQualificationDetails('employmentStatus', e.target.value)}
                  labelId='employment-status-label'
                >
                  <MenuItem value='ACTIVE'>Active</MenuItem>
                  <MenuItem value='INACTIVE'>Inactive</MenuItem>
                  <MenuItem value='ON_LEAVE'>On Leave</MenuItem>
                  <MenuItem value='SUSPENDED'>Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='employment-type-label'>Employment Type</InputLabel>
                <Select
                  label='Employment Type'
                  value={qualificationDetails.employmentType}
                  onChange={e => updateQualificationDetails('employmentType', e.target.value)}
                  labelId='employment-type-label'
                >
                  <MenuItem value='FULL_TIME'>Full Time</MenuItem>
                  <MenuItem value='PART_TIME'>Part Time</MenuItem>
                  <MenuItem value='CONTRACT'>Contract</MenuItem>
                  <MenuItem value='CONSULTANT'>Consultant</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Hospital/Clinic Information */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 2, mt: 3 }}>
                Hospital/Clinic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Hospital/Clinic Name'
                placeholder='Enter hospital or clinic name'
                value={qualificationDetails.hospitalClinicName}
                onChange={e => updateQualificationDetails('hospitalClinicName', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Hospital/Clinic Address'
                placeholder='Enter hospital/clinic address'
                value={qualificationDetails.hospitalClinicAddress}
                onChange={e => updateQualificationDetails('hospitalClinicAddress', e.target.value)}
              />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 2, mt: 3 }}>
                Personal Address
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Address'
                placeholder='Enter your address'
                value={qualificationDetails.address}
                onChange={e => updateQualificationDetails('address', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='City'
                placeholder='Enter city'
                value={qualificationDetails.city}
                onChange={e => updateQualificationDetails('city', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='State'
                placeholder='Enter state'
                value={qualificationDetails.state}
                onChange={e => updateQualificationDetails('state', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Pincode'
                placeholder='Enter pincode'
                value={qualificationDetails.pincode}
                onChange={e => updateQualificationDetails('pincode', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Country'
                placeholder='Enter country'
                value={qualificationDetails.country}
                onChange={e => updateQualificationDetails('country', e.target.value)}
              />
            </Grid>

            {/* Bio */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Bio/About'
                placeholder='Tell us about yourself and your specialization'
                value={qualificationDetails.bio}
                onChange={e => updateQualificationDetails('bio', e.target.value)}
                multiline
                rows={4}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button size='large' type='submit' variant='contained' sx={{ minWidth: 120 }}>
                  Save Qualification
                </Button>
                <Button
                  type='button'
                  size='large'
                  variant='outlined'
                  color='secondary'
                  onClick={resetQualificationForm}
                  sx={{ minWidth: 120 }}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </form>
  )
}

export default FormLayoutsCollapsible
