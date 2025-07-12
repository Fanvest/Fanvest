'use client';

import { useState } from 'react';
import { useSubmitClubRequest } from '@/hooks/useClubRequests';

interface ClubRegistrationFormProps {
  userId: string;
  onSuccess?: (clubRequest: any) => void;
}

export function ClubRegistrationForm({ userId, onSuccess }: ClubRegistrationFormProps) {
  const [formData, setFormData] = useState({
    clubName: '',
    location: '',
    description: '',
    founded: '',
    tier: 'AMATEUR' as const,
    contactEmail: '',
    phoneNumber: '',
    website: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: ''
    }
  });

  const { submitRequest, isSubmitting, error, isSuccess, data } = useSubmitClubRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await submitRequest({
        userId,
        clubName: formData.clubName,
        location: formData.location,
        description: formData.description || undefined,
        founded: formData.founded ? parseInt(formData.founded) : undefined,
        tier: formData.tier,
        contactEmail: formData.contactEmail,
        phoneNumber: formData.phoneNumber || undefined,
        website: formData.website || undefined,
        socialMedia: {
          facebook: formData.socialMedia.facebook || undefined,
          twitter: formData.socialMedia.twitter || undefined,
          instagram: formData.socialMedia.instagram || undefined,
        },
        autoApprove: true // For hackathon demo
      });

      onSuccess?.(result);
    } catch (err) {
      console.error('Failed to submit club request:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('socialMedia.')) {
      const socialField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (isSuccess && data) {
    return (
      <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 text-center">
        <div className="text-green-500 text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">
          Club Registration Successful!
        </h3>
        <p className="text-gray-300 mb-4">
          Your club "{data.clubName}" has been automatically approved for demo purposes.
        </p>
        {data.club && (
          <div className="bg-gray-800 rounded-lg p-4 mt-4">
            <p className="text-sm text-gray-400">Club Created:</p>
            <p className="font-semibold">{data.club.name}</p>
            <p className="text-sm text-gray-400">ID: {data.club.id}</p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-4">
          In production, this would require manual approval by platform admins.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">⚽</div>
        <h3 className="text-xl font-bold">Register Your Club</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Club Name *</label>
            <input
              type="text"
              value={formData.clubName}
              onChange={(e) => handleInputChange('clubName', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder="FC Montreuil"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder="Montreuil, France"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-24"
            placeholder="Tell us about your club..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Founded Year</label>
            <input
              type="number"
              value={formData.founded}
              onChange={(e) => handleInputChange('founded', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder="1995"
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Club Tier</label>
            <select
              value={formData.tier}
              onChange={(e) => handleInputChange('tier', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="AMATEUR">Amateur</option>
              <option value="SEMI_PRO">Semi-Professional</option>
              <option value="GRASSROOTS">Grassroots</option>
            </select>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-700 pt-4">
          <h4 className="font-semibold mb-3">Contact Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Contact Email *</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="contact@fcmontreuil.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder="https://fcmontreuil.com"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t border-gray-700 pt-4">
          <h4 className="font-semibold mb-3">Social Media (Optional)</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Facebook</label>
              <input
                type="url"
                value={formData.socialMedia.facebook}
                onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="https://facebook.com/fcmontreuil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Twitter/X</label>
              <input
                type="url"
                value={formData.socialMedia.twitter}
                onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="https://twitter.com/fcmontreuil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <input
                type="url"
                value={formData.socialMedia.instagram}
                onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="https://instagram.com/fcmontreuil"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error.message}</p>
          </div>
        )}

        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <h4 className="font-semibold text-blue-400 mb-2">Demo Mode - Auto Approval</h4>
          <p className="text-sm text-blue-300">
            For hackathon purposes, your club will be automatically approved. 
            In production, this would require manual verification by our team.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
            isSubmitting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting Request...
            </div>
          ) : (
            'Register Club'
          )}
        </button>
      </form>
    </div>
  );
}