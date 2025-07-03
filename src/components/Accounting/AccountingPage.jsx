import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDrivers, getDriverPayList, getDriverPayReport, uploadPayReportPDF } from '../../api/accounting';
import { pdf } from '@react-pdf/renderer';
import PayReportPDF from './PayReportPDF';
import './AccountingPage.css';
import moment from 'moment';

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
  const [invoiceNumber, setInvoiceNumber] = useState(''); // New state
  const [weeklyNumber, setWeeklyNumber] = useState(''); // New state
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');
  const [driverPayList, setDriverPayList] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    weekly_number: '',
    search: '',
    driver: '',
    pay_from: '',
    pay_to: ''
  });

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

    fetchDrivers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchDriverPayList();
  }, []);

  const fetchDriverPayList = async () => {
    try {
      setLoading(true);
      const data = await getDriverPayList(filters);
      setDriverPayList(ensureArray(data));
    } catch (err) {
      setError(t('Failed to fetch driver pay list'));
      setDriverPayList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchDriverPayList();
  };

  const resetFilters = () => {
    setFilters({
      weekly_number: '',
      search: '',
      driver: '',
      pay_from: '',
      pay_to: ''
    });
    setTimeout(() => fetchDriverPayList(), 100);
  };

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
      };

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
      const blob = await pdf(<PayReportPDF reportData={reportData} />).toBlob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `driver-pay-report-${moment().format('YYYY-MM-DD')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      if (reportData.pay_id) {
        await uploadPayReportPDF(reportData.pay_id, blob);
        console.log('PDF successfully uploaded to server');
      }
      
      fetchDriverPayList();
      setShowCreateForm(false);
      setReportData(null);
      setInvoiceNumber(''); // Clear form
      setWeeklyNumber(''); // Clear form
      setNotes(''); // Clear form
      setSelectedDriver(''); // Clear form
      setDateRange({ startDate: '', endDate: '' }); // Clear form
      
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

          <div className="filters-section">
            <div className="filter-row">
              <div className="form-group">
                <label>{t('Weekly Number')}</label>
                <input
                  type="number"
                  value={filters.weekly_number}
                  onChange={(e) => handleFilterChange('weekly_number', e.target.value)}
                  placeholder={t('Enter weekly number')}
                />
              </div>
              <div className="form-group">
                <label>{t('Search')}</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder={t('Search by invoice or weekly number')}
                />
              </div>
              <div className="form-group">
                <label>{t('Driver')}</label>
                <select
                  value={filters.driver}
                  onChange={(e) => handleFilterChange('driver', e.target.value)}
                >
                  <option value="">{t('All Drivers')}</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.user?.first_name || ''} {driver.user?.last_name || ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('From Date')}</label>
                <input
                  type="date"
                  value={filters.pay_from}
                  onChange={(e) => handleFilterChange('pay_from', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('To Date')}</label>
                <input
                  type="date"
                  value={filters.pay_to}
                  onChange={(e) => handleFilterChange('pay_to', e.target.value)}
                />
              </div>
              <div className="form-group">
                <button 
                  className="btn btn-primary"
                  onClick={applyFilters}
                  disabled={loading}
                >
                  {t('Apply Filters')}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={resetFilters}
                  disabled={loading}
                >
                  {t('Reset')}
                </button>
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
                    <th>{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                        {t('Loading...')}
                      </td>
                    </tr>
                  ) : driverPayList.length > 0 ? (
                    driverPayList.map((pay) => (
                      <tr key={pay.id}>
                        <td>{pay.invoice_number || t('N/A')}</td>
                        <td>{pay.weekly_number || t('N/A')}</td>
                        <td>
                          {pay.driver?.user?.first_name || ''} {pay.driver?.user?.last_name || ''}
                        </td>
                        <td>
                          {pay.pay_from && pay.pay_to 
                            ? `${moment(pay.pay_from).format('MM/DD/YYYY')} - ${moment(pay.pay_to).format('MM/DD/YYYY')}`
                            : t('N/A')
                          }
                        </td>
                        <td>${pay.amount || '0.00'}</td>
                        <td>
                          {pay.created_at 
                            ? moment(pay.created_at).format('MM/DD/YYYY HH:mm')
                            : t('N/A')
                          }
                        </td>
                        <td>
                          {pay.file ? (
                            <a 
                              href={pay.file} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="file-link"
                            >
                              {t('View PDF')}
                            </a>
                          ) : (
                            <span className="no-file">{t('No file')}</span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              console.log('View details for:', pay.id);
                            }}
                          >
                            {t('View')}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
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
                    <option value="">{t('Select driver')}</option>
                    {Array.isArray(drivers) && drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.user?.first_name || ''} {driver.user?.last_name || ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="invoiceNumber">{t('Invoice Number')}</label>
                  <input
                    type="text"
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder={t('Enter invoice number')}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="weeklyNumber">{t('Weekly Number')}</label>
                  <input
                    type="text"
                    id="weeklyNumber"
                    value={weeklyNumber}
                    onChange={(e) => setWeeklyNumber(e.target.value)}
                    placeholder={t('Enter weekly number')}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">{t('Notes')}</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    placeholder={t('Enter notes here')}
                  />
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="button-group">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? t('Creating Report...') : t('Create Report')}
                </button>
                {reportData && (
                  <button
                    type="button"
                    onClick={downloadPDF}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    {t('Download PDF')}
                  </button>
                )}
              </div>
            </form>
          </div>

          {reportData && (
            <div className="report-section">
              <div className="report-header">
                <div className="company-info">
                  <h3>{reportData.user_admin?.company_name || t('N/A')}</h3>
                  <p>{reportData.user_admin

?.address || t('N/A')}</p>
                  <p>{reportData.user_admin?.country || t('N/A')}</p>
                  <p>{t('Phone')}: {reportData.user_admin?.telephone || t('N/A')}</p>
                  {reportData.user_admin?.fax && (
                    <p>{t('Fax')}: {reportData.user_admin.fax}</p>
                  )}
                  <p>{t('Email')}: {reportData.user_admin?.email || t('N/A')}</p>
                </div>

                <div className="driver-info">
                  <h4>{t('Driver Information')}</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>{t('Name')}:</label>
                      <span>
                        {reportData.driver?.first_name || ''} {reportData.driver?.last_name || ''}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>{t('Contact')}:</label>
                      <span>{reportData.driver?.contact_number || t('N/A')}</span>
                    </div>
                    <div className="info-item">
                      <label>{t('Address')}:</label>
                      <span>{reportData.driver?.address1 || t('N/A')}</span>
                    </div>
                  </div>
                </div>

                <div className="report-dates">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>{t('Report Date')}:</label>
                      <span>
                        {reportData.driver?.report_date
                          ? moment(reportData.driver.report_date).format('YYYY-MM-DD')
                          : t('N/A')}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>{t('Generation Date')}:</label>
                      <span>
                        {reportData.driver?.generate_date
                          ? moment(reportData.driver.generate_date).format('YYYY-MM-DD')
                          : t('N/A')}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>{t('Search Period')}:</label>
                      <span>
                        {reportData.driver?.search_from || t('N/A')} -{' '}
                        {reportData.driver?.search_to || t('N/A')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .filters-section {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }
        
        .filter-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
          align-items: end;
        }
        
        .table-section {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .pay-list-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .pay-list-table th,
        .pay-list-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .pay-list-table th {
          background-color: #f7fafc;
          font-weight: 600;
          color: #4a5568;
        }
        
        .pay-list-table tr:hover {
          background-color: #f7fafc;
        }
        
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        
        .file-link {
          color: #4299e1;
          text-decoration: none;
        }
        
        .file-link:hover {
          text-decoration: underline;
        }
        
        .no-file {
          color: #a0aec0;
          font-style: italic;
        }
        
        .create-form-section {
          min-height: 100vh;
        }
        
        .list-section {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default AccountingPage;