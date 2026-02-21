import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

export const toast = ({ title, description, variant }: ToastOptions) => {
  const message = [title, description].filter(Boolean).join(" - ");

  switch (variant) {
    case "destructive":
      return sonnerToast.error(message);
    case "success":
      return sonnerToast.success(message);
    default:
      return sonnerToast(message);
  }
};

export const useToast = () => {
  return { toast };
};
