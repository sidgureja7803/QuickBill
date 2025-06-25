import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    client: '',
    issueDate: new Date(),
    dueDate: addDays(new Date(), 30),
    items: [
      { description: '', quantity: 1, unitPrice: 0, tax: 0 }
    ],
    notes: '',
    paymentTerms: 'Payment due within 30 days',
    status: 'draft'
  });

  // Extract client ID from query params if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const clientId = searchParams.get('client');
    if (clientId) {
      setFormData(prevState => ({
        ...prevState,
        client: clientId
      }));
    }
  }, [location.search]);

  const isEdit = !!id;

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/api/clients');
        setClients(res.data.data);
      } catch (error) {
        toast.error('Error fetching clients');
        console.error(error);
      }
    };

    const fetchInvoice = async () => {
      if (!isEdit) return;
      
      try {
        setLoading(true);
        const res = await api.get(`/api/invoices/${id}`);
        const invoice = res.data.data;
        
        // Set form data with existing invoice data
        setFormData({
          client: invoice.client._id || invoice.client,
          issueDate: new Date(invoice.issueDate),
          dueDate: new Date(invoice.dueDate),
          items: invoice.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            tax: item.tax
          })),
          notes: invoice.notes || '',
          paymentTerms: invoice.paymentTerms || 'Payment due within 30 days',
          status: invoice.status
        });
      } catch (error) {
        toast.error('Error fetching invoice data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
    fetchInvoice();
  }, [id, isEdit]);

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [name]: name === 'description' ? value : parseFloat(value) || 0
    };
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: '', quantity: 1, unitPrice: 0, tax: 0 }
      ]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      return toast.error('Invoice must have at least one item');
    }
    
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  const calculateTax = () => {
    return formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (itemTotal * (item.tax / 100));
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.client) {
      return toast.error('Please select a client');
    }
    
    if (formData.items.some(item => !item.description)) {
      return toast.error('All items must have a description');
    }
    
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/api/invoices/${id}`, formData);
        toast.success('Invoice updated successfully');
      } else {
        const res = await api.post('/api/invoices', formData);
        toast.success('Invoice created successfully');
      }
      navigate('/invoices');
    } catch (error) {
      toast.error(isEdit ? 'Error updating invoice' : 'Error creating invoice');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-6 gap-6">
            {/* Client selection */}
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                Client
              </label>
              <select
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Issue Date */}
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
                Issue Date
              </label>
              <DatePicker
                selected={formData.issueDate}
                onChange={(date) => handleDateChange('issueDate', date)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Due Date */}
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <DatePicker
                selected={formData.dueDate}
                onChange={(date) => handleDateChange('dueDate', date)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Items */}
            <div className="col-span-6">
              <label htmlFor="items" className="block text-sm font-medium text-gray-700 mb-2">
                Items
              </label>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Description"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                            min="1"
                            className="block w-20 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            name="unitPrice"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                            min="0"
                            step="0.01"
                            className="block w-28 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            name="tax"
                            value={item.tax}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                            min="0"
                            max="100"
                            className="block w-20 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${(item.quantity * item.unitPrice * (1 + item.tax / 100)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Add Item
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="col-span-6 sm:col-span-6 lg:col-span-3"></div>
            <div className="col-span-6 sm:col-span-6 lg:col-span-3">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <div className="text-sm text-gray-700">Subtotal:</div>
                  <div className="text-sm font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</div>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="text-sm text-gray-700">Tax:</div>
                  <div className="text-sm font-medium text-gray-900">${calculateTax().toFixed(2)}</div>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <div className="text-base font-medium text-gray-900">Total:</div>
                  <div className="text-base font-medium text-gray-900">${calculateTotal().toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Any additional notes for the client"
              ></textarea>
            </div>

            {/* Payment Terms */}
            <div className="col-span-6">
              <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700">
                Payment Terms
              </label>
              <input
                type="text"
                id="paymentTerms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm; 