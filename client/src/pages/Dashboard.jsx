import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Helper function to get status class based on invoice status
const getStatusClass = (status) => {
  if (status === 'paid') return 'bg-green-100 text-green-800';
  if (status === 'overdue') return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    recentInvoices: [],
    topClients: [],
  });

  // Dashboard data fetching function moved outside of useEffect to avoid deeply nested functions
  const fetchDashboardData = async () => {
    try {
      // Fetch invoices
      const invoicesRes = await api.get('/api/invoices');
      const invoices = invoicesRes.data.data;

      // Fetch clients
      const clientsRes = await api.get('/api/clients');
      const clients = clientsRes.data.data;

      // Calculate statistics
      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');
      const totalPaid = paidInvoices.length;
      const totalUnpaid = unpaidInvoices.length;
      
      const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const totalAmount = paidAmount + unpaidAmount;

      // Get recent invoices (last 5)
      const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Calculate top clients by invoice amount
      const clientTotals = {};
      invoices.forEach(invoice => {
        const clientId = invoice.client._id || invoice.client;
        if (!clientTotals[clientId]) {
          clientTotals[clientId] = 0;
        }
        clientTotals[clientId] += invoice.totalAmount;
      });

      // Helper function to map client data
      const mapClientData = (clientId, total) => {
        const client = clients.find(c => c._id === clientId);
        return {
          id: clientId,
          name: client ? client.name : 'Unknown Client',
          total,
        };
      };

      // Map client IDs to names and sort by total amount
      const topClients = Object.entries(clientTotals)
        .map(([clientId, total]) => mapClientData(clientId, total))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setStats({
        totalInvoices,
        totalPaid,
        totalUnpaid,
        totalAmount,
        paidAmount,
        unpaidAmount,
        recentInvoices,
        topClients,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Chart data for invoice status
  const statusChartData = {
    labels: ['Paid', 'Unpaid'],
    datasets: [
      {
        data: [stats.totalPaid, stats.totalUnpaid],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for monthly invoices
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = Array(12).fill(0);
    
    stats.recentInvoices.forEach(invoice => {
      const month = new Date(invoice.createdAt).getMonth();
      monthlyData[month] += invoice.totalAmount;
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Invoice Amount ($)',
          data: monthlyData,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-md border border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/invoices/new"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
          >
            New Invoice
          </Link>
          <Link
            to="/clients/new"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
          >
            New Client
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-100">
          <div className="px-5 py-6">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Total Invoices
            </dt>
            <dd className="mt-2 text-3xl font-bold text-gray-900">{stats.totalInvoices}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-100">
          <div className="px-5 py-6">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Total Amount
            </dt>
            <dd className="mt-2 text-3xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-100">
          <div className="px-5 py-6">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Paid Amount
            </dt>
            <dd className="mt-2 text-3xl font-bold text-green-600">${stats.paidAmount.toFixed(2)}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-100">
          <div className="px-5 py-6">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Unpaid Amount
            </dt>
            <dd className="mt-2 text-3xl font-bold text-red-600">${stats.unpaidAmount.toFixed(2)}</dd>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-2">
        <div className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-100">
          <div className="px-5 py-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-5 flex items-center gap-2">
              <div className="p-1.5 bg-primary-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Invoice Status
            </h3>
            <div className="h-64 flex justify-center">
              <div className="w-64">
                <Doughnut data={statusChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-100">
          <div className="px-5 py-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-5 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Monthly Invoices
            </h3>
            <div className="h-64">
              <Bar
                data={getMonthlyData()}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-100">
        <div className="px-5 py-5 sm:px-6 flex justify-between items-center border-b border-gray-100">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Recent Invoices
          </h3>
          <Link
            to="/invoices"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center gap-1"
          >
            View all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

          </Link>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Invoice #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentInvoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link to={`/invoices/${invoice._id}/view`} className="text-primary-600 hover:text-primary-900">
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.client.name || 'Unknown Client'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${invoice.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.recentInvoices.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-100">
        <div className="px-5 py-5 sm:px-6 flex justify-between items-center border-b border-gray-100">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            Top Clients
          </h3>
          <Link
            to="/clients"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center gap-1"
          >
            View all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
 clients
          </Link>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-100">
            {stats.topClients.map((client) => (
              <li key={client.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <div className="bg-purple-100 rounded-full p-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    {client.name}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 bg-gray-100 py-1 px-2 rounded-lg">${client.total.toFixed(2)}</div>
                </div>
              </li>
            ))}
            {stats.topClients.length === 0 && (
              <li className="px-6 py-4 text-center text-sm text-gray-500">
                No clients found
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 