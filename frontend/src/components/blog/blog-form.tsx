"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/ui/alert";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { blogsApi } from "@/lib/api/blogs.api";
import { ApiClientError } from "@/lib/api/errors";
import { applyApiError } from "@/lib/forms";
import { blogSchema, type BlogInput } from "@/lib/validators/blog";
import type { Blog } from "@/types";

// Client-only: TipTap isn't prerenderable (it uses Math.random), and this keeps it out of the initial bundle.
const RichTextEditor = dynamic(
  () =>
    import("@/components/editor/rich-text-editor").then(
      (m) => m.RichTextEditor,
    ),
  {
    ssr: false,
    loading: () => <div className="skeleton h-[28rem]" aria-busy="true" />,
  },
);

type BlogFormProps = { mode: "create" } | { mode: "edit"; blog: Blog };

export function BlogForm(props: BlogFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const editing = props.mode === "edit";

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BlogInput>({
    resolver: zodResolver(blogSchema),
    defaultValues:
      props.mode === "edit"
        ? { title: props.blog.title, content: props.blog.content }
        : { title: "", content: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const saved =
        props.mode === "edit"
          ? await blogsApi.update(props.blog.id, values)
          : await blogsApi.create(values);
      router.push(`/blogs/${saved.id}`);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401)
        return router.replace("/login");
      setFormError(applyApiError(err, setError));
    }
  });

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <h1 className="gold-text text-2xl font-semibold tracking-tight">
          {editing ? "Edit blog" : "New blog"}
        </h1>
        {formError && <Alert>{formError}</Alert>}
        <TextField
          label="Title"
          error={errors.title?.message}
          data-tour="blog-title"
          {...register("title")}
        />
        <div className="space-y-1.5">
          <span id="content-label" className="block text-sm font-medium">
            Content
          </span>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!errors.content}
                labelledBy="content-label"
              />
            )}
          />
          {errors.content && (
            <p className="text-sm text-danger">{errors.content.message}</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Link
            href={editing ? `/blogs/${props.blog.id}` : "/blogs"}
            className={buttonStyles("secondary")}
          >
            Cancel
          </Link>
          <Button type="submit" loading={isSubmitting} data-tour="publish">
            {editing ? "Save changes" : "Publish"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
