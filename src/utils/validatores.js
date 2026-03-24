import validator from "zod";

const registerValidate = validator.object({
  first_name: validator
    .string({ required_error: "First name is required" })
    .min(3, { message: "First name must be at least 3 characters long" })
    .regex(/^[a-zA-Z]+$/, { message: "First name can only contain letters" }),

  second_name: validator
    .string({ required_error: "Second name is required" })
    .min(3, { message: "Second name must be at least 3 characters long" })
    .regex(/^[a-zA-Z]+$/, { message: "Second name can only contain letters" }),

  email: validator
    .string({ required_error: "Email is required" })
    .email({ message: "Please provide a valid email address" }),

  password: validator
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" }),

  grade: validator.string({ required_error: "Grade is required" }),

  national_id: validator
    .string({ required_error: "National ID is required" })
    .regex(/^\d{14}$/, { message: "National ID must be exactly 14 digits" }),

  phone_number: validator
    .string({ required_error: "Phone number is required" })
    .regex(/^\d{11}$/, { message: "Phone number must be exactly 11 digits" }),

  gender: validator.enum(["male", "female"], {
    errorMap: () => ({ message: "Gender must be either 'male' or 'female'" }),
  }),

  date_of_birth: validator
    .string({ required_error: "Date of birth is required" })
    .refine(
      (dob) => {
        const age = new Date().getFullYear() - new Date(dob).getFullYear();
        return age >= 12;
      },
      { message: "You must be at least 12 years old to register" },
    ),
});

export default registerValidate;
