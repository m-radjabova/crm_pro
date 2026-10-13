import { createElement } from "react";
import { toast, type Id, type ToastOptions } from "react-toastify";
import PremiumToast from "./PremiumToast";

type Variant = "success" | "error" | "warning" | "info" | "loading";

const baseOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3600,
  closeOnClick: true,
  pauseOnHover: true,
  pauseOnFocusLoss: false,
  draggable: false,
  hideProgressBar: true,
  closeButton: false,
  icon: false,
};

function getOptions(variant: Variant, options: ToastOptions = {}): ToastOptions {
  return {
    ...baseOptions,
    ...options,
    className: `premium-toast premium-toast--${variant}`,
    progressClassName: "premium-toast__progress",
  };
}

function show(variant: Exclude<Variant, "loading">, message: string, options?: ToastOptions) {
  return toast(
    ({ closeToast }) => createElement(PremiumToast, { variant, message, closeToast }),
    getOptions(variant, options),
  );
}

export const notify = {
  success: (message: string, options?: ToastOptions) => show("success", message, options),
  error: (message: string, options?: ToastOptions) => show("error", message, options),
  warning: (message: string, options?: ToastOptions) => show("warning", message, options),
  info: (message: string, options?: ToastOptions) => show("info", message, options),
  dismiss: (id?: Id) => toast.dismiss(id),
  promise: <T,>(
    operation: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((reason: unknown) => string);
    },
  ) => {
    const id = toast(
      createElement(PremiumToast, { variant: "loading", message: messages.loading }),
      getOptions("loading", { autoClose: false, closeOnClick: false, draggable: false }),
    );

    operation.then(
      (data) => {
        const message = typeof messages.success === "function" ? messages.success(data) : messages.success;
        toast.update(id, {
          ...getOptions("success", { autoClose: 3200 }),
          render: ({ closeToast }) => createElement(PremiumToast, { variant: "success", message, closeToast }),
          type: "success",
          isLoading: false,
        });
      },
      (reason) => {
        const message = typeof messages.error === "function" ? messages.error(reason) : messages.error;
        toast.update(id, {
          ...getOptions("error", { autoClose: 4000 }),
          render: ({ closeToast }) => createElement(PremiumToast, { variant: "error", message, closeToast }),
          type: "error",
          isLoading: false,
        });
      },
    );

    return operation;
  },
};
