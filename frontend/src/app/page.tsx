"use client"
import { useState } from 'react';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login state
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  
  // Register state
  const [registerUsername, setRegisterUsername] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: loginUsername, 
          password: loginPassword 
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Login successful!');
        setError('');
      } else {
        setError(data.message || 'Login failed');
        setSuccess('');
      }
      console.log(data);
    } catch (err) {
      setError('An error occurred during login');
      setSuccess('');
      console.error(err);
    }
  };

  const handleRegister = async () => {
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate form
    if (!registerUsername || !registerEmail || !registerPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Registration successful! You can now login.');
        // Reset form
        setRegisterUsername('');
        setRegisterEmail('');
        setRegisterPassword('');
        setConfirmPassword('');
        // Switch to login tab after successful registration
        setTimeout(() => {
          setActiveTab('login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
      console.log(data);
    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 font-medium text-center ${
              activeTab === 'login'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 font-medium text-center ${
              activeTab === 'register'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mt-4 mx-6 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mt-4 mx-6 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Login to your account</h2>
            <div className="mb-4">
              <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="login-username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="login-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 cursor-pointer"
            >
              Login
            </button>
            {/* <div className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setActiveTab('register')}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Register here
              </button>
            </div> */}
          </div>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create an account</h2>
            <div className="mb-4">
              <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="register-username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="register-email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="register-password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              onClick={handleRegister}
              className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 cursor-pointer"
            >
              Register
            </button>
            {/* <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setActiveTab('login')}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Login here
              </button>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}