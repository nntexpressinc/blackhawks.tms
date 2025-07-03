import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../../api/auth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-hot-toast';

const CustomerBrokerCreatePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_number: '',
    email_address: '',
    mc_number: '',
    pod_file: false,
    rate_con: false,
    address1: '',
    address2: '',
    country: 'USA',
    state: '',
    zip_code: '',
    city: '',
    billing_type: 'NONE',
    terms_days: '',
  });

  const states = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ];

  const billingTypes = [
    { value: 'NONE', label: 'None' },
    { value: 'FACTORING_COMPANY', label: 'Factoring Company' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'MANUAL', label: 'Manual' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStateChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      state: newValue ? newValue.code : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Barcha majburiy maydonlarni tekshirish
      const requiredFields = [
        'company_name',
        'contact_number',
        'email_address',
        'mc_number',
        'address1',
        'city',
        'state',
        'zip_code',
        'country',
        'billing_type',
        'terms_days'
      ];

      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Ma'lumotlarni to'g'ri formatda tayyorlash
      const formattedData = {
        company_name: formData.company_name.trim(),
        contact_number: parseInt(formData.contact_number) || null,
        email_address: formData.email_address.trim(),
        mc_number: formData.mc_number.trim(),
        pod_file: formData.pod_file || false,
        rate_con: formData.rate_con || false,
        address1: formData.address1.trim(),
        address2: formData.address2 ? formData.address2.trim() : null,
        country: formData.country.trim(),
        state: formData.state,
        zip_code: parseInt(formData.zip_code) || null,
        city: formData.city.trim(),
        billing_type: formData.billing_type,
        terms_days: formData.terms_days ? new Date(formData.terms_days).toISOString() : null
      };

      console.log('Sending data:', formattedData); // Debug uchun

      const response = await ApiService.postData('/customer_broker/', formattedData);
      console.log('Response:', response); // Debug uchun

      if (response) {
        toast.success('Customer/Broker created successfully');
        navigate('/customer_broker');
      }
    } catch (error) {
      console.error('Error details:', error); // Debug uchun
      if (error.response?.data) {
        const errorMessage = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errorMessage);
      } else {
        setError(error.message || 'Error creating customer/broker');
      }
    }
  };

  const sections = [
    {
      title: 'Basic Information',
      fields: [
        { name: 'company_name', label: 'Company Name', required: true, maxLength: 50 },
        { name: 'contact_number', label: 'Contact Number', required: true, type: 'number' },
        { name: 'email_address', label: 'Email Address', required: true, type: 'email', maxLength: 254 },
        { name: 'mc_number', label: 'MC Number', required: true, maxLength: 50 },
      ]
    },
    {
      title: 'Address Information',
      fields: [
        { name: 'address1', label: 'Address Line 1', required: true, maxLength: 100 },
        { name: 'address2', label: 'Address Line 2', maxLength: 100 },
        { name: 'city', label: 'City', required: true, maxLength: 50 },
        { 
          name: 'state', 
          label: 'State', 
          required: true,
          type: 'autocomplete',
          options: states,
          getOptionLabel: (option) => option.name,
          onChange: handleStateChange
        },
        { name: 'zip_code', label: 'ZIP Code', required: true, type: 'number' },
        { name: 'country', label: 'Country', required: true, maxLength: 50 },
      ]
    },
    {
      title: 'Billing Information',
      fields: [
        { 
          name: 'billing_type', 
          label: 'Billing Type',
          type: 'select',
          options: billingTypes,
          required: true
        },
        { name: 'terms_days', label: 'Terms (Days)', type: 'date', required: true },
      ]
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to Customer/Broker List">
            <IconButton 
              onClick={() => navigate('/customer_broker')}
              sx={{ 
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Create Customer/Broker
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' }
          }}
        >
          Save
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {sections.map((section, index) => (
            <Grid item xs={12} key={index}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    {section.fields.map((field) => (
                      <Grid item xs={12} sm={6} md={4} key={field.name}>
                        {field.type === 'select' ? (
                          <FormControl fullWidth required={field.required}>
                            <InputLabel>{field.label}</InputLabel>
                            <Select
                              name={field.name}
                              value={formData[field.name] || ''}
                              onChange={handleChange}
                              label={field.label}
                            >
                              {field.options.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : field.type === 'autocomplete' ? (
                          <Autocomplete
                            options={field.options}
                            getOptionLabel={field.getOptionLabel}
                            onChange={field.onChange}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={field.label}
                                required={field.required}
                              />
                            )}
                          />
                        ) : (
                          <TextField
                            fullWidth
                            label={field.label}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            required={field.required}
                            type={field.type || 'text'}
                            inputProps={{
                              maxLength: field.maxLength
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </form>
    </Box>
  );
};

export default CustomerBrokerCreatePage;