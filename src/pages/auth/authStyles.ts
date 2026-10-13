export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    height: 42,
    borderRadius: "7px",
    fontSize: "0.875rem",
    "& fieldset": { borderColor: "#e2e5ec" },
    "&:hover fieldset": { borderColor: "#a5b4fc" },
    "&.Mui-focused fieldset": { borderColor: "#5355ec", borderWidth: 1 },
  },
  "& .MuiFormHelperText-root": { marginLeft: 0 },
};

export const submitSx = {
  height: 42,
  borderRadius: "7px",
  backgroundColor: "#5355ec",
  fontSize: "0.875rem",
  fontWeight: 700,
  textTransform: "none" as const,
  boxShadow: "none",
  "&:hover": { backgroundColor: "#4244d6", boxShadow: "none" },
};

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])\S{8,}$/;
