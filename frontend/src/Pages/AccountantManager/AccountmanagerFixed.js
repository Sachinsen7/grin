import React, { useEffect, useState } from 'react';
import styles from '../../Components/Approval/Approval.module.css';
import axios from 'axios';
import TableComponent from '../../Components/Table/Table.rendering';
import LogOutComponent from '../../Components/LogOut/LogOutComponent';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function Accountant() {
    const [visibleItem, setVisibleItem] = useState(null);
    const [selectedValue, setSelectedValue] = useState({});
    const [combinedList, setCombinedList] = useState([]);
    const [filteredGsnList, setFilteredGsnList] = useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isHovered, setIsHovered] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const managerType = 'Account Manager';
    const managerFieldMap = {
        'General Manager': 'GeneralManagerSigned',
        'Store Manager': 'StoreManagerSigned',
        'Purchase Manager': 'PurchaseManagerSigned',
        'Account Manager': 'AccountManagerSigned'
    };

    const url = process.env.REACT_APP_BACKEND_URL;
    const fieldName = managerFieldMap[managerType];

    
    const fetchAndCombineData = async () => {
            try {
            const token = localStorage.getItem('authToken');
            console.log(`(${managerType}) Fetching data with token:`, token);
            
            const [gsnResponse, grnResponse] = await Promise.all([
                axios.get(`${url}/gsn/getdata`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                }),
                axios.get(`${url}/getdata`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            // Sort individual lists first
            const sortedGsnData = (gsnResponse.data || []).filter(u => !u.isHidden)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const sortedGrnData = (grnResponse.data || []).filter(u => !u.isHidden)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            console.log(`(${managerType}) Sorted GSN Data:`, sortedGsnData);
            console.log(`(${managerType}) Sorted GRN Data:`, sortedGrnData);

            const combined = {};
            
           
            sortedGsnData.forEach(doc => {
                if (!combined[doc.partyName]) {
                    combined[doc.partyName] = {
                        partyName: doc.partyName,
                        gsnDocuments: [],
                        grnDocuments: [],
                        GeneralManagerSigned: doc.GeneralManagerSigned,
                        StoreManagerSigned: doc.StoreManagerSigned,
                        PurchaseManagerSigned: doc.PurchaseManagerSigned,
                        AccountManagerSigned: doc.AccountManagerSigned
                    };
                }
                combined[doc.partyName].gsnDocuments.push(doc);
                if (combined[doc.partyName].GeneralManagerSigned === undefined) combined[doc.partyName].GeneralManagerSigned = doc.GeneralManagerSigned;
                if (combined[doc.partyName].StoreManagerSigned === undefined) combined[doc.partyName].StoreManagerSigned = doc.StoreManagerSigned;
                if (combined[doc.partyName].PurchaseManagerSigned === undefined) combined[doc.partyName].PurchaseManagerSigned = doc.PurchaseManagerSigned;
                if (combined[doc.partyName].AccountManagerSigned === undefined) combined[doc.partyName].AccountManagerSigned = doc.AccountManagerSigned;
            });

            // Process sorted GRN documents
            sortedGrnData.forEach(doc => {
                if (!combined[doc.partyName]) {
                    combined[doc.partyName] = {
                        partyName: doc.partyName,
                        gsnDocuments: [],
                        grnDocuments: [],
                        GeneralManagerSigned: doc.GeneralManagerSigned,
                        StoreManagerSigned: doc.StoreManagerSigned,
                        PurchaseManagerSigned: doc.PurchaseManagerSigned,
                        AccountManagerSigned: doc.AccountManagerSigned
                    };
                }
                combined[doc.partyName].grnDocuments.push(doc);
                if (combined[doc.partyName].GeneralManagerSigned === undefined) combined[doc.partyName].GeneralManagerSigned = doc.GeneralManagerSigned;
                if (combined[doc.partyName].StoreManagerSigned === undefined) combined[doc.partyName].StoreManagerSigned = doc.StoreManagerSigned;
                if (combined[doc.partyName].PurchaseManagerSigned === undefined) combined[doc.partyName].PurchaseManagerSigned = doc.PurchaseManagerSigned;
                if (combined[doc.partyName].AccountManagerSigned === undefined) combined[doc.partyName].AccountManagerSigned = doc.AccountManagerSigned;
            });

            const combinedListData = Object.values(combined);

            
            const getLatestDate = (item) => {
                const dates = [
                    ...(item.gsnDocuments || []).map(d => new Date(d.createdAt)),
                    ...(item.grnDocuments || []).map(d => new Date(d.createdAt))
                ].filter(d => !isNaN(d));
                return dates.length > 0 ? Math.max(...dates.map(d => d.getTime())) : 0;
            };

            // Sort the final combined list
            combinedListData.sort((a, b) => getLatestDate(b) - getLatestDate(a));

            console.log(`(${managerType}) Sorted Combined List Data:`, combinedListData);
            setCombinedList(combinedListData);
            setIsDataLoaded(true);

           
            const initialSelectedValue = combinedListData.reduce((acc, item) => {
                if (fieldName && item.hasOwnProperty(fieldName)) {
                    acc[item.partyName] = item[fieldName] === true ? 'checked' : 'not_checked';
                } else {
                    acc[item.partyName] = 'not_checked';
                }
                    return acc;
                }, {});

                setSelectedValue(initialSelectedValue);

            } catch (err) {
            console.error(`(${managerType}) Error fetching data`, err);
            if (err.response) {
                console.error(`(${managerType}) Fetch Error Response:`, err.response.data);
            }
            }
        };

    useEffect(() => {
        fetchAndCombineData();
    }, []);

    // useEffect for filtering based on searchTerm
    useEffect(() => {
        let filtered = combinedList;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = combinedList.filter(item => 
                (item.partyName && item.partyName.toLowerCase().includes(searchLower)) ||
                item.gsnDocuments.some(doc => 
                    (doc.grinNo && doc.grinNo.toLowerCase().includes(searchLower)) ||
                    (doc.gsn && doc.gsn.toLowerCase().includes(searchLower))
                ) ||
                item.grnDocuments.some(doc => 
                    (doc.grinNo && doc.grinNo.toLowerCase().includes(searchLower)) ||
                    (doc.gsn && doc.gsn.toLowerCase().includes(searchLower))
                )
            );
        }
        setFilteredGsnList(filtered);
    }, [searchTerm, combinedList]);

    const formatDate = (oldFormat) => {
        if (!oldFormat) return "N/A";
        const date = new Date(oldFormat);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
        return `${formattedDate}, ${formattedTime}`;
    };

    // Add a new function to format date only with year
    const formatDateOnly = (oldFormat) => {
        if (!oldFormat) return "N/A";
        const date = new Date(oldFormat);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Add a new function to format time only
    const formatTimeOnly = (oldFormat) => {
        if (!oldFormat) return "N/A";
        const date = new Date(oldFormat);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
    };

    const showHandler = (index) => {
        setVisibleItem(visibleItem === index ? null : index);
    };

    const handleRadioChange = (partyName, value) => {
        console.log(`(${managerType}) Radio change for ${partyName}:`, value);
        setSelectedValue(prev => ({ ...prev, [partyName]: value }));
    };

    const handleSubmit = async (e, partyName) => {
        e.preventDefault();
        const currentStatus = selectedValue[partyName] || 'not_checked';
        const payload = {
            partyName,
            managerType,
            status: currentStatus,
            fieldName: fieldName
        };
        console.log(`(${managerType}) Submitting verification status:`, payload);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${url}/verify`, payload, {
                 headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                 }
            });
            console.log(`(${managerType}) Verification Response:`, response.data);
            toast.success('Verification status saved successfully');
            await fetchAndCombineData();
        } catch (err) {
            console.error(`(${managerType}) Error saving verification status`, err);
            if (err.response) {
                console.error(`(${managerType}) Verification Error Response:`, err.response.data);
                toast.error(`Error: ${err.response.data.message || 'Could not save status'}`);
            } else {
                toast.error('An error occurred while saving the status.');
            }
        }
    };

    const isImageFile = (filename) => {
        if (!filename) return false;
        const extension = filename.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
    };

    const handleDownloadPDF = (index, groupIndex) => {
        const item = combinedList[index];
        if (!item) return;
        
        const divElement = document.getElementById(`item-div-${item.partyName}-group-${groupIndex}`);
        if (!divElement) return;

        const partyName = item.partyName || `document-${index}`;
        const sanitizedPartyName = partyName.replace(/[^a-zA-Z0-9]/g, '_');
        const sanitizedManagerType = managerType.replace(/[^a-zA-Z0-9]/g, '_');

        const elementsToHide = divElement.querySelectorAll('.hide-in-pdf');
        const originalDisplayStyles = [];
        elementsToHide.forEach(el => {
            originalDisplayStyles.push(el.style.display);
            el.style.display = 'none';
        });

        setTimeout(() => {
            html2canvas(divElement, { 
                scale: 2, 
                useCORS: true, 
                logging: false, 
                backgroundColor: '#ffffff' 
            }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const imgWidth = 210;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let position = 0;
                const pageHeight = 295;
                let heightLeft = imgHeight;

                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save(`${sanitizedPartyName}_Group${groupIndex + 1}_${sanitizedManagerType}.pdf`);

                elementsToHide.forEach((el, i) => {
                    el.style.display = originalDisplayStyles[i];
                });
            }).catch(err => {
                console.error("Error generating PDF:", err);
                elementsToHide.forEach((el, i) => {
                    el.style.display = originalDisplayStyles[i];
                });
            });
        }, 100);
    };

    return (
        <>
            <LogOutComponent />
            <div className={styles.outer}>
                {/* Search Input */}
                <div style={{ 
                    padding: '10px 20px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '8px', 
                    margin: '10px 0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <input 
                        type="text"
                        placeholder="Search by Supplier Name, GRN or GRIN number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '12px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            fontSize: '16px',
                            outline: 'none',
                            transition: 'border-color 0.3s ease'
                        }}
                    />
                </div>

                {/* Render Filtered List */}
                {filteredGsnList && filteredGsnList.length > 0 ? (
                    filteredGsnList.map((item, index) => {
                        const { partyName, gsnDocuments, grnDocuments, 
                                GeneralManagerSigned, StoreManagerSigned, 
                                PurchaseManagerSigned, AccountManagerSigned } = item;

                        const isApprovedByCurrentManager = !!item[fieldName];
                        const statusText = isApprovedByCurrentManager ? "(Approved)" : "(Not Approved)";

                        // Get the first GSN document for header display
                        const firstGsnDoc = gsnDocuments && gsnDocuments.length > 0 ? gsnDocuments[0] : {};
                        const firstGrnDoc = grnDocuments && grnDocuments.length > 0 ? grnDocuments[0] : {};

                        return (
                            <div key={index} id={`item-div-${partyName}`} className={styles.show}>
                                <h2
                                    style={{
                                        color: "black",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() => showHandler(index)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ 
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '5px',
                                            borderRight: '1px solid #ccc',
                                            paddingRight: '15px',
                                            marginRight: '15px'
                                        }}>
                                            <span style={{ fontSize: '0.9em', color: '#666' }}>
                                                GSN: {firstGsnDoc.gsn || 'N/A'}
                                            </span>
                                            <span style={{ fontSize: '0.9em', color: '#666' }}>
                                                GRIN: {firstGsnDoc.grinNo || 'N/A'}
                                        </span>
                                            <span style={{ fontSize: '0.9em', color: '#666' }}>
                                                DATE: {firstGsnDoc.grinDate ? formatDateOnly(firstGsnDoc.grinDate) : 'N/A'}
                                        </span>
                                            <span style={{ fontSize: '0.9em', color: '#666' }}>
                                                TIME: {firstGsnDoc.grinDate ? formatTimeOnly(firstGsnDoc.grinDate) : 'N/A'}
                                        </span>
                                            </div>
                                            <span style={{ 
                                                fontSize: '1.1em',
                                                fontWeight: '500'
                                            }}>
                                                {partyName}
                                            </span>
                                            <span style={{ marginLeft: '10px', fontSize: '0.8em', color: isApprovedByCurrentManager ? 'green' : 'orange' }}>
                                                {statusText}
                                            </span>
                                    </div>
                                </h2>

                                <div style={{ display: "flex", flexDirection: "row" }}>
                                    {/* Content Section */}
                                    <div className={styles.completeBlock} style={{ display: visibleItem === index ? 'block' : 'none' }}>
                                        <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                            Document details would be rendered here.
                                        </p>
                                    </div>
                                </div>

                                {/* Approval Section */}
                                <div className={`${styles.sign}`}
                                    style={{
                                        width: '90%',
                                        display: 'flex',
                                        margin: '20px auto',
                                        padding: '15px',
                                        flexDirection: windowWidth <= 600 ? "column" : "row",
                                        justifyContent: 'center',
                                        alignItems: "center",
                                        borderRadius: "12px",
                                        backgroundColor: 'rgba(230, 216, 224, 0.3)'
                                    }}>
                                    <form onSubmit={(e) => handleSubmit(e, partyName)} style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: "center" }}>
                                        <div className={styles.submission}>
                                            <div>
                                                <label htmlFor={`checkbox-${partyName}`}><h6>Approve ({managerType})</h6></label>
                                                <br/><center>
                                                <input
                                                    id={`checkbox-${partyName}`}
                                                    style={{
                                                        width: '12px',
                                                        height: '20px',
                                                        transform: 'scale(1.5)',
                                                        cursor: 'pointer',
                                                        marginLeft: '10px'
                                                    }}
                                                    name={`checkbox-${partyName}`}
                                                    value='checked'
                                                    type="checkbox"
                                                    onChange={() => handleRadioChange(partyName, selectedValue[partyName] === 'checked' ? 'not_checked' : 'checked')}
                                                    checked={selectedValue[partyName] === 'checked'}
                                                />
                                                </center>
                                            </div>
                                        </div>
                                        <button 
                                            type='submit'
                                            style={{
                                                width: '100%',
                                                maxWidth: '100px',
                                                margin: '5px',
                                                padding: "8px 15px",
                                                minWidth: "80px",
                                                borderRadius: '15px',
                                                border: '2px solid transparent',
                                                backgroundColor: 'rgba(230, 216, 224, 0.8)',
                                                color: 'black',
                                                fontSize: '1rem',
                                                transition: 'background-color 0.3s ease',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = "#0056b3"}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(218, 216, 224, 0.8)"}
                                        >
                                            Submit
                                        </button>
                                    </form>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <h3 style={{ color: '#666' }}>Loading data...</h3>
                        {isDataLoaded && <p style={{ color: '#999' }}>No documents found for Account Manager approval.</p>}
                    </div>
                )}
            </div>
        </>
    );
}
