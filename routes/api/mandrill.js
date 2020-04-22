const router = require("express").Router();
const mandrillController = require("../../controllers/mandrillController");
const contactValidator = require('../../utils/validators');

// MATCHES -> "/api/mandrill/contact"
router.route("/contact")
  .post(contactValidator, ()=>{console.log("hello")});

module.exports = router;