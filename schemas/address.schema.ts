import * as yup from "yup";

const addressFields = {
  addressLine1: yup.string().trim().required("Street address is required"),
  addressLine2: yup.string().trim().default(""),
  city: yup.string().trim().required("City is required"),
  state: yup.string().trim().required("State is required"),
  postalCode: yup.string().trim().required("Postal code is required"),
  country: yup.string().trim().required("Country is required"),
};

export const addressSchema = yup.object({
  presentAddress: yup.object(addressFields),
  sameAsPresent: yup.boolean().default(false),
  permanentAddress: yup.object(addressFields).when("sameAsPresent", {
    is: true,
    then: (schema) =>
      schema.shape({
        addressLine1: yup.string().trim().default(""),
        addressLine2: yup.string().trim().default(""),
        city: yup.string().trim().default(""),
        state: yup.string().trim().default(""),
        postalCode: yup.string().trim().default(""),
        country: yup.string().trim().default(""),
      }),
  }),
});

export type AddressFormData = yup.InferType<typeof addressSchema>;
