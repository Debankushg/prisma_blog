"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import { authApi } from "@/lib/api/auth.api";
import { applyApiError } from "@/lib/forms";
import { safeRedirectPath } from "@/lib/utils";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

export function LoginForm() {
  const router = useRouter();
  const next = safeRedirectPath(useSearchParams().get("next"));
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await authApi.login(values);
      router.replace(next);
      router.refresh();
    } catch (err) {
      setFormError(applyApiError(err, setError));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <h1 className="gold-text text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to manage your blogs.</p>
      </div>
      {formError && <Alert>{formError}</Alert>}
      <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <PasswordField
        label="Password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" loading={isSubmitting} className="w-full">
        Log in
      </Button>
      <p className="text-center text-sm text-muted">
        No account?{" "}
        <Link href="/register" className="font-medium text-gold hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
