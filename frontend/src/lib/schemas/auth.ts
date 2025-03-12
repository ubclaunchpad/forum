import * as z from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*()_\-+={\[\}\]\|\\:;"'<,>.?\/])[A-Za-z\d~!@#$%^&*()_\-+={\[\}\]\|\\:;"'<,>.?\/]{8,}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
      ),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v, {
      message: "Please check the checkbox to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      const { password, email } = data;
      const emailIdentifier = email.split("@")[0];
      const lowerPassword = password.toLowerCase();
      return (
        !lowerPassword.includes(emailIdentifier.toLowerCase())
      );
    },
    {
      message:
        "Password cannot contain your email identifier",
      path: ["password"],
    },
  );

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*()_\-+={\[\}\]\|\\:;"'<,>.?\/])[A-Za-z\d~!@#$%^&*()_\-+={\[\}\]\|\\:;"'<,>.?\/]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    ),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
