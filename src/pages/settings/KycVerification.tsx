import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper, StepContent } from '@/components/ui/stepper';
import { useAuth } from '@/hooks/useAuth';
import { useS3Upload } from '@/hooks/useS3Upload';
import kycApi from '@/lib/api/kyc';

type IdType = 'national_id' | 'drivers_license' | 'passport' | 'voters_card';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
}

interface IdInfo {
  idType: IdType | '';
  idNumber: string;
  expiryDate: string;
}

type IdInfoErrors = {
  idType?: string;
  idNumber?: string;
  expiryDate?: string;
};

// Update the type to allow for Error | null
interface UploadStateItem {
  progress: number;
  error: Error | null;
  url: string;
  key: string;
  previewUrl: string;
}

type UploadStateMap = {
  'selfie-upload': UploadStateItem;
  'id-document-upload': UploadStateItem;
};

function KycIdVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadFile } = useS3Upload();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
  });
  
  const [idInfo, setIdInfo] = useState<IdInfo>({
    idType: '',
    idNumber: '',
    expiryDate: '',
  });
  
  const [errors, setErrors] = useState<{
    personal?: Partial<PersonalInfo>,
    id?: IdInfoErrors,
    selfie?: string,
    idImage?: string
  }>({});

  // Updated the type to match our new interface
  const [uploadState, setUploadState] = useState<UploadStateMap>({
    'selfie-upload': {
      progress: 0,
      error: null,
      url: '',
      key: '',
      previewUrl: ''
    },
    'id-document-upload': {
      progress: 0,
      error: null,
      url: '',
      key: '',
      previewUrl: ''
    },
  });

  // Derive these when needed:
  const selfieUploaded   = uploadState['selfie-upload'].progress === 100 && !uploadState['selfie-upload'].error;
  const idImageUploaded  = uploadState['id-document-upload'].progress === 100 && !uploadState['id-document-upload'].error;

  const steps = [
    "Personal Information",
    "ID Details",
    "Upload Documents",
    "Review & Submit"
  ];

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors.personal && errors.personal[name as keyof PersonalInfo]) {
      setErrors(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          [name]: undefined
        }
      }));
    }
  };

  const handleIdInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For idType, ensure we're setting a valid IdType value
    if (name === 'idType') {
      const typedValue = value as IdType | '';
      setIdInfo(prev => ({
        ...prev,
        [name]: typedValue
      }));
    } else {
      setIdInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user types
    if (errors.id && errors.id[name as keyof IdInfo]) {
      setErrors(prev => ({
        ...prev,
        id: {
          ...prev.id,
          [name]: undefined
        }
      }));
    }
  };

  const validatePersonalInfo = (): boolean => {
    const newErrors: Partial<PersonalInfo> = {};
    
    if (!personalInfo.firstName) newErrors.firstName = 'First name is required';
    if (!personalInfo.lastName) newErrors.lastName = 'Last name is required';
    if (!personalInfo.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else {
      // Check if user is at least 13 years old
      const birthDate = new Date(personalInfo.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old';
      }
    }
    if (!personalInfo.gender) newErrors.gender = 'Gender is required';
    if (!personalInfo.address) newErrors.address = 'Address is required';
    
    setErrors(prev => ({ ...prev, personal: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateIdInfo = (): boolean => {
    const newErrors: IdInfoErrors = {};
    
    if (!idInfo.idType) newErrors.idType = 'ID type is required';
    if (!idInfo.idNumber) newErrors.idNumber = 'ID number is required';
    if (!idInfo.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    else {
      // Check if expiry date is at least 1 month in the future
      const expiryDate = new Date(idInfo.expiryDate);
      const today = new Date();
      
      // Set minimum date to 1 month from now
      const minExpiryDate = new Date();
      minExpiryDate.setMonth(minExpiryDate.getMonth() + 1);
      
      if (expiryDate <= today) {
        newErrors.expiryDate = 'Expiry date cannot be in the past';
      } else if (expiryDate < minExpiryDate) {
        newErrors.expiryDate = 'Expiry date must be at least 1 month in the future';
      }
    }
    
    setErrors(prev => ({ ...prev, id: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateDocuments = (): boolean => {
    const newErrors: { selfie?: string; idImage?: string } = {};
    
    // Use uploadState directly for validation
    if (!(uploadState['selfie-upload'].progress === 100 && !uploadState['selfie-upload'].error) || !uploadState['selfie-upload'].previewUrl) {
      newErrors.selfie = 'Please upload a selfie';
    }
    
    if (!(uploadState['id-document-upload'].progress === 100 && !uploadState['id-document-upload'].error) || !uploadState['id-document-upload'].previewUrl) {
      newErrors.idImage = 'Please upload your ID document';
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    if (currentStep === 0) {
      isValid = validatePersonalInfo();
    } else if (currentStep === 1) {
      isValid = validateIdInfo();
    } else if (currentStep === 2) {
      isValid = validateDocuments();
    } else {
      isValid = true;
    }
    
    if (isValid) {
      // Ensure we have valid upload states before proceeding from step 2
      if (currentStep === 2) {
        // Double check that both uploads are valid
        if (!uploadState['id-document-upload'].previewUrl || !uploadState['selfie-upload'].previewUrl) {
          console.error('Upload state inconsistent with UI state');
          return;
        }
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Ensure both files are uploaded successfully
      const selfieUploadComplete = 
        uploadState['selfie-upload']?.progress === 100 && 
        !uploadState['selfie-upload']?.error &&
        uploadState['selfie-upload']?.url &&
        uploadState['selfie-upload']?.key;
      
      const idUploadComplete = 
        uploadState['id-document-upload']?.progress === 100 &&
        !uploadState['id-document-upload']?.error &&
        uploadState['id-document-upload']?.url &&
        uploadState['id-document-upload']?.key;
      
      if (!selfieUploadComplete || !idUploadComplete) {
        throw new Error('Please ensure all documents are uploaded successfully');
      }
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Format the idType to match the expected values for the API
      const formattedIdType = (() => {
        switch(idInfo.idType) {
          case 'national_id': return 'national_id';
          case 'drivers_license': return 'drivers_license';
          case 'passport': return 'passport';
          case 'voters_card': return 'voters_card';
          default: return idInfo.idType;
        }
      })();
      
      // Format data according to the API requirements
      const kycPayload = {
        name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        kycType: 'id' as const,
        idType: formattedIdType,
        idNumber: idInfo.idNumber,
        idImage: uploadState['id-document-upload'].url,
        selfieImage: uploadState['selfie-upload'].url,
        expiryDate: idInfo.expiryDate,
        address: personalInfo.address,
        dateOfBirth: personalInfo.dateOfBirth,
        phoneNumber: user.phoneNumber || '', // Use phone number from user profile if available
      };
      
      // Submit the KYC verification request
      console.log('Submitting KYC data:', kycPayload);
      const response = await kycApi.submitIdVerification(kycPayload);
      
      if (response.success) {
        // Navigate to success page
        navigate('/settings/kyc/success');
      } else {
        throw new Error(response.message || 'Verification submission failed');
      }
    } catch (error) {
      console.error('KYC submission failed:', error);
      // Show error message to user
      alert(`KYC submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up object URLs to prevent memory leaks
      if (uploadState['id-document-upload'].previewUrl) {
        URL.revokeObjectURL(uploadState['id-document-upload'].previewUrl);
      }
      if (uploadState['selfie-upload'].previewUrl) {
        URL.revokeObjectURL(uploadState['selfie-upload'].previewUrl);
      }
    };
  }, [uploadState]);

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Verify that this is actually the selfie upload by checking the input name
    if (e.target.name !== 'selfie') {
      console.error('Wrong handler called for input:', e.target.name);
      return;
    }
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Revoke old preview (if any) before creating a new one
      if (uploadState['selfie-upload'].previewUrl) {
        URL.revokeObjectURL(uploadState['selfie-upload'].previewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      
      // Initialize local state to show preview immediately
      setUploadState(prev => ({
        ...prev,
        'selfie-upload': {
          progress: 1, // Start with 1% to show loading immediately
          error: null,
          url: '',
          key: '',
          previewUrl
        }
      }));
      
      // Clear previous errors
      setErrors(prev => ({ ...prev, selfie: undefined }));
      
      // Ensure user is logged in before upload
      if (!user?.id) {
        setUploadState(prev => ({
          ...prev,
          'selfie-upload': {
            ...prev['selfie-upload'],
            progress: 0,
            error: new Error('User not authenticated'),
          }
        }));
        setErrors(prev => ({ ...prev, selfie: 'Please log in to upload files.' }));
        return;
      }
      
      try {
        // Upload the file to S3
        const result = await uploadFile(file, 'selfie', 'selfie-upload');
        
        if (result) {
          setUploadState(prev => ({
            ...prev,
            'selfie-upload': {
              progress: 100,
              error: null,
              url: result.url,
              key: result.key,
              previewUrl
            }
          }));
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error uploading selfie:', error);
        setUploadState(prev => ({
          ...prev,
          'selfie-upload': {
            ...prev['selfie-upload'],
            progress: 0,
            error: error instanceof Error ? error : new Error('Upload failed'),
          }
        }));
        setErrors(prev => ({ ...prev, selfie: 'Failed to upload selfie. Please try again.' }));
      }
    }
  };

  const handleIdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Verify that this is actually the ID document upload by checking the input name
    if (e.target.name !== 'id-document') {
      console.error('Wrong handler called for input:', e.target.name);
      return;
    }
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Revoke old preview (if any) before creating a new one
      if (uploadState['id-document-upload'].previewUrl) {
        URL.revokeObjectURL(uploadState['id-document-upload'].previewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      
      // Initialize local state to show preview immediately
      setUploadState(prev => ({
        ...prev,
        'id-document-upload': {
          progress: 1, // Start with 1% to show loading immediately
          error: null,
          url: '',
          key: '',
          previewUrl
        }
      }));
      
      // Clear previous errors
      setErrors(prev => ({ ...prev, idImage: undefined }));
      
      // Ensure user is logged in before upload
      if (!user?.id) {
        setUploadState(prev => ({
          ...prev,
          'id-document-upload': {
            ...prev['id-document-upload'],
            progress: 0,
            error: new Error('User not authenticated'),
          }
        }));
        setErrors(prev => ({ ...prev, idImage: 'Please log in to upload files.' }));
        return;
      }
      
      try {
        // Upload the file to S3
        const result = await uploadFile(file, 'id-document', 'id-document-upload');
        
        if (result) {
          setUploadState(prev => ({
            ...prev,
            'id-document-upload': {
              progress: 100,
              error: null,
              url: result.url,
              key: result.key,
              previewUrl
            }
          }));
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error uploading ID document:', error);
        setUploadState(prev => ({
          ...prev,
          'id-document-upload': {
            ...prev['id-document-upload'],
            progress: 0,
            error: error instanceof Error ? error : new Error('Upload failed'),
          }
        }));
        setErrors(prev => ({ ...prev, idImage: 'Failed to upload ID document. Please try again.' }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ID Verification</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Verify with Government ID</h2>
          <p className="text-gray-600 mt-2">
            Please complete all steps to verify your identity with a government-issued ID.
          </p>
        </div>
        
        <Stepper 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={handleStepClick} 
        />
        
        <StepContent isActive={currentStep === 0}>
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Personal Information</h3>
            <p className="text-gray-600">
              Please provide your personal details exactly as they appear on your ID.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={personalInfo.firstName}
                  onChange={handlePersonalInfoChange}
                  className={`w-full border ${
                    errors.personal?.firstName ? 'border-red-500' : 'border-gray-300'
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.personal?.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.personal.firstName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={personalInfo.lastName}
                  onChange={handlePersonalInfoChange}
                  className={`w-full border ${
                    errors.personal?.lastName ? 'border-red-500' : 'border-gray-300'
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.personal?.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.personal.lastName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-xs text-gray-500">(Minimum age: 13)</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={personalInfo.dateOfBirth}
                  onChange={handlePersonalInfoChange}
                  max={(() => {
                    const today = new Date();
                    // Calculate 13 years ago in UTC
                    const thirteenYearsAgoUTC = new Date(Date.UTC(today.getUTCFullYear() - 13, today.getUTCMonth(), today.getUTCDate()));
                    return thirteenYearsAgoUTC.toISOString().split('T')[0];
                  })()}
                  className={`w-full border ${
                    errors.personal?.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.personal?.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-500">{errors.personal.dateOfBirth}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={personalInfo.gender}
                  onChange={handlePersonalInfoChange}
                  className={`w-full border ${
                    errors.personal?.gender ? 'border-red-500' : 'border-gray-300'
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.personal?.gender && (
                  <p className="mt-1 text-sm text-red-500">{errors.personal.gender}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={personalInfo.address}
                  onChange={handlePersonalInfoChange}
                  className={`w-full border ${
                    errors.personal?.address ? 'border-red-500' : 'border-gray-300'
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.personal?.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.personal.address}</p>
                )}
              </div>
            </div>
          </div>
        </StepContent>
        
        <StepContent isActive={currentStep === 1}>
          <div className="space-y-4">
            <h3 className="font-medium text-lg">ID Details</h3>
            <p className="text-gray-600">
              Please provide details of your government-issued ID.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Type
                </label>
                <select
                  id="idType"
                  name="idType"
                  value={idInfo.idType}
                  onChange={handleIdInfoChange}
                  className={`w-full border ${
                    errors.id?.idType ? 'border-red-500' : 'border-gray-300'
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select ID Type</option>
                  <option value="national_id">National ID Card</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="passport">International Passport</option>
                  <option value="voters_card">Voter's Card</option>
                </select>
                {errors.id?.idType && (
                  <p className="mt-1 text-sm text-red-500">{errors.id.idType}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number
                </label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  value={idInfo.idNumber}
                  onChange={handleIdInfoChange}
                  className={`w-full border ${
                    errors.id?.idNumber ? 'border-red-500' : 'border-gray-300'
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.id?.idNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.id.idNumber}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date <span className="text-xs text-gray-500">(Min: 1 month from now)</span>
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={idInfo.expiryDate}
                  onChange={handleIdInfoChange}
                  min={(() => {
                    const today = new Date();
                    return today.toISOString().split('T')[0];
                  })()}
                  className={`w-full border ${
                    errors.id?.expiryDate ? 'border-red-500' : 'border-gray-300'
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.id?.expiryDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.id.expiryDate}</p>
                )}
              </div>
            </div>
          </div>
        </StepContent>
        
        <StepContent isActive={currentStep === 2}>
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Upload Documents</h3>
            <p className="text-gray-600">
              Please upload clear photos of your ID and a selfie.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  ID Document
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center relative ${
                  errors.idImage ? 'border-red-500' : idImageUploaded ? 'border-green-300' : 'border-gray-300'
                } ${idImageUploaded ? 'bg-green-50' : uploadState['id-document-upload'].progress > 0 && uploadState['id-document-upload'].progress < 100 ? 'bg-blue-50 border-blue-300' : ''} 
                   hover:bg-gray-50 transition-colors duration-150 group`}>
                  {idImageUploaded ? (
                    <div className="text-green-600">
                      {uploadState['id-document-upload'].previewUrl && (
                        <div className="mb-3 flex justify-center">
                          <img 
                            src={uploadState['id-document-upload'].previewUrl} 
                            alt="ID document preview" 
                            className="max-h-40 max-w-full rounded shadow-sm" 
                          />
                        </div>
                      )}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mx-auto mt-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p>ID document uploaded successfully</p>
                      <button type="button" className="text-xs text-blue-600 mt-1 hover:underline focus:outline-none">
                        Click to replace
                      </button>
                    </div>
                  ) : uploadState['id-document-upload'].progress > 0 && uploadState['id-document-upload'].progress < 100 ? (
                    <div className="text-blue-600">
                      {uploadState['id-document-upload'].previewUrl && (
                        <div className="mb-3 flex justify-center relative">
                          <img 
                            src={uploadState['id-document-upload'].previewUrl} 
                            alt="ID document preview" 
                            className="max-h-40 max-w-full rounded shadow-sm opacity-70" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow">
                              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                      <p className="mt-2 text-sm">Uploading document...</p>
                      <p className="text-xs mt-1">{uploadState['id-document-upload'].progress}% complete</p>
                    </div>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 mx-auto text-gray-400 group-hover:text-gray-500 transition-colors duration-150"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-150">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-150">
                        PNG, JPG or PDF (max 5MB)
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    name="id-document"
                    id="id-document-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleIdImageUpload}
                    accept="image/png, image/jpeg, application/pdf"
                    disabled={uploadState['id-document-upload'].progress > 0 && uploadState['id-document-upload'].progress < 100}
                  />
                </div>
                {errors.idImage && (
                  <p className="mt-1 text-sm text-red-500">{errors.idImage}</p>
                )}
                {!idImageUploaded && uploadState['id-document-upload'].progress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${uploadState['id-document-upload'].progress}%` }}
                      ></div>
                    </div>
                    {uploadState['id-document-upload'].error && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {uploadState['id-document-upload'].error.message}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Upload a clear photo of the front of your ID document.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Selfie with ID
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center relative ${
                  errors.selfie ? 'border-red-500' : selfieUploaded ? 'border-green-300' : 'border-gray-300'
                } ${selfieUploaded ? 'bg-green-50' : uploadState['selfie-upload'].progress > 0 && uploadState['selfie-upload'].progress < 100 ? 'bg-blue-50 border-blue-300' : ''} 
                   hover:bg-gray-50 transition-colors duration-150 group`}>
                  {selfieUploaded ? (
                    <div className="text-green-600">
                      {uploadState['selfie-upload'].previewUrl && (
                        <div className="mb-3 flex justify-center">
                          <img 
                            src={uploadState['selfie-upload'].previewUrl} 
                            alt="Selfie preview" 
                            className="max-h-40 max-w-full rounded shadow-sm" 
                          />
                        </div>
                      )}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mx-auto mt-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p>Selfie uploaded successfully</p>
                      <button type="button" className="text-xs text-blue-600 mt-1 hover:underline focus:outline-none">
                        Click to replace
                      </button>
                    </div>
                  ) : uploadState['selfie-upload'].progress > 0 && uploadState['selfie-upload'].progress < 100 ? (
                    <div className="text-blue-600">
                      {uploadState['selfie-upload'].previewUrl && (
                        <div className="mb-3 flex justify-center relative">
                          <img 
                            src={uploadState['selfie-upload'].previewUrl} 
                            alt="Selfie preview" 
                            className="max-h-40 max-w-full rounded shadow-sm opacity-70" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow">
                              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                      <p className="mt-2 text-sm">Uploading selfie...</p>
                      <p className="text-xs mt-1">{uploadState['selfie-upload'].progress}% complete</p>
                    </div>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 mx-auto text-gray-400 group-hover:text-gray-500 transition-colors duration-150"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-150">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-150">
                        PNG or JPG (max 5MB)
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    name="selfie"
                    id="selfie-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleSelfieUpload}
                    accept="image/png, image/jpeg"
                    disabled={uploadState['selfie-upload'].progress > 0 && uploadState['selfie-upload'].progress < 100}
                  />
                </div>
                {errors.selfie && (
                  <p className="mt-1 text-sm text-red-500">{errors.selfie}</p>
                )}
                {!selfieUploaded && uploadState['selfie-upload'].progress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${uploadState['selfie-upload'].progress}%` }}
                      ></div>
                    </div>
                    {uploadState['selfie-upload'].error && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {uploadState['selfie-upload'].error.message}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Take a selfie while holding your ID document next to your face.
                </p>
              </div>
            </div>
          </div>
        </StepContent>
        
        <StepContent isActive={currentStep === 3}>
          <div className="space-y-6">
            <h3 className="font-medium text-lg">Review & Submit</h3>
            <p className="text-gray-600">
              Please review your information before submitting.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-medium">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p>{personalInfo.firstName} {personalInfo.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p>{personalInfo.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p>{personalInfo.gender.charAt(0).toUpperCase() + personalInfo.gender.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p>{personalInfo.address}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">ID Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-sm text-gray-500">ID Type</p>
                    <p>
                      {idInfo.idType === 'national_id' && 'National ID Card'}
                      {idInfo.idType === 'drivers_license' && "Driver's License"}
                      {idInfo.idType === 'passport' && 'International Passport'}
                      {idInfo.idType === 'voters_card' && "Voter's Card"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID Number</p>
                    <p>{idInfo.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p>{idInfo.expiryDate}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Uploaded Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Document</p>
                    {idImageUploaded && uploadState['id-document-upload'].previewUrl ? (
                      <div className="relative">
                        <img 
                          src={uploadState['id-document-upload'].previewUrl} 
                          alt="ID document preview" 
                          className="max-h-32 max-w-full rounded border border-gray-200" 
                        />
                        <div className="absolute top-0 right-0 bg-green-100 text-green-600 rounded-bl px-2 py-1 text-xs font-medium">
                          ✓ Uploaded
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded text-yellow-700 text-sm">
                        <p>ID document not properly uploaded. Please go back to the upload step.</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Selfie with ID</p>
                    {selfieUploaded && uploadState['selfie-upload'].previewUrl ? (
                      <div className="relative">
                        <img 
                          src={uploadState['selfie-upload'].previewUrl} 
                          alt="Selfie preview" 
                          className="max-h-32 max-w-full rounded border border-gray-200" 
                        />
                        <div className="absolute top-0 right-0 bg-green-100 text-green-600 rounded-bl px-2 py-1 text-xs font-medium">
                          ✓ Uploaded
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded text-yellow-700 text-sm">
                        <p>Selfie not properly uploaded. Please go back to the upload step.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-600 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800">
                    By submitting, you confirm that all information provided is accurate and belongs to you.
                    Providing false information may result in account suspension.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </StepContent>
        
        <div className="mt-8 flex justify-between">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
              disabled={isLoading}
            >
              Back
            </button>
          ) : (
            <button
              onClick={() => navigate('/settings/kyc')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-md font-medium bg-[#0066A1] text-white hover:bg-[#005085] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
              disabled={
                (currentStep === 2 && 
                (uploadState['id-document-upload'].progress > 0 && uploadState['id-document-upload'].progress < 100) || 
                (uploadState['selfie-upload'].progress > 0 && uploadState['selfie-upload'].progress < 100))
              }
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-6 py-2 rounded-md font-medium bg-[#0066A1] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#005085]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Verification'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default KycIdVerification;
