const { Router } = require("express");
const authRoutes = require("./APIs/auth.routes");

const router = Router();

router.use("/auth", authRoutes);

module.exports = router;