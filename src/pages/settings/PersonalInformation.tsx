import { useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import Spinner from '@/components/ui/Spinner';

function PersonalInformation() {
  const { user } = useAuth();
  const { updateProfile, isUpdateLoading } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: user?.address || '',
    phoneNumber: user?.phoneNumber || '',
  });
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      // Only send fields that can be updated
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
      };
      
      // Make API call to update user information
      await updateProfile(user.id, updateData);
      
      // After successful update
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Error is already handled by the hook with toast
    }
  };
  
  const requestPhoneChange = () => {
    // TODO: Implement phone verification flow
    alert('This feature is not available at the moment.');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        {!isEditing ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Information</h2>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-[#0066A1] text-white rounded-md px-4 py-2 text-sm"
              >
                Edit Information
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Personal Details</h3>
                <div className="mt-3 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{user?.phoneNumber || 'Not set'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Residential Address</h3>
                <div className="mt-3 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Street Address</p>
                    <p className="font-medium">{user?.address || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between flex-col md:flex-row items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold">Edit Your Information</h2>
              <div className="space-x-2 flex justify-between w-full">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm"
                  disabled={isUpdateLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#0066A1] text-white rounded-md px-4 py-2 text-sm flex items-center justify-center min-w-[100px]"
                  disabled={isUpdateLoading}
                >
                  {isUpdateLoading ? <Spinner size="sm" /> : 'Save Changes'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">Personal Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isUpdateLoading}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isUpdateLoading}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact support to change email</p>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <button 
                      type="button"
                      onClick={requestPhoneChange}
                      className="text-xs text-blue-600"
                      disabled={isUpdateLoading}
                    >
                      Change
                    </button>
                  </div>
                  <input
                    type="tel"
                    value={user?.phoneNumber || ''}
                    disabled
                    className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Phone number change requires verification</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">Residential Address</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isUpdateLoading}
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PersonalInformation; 