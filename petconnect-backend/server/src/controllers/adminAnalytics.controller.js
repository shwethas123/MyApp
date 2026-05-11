import db from "../../models/index.js";
const { Pet, Shelter, AdoptionApplication, User, Report, Sequelize } = db;
const { Op } = Sequelize;

export const getAdminAnalytics = async (req, res) => {
  try {

    // ── 1. PETS (base data used throughout) ───────────────────────────
    const allPets = await Pet.findAll({ where: { deleted_at: null } })
    const totalAdoptions = allPets.filter(p => p.status === 'Adopted').length
    const activeListings = allPets.filter(p => p.status === 'Available').length
    const successRate = allPets.length > 0
      ? Math.round((totalAdoptions / allPets.length) * 100)
      : 0

    // ── 2. AVERAGE ADOPTION FEE (NEW) ────────────────────────────────
    const petsWithFee = allPets.filter(p => p.adoption_fee != null && parseFloat(p.adoption_fee) > 0)
    const avgAdoptionFee = petsWithFee.length > 0
      ? Math.round(petsWithFee.reduce((sum, p) => sum + parseFloat(p.adoption_fee), 0) / petsWithFee.length)
      : 0

    // ── 3. ALL APPLICATIONS (base data used throughout) ───────────────
    const allApplications = await AdoptionApplication.findAll()
    const totalApps = allApplications.length
    const rejectedApps = allApplications.filter(a => a.status === 'rejected').length
    const abandonmentRate = totalApps > 0
      ? Math.round((rejectedApps / totalApps) * 100)
      : 0


    // ── 5. ADOPTION RATE BY CITY ──────────────────────────────────────
    const shelters = await Shelter.findAll({
      where: { deleted_at: null, status: 'Verified' },
      attributes: ['id', 'name', 'city', 'state', 'owner_id', 'type'],
    })

    const adoptionByCity = {}
    for (const shelter of shelters) {
      const city = shelter.city || 'Unknown'
      const adopted = allPets.filter(
        p => p.shelter_id === shelter.id && p.status === 'Adopted'
      ).length
      if (!adoptionByCity[city]) adoptionByCity[city] = 0
      adoptionByCity[city] += adopted
    }
    const adoptionRateByCity = Object.entries(adoptionByCity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([city, count]) => ({ city, adoptions: count }))

    // ── 6. TOP PERFORMING SHELTERS ────────────────────────────────────
    const topShelters = await Promise.all(
      shelters.map(async shelter => {
        const shelterPets = allPets.filter(p => p.shelter_id === shelter.id)
        const totalListed = shelterPets.length
        const adopted = shelterPets.filter(p => p.status === 'Adopted').length
        const successRate = totalListed > 0
          ? Math.round((adopted / totalListed) * 100)
          : 0

        return {
          id: shelter.id,
          name: shelter.name,
          type: shelter.type,
          location: `${shelter.city || ''}${shelter.state ? ', ' + shelter.state : ''}`,
          totalListed,
          adopted,
          successRate,
        }
      })
    )
    // ── 7. MOST ADOPTED BREEDS ────────────────────────────────────────
    const breedCount = {}
    allPets
      .filter(p => p.status === 'Adopted' && p.breed)
      .forEach(p => {
        breedCount[p.breed] = (breedCount[p.breed] || 0) + 1
      })
    const totalAdoptedWithBreed = Object.values(breedCount).reduce((a, b) => a + b, 0)
    const topBreeds = Object.entries(breedCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([breed, count]) => ({
        breed,
        count,
        percentage: totalAdoptedWithBreed > 0
          ? Math.round((count / totalAdoptedWithBreed) * 100)
          : 0
      }))

    // ── 8. ABANDONMENT TRENDS ─────────────────────────────────────────
    const abandonmentTrend = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const label = d.toLocaleString('default', { month: 'short' })
      const year = d.getFullYear()
      const month = d.getMonth()

      const monthApps = allApplications.filter(a => {
        const created = new Date(a.createdAt || a.created_at)
        return created.getMonth() === month && created.getFullYear() === year
      })
      const total = monthApps.length
      const rejected = monthApps.filter(a => a.status === 'rejected').length
      const rate = total > 0 ? Math.round((rejected / total) * 100) : 0
      abandonmentTrend.push({ month: label, rate, total, rejected })
    }

    // ── 9. MONTHLY LISTINGS VS ADOPTIONS (NEW) ────────────────────────
    
const monthlyListingsVsAdoptions = []
for (let i = 5; i >= 0; i--) {
  const d = new Date()
  d.setMonth(d.getMonth() - i)
  const label = d.toLocaleString('default', { month: 'short' })
  const year = d.getFullYear()
  const month = d.getMonth()

  const listed = allPets.filter(p => {
    if (!p.listed_at) return false
    const date = new Date(p.listed_at)
    return date.getMonth() === month && date.getFullYear() === year
  }).length

  const adopted = allPets.filter(p => {
    if (!p.adopted_at) return false
    const date = new Date(p.adopted_at)
    return date.getMonth() === month && date.getFullYear() === year
  }).length

  monthlyListingsVsAdoptions.push({ month: label, listed, adopted })
}

    // ── 10. PETS NEVER APPLIED FOR — top 10 oldest (NEW) ─────────────
    const appliedPetIds = new Set(allApplications.map(a => a.pet_id))
    const neverAppliedPets = allPets
      .filter(p => p.status === 'Available' && !appliedPetIds.has(p.id))
      .map(p => {
        const daysListed = Math.floor(
          (new Date() - new Date(p.createdAt || p.created_at)) / (1000 * 60 * 60 * 24)
        )
        const shelter = shelters.find(s => s.id === p.shelter_id)
        return {
          id: p.id,
          name: p.name,
          species: p.species,
          breed: p.breed || 'Unknown',
          shelterName: shelter ? shelter.name : 'Unknown Shelter',
          shelterCity: shelter ? (shelter.city || '') : '',
          daysListed,
          adoptionFee: p.adoption_fee != null && parseFloat(p.adoption_fee) > 0
            ? `₹${parseFloat(p.adoption_fee).toLocaleString()}`
            : 'Free',
        }
      })


    // ── 11. REPORTS — USERS VS SHELTERS (NEW) ────────────────────────
    
const allReports = await Report.findAll()

const reportedUserIds = [...new Set(allReports.map(r => r.reported_user_id).filter(Boolean))]

// Fetch the actual user records to check their role


const reportedUsers = await User.findAll({
  where: { id: reportedUserIds },
  attributes: ['id'],
  include: [{ model: db.Role, as: 'roleDetails', attributes: ['name'] }],
})

const reportedUsersCount   = reportedUsers.filter(u => u.roleDetails?.name === 'adopter').length
const reportedSheltersCount = reportedUsers.filter(u => u.roleDetails?.name === 'shelter').length


const pendingReports  = allReports.filter(r => r.status === 'pending').length
const resolvedReports = allReports.filter(r => r.status !== 'pending').length

    return res.status(200).json({
      data: {
        kpis: {
          // existing
          totalAdoptions,
          activeListings,
          successRate,
          abandonmentRate,
          // new
          avgAdoptionFee,
        },
        // existing
        adoptionRateByCity,
        topShelters,
        topBreeds,
        abandonmentTrend,
        // new
        monthlyListingsVsAdoptions,
        neverAppliedPets,
        reports: {
          reportedUsersCount,
          reportedSheltersCount,
          pendingReports,
          resolvedReports,
        },
      }
    })

  } catch (error) {
    console.error('Admin analytics error:', error)
    return res.status(500).json({
      error: 'Failed to fetch admin analytics',
      details: error.message,
    })
  }
}