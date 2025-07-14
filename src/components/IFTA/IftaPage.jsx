import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getIftaRecords, deleteIftaRecord, getFuelTaxRates } from '../../api/ifta';
import { getDrivers } from '../../api/accounting';
import CreateIftaModal from './CreateIftaModal';
import EditIftaModal from './EditIftaModal';
import CreateFuelTaxRatesModal from './CreateFuelTaxRatesModal';
import './IftaPage.css';
import { useLocation } from 'react-router-dom';

const IftaPage = () => {
  // const { t } = useTranslation(); // Translation not used yet
  const [iftaRecords, setIftaRecords] = useState([]);
  const [fuelTaxRates, setFuelTaxRates] = useState([]);
  const [expandedQuarters, setExpandedQuarters] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFuelTaxRatesModal, setShowFuelTaxRatesModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('ifta');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const driverId = queryParams.get('driverId');

  const US_STATES = [
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
    { code: 'KY Surcharge', name: 'Kentucky Surcharge' },
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
    { code: 'WY', name: 'Wyoming' },
  ];

  const QUARTERS = [
    { value: 'Quarter 1', label: 'Quarter 1' },
    { value: 'Quarter 2', label: 'Quarter 2' },
    { value: 'Quarter 3', label: 'Quarter 3' },
    { value: 'Quarter 4', label: 'Quarter 4' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [iftaData, driversData, fuelTaxData] = await Promise.all([
        getIftaRecords(),
        getDrivers(),
        getFuelTaxRates()
      ]);
      setIftaRecords(iftaData);
      setDrivers(driversData);
      setFuelTaxRates(fuelTaxData);
      setError('');
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fuel tax rates quarter-wise grouping
  const getGroupedFuelTaxRates = () => {
    const grouped = {};
    fuelTaxRates.forEach(rate => {
      if (!grouped[rate.quarter]) {
        grouped[rate.quarter] = [];
      }
      grouped[rate.quarter].push(rate);
    });
    return grouped;
  };

  const toggleQuarter = (quarter) => {
    setExpandedQuarters(prev => ({
      ...prev,
      [quarter]: !prev[quarter]
    }));
  };

  const deleteFuelTaxRate = async (id) => {
    if (window.confirm('Are you sure you want to delete this fuel tax rate?')) {
      try {
        // API call to delete will go here
        console.log('Delete fuel tax rate:', id);
        // After successful delete, refresh data
        fetchData();
      } catch (err) {
        setError('Failed to delete fuel tax rate');
        console.error('Error deleting fuel tax rate:', err);
      }
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setSuccessMessage('IFTA records created successfully!');
    fetchData();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedRecord(null);
    setSuccessMessage('IFTA record updated successfully!');
    fetchData();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFuelTaxRatesSuccess = () => {
    setShowFuelTaxRatesModal(false);
    setSuccessMessage('Fuel tax rates created successfully!');
    fetchData();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this IFTA record?')) {
      try {
        await deleteIftaRecord(id);
        setSuccessMessage('IFTA record deleted successfully!');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError('Failed to delete IFTA record');
        console.error('Error deleting IFTA record:', err);
      }
    }
  };

  const getStateName = (code) => {
    const state = US_STATES.find(s => s.code === code);
    return state ? state.name : code;
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `${driver.user.first_name} ${driver.user.last_name}` : 'Unknown';
  };

  // const formatAmount = (amount) => {
  //   if (!amount) return '$0.00';
  //   return `$${parseFloat(amount).toFixed(2)}`;
  // };

  const filteredIftaRecords = driverId
    ? iftaRecords.filter(record => String(record.driver) === String(driverId))
    : iftaRecords;

  if (loading) {
    return <div className="loading">Loading IFTA records...</div>;
  }

  return (
    <div className="ifta-page">
      <div className="ifta-container">
        <div className="ifta-header">
          <h1 className="ifta-title">
            {driverId ? "Driver IFTA Records" : "IFTA Management"}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'ifta' && (
              <button 
                className="btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create IFTA Records
              </button>
            )}
            {activeTab === 'fuel-tax-rates' && (
              <button 
                className="btn-primary"
                onClick={() => setShowFuelTaxRatesModal(true)}
              >
                Create Fuel Tax Rates
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button 
              className={`tab-button ${activeTab === 'ifta' ? 'active' : ''}`}
              onClick={() => setActiveTab('ifta')}
            >
              IFTA Records
            </button>
            <button 
              className={`tab-button ${activeTab === 'fuel-tax-rates' ? 'active' : ''}`}
              onClick={() => setActiveTab('fuel-tax-rates')}
            >
              Fuel Tax Rates
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {activeTab === 'ifta' ? (
          // IFTA Records Table
          <table className="ifta-table">
            <thead>
              <tr>
                <th>Quarter</th>
                <th>Driver</th>
                <th>State</th>
                <th>Total Miles</th>
                <th>Tax Paid Gallon</th>
                <th>Tax</th>
                <th>Invoice Number</th>
                <th>Weekly Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIftaRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    {driverId ? 'No IFTA records found for this driver.' : 'No IFTA records found.'}
                  </td>
                </tr>
              ) : (
                filteredIftaRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.quarter}</td>
                    <td>{getDriverName(record.driver)}</td>
                    <td>{record.state} - {getStateName(record.state)}</td>
                    <td>{record.total_miles}</td>
                    <td>{record.tax_paid_gallon || '-'}</td>
                    <td>{record.tax || '-'}</td>
                    <td>{record.invoice_number}</td>
                    <td>{record.weekly_number}</td>
                    <td>
                      <div className="ifta-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => handleDelete(record.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          // Fuel Tax Rates Table - Quarter-wise grouped
          <div className="fuel-tax-rates">
            {Object.keys(getGroupedFuelTaxRates()).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                No fuel tax rates found
              </div>
            ) : (
              Object.keys(getGroupedFuelTaxRates()).map((quarter) => (
                <div key={quarter} className="quarter-group">
                  <div 
                    className="quarter-header"
                    onClick={() => toggleQuarter(quarter)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginBottom: '10px',
                      transition: 'background-color 0.3s'
                    }}
                  >
                    <h3 style={{ margin: 0, color: '#007bff' }}>{quarter}</h3>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {expandedQuarters[quarter] ? '▼' : '▶'}
                    </span>
                  </div>

                  {expandedQuarters[quarter] && (
                    <table className="fuel-tax-rates-table">
                      <thead>
                        <tr>
                          <th>State</th>
                          <th>Rate</th>
                          <th>MPG</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getGroupedFuelTaxRates()[quarter].map((rate) => (
                          <tr key={rate.id}>
                            <td>{rate.state} - {getStateName(rate.state)}</td>
                            <td>${rate.rate}</td>
                            <td>{rate.mpg}</td>
                            <td>
                              <div className="ifta-actions">
                                <button 
                                  className="btn-secondary"
                                  onClick={() => {
                                    console.log('Edit fuel tax rate:', rate.id);
                                  }}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn-danger"
                                  onClick={() => deleteFuelTaxRate(rate.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {showCreateModal && (
          <CreateIftaModal
            drivers={drivers}
            quarters={QUARTERS}
            states={US_STATES}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        )}

        {showEditModal && selectedRecord && (
          <EditIftaModal
            record={selectedRecord}
            drivers={drivers}
            quarters={QUARTERS}
            states={US_STATES}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRecord(null);
            }}
            onSuccess={handleEditSuccess}
          />
        )}

        {showFuelTaxRatesModal && (
          <CreateFuelTaxRatesModal
            quarters={QUARTERS}
            states={US_STATES}
            onClose={() => setShowFuelTaxRatesModal(false)}
            onSuccess={handleFuelTaxRatesSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default IftaPage;
