import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 25,
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
});


const CompanyDriverPDF = ({ data, driver, search_from, search_to }) => {
  if (!data) return null;
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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header summary */}
        <View style={{marginBottom: 10}}>
          <Text style={{fontSize: 12, fontWeight: 'bold', marginBottom: 6, color: '#cfe2f3'}}>
            In total, {driver?.first_name || ''} {driver?.last_name || ''} drove in the week from {search_from} to {search_to}:
          </Text>
          <View style={{flexDirection: 'row', fontWeight: 'bold'}}>
            <View style={{flex: 1, marginRight: 8}}>
              <View style={{backgroundColor: '#fff', border: '1px solid #000', borderBottom: 0, padding: 4}}>
                <Text>Miles</Text>
              </View>
              <View style={{backgroundColor: '#cfe2f3', border: '1px solid #000', borderTop: 0, padding: 4}}>
                <Text style={{fontWeight: 'normal'}}>{data.total_miles}</Text>
              </View>
            </View>
            <View style={{flex: 1, marginRight: 8}}>
              <View style={{backgroundColor: '#fff', border: '1px solid #000', borderBottom: 0, padding: 4}}>
                <Text>Rate</Text>
              </View>
              <View style={{backgroundColor: '#cfe2f3', border: '1px solid #000', borderTop: 0, padding: 4}}>
                <Text style={{fontWeight: 'normal'}}>{data.miles_rate}</Text>
              </View>
            </View>
            <View style={{flex: 1}}>
              <View style={{backgroundColor: '#fff', border: '1px solid #000', borderBottom: 0, padding: 4}}>
                <Text>To pay:</Text>
              </View>
              <View style={{backgroundColor: '#cfe2f3', border: '1px solid #000', borderTop: 0, padding: 4}}>
                <Text style={{color: 'red', fontWeight: 'bold', fontSize: 13}}>{formatAmount(data.company_driver_pay)}</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Table header */}
        <View style={{flexDirection: 'row', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#fff'}}>
          <View style={{flex: 0.8, borderRight: '1px solid #000', padding: 4}}><Text>Load #</Text></View>
          <View style={{flex: 2.5, borderRight: '1px solid #000', padding: 4}}><Text>Pickup</Text></View>
          <View style={{flex: 2.5, borderRight: '1px solid #000', padding: 4}}><Text>Delivery</Text></View>
          <View style={{flex: 1.2, borderRight: '1px solid #000', padding: 4}}><Text>Loaded Miles</Text></View>
          <View style={{flex: 1.5, padding: 4}}><Text>Load ID</Text></View>
        </View>
        {/* Table rows */}
        {Array.isArray(data.loads_detail) && data.loads_detail.length > 0 && data.loads_detail.map((ld, idx) => (
          <View key={idx} style={{flexDirection: 'row', borderLeft: '1px solid #000', borderRight: '1px solid #000', borderBottom: '1px solid #cfe2f3', backgroundColor: '#cfe2f3'}}>
            <View style={{flex: 0.8, borderRight: '1px solid #000', padding: 4}}><Text>{ld.load_number}</Text></View>
            <View style={{flex: 2.5, borderRight: '1px solid #000', padding: 4}}><Text>{ld.pickup_location}</Text></View>
            <View style={{flex: 2.5, borderRight: '1px solid #000', padding: 4}}><Text>{ld.delivery_location}</Text></View>
            <View style={{flex: 1.2, borderRight: '1px solid #000', padding: 4}}><Text>{ld.loaded_miles}</Text></View>
            <View style={{flex: 1.5, padding: 4}}><Text>{ld.load_id || ''}</Text></View>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default CompanyDriverPDF;
