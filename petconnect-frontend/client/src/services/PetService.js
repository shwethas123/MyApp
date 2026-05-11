import ApiService from "./Apiservices";

const PetService = {
  browsePets: async (filters = {}) => {
    // Build query string from filters object
    const params = new URLSearchParams();

    if (filters.species) params.append("species", filters.species);
    if (filters.breed) params.append("breed", filters.breed);
    if (filters.gender) params.append("gender", filters.gender);
    if (filters.vaccinated !== undefined)
      params.append("vaccinated", filters.vaccinated);
    if (filters.special_needs !== undefined)
      params.append("special_needs", filters.special_needs);
    if (filters.good_with_kids !== undefined)
      params.append("good_with_kids", filters.good_with_kids);
    if (filters.age_min) params.append("age_min", filters.age_min);
    if (filters.age_max) params.append("age_max", filters.age_max);
    if (filters.city) params.append("city", filters.city);
    //if (filters.zipcode) params.append("zipcode", filters.zipcode);
    if (filters.lat != null) params.append("lat", filters.lat);
    if (filters.lng != null) params.append("lng", filters.lng);
    if (filters.radius != null) params.append("radius", filters.radius);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.sort) params.append("sort", filters.sort);

    // const response = await ApiService.get(`/pets/browse?${params.toString()}`);
    // return response.data;
    const response = await ApiService.get(`/pets/browse?${params.toString()}`);
    if (!response || !response.data)
      throw new Error("Empty response from server");
    return response.data;
    // returns { total, page, totalPages, pets: [...] }
  },

  getPetById: async (id) => {
    const response = await ApiService.get(`/shelter/pets/public/${id}`);
    return response.data;
  },
};

export default PetService;
