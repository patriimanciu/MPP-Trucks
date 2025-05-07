import React, { useState, useEffect } from 'react';

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState('');
  const videoPath = 'assets/cars.mp4';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file);
    setSelectedFile(file);
  };

  useEffect(() => {
    if (uploadedVideo) {
      console.log('Uploaded video path updated:', uploadedVideo);
    }
  }, [uploadedVideo]);

  const handleUpload = async (e) => {
    e.preventDefault();
    console.log('Upload button clicked');
  
    if (!selectedFile) {
      setUploadStatus('Please select a video file to upload.');
      return;
    }
  
    const formData = new FormData();
    formData.append('video', selectedFile);
  
    try {
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload video');
      }
  
      const data = await response.json();
      console.log('Upload successful:', data);
      setUploadStatus('Video uploaded successfully!');
      setUploadedVideo(data.filePath);

      console.log('Uploaded video path:', uploadedVideo);
    } catch (error) {
      console.error('Error uploading video:', error);
      setUploadStatus(error.message || 'Failed to upload video.');
    }
  };

  return (
    <div className="min-h-screen mb-4 bg-cover bg-center flex flex-col items-center w-full overflow-hidden" style={{ backgroundImage: `url('/background.jpeg')` }} id="Header">
      <div className="container mx-auto text-white text-center py-4 px-6 md:px-20 lg:px-32">
        <h2 className="text-5xl inline-block max-w-3xl font-semibold">Welcome back, John!</h2>
      </div>

      {/* Video Upload Section */}
      <div className="mt-8 w-full max-w-md">
        <form onSubmit={handleUpload} className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Upload Video
          </button>
        </form>
        {uploadStatus && <p className="mt-4 text-center text-sm text-gray-700">{uploadStatus}</p>}
      </div>

      {/* Display Uploaded Video */}
      <div className="mt-8 w-full max-w-4xl">
        <video
          className="w-full rounded-lg shadow-lg"
          controls
          preload="auto"
          src={videoPath}
        >
          Your browser does not support the video tag.
        </video>
      </div>
      

      {/* Separate Download Button */}
      
      <div className="mt-4 flex justify-center">
        <a
          href={videoPath} // Use the uploaded video path
          download="uploaded-video.mp4" // Default filename for the downloaded video
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Download Video
        </a>
      </div>
    </div>
  );
};

export default Home;