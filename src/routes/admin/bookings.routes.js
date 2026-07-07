import { Router } from "express";
import { createBooking, getBookings, updateBookingStatus } from "../../controllers/admin/bookings.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", validateBody(["providerId", "categoryId"]), createBooking);
router.get("/", getBookings);
router.patch("/:id/status", validateBody(["status"]), updateBookingStatus);

export const bookingsRouter = router;
