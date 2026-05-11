//Badge component used in ShelterApplicationDetails.jsx for pet details
export default function Badge({ text, color }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
      {text}
    </span>
  );
}
