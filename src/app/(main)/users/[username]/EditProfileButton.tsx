"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import EditProfileDialog from "./EditProfileDialog";
import { UserData } from "@/lib/types";

interface EditProfileButtonProps {
  user: UserData;
}

export default function EditProfileButton({ user }: EditProfileButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => setIsDialogOpen(true)}
      >
        ✏️ Edit Profile
      </Button>

      <EditProfileDialog
        user={user}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
