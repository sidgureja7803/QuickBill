import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { downloadInvoicePDF } from '../utils/pdfGenerator';

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/invoices/${id}`);
        setInvoice(res.data.data);
        setClient(res.data.data.client);
      } catch (error) {
        toast.error('Error fetching invoice');
        console.error(error);
        navigate('/invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, navigate]);

  const handleDownloadPDF = () => {
    if (!invoice || !user || !client) return;
    
    try {
      downloadInvoicePDF(invoice, user, client);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Error downloading PDF');
      console.error(error);
    }
  };

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      await api.post(`/api/invoices/${id}/send`);
      
      // Update the invoice status in the local state
      setInvoice({
        ...invoice,
        status: 'sent'
      });
      
      toast.success('Invoice sent successfully');
    } catch (error) {
      toast.error('Error sending invoice');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const calculateSubtotal = () => {
    if (!invoice) return 0;
    return invoice.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!invoice || !client) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">Invoice not found</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to Invoices
          </button>
          <Link
            to={`/invoices/${id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Download PDF
          </button>
          {invoice.status !== 'paid' && (
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              Send Email
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Invoice Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Created on {format(new Date(invoice.createdAt), 'MMMM dd, yyyy')}
            </p>
          </div>
          <div>
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                invoice.status
              )}`}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(invoice.issueDate), 'MMMM dd, yyyy')}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Due Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">From</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <p>{user.company?.name || user.name}</p>
                {user.company?.address && <p>{user.company.address}</p>}
                <p>{user.email}</p>
                {user.company?.phone && <p>{user.company.phone}</p>}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Bill To</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <p>{client.name}</p>
                {client.address?.street && (
                  <p>
                    {client.address.street}
                    {client.address.city && `, ${client.address.city}`}
                    {client.address.state && `, ${client.address.state}`}
                    {client.address.zipCode && ` ${client.address.zipCode}`}
                    {client.address.country && `, ${client.address.country}`}
                  </p>
                )}
                <p>{client.email}</p>
                {client.phone && <p>{client.phone}</p>}
              </dd>
            </div>
          </dl>
        </div>

        {/* Invoice Items */}
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Qty
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Unit Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tax (%)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item, index) => {
                const itemTotal = item.quantity * item.unitPrice;
                const itemTax = itemTotal * (item.tax / 100);
                const itemTotalWithTax = itemTotal + itemTax;
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tax}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${itemTotalWithTax.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-4 py-5 sm:px-6">
          <div className="sm:flex sm:flex-col sm:items-end">
            <div className="w-full sm:max-w-xs">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <div className="text-sm text-gray-700">Subtotal:</div>
                  <div className="text-sm font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</div>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="text-sm text-gray-700">Tax:</div>
                  <div className="text-sm font-medium text-gray-900">${invoice.totalTax.toFixed(2)}</div>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <div className="text-base font-medium text-gray-900">Total:</div>
                  <div className="text-base font-medium text-gray-900">${invoice.totalAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes and Payment Terms */}
        {(invoice.notes || invoice.paymentTerms) && (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              {invoice.notes && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{invoice.notes}</dd>
                </div>
              )}
              {invoice.paymentTerms && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Payment Terms</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {invoice.paymentTerms}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceView; 