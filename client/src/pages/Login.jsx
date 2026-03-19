import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setApiError("");

    try {
      const response = await axiosInstance.post("/api/auth/login", values);
      const { token, ...userData } = response.data;
      login(userData, token);
      toast.success("Welcome back!");

      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        "Unable to sign in.";
      setApiError(message);
      toast.error(message);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-kicker">ServiceHire</p>
        <h1>Sign in to your account</h1>
        <p className="auth-subtitle">Continue to your dashboard and active projects.</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            register={(name) =>
              register(name, {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })
            }
            error={errors.email?.message}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            register={(name) =>
              register(name, {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })
            }
            error={errors.password?.message}
          />

          {apiError ? <p className="auth-api-error">{apiError}</p> : null}

          <Button type="submit" variant="primary" loading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <p className="auth-footer">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
