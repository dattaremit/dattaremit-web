import * as yup from "yup";

export const addressSchema = yup.object({
  addressLine1: yup.string().trim().required("Street address is required"),
  city: yup.string().trim().required("City is required"),
  state: yup.string().trim().required("State is required"),
  country: yup
    .string()
    .trim()
    .required("Country is required")
    .oneOf(["US", "IN"], "Invalid country"),
  postalCode: yup.string().trim().required("Postal code is required"),
});

export type AddressFormData = yup.InferType<typeof addressSchema>;
