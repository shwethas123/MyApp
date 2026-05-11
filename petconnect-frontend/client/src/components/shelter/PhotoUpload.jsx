import { useRef } from "react";
import { Image, X } from "lucide-react";

function PhotoSlot({ label, file, onUpload, onRemove }) {
  const inputRef = useRef();

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="relative border-2 border-dashed border-gray-200 rounded-lg h-28 flex flex-col items-center justify-center cursor-pointer hover:border-[#3B6B8A]/40 transition-all group bg-gray-50"
    >
      {file ? (
        <>
          <img
            src={URL.createObjectURL(file)}
            alt={label}
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 shadow-sm"
          >
            <X size={12} className="text-red-400" />
          </button>
        </>
      ) : (
        <>
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <Image size={16} className="text-gray-300" />
          </div>
          <span className="text-xs text-gray-300 font-medium">{label}</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
      />
    </div>
  );
}

export default function PhotoUpload({ photos, onUpdate }) {
  const slots = [
    { key: "main", label: "MAIN PHOTO" },
    { key: "side", label: "SIDE VIEW" },
    { key: "activity", label: "ACTIVITY PHOTO" },
  ];

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">
        Upload up to 3 images. Accepted formats: JPG, PNG, into size 5MB
      </p>
      <div className="grid grid-cols-3 gap-3">
        {slots.map(({ key, label }) => (
          <PhotoSlot
            key={key}
            label={label}
            file={photos[key]}
            onUpload={(file) => onUpdate({ ...photos, [key]: file })}
            onRemove={() => onUpdate({ ...photos, [key]: null })}
          />
        ))}
      </div>
    </div>
  );
}
