import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  bvn: string;
  dateOfBirth: string;
  phoneNumber: string;
}

function KycBvnVerification() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    bvn: '',
    dateOfBirth: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.bvn) {
      newErrors.bvn = 'BVN is required';
    } else if (!/^\d{11}$/.test(formData.bvn)) {
      newErrors.bvn = 'BVN must be 11 digits';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 11 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call to verify BVN
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, simulate successful verification
      navigate('/settings/kyc/success');
    } catch (error) {
      console.error('BVN verification failed:', error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">BVN Verification</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Verify with BVN</h2>
          <p className="text-gray-600 mt-2">
            Please provide your BVN and additional information to verify your identity.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="bvn" className="block text-sm font-medium text-gray-700 mb-1">
                Bank Verification Number (BVN)
              </label>
              <input
                type="text"
                id="bvn"
                name="bvn"
                value={formData.bvn}
                onChange={handleChange}
                maxLength={11}
                placeholder="Enter your 11-digit BVN"
                className={`w-full border ${
                  errors.bvn ? 'border-red-500' : 'border-gray-300'
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.bvn && (
                <p className="mt-1 text-sm text-red-500">{errors.bvn}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Your BVN is an 11-digit number issued by the Central Bank of Nigeria.
              </p>
            </div>
            
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full border ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                maxLength={11}
                placeholder="Enter your phone number"
                className={`w-full border ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter the phone number registered with your BVN.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate('/settings/kyc')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-md font-medium bg-[#0066A1] text-white ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#005085]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify BVN'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default KycBvnVerification;
