"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useStartInstantMeeting } from "@/hooks/use-start-instant-meeting";

interface StartInstantMeetingButtonProps extends Omit<ButtonProps, "onClick"> {
  title?: string;
}

export function StartInstantMeetingButton({
  title,
  children = "Start instant meeting",
  disabled,
  ...props
}: StartInstantMeetingButtonProps) {
  const { startInstant, isStarting } = useStartInstantMeeting();

  return (
    <Button
      {...props}
      disabled={disabled || isStarting}
      onClick={() => startInstant(title)}
    >
      {isStarting ? <Spinner size="sm" /> : null}
      {children}
    </Button>
  );
}
