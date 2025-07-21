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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

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

  const handleSendEmailModal = () => {
    setEmailRecipient(client.email); // Default to client's email
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailRecipient || !emailRecipient.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      setSendingEmail(true);
      await api.post(`/api/invoices/${id}/send`, { recipientEmail: emailRecipient });
      
      // Update the invoice status in the local state
      setInvoice({
        ...invoice,
        status: 'sent'
      });
      
      setShowEmailModal(false);
      toast.success('Invoice sent successfully');
    } catch (error) {
      toast.error('Error sending invoice');
      console.error(error);
    } finally {
      setSendingEmail(false);
    }
  };
  
  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailRecipient('');
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h1>
            <p className="text-gray-500 mt-1">Created on {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</p>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
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
            className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
          >
            Download PDF
          </button>
          {invoice.status !== 'paid' && (
            <button
              type="button"
              onClick={handleSendEmailModal}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              Send Email
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden sm:rounded-xl border border-gray-100 p-8">
        <div className="px-6 py-6 sm:px-8 flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              Invoice Details
            </h3>
            <div className="mt-2 max-w-2xl text-sm">
              <p className="text-gray-900 font-medium">{client.name}</p>
              <p className="text-gray-500 mt-1">{client.email}</p>
              <p className="text-gray-500">{client.phone}</p>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Created on {format(new Date(invoice.createdAt), 'MMMM dd, yyyy')}
            </p>
          </div>
          <div className="space-y-2">
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                invoice.status
              )}`}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="bg-gray-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8">
              <dt className="text-sm font-medium text-gray-600">Issue Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(invoice.issueDate), 'MMMM dd, yyyy')}
              </dd>
            </div>
            <div className="bg-gray-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8">
              <dt className="text-sm font-medium text-gray-600">Client email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}
              </dd>
            </div>
            <div className="bg-gray-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8">
              <dt className="text-sm font-medium text-gray-600">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <p>{user.company?.name || user.name}</p>
                {user.company?.address && <p>{user.company.address}</p>}
                <p>{user.email}</p>
                {user.company?.phone && <p>{user.company.phone}</p>}
              </dd>
            </div>
            <div className="bg-gray-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8">
              <dt className="text-sm font-medium text-gray-500">Bill To</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-medium">
                <a href={`mailto:${client.email}`} className="text-primary-600 hover:underline">{client.email}</a>
              </dd>
            </div>
          </dl>
        </div>

        {/* Invoice Items */}
        <div className="px-6 py-6 sm:px-8 border-b border-gray-100">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            Client Information
          </h3>
        </div>
        <div className="overflow-x-auto px-1">
          <table className="min-w-full divide-y divide-gray-200 table-auto">
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
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Item
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
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item, index) => {
                const itemTotal = item.quantity * item.unitPrice;
                const itemTax = itemTotal * (item.tax / 100);
                const itemTotalWithTax = itemTotal + itemTax;
                
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.item}</td>
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
        <div className="px-6 py-6 sm:px-8 border-b border-gray-100">
          <div className="sm:flex sm:flex-col sm:items-end">
            <div className="w-full sm:max-w-xs">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                  <div className="text-right space-y-2">
                    <dt className="text-sm font-medium text-gray-700">Subtotal:</dt>
                    <dd className="text-sm font-semibold text-gray-900">${calculateSubtotal().toFixed(2)}</dd>
                  </div>
                  <div className="text-right space-y-2">
                    <dt className="text-sm font-medium text-gray-700">Tax:</dt>
                    <dd className="text-sm font-medium text-gray-900">${invoice.totalTax.toFixed(2)}</dd>
                  </div>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <dt className="text-base font-bold text-gray-900">Total</dt>
                  <dd className="text-base font-bold text-primary-600">
                    ${invoice.totalAmount.toFixed(2)}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes and Payment Terms */}
        {(invoice.notes || invoice.paymentTerms) && (
          <div className="border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              {invoice.notes && (
                <div className="bg-gray-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8">
                  <dt className="text-sm font-medium text-gray-600">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{invoice.notes}</dd>
                </div>
              )}
              {invoice.paymentTerms && (
                <div className="bg-gray-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8">
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

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true"></div>
          
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div
              className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      Send Invoice via Email
                    </h3>
                    <div className="mt-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Recipient Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={emailRecipient}
                        onChange={(e) => setEmailRecipient(e.target.value)}
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="recipient@example.com"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Invoice will be sent as a PDF attachment to this email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {sendingEmail ? 'Sending...' : 'Send'}
                </button>
                <button
                  type="button"
                  onClick={closeEmailModal}
                  disabled={sendingEmail}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceView; 