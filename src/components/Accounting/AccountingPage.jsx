import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { getDrivers, getDriverPayList, getDriverPayReport, uploadPayReportPDF } from '../../api/accounting';
import { getAllLoads } from '../../api/loads';
import { pdf } from '@react-pdf/renderer';
import PayReportPDF from './PayReportPDF';
import CompanyDriverPDF from './CompanyDriverPDF';
import './AccountingPage.css';
import moment from 'moment';

const API_URL = 'https://blackhawks.biznes-armiya.uz';

const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') return [data];
  return [];
};

const AccountingPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedDriver, setSelectedDriver] = useState('');
  const [notes, setNotes] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [weeklyNumber, setWeeklyNumber] = useState('');
  const [loadDriverPay, setLoadDriverPay] = useState([]); 
  const [loadCompanyDriverPay, setLoadCompanyDriverPay] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loads, setLoads] = useState([]);
  const [error, setError] = useState('');
  const [driverPayList, setDriverPayList] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef(null);

  // Modal state for view/edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDrivers = async () => {
      try {
        const data = await getDrivers();
        if (isMounted) {
          setDrivers(ensureArray(data));
        }
      } catch (err) {
        if (isMounted) {
          setError(t('Failed to fetch drivers'));
          setDrivers([]);
        }
      }
    };

    const fetchLoads = async () => {
      try {
        const data = await getAllLoads();
        if (isMounted) {
          setLoads(ensureArray(data));
        }
      } catch (err) {
        if (isMounted) {
          setLoads([]);
        }
      }
    };

    fetchDrivers();
    fetchLoads();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchDriverPayList();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchDriverPayList();
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // Open modal for view/edit
  const handleViewEdit = (pay) => {
    setEditData(pay);
    setShowEditModal(true);
    setError('');
  };

  // Close modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditData(null);
    setError('');
  };

  // Handle file upload for file/cd_file
  const handleFileChange = (e, field) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: e.target.files[0] });
  };

  // Download file helper
  const handleDownloadFile = (url) => {
    if (!url) return;
    window.open(getFullPdfUrl(url), '_blank');
  };

  // Save edited data (PUT request with file/cd_file if changed)
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      // Only send changed fields
      formData.append('notes', editData.notes || '');
      formData.append('invoice_number', editData.invoice_number || '');
      formData.append('weekly_number', editData.weekly_number || '');
      if (editData.file instanceof File) formData.append('file', editData.file);
      if (editData.cd_file instanceof File) formData.append('cd_file', editData.cd_file);
      // Add new fields if needed
      if (editData.total_miles !== undefined) formData.append('total_miles', editData.total_miles);
      if (editData.miles_rate !== undefined) formData.append('miles_rate', editData.miles_rate);
      if (editData.company_driver_pay !== undefined) formData.append('company_driver_pay', editData.company_driver_pay);
      // PUT request
      const storedAccessToken = localStorage.getItem('accessToken');
      await fetch(`${API_URL}/api/driver/pay/driver/${editData.id}/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${storedAccessToken}`
        },
        body: formData
      });
      setShowEditModal(false);
      setEditData(null);
      fetchDriverPayList();
    } catch (err) {
      setError(t('Failed to save changes: ') + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverPayList = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const data = await getDriverPayList(params);
      setDriverPayList(ensureArray(data));
    } catch (err) {
      setError(t('Failed to fetch driver pay list'));
      setDriverPayList([]);
    } finally {
      setLoading(false);
    }
  };

  // handleSearch and resetSearch are no longer needed

  const validateFields = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError(t('Please select a valid date range'));
      return false;
    }
    if (!selectedDriver) {
      setError(t('Please select a driver'));
      return false;
    }
    if (!invoiceNumber) {
      setError(t('Please enter an invoice number'));
      return false;
    }
    if (!weeklyNumber) {
      setError(t('Please enter a weekly number'));
      return false;
    }
    setError('');
    return true;
  };

  const generateReport = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    try {
      setLoading(true);
      const requestData = {
        pay_from: dateRange.startDate,
        pay_to: dateRange.endDate,
        driver: Number(selectedDriver),
        notes: notes || '',
        invoice_number: invoiceNumber,
        weekly_number: weeklyNumber,
        load_driver_pay: Array.isArray(loadDriverPay) ? loadDriverPay : [],
        load_company_driver_pay: Array.isArray(loadCompanyDriverPay) ? loadCompanyDriverPay : [],
      };
      
      console.log('Sending report request with data:', {
        ...requestData,
        load_driver_pay_length: requestData.load_driver_pay.length,
        load_company_driver_pay_length: requestData.load_company_driver_pay.length,
      });

      const response = await getDriverPayReport(requestData);
      console.log('Report data received:', response);
      setReportData(response);
      setError('');

      await generateAndUploadPDF(response);

    } catch (err) {
      console.error('Error fetching report:', err);
      setError(t('Failed to generate report'));
    } finally {
      setLoading(false);
    }
  };

  const generateAndUploadPDF = async (reportData) => {
    try {
      // 1. Generate and download Driver Pay PDF
      const driverPayBlob = await pdf(<PayReportPDF reportData={reportData} />).toBlob();
      const driverPayUrl = window.URL.createObjectURL(driverPayBlob);
      const driverPayLink = document.createElement('a');
      driverPayLink.href = driverPayUrl;
      driverPayLink.download = `driver-pay-report-${moment().format('YYYY-MM-DD')}.pdf`;
      document.body.appendChild(driverPayLink);
      driverPayLink.click();
      document.body.removeChild(driverPayLink);
      window.URL.revokeObjectURL(driverPayUrl);
      
      // Upload driver pay PDF to server if pay_id exists
      if (reportData.pay_id) {
        await uploadPayReportPDF(reportData.pay_id, driverPayBlob);
        console.log('Driver Pay PDF successfully uploaded to server');
      }

      // 2. Generate and download Company Driver PDF if data exists
      if (reportData.company_driver_data) {
        const companyDriverBlob = await pdf(
          <CompanyDriverPDF 
            data={reportData.company_driver_data}
            driver={reportData.driver}
            search_from={reportData.driver?.search_from}
            search_to={reportData.driver?.search_to}
          />
        ).toBlob();
        const companyDriverUrl = window.URL.createObjectURL(companyDriverBlob);
        const companyDriverLink = document.createElement('a');
        companyDriverLink.href = companyDriverUrl;
        companyDriverLink.download = `company-driver-report-${moment().format('YYYY-MM-DD')}.pdf`;
        document.body.appendChild(companyDriverLink);
        companyDriverLink.click();
        document.body.removeChild(companyDriverLink);
        window.URL.revokeObjectURL(companyDriverUrl);
        console.log('Company Driver PDF generated and downloaded');
      }

      // Reset form and update list
      fetchDriverPayList();
      setShowCreateForm(false);
      setReportData(null);
      setInvoiceNumber('');
      setWeeklyNumber('');
      setNotes('');
      setSelectedDriver('');
      setDateRange({ startDate: '', endDate: '' });
    } catch (err) {
      console.error('PDF generation/upload error:', err);
      setError(t('Failed to generate/upload PDF: ') + err.message);
    }
  };

  const downloadPDF = async () => {
    try {
      if (!reportData) {
        throw new Error('No report data available');
      }
      const blob = await pdf(<PayReportPDF reportData={reportData} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `driver-pay-report-${moment().format('YYYY-MM-DD')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError(t('Failed to generate PDF: ') + err.message);
    }
  };

  const getFullPdfUrl = (fileUrl) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith('http')) return fileUrl;
    return `${API_URL}${fileUrl}`;
  };

  // Helper to format amount
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    let num = amount;
    if (typeof num === 'string') {
      num = num.replace('$', '');
      num = parseFloat(num);
    }
    if (isNaN(num)) return '$0.00';
    return '$' + num.toFixed(2);
  };

  // Handle load selection for driver pay
  const handleLoadDriverPayChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    console.log('Selected driver pay loads:', selectedIds);
    setLoadDriverPay(selectedIds);
  };

  // Handle load selection for company driver pay
  const handleLoadCompanyDriverPayChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    console.log('Selected company driver pay loads:', selectedIds);
    setLoadCompanyDriverPay(selectedIds);
  };

  return (
    <div className="accounting-page">
      {!showCreateForm ? (
        <div className="list-section">
          <div className="section-header">
            <h2 className="section-title">{t('Driver Pay Reports')}</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              {t('Create New Report')}
            </button>
          </div>

          <div className="search-section">
            <div className="search-row">
              <div className="form-group" style={{ width: '100%' }}>
                <label>{t('Search')}</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search by invoice number, weekly number, or driver name')}
                // No need for onKeyPress or buttons
                />
              </div>
            </div>
          </div>

          <div className="table-section">
            <div className="table-container">
              <table className="pay-list-table">
                <thead>
                  <tr>
                    <th>{t('Invoice #')}</th>
                    <th>{t('Weekly #')}</th>
                    <th>{t('Driver')}</th>
                    <th>{t('Pay Period')}</th>
                    <th>{t('Amount')}</th>
                    <th>{t('Created At')}</th>
                    <th>{t('File')}</th>
                    {/* <th>{t('CD File')}</th> */}
                    <th>{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        {t('Loading...')}
                      </td>
                    </tr>
                  ) : driverPayList.length > 0 ? (
                    driverPayList.map((pay) => (
                      <tr className="pay-list-row" key={pay.id}>
                        <td>{pay.invoice_number || t('N/A')}</td>
                        <td>{pay.weekly_number || t('N/A')}</td>
                        <td>
                          {pay.driver?.user?.first_name || ''} {pay.driver?.user?.last_name || ''}
                        </td>
                        <td>
                          {pay.pay_from && pay.pay_to
                            ? `${moment(pay.pay_from).format('MM/DD/YYYY')} - ${moment(pay.pay_to).format('MM/DD/YYYY')}`
                            : t('N/A')}
                        </td>
                        <td>{formatAmount(pay.amount)}</td>
                        <td>
                          {pay.created_at
                            ? moment(pay.created_at).format('MM/DD/YYYY HH:mm')
                            : t('N/A')}
                        </td>
                        <td>
                          {pay.file ? (
                            <a
                              href={getFullPdfUrl(pay.file)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-link"
                            >
                              {t('View File')}
                            </a>
                          ) : (
                            <span className="no-file">{t('No file')}</span>
                          )}
                        </td>
                        {/* <td>
                          {pay.file ? (
                            <a
                              href={getFullPdfUrl(pay.cd_file)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-link"
                            >
                              {t('View PDF')}
                            </a>
                          ) : (
                            <span className="no-file">{t('No file')}</span>
                          )}
                        </td> */}
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleViewEdit(pay)}
                          >
                            {t('View')}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        {t('No driver pay reports found')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        <div className="create-form-section">
          <div className="section-header">
            <h2 className="section-title">{t('Create Driver Pay Report')}</h2>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowCreateForm(false);
                setReportData(null);
                setError('');
              }}
            >
              {t('Back to List')}
            </button>
          </div>

          <div className="search-section">
            <form onSubmit={generateReport} className="search-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">{t('Start Date')}</label>
                  <input
                    type="date"
                    id="startDate"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">{t('End Date')}</label>
                  <input
                    type="date"
                    id="endDate"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="driver">{t('Driver')}</label>
                  <select
                    id="driver"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    required
                  >
                    <option value="">{t('Select Driver')}</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.user?.first_name} {driver.user?.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="invoiceNumber">{t('Invoice Number')}</label>
                  <input
                    type="text"
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="weeklyNumber">{t('Weekly Number')}</label>
                  <input
                    type="text"
                    id="weeklyNumber"
                    value={weeklyNumber}
                    onChange={(e) => setWeeklyNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">{t('Notes')}</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              {/* Yangi load_driver_pay va load_company_driver_pay uchun multi-select */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="loadDriverPay">{t('Load Driver Pay (tanlang, optional)')}</label>
                  <Select
                    isMulti
                    options={loads.map(load => ({ value: load.id, label: `Load #${load.id}` }))}
                    value={loadDriverPay.map(id => ({ value: id, label: `Load #${id}` }))}
                    onChange={handleLoadDriverPayChange}
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                  <small>{t('Bir nechta load tanlash mumkin')}</small>
                </div>
                <div className="form-group">
                  <label htmlFor="loadCompanyDriverPay">{t('Load Company Driver Pay (tanlang, optional)')}</label>
                  <Select
                    isMulti
                    options={loads.map(load => ({ value: load.id, label: `Load #${load.id}` }))}
                    value={loadCompanyDriverPay.map(id => ({ value: id, label: `Load #${id}` }))}
                    onChange={handleLoadCompanyDriverPayChange}
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                  <small>{t('Bir nechta load tanlash mumkin')}</small>
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {t('Generate Report')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit/View Modal */}
      {showEditModal && editData && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: '#fff', padding: '28px 22px', borderRadius: 14, minWidth: 340, maxWidth: 420, width: '100%', position: 'relative', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)' }}>
            <h3 style={{ marginBottom: 18, fontWeight: 600, fontSize: 20, color: '#2c3e50', textAlign: 'center' }}>{t('View/Edit Driver Pay Report')}</h3>
            <button onClick={handleCloseModal} style={{ position: 'absolute', top: 10, right: 14, fontSize: 22, border: 'none', background: 'none', cursor: 'pointer', color: '#aaa' }}>&times;</button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ color: '#4a5568', fontWeight: 500 }}>{t('Driver')}:</span>
                <span style={{ color: '#2c3e50', fontWeight: 500 }}>{editData.driver?.user?.first_name} {editData.driver?.user?.last_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: '#4a5568', fontWeight: 500 }}>{t('Pay Period')}:</span>
                <span style={{ color: '#2c3e50' }}>{editData.pay_from} - {editData.pay_to}</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#4a5568', fontWeight: 500, marginBottom: 2, display: 'block' }}>{t('Invoice Number')}</label>
                <input type="text" value={editData.invoice_number || ''} onChange={e => setEditData({ ...editData, invoice_number: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#4a5568', fontWeight: 500, marginBottom: 2, display: 'block' }}>{t('Weekly Number')}</label>
                <input type="text" value={editData.weekly_number || ''} onChange={e => setEditData({ ...editData, weekly_number: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#4a5568', fontWeight: 500, marginBottom: 2, display: 'block' }}>{t('Notes')}</label>
                <textarea value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, minHeight: 48 }} />
              </div>
              {/* Company Driver Fields */}
              {editData.company_driver_data && (
                <div style={{ background: '#f7fafc', padding: 10, borderRadius: 8, margin: '8px 0' }}>
                  <b style={{ color: '#2c3e50', fontWeight: 600 }}>{t('Company Driver Data')}</b>
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div><b style={{ color: '#4a5568', fontWeight: 500 }}>{t('Total Miles')}:</b> <span style={{ color: '#2c3e50' }}>{editData.company_driver_data.total_miles}</span></div>
                    <div><b style={{ color: '#4a5568', fontWeight: 500 }}>{t('Miles Rate')}:</b> <span style={{ color: '#2c3e50' }}>{editData.company_driver_data.miles_rate}</span></div>
                    <div><b style={{ color: '#4a5568', fontWeight: 500 }}>{t('Company Driver Pay')}:</b> <span style={{ color: '#2c3e50' }}>{editData.company_driver_data.company_driver_pay}</span></div>
                  </div>
                </div>
              )}
              {/* File upload/download */}
              <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#4a5568', fontWeight: 500, marginBottom: 2, display: 'block' }}>{t('File')}</label>
                {editData.file && typeof editData.file === 'string' && (
                  <button type="button" onClick={() => handleDownloadFile(editData.file)} style={{ marginRight: 10, background: '#4d9ef0', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 13, cursor: 'pointer' }}>{t('Download')}</button>
                )}
                <input type="file" onChange={e => handleFileChange(e, 'file')} style={{ marginTop: 4 }} />
              </div>
              {/* <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#4a5568', fontWeight: 500, marginBottom: 2, display: 'block' }}>{t('CD File')}</label>
                {editData.cd_file && typeof editData.cd_file === 'string' && (
                  <button type="button" onClick={() => handleDownloadFile(editData.cd_file)} style={{ marginRight: 10, background: '#4d9ef0', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 13, cursor: 'pointer' }}>{t('Download')}</button>
                )}
                <input type="file" onChange={e => handleFileChange(e, 'cd_file')} style={{ marginTop: 4 }} />
              </div> */}
              {error && <div className="error-message">{error}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleSaveEdit} disabled={loading}>{t('Save')}</button>
                <button className="btn btn-secondary" onClick={handleCloseModal}>{t('Cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingPage;