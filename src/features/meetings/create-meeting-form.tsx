"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createMeetingSchema, type CreateMeetingFormValues } from "@/lib/schemas";
import { meetingsService } from "@/services/meetings";
import { ApiError } from "@/types/api";

export function CreateMeetingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateMeetingFormValues>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: { title: "" },
  });

  const onSubmit = async (values: CreateMeetingFormValues) => {
    setError(null);
    try {
      const payload = {
        title: values.title,
        ...(values.scheduledFor ? { scheduledFor: new Date(values.scheduledFor).toISOString() } : {}),
      };
      const { meeting } = await meetingsService.create(payload);
      router.push(`/meeting/${meeting.code}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create meeting.");
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>New meeting</CardTitle>
        <CardDescription>Create an instant or scheduled meeting</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <Alert variant="destructive">{error}</Alert>}

          <div className="space-y-2">
            <Label htmlFor="title">Meeting title</Label>
            <Input id="title" placeholder="Team standup" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledFor">Schedule for (optional)</Label>
            <Input id="scheduledFor" type="datetime-local" {...register("scheduledFor")} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : "Create & join"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
