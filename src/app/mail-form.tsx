"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

const FormSchema = z.object({
  mail: z.string().email(),
});

export function MailForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mail: "",
    },
  });
  const sendEmail = api.email.send.useMutation({
    onSuccess: () => {
      toast.success("Email sent! 🚀");
    },
    onError: () => {
      toast.error("Something went wrong! 💀");
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    sendEmail.mutate({ email: data.mail });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="mail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="tuemail@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={sendEmail.isPending} type="submit" className="w-full">
          Send
        </Button>
      </form>
    </Form>
  );
}
