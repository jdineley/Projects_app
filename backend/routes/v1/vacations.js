const express = require("express");

const {
  createVacation,
  updateVacation,
  deleteVacation,
} = require("../../controllers/vacationController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.post("/", createVacation);

router.patch("/:vacationId", updateVacation);

router.delete("/:vacationId", deleteVacation);

router.get("/");

router.get("/");

module.exports = router;
