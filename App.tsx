import React, { useState, useCallback, useRef } from 'react';
import { solveProblem } from './services/geminiService';
import { Icon } from './components/Icon';
import { Spinner } from './components/Spinner';
import { SolutionDisplay } from './components/SolutionDisplay';

const App: React.FC = () => {
  const [textProblem, setTextProblem] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
        setError(null);
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        setError('Please upload a valid image file (PNG, JPG, WEBP).');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleSubmit = useCallback(async () => {
    if (!textProblem.trim() && !imageFile) {
      setError('Please provide a problem to solve.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setSolution(null);

    const result = await solveProblem(
      textProblem,
      imageFile ?? undefined
    );
    
    if (result.startsWith('An error occurred:')) {
      setError(result);
    } else {
      setSolution(result);
    }

    setIsLoading(false);
  }, [textProblem, imageFile]);

  const handleReset = () => {
    setTextProblem('');
    setImageFile(null);
    setImagePreview(null);
    setSolution(null);
    setError(null);
    setIsLoading(false);
  };
  
  const isSubmitDisabled = isLoading || (!textProblem.trim() && !imageFile);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-300">
          <Spinner />
          <p>Solving your problem...</p>
        </div>
      );
    }

    if (solution) {
      return <SolutionDisplay solution={solution} onReset={handleReset} />;
    }

    return (
      <div className="w-full flex flex-col p-4 sm:p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
            <Icon name="calculator" className="w-6 h-6 text-fuchsia-400" />
            <h1 className="text-2xl font-bold text-white">Universal Solver</h1>
        </div>

        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        
        <div 
          className={`relative border-2 border-dashed border-gray-600 rounded-lg p-4 mb-4 transition-colors ${isDragging ? 'border-fuchsia-500 bg-fuchsia-900/20' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <textarea
            value={textProblem}
            onChange={(e) => setTextProblem(e.target.value)}
            placeholder="Type your problem or question here... You can also drop an image."
            className="w-full h-36 bg-transparent text-gray-200 focus:outline-none resize-none placeholder-gray-500"
          />
          {imagePreview && (
            <div className="relative mt-2 h-24 w-24 rounded-md overflow-hidden border border-gray-600">
                <img src={imagePreview} alt="Problem preview" className="h-full w-full object-cover" />
                <button onClick={handleRemoveImage} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 transition-colors" aria-label="Remove image">
                    <Icon name="x" className="w-4 h-4" />
                </button>
            </div>
          )}
          {isDragging && (
            <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center rounded-lg pointer-events-none">
                <p className="text-fuchsia-400 font-semibold">Drop image here</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
            aria-label="Attach image"
          >
            <Icon name="paperclip" className="w-6 h-6" />
          </button>
          <input 
            ref={fileInputRef} 
            id="file-upload" 
            name="file-upload" 
            type="file" 
            className="sr-only" 
            onChange={handleFileChange} 
            accept="image/*"
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-opacity-50 flex items-center justify-center gap-2 ${
              isSubmitDisabled
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-fuchsia-600 hover:bg-fuchsia-700 hover:shadow-lg hover:shadow-fuchsia-600/20'
            }`}
          >
            Solve Problem
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-900 to-fuchsia-900/30">
        <main className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="min-h-[40rem] flex flex-col items-center justify-center">
                {renderContent()}
            </div>
        </main>
    </div>
  );
};

export default App;