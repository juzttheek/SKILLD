import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: "client",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async ({ confirmPassword, ...values }) => {
    setApiError("");

    try {
      const response = await axiosInstance.post("/api/auth/register", values);
      const { token, ...userData } = response.data;
      login(userData, token);
      toast.success("Account created successfully.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        "Unable to create account.";
      setApiError(message);
      toast.error(message);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-kicker">ServiceHire</p>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Join as a client, worker, or both and start building.</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Full Name"
            name="name"
            placeholder="Jane Doe"
            register={(name) =>
              register(name, {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })
            }
            error={errors.name?.message}
          />

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

          <div className="auth-field-wrap">
            <label htmlFor="role" className="auth-label">
              Role
            </label>
            <select
              id="role"
              className={`auth-select ${errors.role ? "auth-select-error" : ""}`.trim()}
              {...register("role", {
                required: "Role is required",
              })}
            >
              <option value="client">Client</option>
              <option value="worker">Worker</option>
              <option value="both">Client + Worker</option>
            </select>
            {errors.role ? <p className="auth-inline-error">{errors.role.message}</p> : null}
          </div>

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

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            register={(name) =>
              register(name, {
                required: "Please confirm your password",
                validate: (value) => value === passwordValue || "Passwords do not match",
              })
            }
            error={errors.confirmPassword?.message}
          />

          {apiError ? <p className="auth-api-error">{apiError}</p> : null}

          <Button type="submit" variant="primary" loading={isSubmitting}>
            Create Account
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
