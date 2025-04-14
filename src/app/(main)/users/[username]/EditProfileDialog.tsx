import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import LoadingButton from "@/components/LoadingButton";
import ProfilePictureSelector from "@/components/ProfilePictureSelector";
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

import { updateUserProfileSchema, UpdateUserProfileValues } from "@/lib/validation";
import { useUpdateProfileMutation } from "./mutations";
import { UserData } from "@/lib/types";

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
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
    },
  });

  const mutation = useUpdateProfileMutation();

  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(
    user.avatarUrl || avatarPlaceholder.src
  );

  const handleSubmit = (values: UpdateUserProfileValues) => {
    mutation.mutate(
      {
        values: { ...values, avatarUrl: selectedAvatarUrl },
        avatar: croppedAvatar
          ? new File([croppedAvatar], `avatar_${user.id}.webp`)
          : undefined,
      },
      {
        onSuccess: () => {
          setCroppedAvatar(null);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
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

            <div>
              <FormLabel>Profile Picture</FormLabel>
              <ProfilePictureSelector
                selected={selectedAvatarUrl}
                onSelect={(avatar) => {
                  setSelectedAvatarUrl(avatar);
                  setCroppedAvatar(null);
                }}
              />
            </div>

            <DialogFooter>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save Changes
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
