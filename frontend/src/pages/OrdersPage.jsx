import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ChatWindow from '../components/ChatWindow';
import { Package, MessageCircle, DollarSign, Phone, Clock, CheckCircle, Smartphone, AlertCircle, Send } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import io from 'socket.io-client';

// Use same host as the API but different protocol if needed
const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001' : window.location.origin.replace('3000', '5001').replace('5173', '5001');
const socket = io(SOCKET_URL);

const OrdersPage = () => {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [serviceDescription, setServiceDescription] = useState('');
    const [price, setPrice] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();

        // Listen for real-time order updates
        socket.on('status_changed', (updatedOrder) => {
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o));
            if (selectedOrder?._id === updatedOrder._id) {
                setSelectedOrder(prev => ({ ...prev, ...updatedOrder }));
            }
        });

        return () => {
            socket.off('status_changed');
        };
    }, [selectedOrder]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            await api.post('/orders', { serviceDescription });
            setServiceDescription('');
            fetchOrders();
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    const handleUpdateOrderAdmin = async (orderId, newStatus, newPrice = null) => {
        try {
            const updateData = { status: newStatus };
            if (newPrice !== null) updateData.price = newPrice;

            await api.patch(`/orders/${orderId}`, updateData);
            fetchOrders();
            if (selectedOrder && selectedOrder._id === orderId) {
                // Update selected order view
                const res = await api.get(`/orders/${orderId}`);
                setSelectedOrder(res.data);
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const handleSubmitPayment = async (orderId) => {
        try {
            await api.patch(`/orders/${orderId}`, { amountPaid, phoneNumber });
            setAmountPaid('');
            setPhoneNumber('');
            fetchOrders();
            const res = await api.get(`/orders/${orderId}`);
            setSelectedOrder(res.data);
        } catch (error) {
            console.error('Error submitting payment:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Quoted': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Paid': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Processing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Ready': return 'bg-green-100 text-green-700 border-green-200 anim-pulse';
            case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Adeegyada & Wadahadalka</h1>
                    <p className="text-slate-500 mt-1">Ku dhiibo dalabkaaga halkan ama kala soco halka uu marayo.</p>
                </div>
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-600">Live Services</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Orders List Layer */}
                <div className="lg:col-span-4 space-y-6">
                    {user?.role === 'Student' && (
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Package size={20} className="text-blue-600" />
                                Dalab Cusub
                            </h2>
                            <form onSubmit={handleCreateOrder} className="space-y-3">
                                <textarea
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm min-h-[100px]"
                                    placeholder="Maxaad u baahan tahay? Fadlan halkan ku qor..."
                                    value={serviceDescription}
                                    onChange={(e) => setServiceDescription(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    <Send size={18} />
                                    Dir Dalabka
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">Dalabyadaada</h2>
                            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {orders.length} TOTAL
                            </span>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                            {orders.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm italic">
                                    Ilaa hadda ma jiro wax dalab ah.
                                </div>
                            ) : (
                                orders.map((order) => (
                                    <div
                                        key={order._id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${selectedOrder?._id === order._id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                                            {order.serviceDescription}
                                        </p>
                                        {user?.role === 'Admin' && order.student && typeof order.student === 'object' && (
                                            <p className="text-[10px] text-blue-600 font-bold mt-1">
                                                By: {order.student.name || 'Unknown'}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Details & Chat Layer */}
                <div className="lg:col-span-8">
                    {selectedOrder ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Order Info Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-xl font-bold text-slate-900">Faahfaahinta Dalabka</h3>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-slate-700 text-sm italic">"{selectedOrder.serviceDescription}"</p>
                                        </div>

                                        {/* Financial Summary */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase">Qiimaha</p>
                                                <p className="text-lg font-black text-blue-900">${selectedOrder.price || 0}</p>
                                            </div>
                                            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                                                <p className="text-[10px] font-bold text-green-600 uppercase">Lacag Bixinta</p>
                                                <p className="text-lg font-black text-green-900">${selectedOrder.amountPaid || 0}</p>
                                            </div>
                                            <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                                                <p className="text-[10px] font-bold text-red-600 uppercase">Haraaga</p>
                                                <p className="text-lg font-black text-red-900">${selectedOrder.balance || 0}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Service Time</p>
                                                <p className="text-sm font-bold text-slate-700">
                                                    {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div className="w-full md:w-64 space-y-4">
                                        {user?.role === 'Admin' ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">DHIG QIIMAHA</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                            placeholder="$"
                                                            value={price}
                                                            onChange={(e) => setPrice(e.target.value)}
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateOrderAdmin(selectedOrder._id, 'Quoted', price)}
                                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                                                        >
                                                            OK
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleUpdateOrderAdmin(selectedOrder._id, 'Processing')}
                                                        className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                                                    >
                                                        <Clock size={14} /> Bilow Adeega
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateOrderAdmin(selectedOrder._id, 'Ready')}
                                                        className="w-full py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle size={14} /> Adeegu Waa Diyaar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            selectedOrder.status === 'Quoted' && (
                                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
                                                    <h4 className="text-xs font-black text-blue-800 uppercase flex items-center gap-2">
                                                        <DollarSign size={14} /> Submit Payment
                                                    </h4>
                                                    <input
                                                        type="number"
                                                        placeholder="Meqo ayaad soo dirtay?"
                                                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                        value={amountPaid}
                                                        onChange={(e) => setAmountPaid(e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Lambarka aad ka soo dirtay"
                                                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={() => handleSubmitPayment(selectedOrder._id)}
                                                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 shadow-md shadow-blue-100"
                                                    >
                                                        Hubi Lacagta
                                                    </button>
                                                </div>
                                            )
                                        )}

                                        {selectedOrder.status === 'Ready' && user?.role === 'Student' && (
                                            <div className="bg-green-600 p-4 rounded-2xl text-white text-center shadow-xl shadow-green-100 animate-bounce">
                                                <h4 className="text-sm font-black mb-1">ADEEYGAAGI WAA DIYAAR!</h4>
                                                <p className="text-[10px] opacity-80">Fadlan la xiriir Adminka si aad u qaadato.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Chat Window */}
                            <ChatWindow orderId={selectedOrder._id} currentUser={user} />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">Doorasho Sameey</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                Fadlan dhinac bidix ka dooro dalabka aad rabto inaad faahfaahintiisa aragto ama kula sheekaysato adminka.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .anim-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .7; }
                }
            `}</style>
        </div>
    );
};

export default OrdersPage;
