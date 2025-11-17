import React, { useEffect, useRef, useState, useMemo } from 'react';
import axios from 'axios';
import style from './Inputgrin.module.css';
import styles from './Fileupload.module.css';
import TableComponent from '../../Components/Table/TableEntry';
import LogOutComponent from '../../Components/LogOut/LogOutComponent';
import { useLocation } from 'react-router-dom';
import { validateFile } from '../../utils/fileValidation';
import { useGsnData, useSuppliers } from '../../hooks/useApiData';
import toast from 'react-hot-toast';

export default function Attendee() {
    const location = useLocation();
    const initialselectedValue = location.state?.selectedvalue || '';
    const gsndate = location.state?.innoviceDate || '';
    const initialGrinNo = location.state?.selectedGrinNo || '';
    const initialGsn = location.state?.selectedGsn || '';
    const initialGrinDate = location.state?.selectedGrinDate || '';
    const initialGsnDate = location.state?.selectedGsnDate || '';

    const initialgsnDate = gsndate && !isNaN(new Date(gsndate))
        ? new Date(gsndate).toISOString().split('T')[0]
        : '';

    const [grinNo, setGrinNo] = useState(initialGrinNo);
    const [grinDate, setGrinDate] = useState(initialGrinDate);
    const [gsn, setGsn] = useState(initialGsn);
    const [gsnDate, setGsnDate] = useState(initialGsnDate);
    const [poNo, setPoNo] = useState('');
    const [poDate, setPoDate] = useState('');
    const [partyName, setpartyName] = useState(initialselectedValue);
    const [innoviceno, setInnoviceno] = useState('');
    const [innoviceDate, setInnoviceDate] = useState(initialgsnDate);
    const [receivedFrom, setReceivedFrom] = useState('');
    const [lrNo, setLrNo] = useState('');
    const [lrDate, setLrDate] = useState('');
    const [transName, setTransName] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [materialInfo, setMaterialInfo] = useState('');
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


    const [totalAmount, setTotalAmount] = useState(0);
    const [materialTotal, setMaterialTotal] = useState(0);


    const [latestGsnNumber, setLatestGsnNumber] = useState("");

    const [tableData, setTableData] = useState(
        Array.from({ length: 20 }, () => ({
            item: '',
            description: '',
            quantityValue: '',
            priceValue: '',
            priceType: '',
            total: 0
        }))
    );

    // State variables
    const [backendData, setbackendData] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const popupRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

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


        if (field === 'quantityValue' || field === 'priceValue') {
            const quantity = parseFloat(updatedData[index].quantityValue) || 0;
            const price = parseFloat(updatedData[index].priceValue) || 0;
            updatedData[index].total = quantity * price;
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

        setGstNo('');
        setCgst('');
        setSgst('');
        setIgst('');
        setGstTax(0);
        setCompanyName('');
        setAddress('');
        setMobileNo('');
        setTotalAmount(0);
        setMaterialTotal(0);

        setTableData(
            Array.from({ length: 20 }, (_, index) => ({
                item: '',
                description: '',
                quantityValue: '',
                priceValue: '',
                priceType: '',
                total: 0
            }))
        );
    };


    useEffect(() => {
        let subTotal = 0;
        tableData.forEach(row => {
            const qty = parseFloat(row.quantityValue) || 0;
            const price = parseFloat(row.priceValue) || 0;
            subTotal += qty * price;
        });

        setMaterialTotal(subTotal);

        const cgstPercent = parseFloat(cgst) || 0;
        const sgstPercent = parseFloat(sgst) || 0;
        const igstPercent = parseFloat(igst) || 0;


        let taxTotal = 0;
        if (igstPercent > 0) {
            taxTotal = (subTotal * igstPercent) / 100;
        } else {
            taxTotal = (subTotal * (cgstPercent + sgstPercent)) / 100;
        }

        setGstTax(taxTotal);

        const finalTotal = subTotal + taxTotal;
        setTotalAmount(finalTotal);
    }, [tableData, cgst, sgst, igst]);

    const submitHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('grinNo', grinNo);
        formData.append('grinDate', grinDate);
        formData.append('gsn', gsn);
        formData.append('gsnDate', gsnDate);
        formData.append('poNo', poNo);
        formData.append('poDate', poDate);
        formData.append('partyName', partyName);
        formData.append('innoviceno', innoviceno);
        formData.append('innoviceDate', innoviceDate);
        formData.append('receivedFrom', receivedFrom);
        formData.append('lrNo', lrNo);
        formData.append('lrDate', lrDate);
        formData.append('transName', transName);
        formData.append('vehicleNo', vehicleNo);
        formData.append('materialInfo', materialInfo);
        formData.append('tableData', JSON.stringify(tableData));

        // Log and Append new fields
        console.log("Frontend Sending - GST:", gstNo, "CGST:", cgst, "SGST:", sgst, "IGST:", igst);
        console.log("Frontend Sending - Company:", companyName, "Address:", address, "Mobile:", mobileNo);
        formData.append("gstNo", gstNo);
        formData.append("cgst", cgst);
        formData.append("sgst", sgst);
        formData.append("igst", igst);
        formData.append("gstTax", gstTax.toString());
        formData.append("companyName", companyName);
        formData.append("address", address);
        formData.append("mobileNo", mobileNo);
        formData.append("totalAmount", totalAmount.toString());
        formData.append("materialTotal", materialTotal.toString());

        if (file) {
            formData.append('file', file);
        }

        // Append photo if selected (optional)
        if (photo) {
            formData.append('photo', photo);
            console.log("Photo added to form data:", photo.name);
        }

        try {
            const url = process.env.REACT_APP_BACKEND_URL;
            const token = localStorage.getItem('authToken');
            console.log("Submitting to URL:", `${url}/upload-data`);
            console.log("Using token:", token ? "Token exists" : "No token found");
            console.log("FormData contents:", Object.fromEntries(formData.entries()));

            const response = await axios.post(`${url}/upload-data`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("Response:", response.data);


            if (response.status === 200) {
                toast.success('Entry Updated Successfully');
            } else {
                toast.success('Entry Created Successfully');
            }

            resetForm();
        } catch (error) {
            toast.error('Error in uploading data');
            console.error('Error uploading file:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
            }
        }
    };

    // Use React Query hooks for caching
    const token = localStorage.getItem('authToken');
    const { data: gsnDataFromAPI } = useGsnData(token);
    const { data: suppliersFromAPI } = useSuppliers();

    // Process GSN data with caching
    useEffect(() => {
        if (gsnDataFromAPI && Array.isArray(gsnDataFromAPI)) {
            setbackendData(gsnDataFromAPI);

            // Get latest GSN number from cached data
            if (gsnDataFromAPI.length > 0) {
                const sortedData = gsnDataFromAPI.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const latestEntry = sortedData[0];
                if (latestEntry && latestEntry.gsn) {
                    setLatestGsnNumber(latestEntry.gsn);
                }
            }
        }
    }, [gsnDataFromAPI]);

    // Process suppliers data with caching
    useEffect(() => {
        if (suppliersFromAPI && Array.isArray(suppliersFromAPI)) {
            const data = suppliersFromAPI;
            // Sort by name for readability
            data.sort((a, b) => (a.partyName || '').localeCompare(b.partyName || ''));
            setSuppliers(data);
            setFilteredSuppliers(data);
        }
    }, [suppliersFromAPI]);

    // Auto-fill initial values from location state
    useEffect(() => {
        if (initialselectedValue) {
            setpartyName(initialselectedValue);
            console.log("Auto-filled Party Name:", initialselectedValue);
        }
        if (initialgsnDate) {
            setInnoviceDate(initialgsnDate);
            console.log("Auto-filled Invoice Date:", initialgsnDate);
        }
        if (initialGrinNo) {
            setGrinNo(initialGrinNo);
            console.log("Auto-filled GRIN No:", initialGrinNo);
        }
        if (initialGsn) {
            setGsn(initialGsn);
            console.log("Auto-filled GSN:", initialGsn);
        }
        if (initialGrinDate) {
            setGrinDate(initialGrinDate);
            console.log("Auto-filled GRIN Date:", initialGrinDate);
        }
        if (initialGsnDate) {
            setGsnDate(initialGsnDate);
            console.log("Auto-filled GSN Date:", initialGsnDate);
        }
    }, [initialselectedValue, initialgsnDate, initialGrinNo, initialGsn, initialGrinDate, initialGsnDate]);

    useEffect(() => {
        const getData = async () => {
            try {
                const url = process.env.REACT_APP_BACKEND_URL;
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`${url}/gsn/getdata`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                setbackendData(res.data);
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
                data.sort((a, b) => (a.partyName || '').localeCompare(b.partyName || ''));
                setSuppliers(data);
                setFilteredSuppliers(data);
            } catch (e) {
                console.log('Failed to load suppliers', e);
            }
        };
        getData();
        loadSuppliers();
    }, []);

    useEffect(() => {
        if (!partyName) {
            setFilteredSuppliers(suppliers);
            return;
        }
        const filtered = suppliers.filter(s => (s.partyName || '').toLowerCase().includes(partyName.toLowerCase()));
        setFilteredSuppliers(filtered);
    }, [partyName, suppliers]);


    useEffect(() => {
        if (!partyName) return;

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
        setFilteredSuppliers(suppliers);
    };

    const handleBlur = (event) => {
        setTimeout(() => setIsVisible(false), 1000);
    };

    const handleSelectParty = (party) => {
        const partyNameValue = party.partyName || '';
        setpartyName(partyNameValue);
        setCompanyName(partyNameValue);
        setAddress(party.address || '');
        setGstNo(party.gstNo || '');
        setMobileNo(party.mobileNo || '');
        setIsVisible(false);
    };

    // Inline CSS Styles
    const containerStyle = {
        width: "130%",
        overflow: 'hidden',
        textAlign: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
        backgroundSize: '400% 400%',
        animation: 'gradientAnimation 12s ease infinite',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        marginLeft: 'auto',
        marginRight: 'auto',
    };

    const globalStyles = `
    @keyframes gradientAnimation {
        0% { background-position: 0% 50%; }
        25% { background-position: 50% 100%; }
        50% { background-position: 100% 50%; }
        75% { background-position: 50% 0%; }
        100% { background-position: 0% 50%; }
    }

    @media (max-width: 768px) {
        .formRow {
            flex-direction: column;
            align-items: flex-start;
        }
        .input, .dateInput {
            width: 100%;
            margin: 5px 0;
        }
        .popUp {
            width: 90%;
            left: 5%;
        }
        #nav h2 {
            font-size: 1.5rem;
        }
        .button {
            width: 100%;
            padding: 10px;
            font-size: 1rem;
        }
    }
    `;

    return (
        <>
            <LogOutComponent />
            <div style={containerStyle} >
                <style>{globalStyles}</style>
                <div
                    style={{

                        width: '100vw',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div
                        id="nav"
                        style={{

                            width: '90%',
                            height: '30px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '25px',
                            padding: '10px',
                            marginTop: '20px',
                        }}
                    >
                        <h2>GRIN Details</h2>
                    </div>

                    {/* Latest GSN Number Display */}
                    {latestGsnNumber && (
                        <div style={{
                            width: "90%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: 'center',
                            padding: '10px',
                            marginTop: "10px",
                            backgroundColor: 'rgba(226, 201, 201, 0.9)',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
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

                    <div style={{
                        width: '90vw', maxWidth: '700px',

                    }}>
                        <form
                            action=""
                            onSubmit={submitHandler}
                            style={{
                                margin: '20px', width: '100%',

                            }}
                        >
                            {/* GRIN NO. and Date */}
                            <div className={styles.form}>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>GRIN NO:</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        readOnly
                                        value={grinNo}
                                        onChange={(e) => setGrinNo(e.target.value)}
                                    />
                                    <input
                                        className={styles.dateInput}
                                        style={{ margin: '10px', maxWidth: '500px' }}
                                        type="date"
                                        value={grinDate}
                                        onChange={(e) => setGrinDate(e.target.value)}
                                    />
                                </div>

                                {/* GSN and Date */}
                                <div className={styles.formRow}>
                                    <label className={styles.label}>GSN:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={gsn}
                                        readOnly
                                        required
                                        onChange={(e) => setGsn(e.target.value)}
                                    />
                                    <input
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ margin: '10px' }}
                                        value={gsnDate}
                                        readOnly
                                        required
                                        onChange={(e) => setGsnDate(e.target.value)}
                                    />
                                </div>

                                {/* P.O. NO. and Date */}
                                <div className={styles.formRow}>
                                    <label className={styles.label}>P.O. NO:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={poNo}
                                        onChange={(e) => setPoNo(e.target.value)}
                                    />
                                    <input
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ margin: '10px' }}
                                        value={poDate}
                                        onChange={(e) => setPoDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            { }
                            <div className={styles.form}>
                                { }
                                <div className={styles.formRow} style={{ position: 'relative' }}>
                                    <label className={styles.label}>Supplier Name:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={partyName}
                                        onFocus={handleFocus}
                                        onBlur={(event) => handleBlur(event)}
                                        readOnly
                                        onChange={(e) => setpartyName(e.target.value)}
                                    />
                                    {/* Popup for Party Name Suggestions */}
                                    <div
                                        className="popUp"
                                        ref={popupRef}
                                        style={{
                                            display: isVisible ? 'block' : 'none',
                                            position: 'absolute',
                                            zIndex: '1000',
                                            top: '100%',
                                            width: '100%',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            backgroundColor: '#ffffff',
                                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                            borderRadius: '8px',
                                            padding: '10px',
                                            transition: 'opacity 0.3s ease-in-out',
                                            opacity: isVisible ? 1 : 0,
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
                                    { }
                                    <input
                                        type="text"
                                        className={`${styles.dateInput} ${styles.dummy}`}
                                        style={{ visibility: 'hidden' }}
                                    />
                                </div>

                                {/* Party Invoice No and Date Input */}
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Supplier Invoice No:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={innoviceno}
                                        onChange={(e) => setInnoviceno(e.target.value)}
                                    />
                                    <input
                                        className={styles.dateInput}
                                        type="date"
                                        readOnly
                                        value={innoviceDate}
                                        onChange={(e) => setInnoviceDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* Transport Details */}
                            <div className={styles.form}>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>L.R. No:</label>
                                    <input
                                        className={styles.input}
                                        style={{ marginBottom: '20px' }}
                                        type="text"
                                        value={lrNo}
                                        onChange={(e) => setLrNo(e.target.value)}
                                    />
                                    <input
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ marginTop: '30px' }}
                                        value={lrDate}
                                        onChange={(e) => setLrDate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>Name of Transporter:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={transName}
                                        onChange={(e) => setTransName(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className={`${styles.dateInput} ${styles.dummy}`}
                                        style={{ visibility: 'hidden' }}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>Vehicle No:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={vehicleNo}
                                        onChange={(e) => setVehicleNo(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className={`${styles.dateInput} ${styles.dummy}`}
                                        style={{ visibility: 'hidden' }}
                                    />
                                </div>

                                {/* Add Photo Upload Field */}
                                <div className={style.formRow}>
                                    <label className={style.label}>Upload Photo (Optional):</label>
                                    <label
                                        className={style.custom}
                                        htmlFor="photo-upload"
                                    >
                                        {photo !== null ? `${photo.name}` : 'Select Photo'}
                                    </label>
                                    <input
                                        id="photo-upload"
                                        className={style.fileInput}
                                        type="file"
                                        accept="image/jpeg, image/png, image/jpg, .pdf"
                                        onChange={handlePhotoChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>


                            </div>

                            {/* Added Section for New Fields */}
                            <div className={styles.form}>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Supplier Name:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
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
                                    <label className={styles.label}>Before Tax Total:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={materialTotal.toFixed(2)}
                                        readOnly
                                        style={{ fontWeight: 'bold', backgroundColor: '#e9ecef' }}
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
                                            if (e.target.value) setIgst('');
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
                                            if (e.target.value) setIgst('');
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
                                                setCgst('');
                                                setSgst('');
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
                                        style={{ fontWeight: 'bold', backgroundColor: '#e9ecef' }}
                                    />
                                </div>

                                { }
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Total Amount:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={totalAmount.toFixed(2)}
                                        readOnly
                                        style={{ fontWeight: 'bold', backgroundColor: '#e9ecef' }}
                                    />
                                </div>
                            </div>
                            {/* End Added Section */}

                            { }
                            <div className={styles.forms}>
                                <div
                                    className={styles.formRow}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',

                                        borderRadius: '15px',
                                    }}
                                >
                                    <label className={styles.label}>Material Information:</label>
                                    <TableComponent
                                        data={tableData}
                                        handleTableChange={handleTableChange}
                                    />
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className={style.form}
                                style={{ backgroundColor: "rgba(218, 216, 224, 0.6)" }}
                            >
                                <div className={style.formRow}>
                                    <label className={style.label}>Upload Bill (Optional):</label>
                                    <label
                                        className={style.custom}
                                        htmlFor="file-upload"
                                    >
                                        {file !== null ? `${file.name}` : 'Select Bill'}
                                    </label>
                                    <input
                                        id="file-upload"
                                        className={style.fileInput}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                            </div>

                            {/* Submit Button */}
                            <div id="btn">
                                <button
                                    style={{
                                        width: '100%',
                                        backgroundColor: "rgba(218, 216, 224, 0.8)"
                                    }}
                                    className={style.button}
                                    id={styles.btn}
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}