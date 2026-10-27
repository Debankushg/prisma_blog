"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import { authApi } from "@/lib/api/auth.api";
import { applyApiError } from "@/lib/forms";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await authApi.register(values);
      router.replace("/blogs");
      router.refresh();
    } catch (err) {
      setFormError(applyApiError(err, setError));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <h1 className="gold-text text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Start writing in under a minute.</p>
      </div>
      {formError && <Alert>{formError}</Alert>}
      <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <TextField
        label="Age"
        type="number"
        inputMode="numeric"
        error={errors.age?.message}
        {...register("age", { valueAsNumber: true })}
      />
      <PasswordField
        label="Password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        label="Confirm password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" loading={isSubmitting} className="w-full">
        Create account
      </Button>
      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-gold hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
