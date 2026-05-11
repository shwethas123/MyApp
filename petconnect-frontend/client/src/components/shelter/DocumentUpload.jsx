import { useRef } from "react";
import { FileText, X } from "lucide-react";

export default function DocumentUpload({ file, onUpload, onRemove }) {
  const inputRef = useRef();

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#3B6B8A]/40 transition-all group bg-gray-50 min-h-[100px] relative"
    >
      {file ? (
        <>
          <FileText size={22} className="text-[#3B6B8A]" />
          <span className="text-xs text-gray-500 text-center break-all max-w-full px-2 mt-1">
            {file.name}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm"
          >
            <X size={11} className="text-red-400" />
          </button>
        </>
      ) : (
        <>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-1.5">
            <FileText size={15} className="text-gray-300" />
          </div>
          <span className="text-xs text-gray-400 font-medium">
            UPLOAD PDF/PNG
          </span>
          <span className="text-xs text-gray-300 mt-0.5">
            Max file size 5MB
          </span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/png"
        className="hidden"
        onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
      />
    </div>
  );
}
