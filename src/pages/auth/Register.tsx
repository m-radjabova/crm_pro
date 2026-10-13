import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FiArrowRight, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layout/AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { emailPattern, fieldSx, passwordPattern, submitSx } from "./authStyles";
import { notify } from "../../components/ui/notify";

type RegisterValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const navigate = useNavigate();
  const { register: createAccount, errorMessage } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });
  const password = useWatch({ control, name: "password" });
  const passwordValid = passwordPattern.test(password);

  const onSubmit = async ({ fullName, email, password }: RegisterValues) => {
    try {
      const session = await createAccount(
        fullName.trim(),
        email.trim().toLowerCase(),
        password,
        "manager",
      );
      notify.success("Hisob yaratildi. Xush kelibsiz!");
      navigate(
        session.user.role === "admin"
          ? "/admin"
          : session.user.role === "manager"
            ? "/settings"
            : "/welcome",
        { replace: true },
      );
    } catch (error) {
      const message = errorMessage(error);
      setError("root", { message });
      notify.error(message);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-[30px] font-bold tracking-tight">
        Ro&apos;yxatdan o&apos;tish
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Yangi hisob yarating va CRM tizimidan foydalaning.
      </p>
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#5355ec] font-bold text-white">
          M
        </span>
        <span>
          <b>Manager hisobi</b> — CRM ish maydoningiz yaratiladi.
        </span>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 space-y-4"
      >
        <div>
          <label
            htmlFor="register-name"
            className="mb-2 block text-xs font-semibold"
          >
            To&apos;liq ism *
          </label>
          <Controller
            name="fullName"
            control={control}
            rules={{
              required: "To'liq ismni kiriting",
              validate: (value) =>
                (value.trim().length >= 2 && value.trim().length <= 100) ||
                "Ism 2–100 belgidan iborat bo'lsin",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                id="register-name"
                autoComplete="name"
                placeholder="John Doe"
                fullWidth
                size="small"
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                sx={fieldSx}
              />
            )}
          />
        </div>
        <div>
          <label
            htmlFor="register-email"
            className="mb-2 block text-xs font-semibold"
          >
            Email manzil *
          </label>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email manzilni kiriting",
              pattern: {
                value: emailPattern,
                message: "To'g'ri email manzil kiriting",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                fullWidth
                size="small"
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={fieldSx}
              />
            )}
          />
        </div>
        <div>
          <label
            htmlFor="register-password"
            className="mb-2 block text-xs font-semibold"
          >
            Parol *
          </label>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Parolni kiriting",
              pattern: {
                value: passwordPattern,
                message:
                  "Kamida 8 belgi, katta va kichik harf, raqam va maxsus belgi kiriting",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Kuchli parol yarating"
                fullWidth
                size="small"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={fieldSx}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword
                              ? "Parolni yashirish"
                              : "Parolni ko'rsatish"
                          }
                        >
                          {showPassword ? (
                            <FiEyeOff size={16} />
                          ) : (
                            <FiEye size={16} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </div>
        <div>
          <label
            htmlFor="register-confirm"
            className="mb-2 block text-xs font-semibold"
          >
            Parolni tasdiqlang *
          </label>
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Parolni qayta kiriting",
              validate: (value) =>
                value === password || "Parollar bir xil emas",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                id="register-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Parolni qayta kiriting"
                fullWidth
                size="small"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                sx={fieldSx}
              />
            )}
          />
        </div>
        <p
          className={`flex items-center gap-1.5 text-xs ${passwordValid ? "text-emerald-600" : "text-slate-400"}`}
        >
          <FiCheck /> Kamida 8 ta belgi, katta va kichik harf, raqam hamda
          maxsus belgi
        </p>
        {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={submitSx}
          endIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FiArrowRight size={15} />
            )
          }
        >
          {isSubmitting ? "Hisob yaratilmoqda..." : "Hisob yaratish"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-400">
        Hisobingiz bormi?{" "}
        <Link
          className="font-semibold text-[#5355ec] hover:underline"
          to="/login"
        >
          Kirish
        </Link>
      </p>
    </AuthLayout>
  );
}
