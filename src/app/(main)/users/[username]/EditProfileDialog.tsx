import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import LoadingButton from "@/components/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserData } from "@/lib/types";
import ProfilePictureSelector from "@/components/ProfilePictureSelector";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useUpdateProfileMutation } from "./mutations";
import Image from "next/image";

interface EditProfileDialogProps {
  user: UserData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  // Added avatarUrl to defaultValues so that it's part of the form values.
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
    },
  });

  const mutation = useUpdateProfileMutation();

  // State for a cropped avatar if the user uploads and crops one
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  // New state to track the selected pre-built avatar URL.
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(
    user.avatarUrl || avatarPlaceholder.src
  );

  async function onSubmit(values: UpdateUserProfileValues) {
    mutation.mutate(
      {
        values: { ...values, avatarUrl: selectedAvatarUrl },
        // Only pass a File if croppedAvatar exists; otherwise, undefined.
        avatar: croppedAvatar ? new File([croppedAvatar], `avatar_${user.id}.webp`) : undefined,
      },
      {
        onSuccess: () => {
          setCroppedAvatar(null);
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mb-4">
              <FormLabel>Profile Picture</FormLabel>
              <ProfilePictureSelector
                selected={selectedAvatarUrl}
                onSelect={(avatar) => {
                  setSelectedAvatarUrl(avatar);
                  // Clear any cropped image if a pre-built avatar is chosen.
                  setCroppedAvatar(null);
                }}
              />
            </div>
            <DialogFooter>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
