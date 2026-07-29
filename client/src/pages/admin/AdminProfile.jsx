import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, ShieldAlert, Key, Save, Upload, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminProfile = () => {
  const { user, setUser } = useAuth();
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Watch for profile photo change
  const profilePhoto = watchProfile('photo');
  const newPasswordVal = watchPassword('newPassword');

  useEffect(() => {
    if (user) {
      setProfileValue('username', user.username);
      setProfileValue('email', user.email);
    }
  }, [user, setProfileValue]);

  useEffect(() => {
    if (profilePhoto && profilePhoto[0]) {
      const file = profilePhoto[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [profilePhoto]);

  // Profile Details Form Submission
  const onProfileSubmit = async (data) => {
    setProfileSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('username', data.username.trim());
      formData.append('email', data.email.trim());

      if (data.photo && data.photo[0]) {
        formData.append('photo', data.photo[0]);
      }

      const response = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.success) {
        toast.success(response.message || 'Profile details updated successfully');
        setUser(response.data); // Update AuthContext state
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile details');
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Password Update Form Submission
  const onPasswordSubmit = async (data) => {
    setPasswordSubmitting(true);
    try {
      const response = await api.put('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.success) {
        toast.success(response.message || 'Password changed successfully');
        resetPassword();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // PIN Form State
  const [pinCurrentPassword, setPinCurrentPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSubmitting, setPinSubmitting] = useState(false);

  // Security PIN Update Form Submission
  const onPinSubmit = async (e) => {
    e.preventDefault();
    if (!pinCurrentPassword || !newPin || !confirmPin) {
      return toast.error('Please fill in all fields');
    }
    if (newPin !== confirmPin) {
      return toast.error('New PIN and Confirm PIN do not match');
    }
    if (newPin.length < 4) {
      return toast.error('Security PIN must be at least 4 digits');
    }

    setPinSubmitting(true);
    try {
      const response = await api.put('/auth/pin', {
        currentPassword: pinCurrentPassword,
        newPin: newPin,
      });

      if (response.success) {
        toast.success(response.message || 'Security PIN changed successfully');
        setPinCurrentPassword('');
        setNewPin('');
        setConfirmPin('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change security PIN');
    } finally {
      setPinSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen py-10 bg-[#fbf9f7]">
      <div className="mx-auto max-w-[90%] px-2 sm:px-4 lg:px-6">
        
        {/* Page Header */}
        <div className="mb-10 pb-6 border-b border-dark-100">
          <h1 className="text-3xl font-bold tracking-tight text-dark-900 font-playfair">
            Account Profile
          </h1>
          <p className="font-sans text-sm text-dark-500 font-light mt-1">
            Update personal administrator details and change password credentials.
          </p>
        </div>

        {/* Two Column Forms */}
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          
          {/* Left Column: Profile Info Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-dark-100">
            <h2 className="text-xl font-bold text-dark-900 font-playfair mb-8 flex items-center gap-2">
              <UserCheck size={18} className="text-primary-500" />
              <span>Personal Details</span>
            </h2>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              
              {/* Photo Upload area */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-dark-100">
                {/* Current / Preview Image */}
                <div className="h-24 w-24 rounded-full overflow-hidden bg-dark-100 border border-dark-200 shadow-inner flex-shrink-0 relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user?.photo ? (
                    <img
                      src={user.photo}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-300">
                      <User size={36} />
                    </div>
                  )}
                </div>

                {/* Upload Action */}
                <div className="text-center sm:text-left">
                  <div className="relative inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      id="photo"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      {...registerProfile('photo')}
                    />
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-dark-200 bg-white hover:bg-dark-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-dark-700 transition-colors shadow-sm cursor-pointer pointer-events-none"
                    >
                      <Upload size={14} />
                      <span>Upload Photo</span>
                    </button>
                  </div>
                  <span className="block text-[10px] text-dark-400 font-light mt-1.5">
                    JPEG, PNG, JPG up to 5MB. Cloudinary integration.
                  </span>
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-xs uppercase tracking-wider text-dark-700 font-semibold mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-dark-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    id="username"
                    placeholder="Username"
                    className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                      profileErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-dark-200 focus:ring-primary-500'
                    }`}
                    {...registerProfile('username', {
                      required: 'Username is required',
                      minLength: { value: 3, message: 'Username must be at least 3 characters long' },
                    })}
                  />
                </div>
                {profileErrors.username && (
                  <p className="mt-1 text-xs text-red-500 font-sans">{profileErrors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs uppercase tracking-wider text-dark-700 font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-dark-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    id="email"
                    placeholder="email@example.com"
                    className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                      profileErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-dark-200 focus:ring-primary-500'
                    }`}
                    {...registerProfile('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Please enter a valid email address',
                      },
                    })}
                  />
                </div>
                {profileErrors.email && (
                  <p className="mt-1 text-xs text-red-500 font-sans">{profileErrors.email.message}</p>
                )}
              </div>

              {/* Submit Details Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="rose-gradient inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-sans text-xs font-semibold uppercase tracking-widest text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
                >
                  <Save size={14} />
                  <span>{profileSubmitting ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Password Update & PIN Update Forms */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Change Password Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-dark-100">
              <h2 className="text-xl font-bold text-dark-900 font-playfair mb-8 flex items-center gap-2">
                <Key size={18} className="text-primary-500" />
                <span>Change Password</span>
              </h2>

              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-xs uppercase tracking-wider text-dark-700 font-semibold mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    placeholder="••••••••"
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                      passwordErrors.currentPassword ? 'border-red-500 focus:ring-red-500' : 'border-dark-200 focus:ring-primary-500'
                    }`}
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required',
                    })}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-xs text-red-500 font-sans">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-xs uppercase tracking-wider text-dark-700 font-semibold mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="••••••••"
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                      passwordErrors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-dark-200 focus:ring-primary-500'
                    }`}
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters long' },
                    })}
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-xs text-red-500 font-sans">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs uppercase tracking-wider text-dark-700 font-semibold mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="••••••••"
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                      passwordErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-dark-200 focus:ring-primary-500'
                    }`}
                    {...registerPassword('confirmPassword', {
                      required: 'Confirm password is required',
                      validate: (value) => value === newPasswordVal || 'Passwords do not match',
                    })}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500 font-sans">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Password Button */}
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="rose-gradient w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 font-sans text-xs font-semibold uppercase tracking-widest text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
                >
                  <span>{passwordSubmitting ? 'Updating...' : 'Update Password'}</span>
                </button>

              </form>
            </div>

            {/* Change Security PIN Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-dark-100 animate-fadeIn">
              <h2 className="text-xl font-bold text-dark-900 font-playfair mb-8 flex items-center gap-2">
                <ShieldAlert size={18} className="text-primary-500" />
                <span>Security PIN</span>
              </h2>

              <form onSubmit={onPinSubmit} className="space-y-6">
                
                {/* Current Password for verification */}
                <div>
                  <label htmlFor="pinCurrentPassword" className="block text-xs uppercase tracking-wider text-dark-700 font-semibold mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="pinCurrentPassword"
                    value={pinCurrentPassword}
                    onChange={(e) => setPinCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border px-4 py-3 text-sm border-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* New Security PIN */}
                <div>
                  <label htmlFor="newPin" className="block text-xs uppercase tracking-wider text-dark-700 font-semibold mb-2">
                    New Security PIN (Min 4 digits)
                  </label>
                  <input
                    type="password"
                    id="newPin"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    maxLength={6}
                    required
                    className="w-full rounded-xl border px-4 py-3 text-sm border-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500 tracking-widest"
                  />
                </div>

                {/* Confirm Security PIN */}
                <div>
                  <label htmlFor="confirmPin" className="block text-xs uppercase tracking-wider text-dark-700 font-semibold mb-2">
                    Confirm Security PIN
                  </label>
                  <input
                    type="password"
                    id="confirmPin"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    maxLength={6}
                    required
                    className="w-full rounded-xl border px-4 py-3 text-sm border-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500 tracking-widest"
                  />
                </div>

                {/* Submit PIN Button */}
                <button
                  type="submit"
                  disabled={pinSubmitting}
                  className="rose-gradient w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 font-sans text-xs font-semibold uppercase tracking-widest text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
                >
                  <span>{pinSubmitting ? 'Updating PIN...' : 'Update Security PIN'}</span>
                </button>

              </form>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
};

export default AdminProfile;
