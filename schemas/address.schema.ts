import * as yup from "yup";

const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;
const IN_PIN_REGEX = /^\d{6}$/;

export const addressSchema = yup.object({
  addressLine1: yup
    .string()
    .trim()
    .required("Street address is required")
    .max(100, "Address is too long"),
  city: yup.string().trim().required("City is required").max(60, "City is too long"),
  state: yup.string().trim().required("State is required").max(60, "State is too long"),
  country: yup
    .string()
    .trim()
    .required("Country is required")
    .oneOf(["US", "IN"], "Invalid country"),
  postalCode: yup
    .string()
    .trim()
    .required("Postal code is required")
    .max(12, "Postal code is too long")
    .test("postal-code-format", "Enter a valid postal code", function (value) {
      const country = this.parent?.country;
      if (!value) return false;
      if (country === "US") return US_ZIP_REGEX.test(value);
      if (country === "IN") return IN_PIN_REGEX.test(value);
      return true;
    }),
});

export type AddressFormData = yup.InferType<typeof addressSchema>;
