import { useNavigate } from "react-router-dom";


const PetCard = ({ pet }) => {
  const navigate = useNavigate();

  const getVaccineBadgeColor = (vaccinated) => {
    return vaccinated
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };
 
  

 

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ">
      {/* Pet Image */}
      <div className="relative ">
        <img
          src={pet.images?.[0]?.file_url || "https://placehold.co/400x250?text=No+Photo"}
          alt={pet.name}
          className="w-full h-52 object-cover object-top"
        />
        {/* Vaccinated Badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${getVaccineBadgeColor(pet.vaccinated)}`}
        >
          {pet.vaccinated ? "✔ VACCINATED" : "✘ UNVACCINATED"}
        </span>
      </div>

      {/* Pet Info */}
      <div className="p-4">
        {/* Name + Distance */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-gray-900">{pet.name}</h3>
          {pet.shelter?.city && (
            <span className="text-xs text-gray-400">{pet.shelter.city}</span>
          )}
        </div>

        {/* Breed + Age */}
        <p className="text-sm text-gray-500 mb-1">
          {pet.breed} • {pet.age} {pet.age === 1 ? "Year" : "Years"} Old
        </p>

        {/* Gender */}
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">
          ♦ {pet.gender}
        </p>

        {/* View Details Button */}
        <button
          onClick={() => navigate(`/pets/${pet.id}`)}
          className="w-full text-sm text-blue-600 border border-blue-600 rounded-lg py-2 hover:bg-blue-600 hover:text-white transition-colors duration-200"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default PetCard;
