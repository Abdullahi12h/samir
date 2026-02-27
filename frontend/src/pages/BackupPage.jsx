import { useState } from 'react';
import { Download, UploadCloud, Database, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import api from '../utils/api';

const BackupPage = () => {
    const [downloading, setDownloading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [file, setFile] = useState(null);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const response = await api.get('/backup/download', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `alkhid_backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download backup');
        } finally {
            setDownloading(false);
        }
    };

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const response = await api.get('/backup/export-excel', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `alkhid_data_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export Excel file');
        } finally {
            setExporting(false);
        }
    };

    const handleRestore = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a backup file');
        if (!window.confirm('WARNING: Restoring will overwrite all existing data. Are you sure you want to proceed?')) return;

        setRestoring(true);
        const formData = new FormData();
        formData.append('backupFile', file);

        try {
            const res = await api.post('/backup/restore', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(res.data.message || 'Restore successful!');
            setFile(null);
            // Optionally reload the app
            window.location.reload();
        } catch (error) {
            console.error('Restore error:', error);
            alert(error.response?.data?.message || 'Restore failed');
        } finally {
            setRestoring(false);
        }
    };

    const handleFullZip = async () => {
        setDownloading(true);
        try {
            const response = await api.get('/backup/full-zip', {
                responseType: 'blob',
                timeout: 120000 // 2 minutes
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `alkhid_full_system_${new Date().toISOString().split('T')[0]}.zip`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Full backup error:', error);
            let errMsg = 'Failed to download full system backup';
            if (error.response?.data instanceof Blob) {
                // If the error response is a blob, we need to read it as text
                const text = await error.response.data.text();
                try {
                    const json = JSON.parse(text);
                    errMsg = json.message || errMsg;
                } catch (e) { }
            } else if (error.response?.data?.message) {
                errMsg = error.response.data.message;
            }
            alert(errMsg);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                        <Database className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">System Backup & Restore</h1>
                        <p className="text-sm text-slate-500">Safeguard your data and restore from backups</p>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                        System Secure
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 bg-slate-50">
                        <h2 className="font-bold text-slate-700 flex items-center">
                            <Download className="w-5 h-5 mr-2 text-blue-500" />
                            Create Backup
                        </h2>
                    </div>
                    <div className="p-6 flex-1 flex flex-col space-y-5">
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Download a full JSON snapshot for restoration, or an Excel document for human-readable reporting across all tables (one by one). For 100% safety, use the <strong>Full System ZIP</strong>.
                        </p>

                        <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">Included in Backup:</h3>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                {[
                                    { label: 'Accounts & Users', icon: '👤' },
                                    { label: 'Student Profiles', icon: '🎓' },
                                    { label: 'Teacher Records', icon: '👨‍🏫' },
                                    { label: 'Exams & Results', icon: '📝' },
                                    { label: 'Financial Logs', icon: '💰' },
                                    { label: 'Student Photos', icon: '📸' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center text-[11px] font-medium text-slate-600">
                                        <span className="mr-2 text-[10px]">{item.icon}</span>
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <button
                                onClick={handleFullZip}
                                disabled={downloading || exporting}
                                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-md font-bold flex items-center justify-center transform hover:scale-[1.01]"
                            >
                                {downloading ? 'Processing Full ZIP...' : (
                                    <>
                                        <Download className="w-5 h-5 mr-2" /> Full System ZIP (Everything)
                                    </>
                                )}
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading || exporting}
                                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 transition-colors shadow-sm font-medium flex items-center justify-center text-xs"
                                >
                                    <Database className="w-4 h-4 mr-2 text-blue-500" /> Data Only
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    disabled={downloading || exporting}
                                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 transition-colors shadow-sm font-medium flex items-center justify-center text-xs"
                                >
                                    <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" /> Excel Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Restore Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col border-t-4 border-t-red-500">
                    <div className="p-5 border-b border-slate-100 bg-slate-50">
                        <h2 className="font-bold text-slate-700 flex items-center">
                            <UploadCloud className="w-5 h-5 mr-2 text-red-500" />
                            Restore System
                        </h2>
                    </div>
                    <form onSubmit={handleRestore} className="p-6 flex-1 flex flex-col space-y-4">
                        <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start space-x-3 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700 leading-relaxed font-medium">
                                Warning: Restoring from a backup will permanently overwrite current system data. This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                            <input
                                type="file"
                                id="backup-file"
                                accept=".json"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            <label htmlFor="backup-file" className="cursor-pointer flex flex-col items-center space-y-2">
                                <UploadCloud className="w-8 h-8 text-slate-400" />
                                <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                    {file ? file.name : 'Select Backup File (.json)'}
                                </span>
                                <span className="text-xs text-slate-500">
                                    Click to browse files
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={restoring || !file}
                            className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors shadow-sm font-medium"
                        >
                            {restoring ? 'Restoring System...' : 'Start Restoration'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BackupPage;
