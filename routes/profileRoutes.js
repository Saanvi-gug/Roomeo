const express = require("express");

const router = express.Router();

const {
    saveProfile,
    getProfile
} = require("../controllers/profileController");

router.put("/:id", saveProfile);

router.get("/:id", getProfile);

module.exports = router;
