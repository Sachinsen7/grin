import React, { useState } from 'react';
import styles from './Table.module.css';

const TableComponent = ({ tableData }) => {
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (index) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(index)) {
            newExpandedRows.delete(index);
        } else {
            newExpandedRows.add(index);
        }
        setExpandedRows(newExpandedRows);
    };

    const tableContainerStyle = {
        width: "100%",
        maxWidth: "100%",
        position: "relative",
        height: "800px",
        overflow: "hidden"
    };

    const tableStyle = {
        width: "100%",
        borderCollapse: "collapse"
    };

    const theadStyle = {
        position: "sticky",
        top: 0,
        zIndex: 1
    };

    const tbodyStyle = {
        display: "block",
        overflowY: "auto",
        height: "700px", // Increased scrollable area height from 500px to 700px
    };

    const trStyle = {
        display: "table",
        width: "100%",
        tableLayout: "fixed"
    };

    // Calculate total for each row
    const calculateTotal = (quantityNo, price) => {
        const quantity = parseFloat(quantityNo) || 0;
        const priceValue = parseFloat(price) || 0;
        return (quantity * priceValue).toFixed(2);
    };

    return (
        <div style={tableContainerStyle}>
            <table className={styles.table} style={tableStyle}>
                <thead style={theadStyle}>
                    <tr style={trStyle}>
                        <th style={{ width: '3%' }}>Sr. No.</th>
                        <th style={{ width: '8%' }}>Date</th>
                        <th style={{ width: '12%' }}>Item</th>
                        <th style={{ width: '15%' }}>Description</th>
                        <th style={{ width: '7%' }}>Quantity No.</th>
                        <th style={{ width: '7%' }}>Quantity in Kgs.</th>
                        <th style={{ width: '9%' }}>Price (₹)</th>
                        <th style={{ width: '7%' }}>Discount (%)</th>
                        <th style={{ width: '9%' }}>Total (₹)</th>
                        <th style={{ width: '9%' }}>Weight Diff (KG)</th>
                        <th style={{ width: '16%' }}>Weight Notes</th>
                    </tr>
                </thead>
                <tbody style={tbodyStyle}>
                    {tableData
                        .filter(row => row.item || row.description || row.quantityNo || row.quantityKg)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date, newest first
                        .map((row, index) => (
                            <React.Fragment key={index}>
                                <tr style={trStyle}>
                                    <td style={{ width: '3%' }}>{index + 1}</td>
                                    <td style={{ width: '8%' }}>{row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    }) : '-'}</td>
                                    <td
                                        style={{
                                            width: '12%',
                                            cursor: 'pointer',
                                            textDecoration: row.item ? 'underline' : 'none'
                                        }}
                                        onClick={() => row.item && toggleRow(index)}
                                    >
                                        {row.item}
                                        {row.item && (
                                            <span style={{ marginLeft: '5px', fontSize: '12px' }}>
                                                {expandedRows.has(index) ? '▼' : '▶'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ width: '15%' }}>{row.description}</td>
                                    <td style={{ width: '7%' }}>{row.quantityNo}</td>
                                    <td style={{ width: '7%' }}>{row.quantityKg}</td>
                                    <td style={{ width: '9%' }}>{row.price ? `₹${parseFloat(row.price).toFixed(2)}` : '-'}</td>
                                    <td style={{ width: '7%' }}>{row.discount !== undefined ? `${row.discount}%` : '0%'}</td>
                                    <td style={{ width: '9%', fontWeight: 'bold' }}>
                                        ₹{calculateTotal(row.quantityNo, row.price)}
                                    </td>
                                    <td style={{
                                        width: '9%',
                                        backgroundColor: row.weightDifference ? 'rgba(255, 243, 205, 0.5)' : 'transparent',
                                        fontWeight: row.weightDifference ? 'bold' : 'normal'
                                    }}>
                                        {row.weightDifference ? `${parseFloat(row.weightDifference).toFixed(2)} KG` : '-'}
                                    </td>
                                    <td style={{
                                        width: '16%',
                                        backgroundColor: row.weightNotes ? 'rgba(255, 243, 205, 0.5)' : 'transparent',
                                        fontSize: '13px',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {row.weightNotes || '-'}
                                    </td>
                                </tr>
                                {expandedRows.has(index) && (
                                    <tr style={trStyle}>
                                        <td colSpan="11" style={{
                                            backgroundColor: 'rgba(200, 198, 206, 0.8)',
                                            padding: '10px',
                                            fontSize: '14px',
                                            borderRadius: '4px',
                                            margin: '5px'
                                        }}>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(3, 1fr)',
                                                gap: '10px',
                                                padding: '10px',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '4px',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                            }}>
                                                <div>
                                                    <strong>GSN Number:</strong> <span>{row.gsn}</span>
                                                </div>
                                                <div>
                                                    <strong>GRIN Number:</strong> <span>{row.grinNo}</span>
                                                </div>
                                                <div>
                                                    <strong>Entry Date:</strong> <span>
                                                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        }) : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                </tbody>
            </table>
            {/* Separate Total Price Display */}
            <div style={{
                backgroundColor: 'rgba(218, 216, 224, 0.6)',
                borderTop: '4px solid white',
                position: 'sticky',
                bottom: 0,
                width: '100%',
                padding: '15px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                boxShadow: '0 -4px 6px rgba(0,0,0,0.1)',
                zIndex: 2
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    backgroundColor: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <span style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#333'
                    }}>
                        Total Price:
                    </span>
                    <span style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#2c5282',
                        minWidth: '150px',
                        textAlign: 'right'
                    }}>
                        ₹{tableData
                            .reduce((total, row) => {
                                const quantity = parseFloat(row.quantityNo) || 0;
                                const price = parseFloat(row.price) || 0;
                                return total + (quantity * price);
                            }, 0)
                            .toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TableComponent;
