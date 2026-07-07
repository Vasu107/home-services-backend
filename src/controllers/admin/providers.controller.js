import { prisma } from "../../config/db.js";

export async function getProviderProfile(req, res, next) {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: Number(req.params.providerId) },
      include: { user: true, categories: { include: { category: true } } },
    });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found." });
    }
    res.json({ success: true, data: provider });
  } catch (error) {
    next(error);
  }
}

export async function updateProviderProfile(req, res, next) {
  try {
    if (req.user.role !== "PROVIDER") {
      return res.status(403).json({ success: false, message: "Only providers can update their profile." });
    }

    const { about, experienceYears, serviceCharge, availability } = req.body;
    const profile = await prisma.providerProfile.update({
      where: { userId: req.user.id },
      data: {
        about,
        experienceYears: experienceYears !== undefined ? Number(experienceYears) : undefined,
        serviceCharge: serviceCharge !== undefined ? Number(serviceCharge) : undefined,
        availability,
      },
    });
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}



export async function updateProviderStatus(req, res, next) {
  try {
    const { providerId } = req.params;


    // Get action from URL
    const action = req.path.split("/").pop().toUpperCase();
    console.log("Action:", action); // Debugging line


    // Validate action
    const allowedStatus = ["APPROVED", "REJECTED", "SUSPENDED"];

    if (!allowedStatus.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status action.",
      });
    }

    // Check provider exists
    const provider = await prisma.providerProfile.findUnique({
      where: {
        id: Number(providerId),
      },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found.",
      });
    }

    // Update status
    const updatedProvider = await prisma.providerProfile.update({
      where: {
        id: Number(providerId),
      },
      data: {
        status: action,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Provider ${action.toLowerCase()} successfully.`,
      data: updatedProvider,
    });
  } catch (error) {
    next(error);
  }
}