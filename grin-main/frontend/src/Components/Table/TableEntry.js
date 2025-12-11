import React from 'react';
import styles from './Table.module.css';

const TableComponent = ({ data, handleTableChange }) => {
    const calculateRowTotal = (row) => {
        const quantity = parseFloat(row.quantityValue || 0);
        const price = parseFloat(row.priceValue || 0);
        const discount = parseFloat(row.discount || 0);

        const subtotal = quantity * price;
        const discountAmount = (subtotal * discount) / 100;
        return (subtotal - discountAmount).toFixed(2);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            margin: '20px 0'
        }}>
            <table className={styles.table} style={{
                backgroundColor: 'rgba(218, 216, 224, 0.6)',
                borderRadius: '15px',
                border: 'none',
                borderCollapse: 'collapse',
                width: '100%',
                maxWidth: '1200px'
            }}>
                <thead>
                    <tr>
                        <th style={{ width: '3%', border: 'none' }}>Sr. No.</th>
                        <th style={{ width: '11%', border: 'none' }}>Item</th>
                        <th style={{ width: '14%', border: 'none' }}>Description</th>
                        <th style={{ width: '8%', border: 'none' }}>Quantity</th>
                        <th style={{ width: '9%', border: 'none' }}>Price / Piece</th>
                        <th style={{ width: '6%', border: 'none' }}>Type</th>
                        <th style={{ width: '7%', border: 'none' }}>Discount (%)</th>
                        <th style={{ width: '9%', border: 'none' }}>Total</th>
                        <th style={{ width: '8%', border: 'none' }}>Received Weight</th>
                        <th style={{ width: '8%', border: 'none' }}>Ordered Weight</th>
                        <th style={{ width: '8%', border: 'none' }}>Billed Weight</th>
                        <th style={{ width: '11%', border: 'none' }}>Weight Diff (KG)</th>
                        <th style={{ width: '18%', border: 'none' }}>Weight Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            <td style={{ border: 'none' }}>{index + 1}</td>
                            <td style={{ border: 'none' }}>
                                <textarea
                                    style={{
                                        width: "100%",
                                        marginLeft: "0px",
                                        backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                        borderRadius: '20px',
                                        border: 'none',
                                        padding: '12px',
                                        fontSize: '14px',
                                        minHeight: '60px',
                                        resize: 'vertical',
                                        minWidth: '150px'
                                    }}
                                    value={row.item}
                                    onChange={(e) => handleTableChange(index, 'item', e.target.value)}
                                />
                            </td>
                            <td style={{ border: 'none' }}>
                                <textarea
                                    style={{
                                        resize: "vertical",
                                        width: "100%",
                                        backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                        borderRadius: '20px',
                                        border: 'none',
                                        padding: '12px',
                                        fontSize: '14px',
                                        minHeight: '60px',
                                        minWidth: '200px'
                                    }}
                                    value={row.description}
                                    onChange={(e) => handleTableChange(index, 'description', e.target.value)}
                                    className={styles.textarea}
                                />
                            </td>
                            <td style={{ border: 'none' }}>
                                <input
                                    style={{
                                        width: "100%",
                                        marginLeft: "0px",
                                        backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                        borderRadius: '20px',
                                        border: 'none',
                                        padding: '12px',
                                        fontSize: '16px',
                                        height: '40px',
                                        minWidth: '120px'
                                    }}
                                    type="number"
                                    value={row.quantityValue || ""}
                                    onChange={(e) => handleTableChange(index, 'quantityValue', e.target.value)}
                                    placeholder="Enter quantity"
                                />
                            </td>
                            <td style={{ border: 'none' }}>
                                <input
                                    style={{
                                        width: "100%",
                                        marginLeft: "0px",
                                        backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                        borderRadius: '20px',
                                        border: 'none',
                                        padding: '12px',
                                        fontSize: '16px',
                                        height: '40px',
                                        minWidth: '120px'
                                    }}
                                    type="number"
                                    value={row.priceValue || ""}
                                    onChange={(e) => handleTableChange(index, 'priceValue', e.target.value)}
                                    placeholder="Enter price"
                                />
                            </td>
                            <td style={{ border: 'none' }}>
                                <select
                                    style={{
                                        width: "100%",
                                        backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                        borderRadius: '20px',
                                        border: 'none',
                                        padding: '12px',
                                        fontSize: '16px',
                                        height: '40px',
                                        minWidth: '100px'
                                    }}
                                    value={row.priceType || ""}
                                    onChange={(e) => handleTableChange(index, 'priceType', e.target.value)}
                                >
                                    <option value="">Select Type</option>
                                    <option value="piece">Piece</option>
                                    <option value="kg">KG</option>
                                </select>
                            </td>
                            <td style={{ border: 'none' }}>
                                <input
                                    style={{
                                        width: "100%",
                                        backgroundColor: 'rgba(255, 235, 59, 0.7)',
                                        borderRadius: '20px',
                                        border: '1px solid #ffc107',
                                        padding: '12px',
                                        fontSize: '16px',
                                        height: '40px',
                                        minWidth: '80px',
                                        textAlign: 'center'
                                    }}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={row.discount || ''}
                                    onChange={(e) => handleTableChange(index, 'discount', e.target.value)}
                                    placeholder="0"
                                />
                            </td>
                            <td style={{ border: 'none' }}>
                                <input
                                    style={{
                                        width: "100%",
                                        marginLeft: "0px",
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '20px',
                                        border: 'none',
                                        padding: '12px',
                                        fontSize: '16px',
                                        height: '40px',
                                        minWidth: '100px',
                                        fontWeight: 'bold',
                                        textAlign: 'center'
                                    }}
                                    type="text"
                                    value={calculateRowTotal(row)}
                                    readOnly
                                />
                            </td>
                            <td style={{ border: 'none' }}>
                                <input
                                    style={{
                                        width: "100%",
                                        backgroundColor: 'rgba(173, 216, 230, 0.7)',
                                        borderRadius: '20px',
                                        border: '1px solid #4CAF50',
                                        padding: '12px',
                                        fontSize: '16px',
                                        height: '40px',
                                        minWidth: '90px',
                                        textAlign: 'center'
                                    }}
                                    type="number"
                                    step="0.01"
                                    value={row.receivedWeight || ''}
                                    onChange={(e) => handleTableChange(index, 'receivedWeight', e.target.value)}
                                    placeholder="0.00"
                                />
                            </td>
                            <td style={{ border: 'none' }}>
                                <input
                                    style={{
                                        width: "100%",
                                        backgroundColor: 'rgba(255, 182, 193, 0.7)',
                                        borderRadius: '20px',
                                        border: '1px solid #2196F3',
                                        padding: '12px',
                                        fontSize: '16px',
                                        height: '40px',
                                        minWidth: '90px',
                                        textAlign: 'center'
                                    }}
                                    type="number"
                                    step="0.01"
                                    value={row.orderedWeight || ''}
                                    onChange={(e) => handleTableChange(index, 'orderedWeight', e.target.value)}
                                    placeholder="0.00"
                                />
                            </td>
                            <td style={{ border: 'none' }}>
                                <input
                                    style={{
                                        width: "100%",
                                        backgroundColor: 'rgba(221, 160, 221, 0.7)',
                                        borderRadius: '20px',
                                        border: '1px solid #9C27B0',
                                        padding: '12px',
                                        fontSize: '16px',
                                        height: '40px',
                                        minWidth: '90px',
                                        textAlign: 'center'
                                    }}
                                    type="number"
                                    step="0.01"
                                    value={row.billedWeight || ''}
                                    onChange={(e) => handleTableChange(index, 'billedWeight', e.target.value)}
                                    placeholder="0.00"
                                />
                            </td>
                            <td style={{ border: 'none' }}>
                                <input
                                    style={{
                                        width: "100%",
                                        backgroundColor: 'rgba(255, 243, 205, 0.7)',
                                        borderRadius: '20px',
                                        border: '1px dashed #ff9800',
                                        padding: '12px',
                                        fontSize: '16px',
                                        height: '40px',
                                        minWidth: '100px',
                                        textAlign: 'center'
                                    }}
                                    type="number"
                                    step="0.01"
                                    value={row.weightDifference || ''}
                                    onChange={(e) => handleTableChange(index, 'weightDifference', e.target.value)}
                                    placeholder="0.00"
                                />
                            </td>
                            <td style={{ border: 'none' }}>
                                <textarea
                                    style={{
                                        width: "100%",
                                        backgroundColor: 'rgba(255, 243, 205, 0.7)',
                                        borderRadius: '20px',
                                        border: '1px dashed #ff9800',
                                        padding: '12px',
                                        fontSize: '14px',
                                        minHeight: '60px',
                                        resize: 'vertical',
                                        minWidth: '180px'
                                    }}
                                    value={row.weightNotes || ''}
                                    onChange={(e) => handleTableChange(index, 'weightNotes', e.target.value)}
                                    placeholder="Weight variance notes..."
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableComponent;