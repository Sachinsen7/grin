import React, { useEffect, useRef, useState, useMemo } from 'react';
import axios from 'axios';
import style from '../Attendee/Inputgrin.module.css';
import styles from "../Attendee/Fileupload.module.css"; // Import the CSS module
import TableComponent from '../../Components/Table/TableEntry'; // Import the TableComponent
import LogOutComponent from '../../Components/LogOut/LogOutComponent';
import { validateFile, FILE_VALIDATION_CONFIG } from '../../utils/fileValidation';
import { useGsnData, useSuppliers } from '../../hooks/useApiData';
import toast from 'react-hot-toast';

export default function Gsn() {
    const [grinNo, setGrinNo] = useState("");
    const [grinDate, setGrinDate] = useState("");
    const [gsn, setGsn] = useState("");
    const [gsnDate, setGsnDate] = useState("");
    const [poNo, setPoNo] = useState("");
    const [poDate, setPoDate] = useState("");

    const [partyName, setpartyName] = useState("");
    const [innoviceno, setInnoviceno] = useState("");
    const [innoviceDate, setInnoviceDate] = useState("");
    const [receivedFrom, setReceivedFrom] = useState("");

    const [lrNo, setLrNo] = useState("");
    const [lrDate, setLrDate] = useState("");
    const [transName, setTransName] = useState("");
    const [vehicleNo, setVehicleNo] = useState("");

    const [materialInfo, setMaterialInfo] = useState("");
    const [file, setFile] = useState(null);
    const [photo, setPhoto] = useState(null);

    // Add state for new fields
    const [gstNo, setGstNo] = useState("");
    const [cgst, setCgst] = useState("");
    const [sgst, setSgst] = useState("");
    const [igst, setIgst] = useState("");
    const [gstTax, setGstTax] = useState(0);
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [mobileNo, setMobileNo] = useState("");

    // State for calculated total amount
    const [totalAmount, setTotalAmount] = useState(0);
    const [materialTotal, setMaterialTotal] = useState(0);

    // State for weight difference notes
    const [weightDifferenceNotes, setWeightDifferenceNotes] = useState("");
    const [weightDifferenceValue, setWeightDifferenceValue] = useState(0);

    // State for latest GSN number
    const [latestGsnNumber, setLatestGsnNumber] = useState("");

    const [tableData, setTableData] = useState(
        Array.from({ length: 20 }, () => ({
            item: '',
            description: '',
            quantityValue: '',
            priceValue: '',
            priceType: '',
            total: 0,
            weightNotes: ''
        }))
    );

    const [backendData, setbackendData] = useState([])
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const popupRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    // State for Company Name suggestions
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [isCompanyPopupVisible, setIsCompanyPopupVisible] = useState(false);
    const companyPopupRef = useRef(null); // Ref for company popup

    // Function to get latest GSN number
    const getLatestGsnNumber = async () => {
        try {
            const url = process.env.REACT_APP_BACKEND_URL;
            const token = localStorage.getItem('authToken');
            const res = await axios.get(`${url}/gsn/getdata`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Normalize response to array
            const data = res && res.data ? res.data : [];
            const arr = Array.isArray(data) ? data : (data ? [data] : []);

            if (arr.length > 0) {
                // Sort by creation date to get the latest
                const sortedData = arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const latestEntry = sortedData[0];
                if (latestEntry && latestEntry.gsn) {
                    setLatestGsnNumber(latestEntry.gsn);
                }
            }
        } catch (err) {
            console.log("Error fetching latest GSN number:", err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const validation = validateFile(file, 'documents');

        if (!validation.isValid) {
            alert(`❌ File validation failed:\n${validation.error}`);
            e.target.value = ''; // Clear the input
            return;
        }

        setFile(file);
        console.log('✓ File validated and selected:', file.name);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        const validation = validateFile(file, 'images');

        if (!validation.isValid) {
            alert(`❌ Photo validation failed:\n${validation.error}`);
            e.target.value = ''; // Clear the input
            return;
        }

        setPhoto(file);
        console.log('✓ Photo validated and selected:', file.name);
    };

    const handleTableChange = (index, field, value) => {
        const updatedData = [...tableData];
        updatedData[index][field] = value;

        // Calculate total for the row when quantityValue or priceValue changes
        if (field === 'quantityValue' || field === 'priceValue') {
            const quantityValue = parseFloat(updatedData[index].quantityValue) || 0;
            const priceValue = parseFloat(updatedData[index].priceValue) || 0;
            updatedData[index].total = quantityValue * priceValue;
        }

        setTableData(updatedData);
    };

    const resetForm = () => {
        setGrinNo('');
        setGrinDate('');
        setGsn('');
        setGsnDate('');
        setPoNo('');
        setPoDate('');
        setpartyName('');
        setInnoviceno('');
        setInnoviceDate('');
        setReceivedFrom('');
        setLrNo('');
        setLrDate('');
        setTransName('');
        setVehicleNo('');
        setMaterialInfo('');
        setFile(null);
        setPhoto(null);
        // Reset new fields
        setGstNo('');
        setCgst('');
        setSgst('');
        setIgst('');
        setGstTax(0);
        setCompanyName('');
        setAddress('');
        setMobileNo('');
        setTotalAmount(0); // Reset total amount
        setMaterialTotal(0); // Reset material total
        setWeightDifferenceNotes(''); // Reset weight difference notes
        setWeightDifferenceValue(0); // Reset weight difference value

        setTableData(
            Array.from({ length: 20 }, (_, index) => ({
                item: '',
                description: '',
                quantityValue: '',
                priceValue: '',
                priceType: '',
                total: 0,
                weightNotes: ''
            }))
        );
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // Client-side validation to avoid server-side validation errors
        // Ensure required fields are present
        if (!grinNo || (typeof grinNo === 'string' && grinNo.trim() === '')) {
            toast.error('GRIN No is required');
            return;
        }
        if (!gsn || (typeof gsn === 'string' && gsn.trim() === '')) {
            toast.error('GSN is required');
            return;
        }
        if (!partyName || (typeof partyName === 'string' && partyName.trim() === '')) {
            toast.error('Supplier Name is required');
            return;
        }

        // Debug: log the key values before creating FormData
        console.debug('Submitting GSN form with', { grinNo, gsn, partyName, grinDate, gsnDate });

        const formData = new FormData();
        formData.append("grinNo", grinNo);
        formData.append("grinDate", grinDate);
        formData.append("gsn", gsn);
        formData.append("gsnDate", gsnDate);
        formData.append("poNo", poNo);
        formData.append("poDate", poDate);
        formData.append("partyName", partyName);
        formData.append("innoviceno", innoviceno);
        formData.append("innoviceDate", innoviceDate);
        formData.append("lrNo", lrNo);
        formData.append("lrDate", lrDate);
        formData.append("transName", transName);
        formData.append("vehicleNo", vehicleNo);
        formData.append("materialInfo", materialInfo);
        formData.append("tableData", JSON.stringify(tableData));

        // Log and Append new fields
        console.log("Frontend Sending - GST:", gstNo, "CGST:", cgst, "SGST:", sgst, "IGST:", igst);
        console.log("Frontend Sending - Company:", companyName, "Address:", address, "Mobile:", mobileNo);
        formData.append("gstNo", gstNo);
        formData.append("cgst", cgst);
        formData.append("sgst", sgst);
        formData.append("igst", igst);
        formData.append("gstTax", gstTax);
        formData.append("companyName", companyName);
        formData.append("address", address);
        formData.append("mobileNo", mobileNo);
        formData.append("totalAmount", totalAmount); // Append calculated total amount
        formData.append("materialTotal", materialTotal); // Append material total
        formData.append("weightDifferenceNotes", weightDifferenceNotes); // Append weight difference notes
        formData.append("weightDifferenceValue", weightDifferenceValue); // Append weight difference value

        if (file) {
            formData.append("file", file);
        }

        if (photo) {
            formData.append("photo", photo);
        }

        // Log all form data for debugging
        console.log("=== GSN Form Data Being Sent ===");
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
        }

        try {
            const url = process.env.REACT_APP_BACKEND_URL;
            const token = localStorage.getItem('authToken');
            console.log("Sending to URL:", `${url}/gsn/upload-data`);
            console.log("Token present:", !!token);
            const response = await axios.post(`${url}/gsn/upload-data`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            console.log(response);
            toast.success("Details Submitted Successfully");
            resetForm();
        } catch (error) {
            console.error('=== GSN Upload Error ===');
            console.error('Error:', error);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Error response:', error.response.data);
                toast.error(`Error: ${error.response.data.message || 'Error in uploading data'}\n\nDetails: ${JSON.stringify(error.response.data, null, 2)}`);
            } else {
                toast.error("Error in uploading data: " + error.message);
            }
        }
    };

    // Use React Query hooks for caching
    const token = localStorage.getItem('authToken');
    const { data: gsnDataFromAPI } = useGsnData(token);
    const { data: suppliersFromAPI } = useSuppliers();

    // Process GSN data with useMemo
    useEffect(() => {
        const getData = async () => {
            try {
                const url = process.env.REACT_APP_BACKEND_URL;
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`${url}/gsn/getdata`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                // Normalize backend data into an array so later .filter/.reduce won't fail
                const data = res && res.data ? res.data : [];
                setbackendData(Array.isArray(data) ? data : (data ? [data] : []));
            } catch (err) {
                console.log(err);
            }
        };
        const loadSuppliers = async () => {
            try {
                const url = process.env.REACT_APP_BACKEND_URL;
                const response = await axios.get(`${url}/api/suppliers`);
                const data = Array.isArray(response.data) ? response.data : [];
                // Do NOT de-duplicate; show all old and new entries
                // Sort by name for readability
                data.sort((a, b) => (a.partyName || '').localeCompare(b.partyName || ''));
                setSuppliers(data);
                setFilteredSuppliers(data);
            } catch (e) {
                console.log('Failed to load suppliers', e);
            }
        }
    }, [gsnDataFromAPI]);

    // Process suppliers data with useMemo
    useEffect(() => {
        if (suppliersFromAPI && Array.isArray(suppliersFromAPI)) {
            const data = suppliersFromAPI;
            // Sort by name for readability
            data.sort((a, b) => (a.partyName || '').localeCompare(b.partyName || ''));
            setSuppliers(data);
            setFilteredSuppliers(data);
        }
    }, [suppliersFromAPI]);

    useEffect(() => {
        if (!partyName) {
            setFilteredSuppliers(suppliers);
            return;
        }
        const filtered = suppliers.filter(s => (s.partyName || '').toLowerCase().includes(partyName.toLowerCase()));
        setFilteredSuppliers(filtered);
    }, [partyName, suppliers]);

    // useEffect for filtering company names
    useEffect(() => {
        if (companyName && companyName.length > 0) {
            // Filter unique companies based on input
            const uniqueCompanies = backendData.reduce((acc, current) => {
                if (current.companyName && current.companyName.toLowerCase().includes(companyName.toLowerCase())) {
                    // Add company only if it's not already in the accumulator
                    if (!acc.some(item => item.companyName.toLowerCase() === current.companyName.toLowerCase())) {
                        acc.push(current); // Store the whole object to retrieve details later
                    }
                }
                return acc;
            }, []);
            setFilteredCompanies(uniqueCompanies);
            setIsCompanyPopupVisible(true); // Show popup when filtering
        } else {
            setFilteredCompanies([]); // Clear suggestions if input is empty
            setIsCompanyPopupVisible(false); // Hide popup
        }
    }, [companyName, backendData]);

    // useEffect for calculating total amount
    useEffect(() => {
        let subTotal = 0;
        tableData.forEach(row => {
            const qty = parseFloat(row.quantityValue) || 0;
            const price = parseFloat(row.priceValue) || 0;
            subTotal += qty * price;
        });

        // Add weight difference to material total
        const weightDiff = parseFloat(weightDifferenceValue) || 0;
        const materialTotalWithDiff = subTotal + weightDiff;

        // Set material total (Before Tax Total + Weight Difference)
        setMaterialTotal(materialTotalWithDiff);

        const cgstPercent = parseFloat(cgst) || 0;
        const sgstPercent = parseFloat(sgst) || 0;
        const igstPercent = parseFloat(igst) || 0;

        // Calculate GST Tax as percentage of materialTotal (including weight difference)
        let taxTotal = 0;
        if (igstPercent > 0) {
            taxTotal = (materialTotalWithDiff * igstPercent) / 100;
        } else {
            taxTotal = (materialTotalWithDiff * (cgstPercent + sgstPercent)) / 100;
        }

        setGstTax(taxTotal);

        const finalTotal = materialTotalWithDiff + taxTotal;
        setTotalAmount(finalTotal);

    }, [tableData, cgst, sgst, igst, weightDifferenceValue]); // Recalculate when table data, cgst, sgst, igst, or weightDifferenceValue changes

    // Auto-fill company details when partyName changes
    useEffect(() => {
        if (!partyName) return;
        // Find all entries with matching partyName (case-insensitive)
        const matches = backendData.filter(
            (entry) => entry.partyName && entry.partyName.toLowerCase() === partyName.toLowerCase()
        );
        if (matches.length > 0) {
            // Use the most recent (by createdAt)
            const latest = matches.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
            setCompanyName(latest.companyName || "");
            setAddress(latest.address || "");
            setGstNo(latest.gstNo || "");
            setMobileNo(latest.mobileNo || "");
            setCgst(latest.cgst || "");
            setSgst(latest.sgst || "");
            setIgst(latest.igst || "");
        }
    }, [partyName, backendData]);

    const handleFocus = () => {
        setIsVisible(true);
        // show all suppliers when focusing
        setFilteredSuppliers(suppliers);
    };

    const handleBlur = (event) => {
        setTimeout(() => setIsVisible(false), 1000);
    };

    const handleSelectParty = (party) => {
        setpartyName(party.partyName || '');
        setCompanyName(party.partyName || '');
        setAddress(party.address || '');
        setGstNo(party.gstNo || '');
        setMobileNo(party.mobileNo || '');
        setIsVisible(false);
    };

    // Handlers for Company Name suggestions
    const handleCompanyFocus = () => {
        if (companyName && filteredCompanies.length > 0) {
            setIsCompanyPopupVisible(true);
        }
    };

    const handleCompanyBlur = () => {
        // Delay hiding to allow click on suggestion
        setTimeout(() => setIsCompanyPopupVisible(false), 200);
    };

    const handleSelectCompany = (selectedCompanyData) => {
        console.log("Selected Company Data:", selectedCompanyData);
        setCompanyName(selectedCompanyData.companyName || "");
        setAddress(selectedCompanyData.address || "");
        setGstNo(selectedCompanyData.gstNo || "");
        setMobileNo(selectedCompanyData.mobileNo || "");
        setCgst(selectedCompanyData.cgst || "");
        setSgst(selectedCompanyData.sgst || "");
        setIsCompanyPopupVisible(false); // Hide popup after selection
    };

    const containerStyle = {
        width: "100%",
        maxWidth: '100%',
        overflow: 'hidden',
        textAlign: 'center',
        minHeight: 'auto',
        padding: 'clamp(10px, 5vw, 20px)',
        background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
        backgroundSize: '400% 400%',
        animation: 'gradientAnimation 12s ease infinite',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        marginLeft: '0',
        marginRight: '0',
        boxSizing: 'border-box',
    };

    const globalStyles = `
    @keyframes gradientAnimation {
        0% { background-position: 0% 50%; }
        25% { background-position: 50% 100%; }
        50% { background-position: 100% 50%; }
        75% { background-position: 50% 0%; }
        100% { background-position: 0% 50%; }
    }
    `;

    return (
        <>
            <LogOutComponent />
            <div style={containerStyle}>
                <style>{globalStyles}</style>
                <div style={{ width: "100%", maxWidth: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginLeft: '0', marginRight: '0', boxSizing: 'border-box', padding: '0 clamp(8px, 3vw, 16px)' }}>
                    <div id="nav"
                        style={{
                            width: "100%",
                            maxWidth: '100%',
                            height: "auto",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: 'center',
                            fontSize: "clamp(18px, 6vw, 25px)",
                            padding: 'clamp(8px, 3vw, 10px)',
                            marginTop: "clamp(10px, 3vw, 20px)",
                            marginLeft: '0',
                            marginRight: '0',
                            boxSizing: 'border-box',
                        }}
                    >
                        <h2>GSN Details</h2>
                    </div>

                    {/* Latest GSN Number Display */}
                    {latestGsnNumber && (
                        <div style={{
                            width: "calc(100% - 20px)",
                            maxWidth: '100%',
                            display: "flex",
                            color: 'black',
                            justifyContent: "center",
                            alignItems: 'center',
                            padding: 'clamp(8px, 2vw, 10px)',
                            marginTop: "clamp(8px, 2vw, 10px)",
                            margin: 'clamp(8px, 2vw, 10px) auto',
                            backgroundColor: 'rgba(224, 211, 211, 0.9)',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            boxSizing: 'border-box'
                        }}>
                            <h3 style={{
                                margin: '0',
                                color: '#333',
                                fontSize: '18px',
                                fontWeight: 'bold'
                            }}>
                                Last GSN And GRIN Number: {latestGsnNumber}
                            </h3>
                        </div>
                    )}

                    <div style={{ width: "100%", maxWidth: '760px', boxSizing: 'border-box', padding: '0 clamp(8px, 3vw, 16px)' }}>
                        <form action="" onSubmit={submitHandler} style={{ margin: 'clamp(12px, 3vw, 18px) clamp(4px, 2vw, 8px)', width: "100%", boxSizing: 'border-box' }}>
                            <div className={styles.form}>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>GRIN NO :</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="number"
                                        value={grinNo}
                                        onChange={(e) => setGrinNo(e.target.value)}
                                    />
                                    <input
                                        required
                                        className={styles.dateInput}
                                        style={{ margin: "10px", maxWidth: "500px" }}
                                        type="date"
                                        value={grinDate}
                                        onChange={(e) => setGrinDate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>GSN :</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="text"
                                        value={gsn}
                                        onChange={(e) => setGsn(e.target.value)}
                                    />
                                    <input
                                        required
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ margin: "10px" }}
                                        value={gsnDate}
                                        onChange={(e) => setGsnDate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>P.O. NO :</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="text"
                                        value={poNo}
                                        onChange={(e) => setPoNo(e.target.value)}
                                    />
                                    <input
                                        required
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ margin: "10px" }}
                                        value={poDate}
                                        onChange={(e) => setPoDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.form}>
                                <div className={styles.formRow} style={{ position: "relative" }}>
                                    <label className={styles.label}>Supplier Name:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        style={{ marginLeft: '5px' }}
                                        type="text"
                                        value={partyName}
                                        onFocus={handleFocus}
                                        onBlur={(event) => handleBlur(event)}
                                        onChange={(e) => setpartyName(e.target.value)}
                                    />
                                    <div
                                        className='popUp'
                                        ref={popupRef}
                                        style={{
                                            display: isVisible ? 'block' : 'none',
                                            position: 'absolute',
                                            zIndex: '1000',
                                            top: '100%',
                                            width: '100%',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            backgroundColor: '#ffffffff',
                                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            transition: 'opacity 0.3s ease-in-out',
                                            opacity: isVisible ? 1 : 0
                                        }}
                                    >
                                        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                                {filteredSuppliers.map((u, idx) => (
                                                    <li key={`${u.partyName}-${u.gstNo}-${idx}`}
                                                        onClick={(e) => { e.stopPropagation(); handleSelectParty(u); }}
                                                        style={{ cursor: 'pointer', padding: '8px 6px', borderTop: '1px solid #eee' }}
                                                    >
                                                        {u.partyName || '-'}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <input type="text" className={`${styles.dateInput} ${styles.dummy}`} style={{ visibility: "hidden" }} />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>Supplier Invoice No:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="text"
                                        style={{ marginLeft: '4px', }}
                                        value={innoviceno}
                                        onChange={(e) => setInnoviceno(e.target.value)}
                                    />
                                    <input
                                        required
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ marginTop: "25px" }}
                                        value={innoviceDate}
                                        onChange={(e) => setInnoviceDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.form}>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>L.R. No:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        style={{ marginBottom: "20px" }}
                                        type="text"
                                        value={lrNo}
                                        onChange={(e) => setLrNo(e.target.value)}
                                    />
                                    <input
                                        required
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ marginTop: "0px" }}
                                        value={lrDate}
                                        onChange={(e) => setLrDate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>Name of Transporter:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="text"
                                        value={transName}
                                        onChange={(e) => setTransName(e.target.value)}
                                    />


                                    <input type="text" className={`${styles.dateInput} ${styles.dummy}`} style={{ visibility: "hidden" }} />


                                </div>






                                <div className={styles.formRow}>
                                    <label className={styles.label}>Vehicle No:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="text"
                                        value={vehicleNo}
                                        onChange={(e) => setVehicleNo(e.target.value)}
                                    />
                                    <input type="text" className={`${styles.dateInput} ${styles.dummy}`} style={{ visibility: "hidden" }} />
                                </div>
                                <div className={style.formRow}>
                                    <label className={style.label}>Upload Photo (Optional):</label>
                                    <label className={style.custom} htmlFor="photo-upload">
                                        {photo ? `${photo.name}` : 'Select Photo'}
                                    </label>
                                    <input
                                        id='photo-upload'
                                        className={style.fileInput}
                                        type="file"
                                        accept="image/jpeg, image/png, image/jpg, .pdf"
                                        onChange={handlePhotoChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className={styles.forms}>
                                <div className={styles.formRow} style={{ width: '100%', display: "flex", flexDirection: 'column' }}>
                                    <label style={{ fontWeight: 'bold', display: "flex" }}>Material Information:</label>
                                    <TableComponent data={tableData} handleTableChange={handleTableChange} />
                                </div>
                            </div>

                            {/* Weight Difference Notes Section */}
                            <div className={styles.form} style={{
                                backgroundColor: 'rgba(255, 243, 205, 0.9)',
                                border: '2px dashed #ff9800',
                                marginTop: '20px',
                                padding: '20px',
                                borderRadius: '10px'
                            }}>
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '15px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#ff6900'
                                }}>
                                    📝 Weight Difference Notes (Not part of item list)
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>Weight Difference (₹):</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        step="0.01"
                                        value={weightDifferenceValue}
                                        onChange={(e) => setWeightDifferenceValue(e.target.value)}
                                        placeholder="Enter weight difference amount"
                                    />
                                </div>

                                <div className={styles.formRow} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <label className={styles.label} style={{ marginBottom: '10px' }}>
                                        Notes/Remarks (Explain weight variance):
                                    </label>
                                    <textarea
                                        className={styles.input}
                                        value={weightDifferenceNotes}
                                        onChange={(e) => setWeightDifferenceNotes(e.target.value)}
                                        rows={4}
                                        placeholder="Example: Supplier sent 6 tons but actual weight is 5 tons 850 kg. Difference of 150 kg due to weight variance in individual pieces (±30g per piece)."
                                        style={{ width: '100%', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{
                                    fontSize: '14px',
                                    color: '#666',
                                    marginTop: '10px',
                                    fontStyle: 'italic',
                                    textAlign: 'center'
                                }}>
                                    💡 This value will be added to the material total for final calculation
                                </div>
                            </div>

                            <div className={style.form} style={{ backgroundColor: "rgba(218, 216, 224, 0.6)" }}>
                                <div className={style.formRow}>
                                    <label className={style.label}>Upload Bill (Optional):</label>
                                    <label className={style.custom} htmlFor="file-upload">
                                        {file ? `${file.name}` : 'Select Bill File'}
                                    </label>
                                    <input
                                        id='file-upload'
                                        className={style.fileInput}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>


                            </div>

                            <div className={styles.form}>
                                <div className={styles.formRow} style={{ position: "relative" }}>
                                    <label className={styles.label}>Supplier Name:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        onFocus={handleCompanyFocus}
                                        onBlur={handleCompanyBlur}
                                    />
                                    <div
                                        className='companyPopUp'
                                        ref={companyPopupRef}
                                        style={{
                                            display: isCompanyPopupVisible && filteredCompanies.length > 0 ? 'block' : 'none',
                                            position: 'absolute',
                                            zIndex: '1000',
                                            top: '100%',
                                            left: '0',
                                            width: 'calc(100% - 2px)',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            backgroundColor: '#ffffff',
                                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                            borderRadius: '8px',
                                            padding: '10px',
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}
                                    >
                                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                            {filteredCompanies.map((compData) => (
                                                <li key={compData._id}
                                                    onClick={() => handleSelectCompany(compData)}
                                                    style={{ cursor: "pointer", padding: "8px 5px", borderBottom: "1px solid #eee" }}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                >
                                                    {compData.companyName}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Address:</label>
                                    <textarea
                                        className={styles.input}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>GST No:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={gstNo}
                                        onChange={(e) => setGstNo(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Mobile No:</label>
                                    <input
                                        className={styles.input}
                                        type="tel"
                                        value={mobileNo}
                                        onChange={(e) => setMobileNo(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Before Tax  Total:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={materialTotal.toFixed(2)}
                                        readOnly
                                        style={{ fontWeight: 'bold', backgroundColor: 'rgba(218, 216, 224, 0.6)' }}
                                    />
                                </div>
                                <div className={styles.formRow} style={{ display: igst ? 'none' : 'flex' }}>
                                    <label className={styles.label}>CGST:</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        step="0.01"
                                        value={cgst}
                                        onChange={(e) => {
                                            setCgst(e.target.value);
                                            if (e.target.value) setIgst(''); // Clear IGST when CGST is entered
                                        }}
                                    />
                                </div>
                                <div className={styles.formRow} style={{ display: igst ? 'none' : 'flex' }}>
                                    <label className={styles.label}>SGST:</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        step="0.01"
                                        value={sgst}
                                        onChange={(e) => {
                                            setSgst(e.target.value);
                                            if (e.target.value) setIgst(''); // Clear IGST when SGST is entered
                                        }}
                                    />
                                </div>
                                <div className={styles.formRow} style={{ display: (cgst || sgst) ? 'none' : 'flex' }}>
                                    <label className={styles.label}>IGST:</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        step="0.01"
                                        value={igst}
                                        onChange={(e) => {
                                            setIgst(e.target.value);
                                            if (e.target.value) {
                                                setCgst(''); // Clear CGST when IGST is entered
                                                setSgst(''); // Clear SGST when IGST is entered
                                            }
                                        }}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>GST Tax:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={gstTax.toFixed(2)}
                                        readOnly
                                        style={{ fontWeight: 'bold', backgroundColor: 'rgba(218, 216, 224, 0.6)' }}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>Total Amount:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={totalAmount.toFixed(2)}
                                        readOnly
                                        style={{ fontWeight: 'bold', backgroundColor: 'rgba(218, 216, 224, 0.6)' }}
                                    />
                                </div>
                            </div>

                            <div id="btn">
                                <button style={{ width: "95%", height: "100%" }} className={style.button} id={styles.btn}>Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}