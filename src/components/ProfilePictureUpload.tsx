import React, { useState } from 'react';
import Image from 'next/image';

const ProfilePictureUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      console.warn('Please select a file to upload.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.info('Profile picture uploaded successfully.');
      } else {
        console.error('Failed to upload profile picture.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <h4>Profile Picture</h4>
      <div className="mb-3">
        {previewUrl ? (
          <Image
            src={previewUrl}
            layout="intrinsic"
            width={150}
            height={150}
            alt="Profile preview"
            className="img-thumbnail"
          />
        ) : (
          <p>No profile picture selected.</p>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="form-control mb-3"
      />
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default ProfilePictureUpload;
