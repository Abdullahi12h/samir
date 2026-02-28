import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import { Plus, Trash2, Edit, Lock } from 'lucide-react';
import PrintHeader from './PrintHeader';

const CrudPage = ({ title, endpoint, columns, formFields, roleAccess = ['Admin'], writeAccessRoles = ['Admin'], customActions = [], transformEditData, filters = [], extraHeaderActions = [] }) => {
    const [data, setData] = useState([]);
    const [isLocked, setIsLocked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [lookupData, setLookupData] = useState({});
    const [filterValues, setFilterValues] = useState({});
    const [editingId, setEditingId] = useState(null);
    const user = useAuthStore((state) => state.user);

    const canAccess = !roleAccess || roleAccess.includes(user?.role);
    const canWrite = !writeAccessRoles || writeAccessRoles.includes(user?.role);

    const isFetchingLookups = useRef(false);
    const isFetchingData = useRef(false);

    useEffect(() => {
        const fetchLookups = async () => {
            if (isFetchingLookups.current) return;
            isFetchingLookups.current = true;
            const lookups = {};
            const allFields = [...formFields, ...filters];
            let hasLookups = false;
            try {
                for (const field of allFields) {
                    if ((field.type === 'select' || field.type === 'multi-select') && field.optionsEndpoint) {
                        hasLookups = true;
                        const res = await api.get(field.optionsEndpoint);
                        lookups[field.name] = res.data;
                    }
                }
                if (hasLookups) setLookupData(lookups);
            } catch (e) {
                console.error(`Error fetching lookups for ${title}`, e);
            } finally {
                isFetchingLookups.current = false;
            }
        };
        fetchLookups();
    }, [title, formFields, filters]);

    const fetchData = async () => {
        if (!endpoint || isFetchingData.current) return;
        isFetchingData.current = true;
        try {
            setLoading(true);
            const response = await api.get(endpoint);
            if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                setData(response.data.results || []);
                setIsLocked(!!response.data.isLocked);
            } else {
                setData(response.data || []);
                setIsLocked(false);
            }
        } catch (error) {
            console.error(`Error fetching ${title} `, error);
        } finally {
            setLoading(false);
            isFetchingData.current = false;
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint]);

    const filteredData = data.filter(item => {
        return Object.keys(filterValues).every(key => {
            const val = filterValues[key];
            if (!val) return true;
            const itemVal = item[key]?._id || item[key];
            return itemVal === val;
        });
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = { ...formData };
            for (const field of formFields) {
                if (field.type === 'file' && dataToSubmit[field.name] instanceof File) {
                    const uploadData = new FormData();
                    uploadData.append('file', dataToSubmit[field.name]);
                    const res = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
                    dataToSubmit[field.name] = res.data.file;
                }
            }
            if (editingId) {
                const baseEndpoint = endpoint.split('?')[0];
                await api.put(`${baseEndpoint}/${editingId}`, dataToSubmit);
            } else {
                await api.post(endpoint, dataToSubmit);
            }
            setShowForm(false);
            setFormData({});
            setEditingId(null);
            fetchData();
        } catch (error) {
            console.error(`Error creating ${title}`, error);
            alert(error.response?.data?.message || 'Error occurred');
        }
    };

    const handleEdit = (item) => {
        const data = transformEditData ? transformEditData(item) : item;
        setFormData(data);
        setEditingId(item._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            const baseEndpoint = endpoint.split('?')[0];
            await api.delete(`${baseEndpoint}/${id}`);
            fetchData();
        } catch (error) {
            console.error(`Error deleting ${title}`, error);
            alert(error.response?.data?.message || 'Error occurred');
        }
    };

    if (!canAccess) return <div className="p-8 text-center text-red-500">Access Denied</div>;

    return (
        <div className="space-y-4 sm:space-y-6">
            <PrintHeader title={title} />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{title}</h2>
                    <div className="flex flex-wrap gap-2">
                        {filters.map(filter => (
                            <select
                                key={filter.name}
                                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                                value={filterValues[filter.name] || ''}
                                onChange={(e) => setFilterValues({ ...filterValues, [filter.name]: e.target.value })}
                            >
                                <option value="">All {filter.label}</option>
                                {lookupData[filter.name]?.map(opt => (
                                    <option key={opt._id} value={opt._id}>
                                        {filter.optionsLabel ? (filter.optionsLabel.includes('.') ? filter.optionsLabel.split('.').reduce((obj, key) => obj?.[key], opt) : opt[filter.optionsLabel]) : opt.name}
                                    </option>
                                ))}
                            </select>
                        ))}
                        {extraHeaderActions.map((ActionComponent, idx) => (
                            <ActionComponent key={idx} refresh={fetchData} />
                        ))}
                        {canWrite && (
                            <button onClick={() => { setShowForm(!showForm); if (!showForm) { setFormData({}); setEditingId(null); } }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
                                <Plus className="h-4 w-4 mr-2" />
                                {showForm ? 'Cancel' : 'Add New'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showForm && canWrite && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {formFields.map((field) => (
                                <div key={field.name} className="flex flex-col">
                                    <label className="text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                                    {field.type === 'select' ? (
                                        <select
                                            className="p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                            required={field.required}
                                            value={formData[field.name] || ''}
                                        >
                                            <option value="">Select {field.label}</option>
                                            {field.optionsEndpoint ? (
                                                lookupData[field.name]?.map(opt => (
                                                    <option key={opt[field.optionsValue] || opt._id} value={opt[field.optionsValue] || opt._id}>
                                                        {field.optionsLabel.includes('.') ? field.optionsLabel.split('.').reduce((obj, key) => obj?.[key], opt) : opt[field.optionsLabel]}
                                                    </option>
                                                ))
                                            ) : (
                                                field.options?.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))
                                            )}
                                        </select>
                                    ) : field.type === 'multi-select' ? (
                                        <div className="relative">
                                            <select
                                                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none h-auto bg-none"
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (!value) return;
                                                    const currentArray = formData[field.name] || [];
                                                    if (currentArray.includes(value)) return;
                                                    if (field.max && currentArray.length >= field.max) {
                                                        alert(`You can only select up to ${field.max} items.`);
                                                        return;
                                                    }
                                                    setFormData({ ...formData, [field.name]: [...currentArray, value] });
                                                    e.target.value = '';
                                                }}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select {field.label} (Max {field.max || 5})</option>
                                                {field.optionsEndpoint && lookupData[field.name]?.map(opt => (
                                                    <option key={opt[field.optionsValue] || opt._id} value={opt[field.optionsValue] || opt._id}>
                                                        {field.optionsLabel.includes('.') ? field.optionsLabel.split('.').reduce((obj, key) => obj?.[key], opt) : opt[field.optionsLabel]}
                                                    </option>
                                                ))}
                                            </select>
                                            {Array.isArray(formData[field.name]) && formData[field.name].length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {formData[field.name].map(val => {
                                                        const opt = lookupData[field.name]?.find(o => (o[field.optionsValue] || o._id) === val);
                                                        const displayLabel = opt ? (field.optionsLabel.includes('.') ? field.optionsLabel.split('.').reduce((obj, key) => obj?.[key], opt) : opt[field.optionsLabel]) : val;
                                                        return (
                                                            <span key={val} className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                                                                {displayLabel}
                                                                <button
                                                                    type="button"
                                                                    className="ml-1 text-blue-600 hover:text-blue-900"
                                                                    onClick={() => {
                                                                        const newArr = formData[field.name].filter(v => v !== val);
                                                                        setFormData({ ...formData, [field.name]: newArr });
                                                                    }}
                                                                >
                                                                    &times;
                                                                </button>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ) : field.type === 'file' ? (
                                        <input type="file" accept={field.accept || '*/*'} className="p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none" onChange={(e) => setFormData({ ...formData, [field.name]: e.target.files[0] })} required={field.required && !editingId} />
                                    ) : (
                                        <input type={field.type || 'text'} className="p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none" placeholder={field.label} required={field.required} value={formData[field.name] || ''} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500 text-sm">Loading data...</div>
                ) : isLocked ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                            <Lock className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-black text-red-600 uppercase tracking-tighter animate-pulse">
                            NATIIJADA WAA LA XIRAY
                        </h3>
                        <p className="text-slate-500 text-sm max-w-xs text-center font-bold uppercase tracking-wider">
                            Fadlan la xariir xafiiska examination ustaad Abdallahi Abdinasir Hussein , tell 613213138.
                        </p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                        {title === 'Exam Results' && (
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                                <Lock className="h-8 w-8" />
                            </div>
                        )}
                        <div className={`p-8 text-center text-sm font-bold uppercase tracking-wider ${title === 'Exam Results' ? 'text-red-600' : 'text-slate-500'}`}>
                            {title === 'Exam Results' ? 'Fadlan iska bixi lacagta.' : `No ${title.toLowerCase()} found.`}
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    {columns.map((col, i) => (
                                        <th key={i} className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{col.header}</th>
                                    ))}
                                    {(canWrite || customActions.length > 0) && <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredData.map((item, index) => (
                                    <tr key={item._id || index} className="hover:bg-slate-50 transition-colors">
                                        {columns.map((col, i) => (
                                            <td key={i} className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-700">
                                                {col.render ? col.render(item) : (item[col.accessor] || '-')}
                                            </td>
                                        ))}
                                        {(canWrite || customActions.length > 0) && (
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium flex justify-end items-center space-x-1 sm:space-x-2">
                                                {customActions.map((ActionComponent, idx) => (
                                                    <ActionComponent key={idx} item={item} refresh={fetchData} />
                                                ))}
                                                {canWrite && (
                                                    <>
                                                        <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CrudPage;
