import { useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layout/AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { emailPattern, fieldSx, submitSx } from "./authStyles";
import { notify } from "../../components/ui/notify";

type LoginValues = { email: string; password: string; remember: boolean };

export default function Login() {
  const navigate = useNavigate();
  const { login, errorMessage } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    defaultValues: { email: "", password: "", remember: true },
    mode: "onTouched",
  });

  const onSubmit = async ({ email, password, remember }: LoginValues) => {
    try {
      const session = await login(
        email.trim().toLowerCase(),
        password,
        remember,
      );
      notify.success(`Xush kelibsiz, ${session.user.fullName}!`);
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
      <h1 className="text-[30px] font-bold tracking-tight">Tizimga kirish</h1>
      <p className="mt-1 text-sm text-slate-400">
        Hisobingizga kirish uchun ma&apos;lumotlaringizni kiriting.
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-9 space-y-5"
      >
        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block text-xs font-semibold"
          >
            Email manzil
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
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                fullWidth
                size="small"
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={fieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiMail size={15} />
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
            htmlFor="login-password"
            className="mb-2 block text-xs font-semibold"
          >
            Parol
          </label>
          <Controller
            name="password"
            control={control}
            rules={{ required: "Parolni kiriting" }}
            render={({ field }) => (
              <TextField
                {...field}
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Parolingiz"
                fullWidth
                size="small"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={fieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiLock size={15} />
                      </InputAdornment>
                    ),
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
        <div className="flex items-center justify-between gap-3">
          <Controller
            name="remember"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={field.value}
                    onChange={(_, checked) => field.onChange(checked)}
                    sx={{
                      color: "#aab0c1",
                      "&.Mui-checked": { color: "#5355ec" },
                    }}
                  />
                }
                label={
                  <span className="text-xs text-slate-600">
                    Meni eslab qolish
                  </span>
                }
                sx={{ marginLeft: -1 }}
              />
            )}
          />
          <span
            className="text-xs text-slate-400"
            title="Parolni tiklash xizmati hali ulanmagan"
          >
            Parolni unutdingizmi?
          </span>
        </div>
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
          {isSubmitting ? "Kirilmoqda..." : "Kirish"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Hisobingiz yo&apos;qmi?{" "}
        <Link
          className="font-semibold text-[#5355ec] hover:underline"
          to="/register"
        >
          Ro&apos;yxatdan o&apos;tish
        </Link>
      </p>
    </AuthLayout>
  );
}
