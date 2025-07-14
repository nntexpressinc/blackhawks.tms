import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getIftaRecords, deleteIftaRecord, getFuelTaxRates } from '../../api/ifta';
import { getDrivers } from '../../api/accounting';
import CreateIftaModal from './CreateIftaModal';
import EditIftaModal from './EditIftaModal';
import CreateFuelTaxRatesModal from './CreateFuelTaxRatesModal';
import './IftaPage.css';

const IftaPage = () => {
  const { t } = useTranslation();
  const [iftaRecords, setIftaRecords] = useState([]);
  const [fuelTaxRates, setFuelTaxRates] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFuelTaxRatesModal, setShowFuelTaxRatesModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('ifta'); // 'ifta' or 'fuel-tax-rates'

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
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setSuccess('IFTA records created successfully');
    fetchData();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedRecord(null);
    setSuccess('IFTA record updated successfully');
    fetchData();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleFuelTaxRatesSuccess = () => {
    setShowFuelTaxRatesModal(false);
    setSuccess('Fuel tax rates created successfully');
    fetchData();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this IFTA record?')) {
      try {
        await deleteIftaRecord(id);
        setSuccess('IFTA record deleted successfully');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete IFTA record');
        console.error('Error deleting record:', err);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const getStateName = (code) => {
    const state = US_STATES.find(s => s.code === code);
    return state ? state.name : code;
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `${driver.first_name} ${driver.last_name}` : 'Unknown';
  };

  const formatAmount = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return <div className="loading">Loading IFTA records...</div>;
  }

  return (
    <div className="ifta-page">
      <div className="ifta-container">
        <div className="ifta-header">
          <h1 className="ifta-title">IFTA Management</h1>
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
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
          <button 
            className={`tab-button ${activeTab === 'ifta' ? 'active' : ''}`}
            onClick={() => setActiveTab('ifta')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'ifta' ? '#007bff' : 'transparent',
              color: activeTab === 'ifta' ? 'white' : '#333',
              cursor: 'pointer',
              marginRight: '10px',
              borderRadius: '4px 4px 0 0'
            }}
          >
            IFTA Records
          </button>
          <button 
            className={`tab-button ${activeTab === 'fuel-tax-rates' ? 'active' : ''}`}
            onClick={() => setActiveTab('fuel-tax-rates')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'fuel-tax-rates' ? '#007bff' : 'transparent',
              color: activeTab === 'fuel-tax-rates' ? 'white' : '#333',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0'
            }}
          >
            Fuel Tax Rates
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'ifta' ? (
          <table className="ifta-table">
          <thead>
            <tr>
              <th>Quarter</th>
              <th>State</th>
              <th>Driver</th>
              <th>Total Miles</th>
              <th>Taxible Gallon</th>
              <th>Tax Paid Gallon</th>
              <th>Net Taxible Gallon</th>
              <th>Tax</th>
              <th>Invoice Number</th>
              <th>Weekly Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {iftaRecords.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>
                  No IFTA records found
                </td>
              </tr>
            ) : (
              iftaRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.quarter}</td>
                  <td>{getStateName(record.state)}</td>
                  <td>{getDriverName(record.driver)}</td>
                  <td>{parseFloat(record.total_miles).toFixed(2)}</td>
                  <td>{parseFloat(record.taxible_gallon).toFixed(3)}</td>
                  <td>{record.tax_paid_gallon ? parseFloat(record.tax_paid_gallon).toFixed(3) : 'N/A'}</td>
                  <td>{parseFloat(record.net_taxible_gallon).toFixed(3)}</td>
                  <td>{formatAmount(record.tax)}</td>
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
          // Fuel Tax Rates Table
          <table className="ifta-table">
            <thead>
              <tr>
                <th>Quarter</th>
                <th>State</th>
                <th>Rate</th>
                <th>MPG</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {fuelTaxRates.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No fuel tax rates found
                  </td>
                </tr>
              ) : (
                fuelTaxRates.map((rate) => (
                  <tr key={rate.id}>
                    <td>{rate.quarter}</td>
                    <td>{getStateName(rate.state)}</td>
                    <td>{parseFloat(rate.rate).toFixed(3)}</td>
                    <td>{parseFloat(rate.mpg).toFixed(3)}</td>
                    <td>{new Date(rate.created_at || rate.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
