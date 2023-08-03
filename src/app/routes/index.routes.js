const { Router } = require("express");
const authRoutes = require("./APIs/auth.routes");
const {loggedIn} = require("../middlewares/auth.middleware");

const router = Router();
router.get("/", loggedIn(), (req, res) => {
    res.json({
        status: "success",
        data: {
            user: req.user,
        },
    });
});

router.use("/auth", authRoutes);

module.exports = router;