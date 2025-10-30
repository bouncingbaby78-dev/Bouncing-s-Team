
import React, { useState, useCallback, useRef } from 'react';
import type { CompressionStats, AppStatus } from './types';
import { UploadIcon, DownloadIcon, ResetIcon, ImageFileIcon } from './components/icons';
import StatCard from './components/StatCard';
import Spinner from './components/Spinner';

const Header: React.FC = () => (
    <header className="text-center p-4 md:p-6 border-b border-slate-700/50">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Hybrid Image Compression System
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Upload an image to compress it using a simulated hybrid DCT & Wavelet algorithm and see the results in real-time.
        </p>
    </header>
);

const Footer: React.FC = () => (
    <footer className="text-center py-4 mt-8 text-slate-500 text-sm">
        <p>Built with React, TypeScript, and Tailwind CSS.</p>
    </footer>
);


const ImageUploader: React.FC<{ onImageSelect: (file: File) => void }> = ({ onImageSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageSelect(e.target.files[0]);
        }
    };

    const handleDragEvent = (e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvent(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageSelect(e.dataTransfer.files[0]);
        }
    };
    
    return (
        <div 
            className={`w-full max-w-2xl mx-auto mt-8 border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300 ${isDragging ? 'border-cyan-400 bg-slate-800/50' : 'border-slate-600 hover:border-cyan-500 hover:bg-slate-800/30'}`}
            onDragEnter={(e) => handleDragEvent(e, true)}
            onDragLeave={(e) => handleDragEvent(e, false)}
            onDragOver={(e) => handleDragEvent(e, true)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input type="file" accept="image/jpeg, image/png" className="hidden" ref={inputRef} onChange={handleFileChange} />
            <UploadIcon className="mx-auto h-12 w-12 text-slate-500 mb-4" />
            <p className="text-slate-300 font-semibold">Drag & drop an image here</p>
            <p className="text-slate-400 text-sm mt-1">or click to browse files</p>
            <p className="text-xs text-slate-500 mt-4">Supports JPEG and PNG formats</p>
        </div>
    );
};


const App: React.FC = () => {
    const [status, setStatus] = useState<AppStatus>('idle');
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [compressedImageUrl, setCompressedImageUrl] = useState<string | null>(null);
    const [stats, setStats] = useState<CompressionStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    const formatBytes = (bytes: number, decimals = 2): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };
    
    const handleImageSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file (JPEG or PNG).');
            return;
        }
        setError(null);
        setOriginalFile(file);
        setOriginalImageUrl(URL.createObjectURL(file));
        setStatus('image-loaded');
        setCompressedImageUrl(null);
        setStats(null);
    };

    const handleCompress = useCallback(async () => {
        if (!originalImageUrl || !originalFile) return;

        setStatus('compressing');

        // Simulate backend processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        const image = new Image();
        image.src = originalImageUrl;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setError('Could not process image.');
                setStatus('image-loaded');
                return;
            }
            ctx.drawImage(image, 0, 0);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // Simulate compression
            setCompressedImageUrl(compressedDataUrl);

            // Calculate compressed size from base64 string
            const head = 'data:image/jpeg;base64,';
            const compressedSize = Math.round((compressedDataUrl.length - head.length) * 3/4);

            const psnr = 35 + Math.random() * 5; // Mock PSNR value
            const mse = 5 + Math.random() * 5; // Mock MSE value

            setStats({
                originalSize: originalFile.size,
                compressedSize: compressedSize,
                reductionPercentage: (1 - compressedSize / originalFile.size) * 100,
                psnr,
                mse,
            });

            setStatus('done');
        };
        image.onerror = () => {
            setError('Could not load image for processing.');
            setStatus('image-loaded');
        };
    }, [originalFile, originalImageUrl]);
    
    const handleDownload = () => {
        if (!compressedImageUrl) return;
        const link = document.createElement('a');
        link.href = compressedImageUrl;
        link.download = `compressed_${originalFile?.name.split('.')[0] || 'image'}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClear = () => {
        if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
        if (compressedImageUrl) URL.revokeObjectURL(compressedImageUrl);
        setStatus('idle');
        setOriginalFile(null);
        setOriginalImageUrl(null);
        setCompressedImageUrl(null);
        setStats(null);
        setError(null);
    };

    return (
        <div className="min-h-screen text-slate-200 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                {error && <div className="max-w-4xl mx-auto bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">{error}</div>}
                {status === 'idle' && <ImageUploader onImageSelect={handleImageSelect} />}

                {(status === 'image-loaded' || status === 'compressing' || status === 'done') && (
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Original Image */}
                            <div className="bg-slate-800/30 p-4 rounded-xl">
                                <h2 className="text-lg font-semibold text-slate-300 mb-3">Original Image</h2>
                                {originalImageUrl && <img src={originalImageUrl} alt="Original" className="w-full h-auto rounded-lg object-contain max-h-[400px]" />}
                                {originalFile && (
                                    <div className="flex items-center justify-between mt-3 text-sm text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <ImageFileIcon className="w-4 h-4" />
                                            <span className="truncate">{originalFile.name}</span>
                                        </div>
                                        <span>{formatBytes(originalFile.size)}</span>
                                    </div>
                                )}
                            </div>
                            {/* Compressed Image */}
                            <div className="bg-slate-800/30 p-4 rounded-xl flex flex-col justify-center items-center">
                                <h2 className="text-lg font-semibold text-slate-300 mb-3 self-start">Compressed Image</h2>
                                <div className="flex-grow w-full flex justify-center items-center">
                                    {status === 'compressing' && (
                                        <div className="text-center">
                                            <Spinner />
                                            <p className="mt-2 text-slate-400">Compressing...</p>
                                        </div>
                                    )}
                                    {status === 'done' && compressedImageUrl && (
                                        <>
                                            <img src={compressedImageUrl} alt="Compressed" className="w-full h-auto rounded-lg object-contain max-h-[400px]" />
                                        </>
                                    )}
                                    {status === 'image-loaded' && (
                                        <p className="text-slate-500">Awaiting compression</p>
                                    )}
                                </div>
                                {status === 'done' && stats && (
                                     <div className="flex items-center justify-between mt-3 text-sm text-slate-400 w-full">
                                        <span className="truncate">compressed_{originalFile?.name.split('.')[0] || 'image'}.jpg</span>
                                        <span>{formatBytes(stats.compressedSize)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            <button
                                onClick={handleCompress}
                                disabled={status === 'compressing' || status === 'done'}
                                className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {status === 'compressing' ? <><Spinner /> Compressing...</> : 'Compress Image'}
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={status !== 'done'}
                                className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition-all duration-200 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <DownloadIcon className="w-5 h-5" /> Download
                            </button>
                             <button
                                onClick={handleClear}
                                className="px-6 py-3 bg-transparent text-slate-400 font-semibold rounded-lg hover:bg-slate-700/50 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-opacity-75 transition-all duration-200 flex items-center gap-2"
                            >
                                <ResetIcon className="w-5 h-5" /> New Image
                            </button>
                        </div>
                        
                        {/* Stats */}
                        {status === 'done' && stats && (
                            <div className="mt-12">
                                <h3 className="text-xl font-semibold text-center mb-6">Compression Statistics</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
                                    <StatCard label="Original Size" value={formatBytes(stats.originalSize, 1)} unit="" />
                                    <StatCard label="Compressed Size" value={formatBytes(stats.compressedSize, 1)} unit="" />
                                    <StatCard label="Reduction" value={stats.reductionPercentage.toFixed(1)} unit="%" />
                                    <StatCard label="PSNR" value={stats.psnr.toFixed(2)} unit="dB" />
                                    <StatCard label="MSE" value={stats.mse.toFixed(2)} unit="" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default App;
