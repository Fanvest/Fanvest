'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { BGPattern } from '@/components/bg-pattern';

export default function RegisterClubPage() {
  const { user, authenticated } = usePrivy();
  
  const [formData, setFormData] = useState({
    clubName: '',
    location: '',
    description: '',
    documents: [] as File[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdClub, setCreatedClub] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => 
        file.type === 'application/pdf'
      );
      setFormData(prev => ({ ...prev, documents: files }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!authenticated || !user || !user.id) {
      setError("You must be connected to create a club. Please check your wallet connection.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Creating club for user:', user.id);
      
      // Create club request (with auto-approval) - the API will handle user creation
      const clubRequestResponse = await fetch('/api/clubs/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id, // Use Privy user ID directly
          clubName: formData.clubName,
          location: formData.location,
          description: formData.description,
          contactEmail: user.email?.address || '',
          legalDocuments: formData.documents.map(file => file.name), // File simulation
          autoApprove: true // Auto-approval for hackathon
        })
      });

      if (!clubRequestResponse.ok) {
        const errorData = await clubRequestResponse.json();
        throw new Error(errorData.error || 'Error creating club');
      }

      const result = await clubRequestResponse.json();
      setCreatedClub(result.club);
      setIsSuccess(true);
      
    } catch (err: any) {
      console.error('Error creating club:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900 flex items-center justify-center p-4 relative">
        <BGPattern 
          variant="diagonal-stripes" 
          mask="fade-edges" 
          size={32}
          fill="#e5e7eb"
          className="opacity-30"
        />
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 text-center max-w-lg shadow-lg relative z-10">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Club Registered Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Congratulations! Your club "{formData.clubName}" has been created and instantly approved.
          </p>
          
          {createdClub && (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 mb-4 text-sm">
              <div className="font-semibold" style={{color: '#fa0089'}}>Created club:</div>
              <div className="text-gray-600">ID: {createdClub.id}</div>
              <div className="text-gray-600">Name: {createdClub.name}</div>
              <div className="text-gray-600">Location: {createdClub.location}</div>
              <div className="text-gray-600">Owner: {user?.email?.address}</div>
            </div>
          )}
          
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{color: '#fa0089'}}>🔑 Your New Privileges</h3>
            <div className="space-y-2 text-sm text-left">
              <div className="flex items-center gap-2">
                <span style={{color: '#fa0089'}}>✓</span>
                <span className="text-gray-600">Create and manage tokens for your club</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{color: '#fa0089'}}>✓</span>
                <span className="text-gray-600">Launch polls and votes</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{color: '#fa0089'}}>✓</span>
                <span className="text-gray-600">Manage revenues and distributions</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{color: '#fa0089'}}>✓</span>
                <span className="text-gray-600">Access the club dashboard</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => window.location.href = '/dashboard/club'}
              className="flex-1 text-white px-6 py-3 rounded-lg font-semibold transition hover:opacity-90"
              style={{backgroundColor: '#fa0089'}}
            >
              Next →
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connection check
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900 flex items-center justify-center p-4 relative">
        <BGPattern 
          variant="diagonal-stripes" 
          mask="fade-edges" 
          size={32}
          fill="#e5e7eb"
          className="opacity-30"
        />
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 text-center max-w-md shadow-lg relative z-10">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Login Required</h2>
          <p className="text-gray-600 mb-6">
            You must log in with your wallet to create a club.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900 p-4 relative">
      <BGPattern 
        variant="diagonal-stripes" 
        mask="fade-edges" 
        size={32}
        fill="#e5e7eb"
        className="opacity-30"
      />
      <div className="max-w-2xl mx-auto py-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="text-3xl">⚽</div>
            <div>
              <h1 className="text-2xl font-bold">Register Your Club</h1>
              <p className="text-gray-600">Join the Fanvest revolution</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Club name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Club Name *
              </label>
              <input
                type="text"
                value={formData.clubName}
                onChange={(e) => handleInputChange('clubName', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:outline-none"
                placeholder="Ex: FC Montreuil"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:outline-none"
                placeholder="Ex: Montreuil, France"
                required
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Club Details *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 h-32 resize-none focus:border-pink-500 focus:outline-none transition"
                placeholder="Describe your club: history, level, number of players, facilities..."
                required
              />
            </div>

            {/* Email auto from Privy */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Email
              </label>
              <div className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 flex items-center gap-2">
                <span>📧</span>
                <span>{user?.email?.address || 'Email not available'}</span>
                <span className="text-xs text-gray-500 ml-auto">From your Privy account</span>
              </div>
            </div>

            {/* PDF document upload (fake) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Supporting Documents (PDF) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-lg font-medium mb-1">Drop your PDF documents</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Statutes, FFF license, certificates, facility photos...
                  </p>
                  <div className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg inline-block transition">
                    Choose files
                  </div>
                </label>
              </div>
              
              {formData.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium" style={{color: '#fa0089'}}>
                    {formData.documents.length} document(s) selected:
                  </p>
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm bg-gray-100 rounded px-3 py-2">
                      <span>📄</span>
                      <span>{file.name}</span>
                      <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error display */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2">❌ Error</h4>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.clubName || !formData.location || !formData.description}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition ${
                isSubmitting || !formData.clubName || !formData.location || !formData.description
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'text-white hover:opacity-90 transform hover:scale-105'
              }`}
              style={!(isSubmitting || !formData.clubName || !formData.location || !formData.description) ? {backgroundColor: '#fa0089'} : {}}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                '🚀 Submit Request'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}