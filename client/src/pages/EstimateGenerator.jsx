import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const EstimateGenerator = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    estimateNumber: `EST-${Date.now()}`,
    estimateDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    status: 'draft',
    items: [
      { description: '', quantity: 1, rate: 0, amount: 0 }
    ],
    notes: '',
    tax: 18,
    discount: 0,
    subtotal: 0,
    taxAmount: 0,
    total: 0
  });
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.tax, formData.discount]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * formData.tax) / 100;
    const total = taxableAmount + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal: subtotal,
      taxAmount: taxAmount,
      total: total
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'clientId') {
      const client = clients.find(c => c._id === value);
      setSelectedClient(client);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId) {
      toast.error('Please select a client');
      return;
    }

    setLoading(true);
    try {
      const estimateData = {
        ...formData,
        client: formData.clientId
      };
      await api.post('/api/estimates', estimateData);
      toast.success('Estimate created successfully');
      // Reset form or redirect
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create estimate');
    } finally {
      setLoading(false);
    }
  };

  const downloadEstimate = async (format = 'pdf') => {
    try {
      const response = await api.post(`/api/estimates/download/${format}`, formData, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.estimateNumber}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(`Failed to download ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estimate Generator</h1>
        <p className="text-gray-600">Create professional estimates for your clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Estimate Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimate Number
                </label>
                <input
                  type="text"
                  name="estimateNumber"
                  value={formData.estimateNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="estimateDate"
                  value={formData.estimateDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until
                </label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Client Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Choose a client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.name} - {client.email}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Items</h2>
              <Button onClick={addItem} className="bg-indigo-600 hover:bg-indigo-700">
                + Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.amount.toFixed(2)}
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                      disabled={formData.items.length === 1}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax (%)
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes or terms..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Saving...' : 'Save Estimate'}
            </Button>
            <Button
              onClick={() => downloadEstimate('pdf')}
              className="bg-red-600 hover:bg-red-700"
            >
              Download PDF
            </Button>
            <Button
              onClick={() => downloadEstimate('docx')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Download DOC
            </Button>
            <Button
              onClick={() => downloadEstimate('pptx')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Download PPTX
            </Button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:sticky lg:top-6">
          <Card className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Preview</h2>
              <Button variant="outline" className="text-sm">
                👁️ Preview
              </Button>
            </div>
            
            <div className="bg-white border rounded-lg p-6 min-h-[600px]">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-indigo-600 mb-2">ESTIMATE</h1>
                <p className="text-sm text-gray-600">#{formData.estimateNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
                  <p className="text-sm text-gray-600">Your Company Name</p>
                  <p className="text-sm text-gray-600">Your Address</p>
                  <p className="text-sm text-gray-600">City, State ZIP</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">To:</h3>
                  {selectedClient ? (
                    <>
                      <p className="text-sm text-gray-600">{selectedClient.name}</p>
                      <p className="text-sm text-gray-600">{selectedClient.email}</p>
                      <p className="text-sm text-gray-600">{selectedClient.address}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Select a client</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm"><span className="font-medium">Estimate Date:</span> {formData.estimateDate}</p>
                </div>
                <div>
                  <p className="text-sm"><span className="font-medium">Valid Until:</span> {formData.validUntil || 'Not specified'}</p>
                </div>
              </div>

              <div className="mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-center py-2 w-16">Qty</th>
                      <th className="text-right py-2 w-20">Rate</th>
                      <th className="text-right py-2 w-20">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.description || 'Item description'}</td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-right py-2">₹{item.rate.toFixed(2)}</td>
                        <td className="text-right py-2">₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{formData.subtotal.toFixed(2)}</span>
                  </div>
                  {formData.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount ({formData.discount}%):</span>
                      <span>-₹{((formData.subtotal * formData.discount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax ({formData.tax}%):</span>
                    <span>₹{formData.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{formData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {formData.notes && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium mb-2">Notes:</h4>
                  <p className="text-sm text-gray-600">{formData.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EstimateGenerator; 