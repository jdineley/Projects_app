const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
  },
  organisation: {
    type: Boolean,
    default: function () {
      return this.tenantId !== "9188040d-6c67-4c5b-b112-36a304b66dad";
    },
  },
  // name: {
  //   type: String,
  //   required: true,
  // },
  // admins: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //   },
  // ],
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Virtual property for 'organisation'
// tenantSchema.virtual("organisation").get(function () {
//   return this.tenantId !== "9188040d-6c67-4c5b-b112-36a304b66dad";
// });

// Custom validation for admins property
// tenantSchema.path("admins").validate(function (value) {
//   // If the tenant is an organisation, ensure at least one admin
//   if (this.organisation && (!Array.isArray(value) || value.length === 0)) {
//     return false;
//   }
//   return true;
// }, "Organisation tenants must have at least one admin.");

// Ensure virtual fields are included in JSON output
// tenantSchema.set("toJSON", { virtuals: true });
// tenantSchema.set("toObject", { virtuals: true });

// const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = mongoose.model("Tenant", tenantSchema);
