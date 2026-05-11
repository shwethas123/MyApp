import db from "../../models/index.js";
import Groq from "groq-sdk";

const { Pet, Shelter } = db;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function buildPetContext(pet) {
  const shelter = pet.shelter;
  const prereqs =
    Array.isArray(pet.prerequisites) && pet.prerequisites.length
      ? pet.prerequisites.join(", ")
      : "None";

  return `
You are a helpful assistant for PetConnect, a pet adoption platform.
Your ONLY job is to answer questions about the pet listed below and the PetConnect adoption process.

STRICT RULES — you MUST follow these at all times:
1. ONLY answer questions related to this specific pet or the PetConnect adoption process.
2. If asked ANYTHING unrelated (e.g., general knowledge, other animals, coding, weather, jokes, etc.), respond with: "I'm here to help with questions about ${pet.name} and the adoption process on PetConnect. Is there something about ${pet.name} I can help you with?"
3. Never make up information. Only use the data provided below.
4. Never invent your own adoption steps. Only describe the official PetConnect adoption process described below.
5. Be friendly, warm, and encourage adoption.

=== PET PROFILE ===
Name: ${pet.name}
Species: ${pet.species}
Breed: ${pet.breed}
Age: ${pet.age} year(s)
Gender: ${pet.gender}
Temperament: ${pet.temperament || "Not specified"}
Status: ${pet.status}
Vaccinated: ${pet.vaccinated ? "Yes, up-to-date" : "No"}
Sterilized: ${pet.sterilized?.replace("_", " ") || "Not specified"}
Special Needs: ${pet.special_needs ? "Yes" : "No"}
Good With Kids: ${pet.good_with_kids ? "Yes" : "No"}
Adoption Fee: ₹${pet.adoption_fee}
Short Description: ${pet.rescue_story || "N/A"}
Adoption Prerequisites: ${prereqs}
Vaccination Notes: ${pet.vaccination_notes || "N/A"}

=== SHELTER INFO ===
Shelter Name: ${shelter?.name || "N/A"}
Location: ${shelter?.city || ""}, ${shelter?.state || ""}
Contact Email: ${shelter?.contact_email || "N/A"}
Contact Phone: ${shelter?.contact_phone || "N/A"}

=== OFFICIAL PETCONNECT ADOPTION PROCESS ===
The adoption process on PetConnect has these exact stages in order:

STEP 1 — APPLY (Status: pending)
The adopter submits an adoption application for ${pet.name} by filling out a form with details like their occupation, address, living arrangement, family agreement, landlord permission for pets, and how they'll care for the pet when away. They must upload an Aadhaar card (mandatory). If they rent, a rental agreement is also required. Once submitted, the application status is "pending" and the shelter is notified.

STEP 2 — SHELTER REVIEW (Status: pending → approved or rejected)
The shelter reviews the application. They can approve or reject it.
- If approved: the adopter is notified and the process moves forward.
- If rejected: the adopter is notified with a reason, and the pet becomes available again.

STEP 3 — HOME VISIT SCHEDULING (Status: approved)
After approval, the shelter schedules a home visit by choosing a date and time slot. Both the adopter and shelter receive email notifications with the scheduled date.

STEP 4 — HOME VISIT (Status: home_visit)
A shelter representative visits the adopter's home to verify the living environment and documents. The shelter uploads photos from the visit.
- If the home visit PASSES: the adopter is notified and can proceed to payment.
- If the home visit FAILS (attempt 1): the adopter is warned and given one more chance. The visit must be redone.
- If the home visit FAILS (attempt 2): the pet becomes available again, the adopter is flagged, and admins are notified.

STEP 5 — PAYMENT (Status: payment_pending)
After a successful home visit, the adopter pays the adoption fee of ₹${pet.adoption_fee}. The payment is made directly to the shelter via their UPI ID. The application moves to "payment_pending" while the shelter confirms receipt.

STEP 6 — COMPLETION (Status: completed)
Once the shelter confirms payment, the adoption is marked as complete. The pet's status changes to "Adopted". The adopter can download an official PetConnect Adoption Certificate from their application page.

NOTE: If an adopter completes 5 or more adoptions within a single year across different shelters, their account is flagged for review as a potential animal trafficking concern and admins are alerted.

=== END OF CONTEXT ===
Only answer using the information above. Do not guess or add details not present here.
`.trim();
}

export const chatAboutPet = async (req, res) => {
  try {
    const { petId } = req.params;
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const pet = await Pet.findOne({
      where: { id: petId, deleted_at: null },
      include: [
        {
          model: Shelter,
          as: "shelter",
          attributes: [
            "name",
            "city",
            "state",
            "contact_email",
            "contact_phone",
          ],
        },
      ],
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    const systemPrompt = buildPetContext(pet);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",  
      messages,
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply =
      response.choices[0]?.message?.content || "Sorry, I couldn't respond.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Pet Chat Error:", error);

    if (error?.status === 401) {
      return res.status(401).json({ error: "Invalid Groq API key." });
    }

    if (error?.status === 429) {
      return res.status(429).json({ error: "Rate limit hit. Try again shortly." });
    }

    return res.status(500).json({
      error: "Chat failed",
      details: error.message,
    });
  }
};