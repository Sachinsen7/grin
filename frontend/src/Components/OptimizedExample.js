import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { useDebounce } from '../hooks/useDebounce';

/**
 * OPTIMIZED COMPONENT EXAMPLE
 * This shows best practices for preventing unnecessary re-renders
 */

// Memoized child component - only re-renders when props change
const SupplierItem = memo(({ supplier, onSelect }) => {
    return (
        <div onClick={() => onSelect(supplier)}>
            {supplier.name} - {supplier.company}
        </div>
    );
});

const OptimizedExample = () => {
    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Debounce search to prevent excessive API calls
    const debouncedSearch = useDebounce(searchTerm, 300);

    // Memoized callback - doesn't recreate on every render
    const loadSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error loading suppliers:', error);
        } finally {
            setLoading(false);
        }
    }, []); // Empty deps - function never changes

    // Memoized callback with dependency
    const handleSelectSupplier = useCallback((supplier) => {
        console.log('Selected:', supplier);
        // Handle selection
    }, []); // Add dependencies if needed

    // Load data once on mount
    useEffect(() => {
        loadSuppliers();
    }, [loadSuppliers]);

    // Memoized filtered list - only recalculates when dependencies change
    const filteredSuppliers = useMemo(() => {
        if (!debouncedSearch) return suppliers;

        return suppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            supplier.company.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [suppliers, debouncedSearch]);

    // Memoized computed value
    const totalSuppliers = useMemo(() => {
        return filteredSuppliers.length;
    }, [filteredSuppliers]);

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search suppliers..."
            />

            <p>Total: {totalSuppliers}</p>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    {filteredSuppliers.map((supplier) => (
                        <SupplierItem
                            key={supplier._id}
                            supplier={supplier}
                            onSelect={handleSelectSupplier}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OptimizedExample;
