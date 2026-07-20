import {useState, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const {getRootProps, getInputProps, isDragActive, acceptedFiles} = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf']},
        maxSize: maxFileSize,
    })

    const file = acceptedFiles[0] || null;



    return (
        <div className="w-full bg-white/5 border border-white/20 rounded-2xl backdrop-blur-xl p-5 md:p-8 text-center transition-all duration-300 hover:bg-white/10 hover:border-[#a5e1f3]/50 cursor-pointer shadow-[0_0_30px_rgba(165,225,243,0.05)]">
            <div {...getRootProps()}>
                <input {...getInputProps()} />

                <div className="space-y-4 cursor-pointer">
                    {file ? (
                        <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/10" onClick={(e) => e.stopPropagation()}>
                            <img src="/images/pdf.png" alt="pdf" className="size-10 drop-shadow-lg" />
                            <div className="flex items-center space-x-3 w-full ml-4">
                                <div className="text-left w-full">
                                    <p className="text-[0.95rem] font-bold text-white truncate max-w-[200px] md:max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-[0.8rem] text-[#b4a8d1]">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 cursor-pointer hover:scale-110 transition-transform" onClick={(e) => {
                                onFileSelect?.(null)
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff8a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    ): (
                        <div className="py-2">
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4 bg-gradient-to-br from-[#a5e1f3]/20 to-[#a5e1f3]/5 rounded-full shadow-[0_0_20px_rgba(165,225,243,0.2)] border border-white/10">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a5e1f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            </div>
                            <p className="text-[1rem] text-[#b4a8d1] mb-1">
                                <span className="font-bold text-white">
                                    Click to upload
                                </span> or drag and drop
                            </p>
                            <p className="text-[0.85rem] text-white/50">PDF (max {formatSize(maxFileSize)})</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default FileUploader