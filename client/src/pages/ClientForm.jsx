import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const isEdit = !!id;

  useEffect(() => {
    const fetchClient = async () => {
      if (!isEdit) return;
      
      try {
        setLoading(true);
        const res = await api.get(`/api/clients/${id}`);
        const client = res.data.data;
        
        // Set form data with existing client data
        setFormData({
          name: client.name || '',
          email: client.email || '',
          phone: client.phone || '',
          address: {
            street: client.address?.street || '',
            city: client.address?.city || '',
            state: client.address?.state || '',
            zipCode: client.address?.zipCode || '',
            country: client.address?.country || '',
          },
        });
      } catch (error) {
        toast.error('Error fetching client data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/api/clients/${id}`, formData);
        toast.success('Client updated successfully');
      } else {
        await api.post('/api/clients', formData);
        toast.success('Client created successfully');
      }
      navigate('/clients');
    } catch (error) {
      toast.error(isEdit ? 'Error updating client' : 'Error creating client');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit Client' : 'Add New Client'}</h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Clients
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden sm:rounded-xl border border-gray-100">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
          <p className="mt-1 text-sm text-gray-500">{isEdit ? 'Update existing client details' : 'Enter details for your new client'}</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 sm:p-8">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md transition-all duration-200"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md transition-all duration-200"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md transition-all duration-200"
              />
            </div>

            <div className="col-span-6 border-t border-gray-100 pt-4 mt-4">
              <div className="flex items-center mb-4">
              <div className="p-1.5 bg-gray-100 rounded-md mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
            </div>
            </div>

            <div className="col-span-6 border-t border-gray-100 pt-4 mt-4">
              <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                type="text"
                name="address.street"
                id="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md transition-all duration-200"
              />
            </div>

            <div className="col-span-6 sm:col-span-3 lg:col-span-2">
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="address.city"
                id="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md transition-all duration-200"
              />
            </div>

            <div className="col-span-6 sm:col-span-3 lg:col-span-2">
              <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                State / Province
              </label>
              <input
                type="text"
                name="address.state"
                id="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md transition-all duration-200"
              />
            </div>

            <div className="col-span-6 sm:col-span-3 lg:col-span-2">
              <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                name="address.zipCode"
                id="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md transition-all duration-200"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                name="address.country"
                id="address.country"
                value={formData.address.country}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md transition-all duration-200"
              />
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center py-2.5 px-5 border border-transparent shadow-md text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isEdit ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    )}
                  </svg>
                  {isEdit ? 'Update Client' : 'Create Client'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="ml-3 inline-flex items-center justify-center py-2.5 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm; 