import * as yup from "yup";

export const indianKycSchema = yup.object({
  aadharNumber: yup
    .string()
    .trim()
    .required("Aadhar number is required")
    .matches(/^\d{12}$/, "Aadhar must be exactly 12 digits"),
  panNumber: yup
    .string()
    .trim()
    .uppercase()
    .required("PAN is required")
    .matches(
      /^[A-Z]{5}[0-9]{4}[A-Z]$/,
      "PAN must be like ABCDE1234F (5 letters, 4 digits, 1 letter)",
    ),
});

export type IndianKycFormData = yup.InferType<typeof indianKycSchema>;
