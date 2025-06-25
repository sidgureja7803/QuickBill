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

  useEffect(() => {
    const fetchData = async () => {
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

        // Map client IDs to names and sort by total amount
        const topClients = Object.entries(clientTotals)
          .map(([clientId, total]) => {
            const client = clients.find(c => c._id === clientId);
            return {
              id: clientId,
              name: client ? client.name : 'Unknown Client',
              total,
            };
          })
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

    fetchData();
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <Link
            to="/invoices/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            New Invoice
          </Link>
          <Link
            to="/clients/new"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            New Client
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalInvoices}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Amount</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">${stats.totalAmount.toFixed(2)}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Paid Amount</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">${stats.paidAmount.toFixed(2)}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Unpaid Amount</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">${stats.unpaidAmount.toFixed(2)}</dd>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Invoice Status</h3>
            <div className="h-64 flex justify-center">
              <div className="w-64">
                <Doughnut data={statusChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Monthly Invoices</h3>
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Invoices</h3>
          <Link
            to="/invoices"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
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
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Top Clients</h3>
          <Link
            to="/clients"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all clients
          </Link>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {stats.topClients.map((client) => (
              <li key={client.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">{client.name}</div>
                  <div className="text-sm text-gray-500">${client.total.toFixed(2)}</div>
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