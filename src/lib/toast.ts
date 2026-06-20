import { toast as sonner } from "sonner";

type ToastOptions = {
  description?: string;
};

export const toast = {
  success(message: string, options?: ToastOptions) {
    sonner.success(message, options);
  },

  error(message: string, options?: ToastOptions) {
    sonner.error(message, options);
  },

  info(message: string, options?: ToastOptions) {
    sonner.info(message, options);
  },

  copied(label = "Copied to clipboard") {
    sonner.success(label, {
      description: "You can paste it into a message or email.",
    });
  },

  shared() {
    sonner.success("Invite shared", {
      description: "Your meeting link was sent.",
    });
  },
};
