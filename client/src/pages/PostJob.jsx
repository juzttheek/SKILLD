import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./PostJob.css";

const categories = ["digital", "local", "professional"];

const PostJob = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "digital",
      budget: "",
      budgetType: "fixed",
      deadline: "",
      location: "",
      tags: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        budget: Number(values.budget),
        tags: values.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const response = await axiosInstance.post("/api/jobs", payload);
      toast.success("Job posted successfully");
      navigate(`/jobs/${response.data?._id}`);
    } catch (error) {
      const message =
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        "Unable to post job";
      toast.error(message);
    }
  };

  return (
    <div className="post-job-page">
      <Navbar />

      <main className="post-job-main">
        <div className="pj-shell">
          <section className="pj-header">
            <p className="pj-kicker">Client Workspace</p>
            <h1>Post a New Job</h1>
            <p>Describe your project clearly so workers can send stronger proposals.</p>
          </section>

          <section className="pj-form-card">
            <form className="pj-form" onSubmit={handleSubmit(onSubmit)}>
              <label>
                Job title
                <input
                  type="text"
                  placeholder="e.g. Build a React landing page"
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 6,
                      message: "Title must be at least 6 characters",
                    },
                  })}
                />
                {errors.title ? <span className="pj-field-error">{errors.title.message}</span> : null}
              </label>

              <label>
                Description
                <textarea
                  placeholder="What do you need, what deliverables matter, and what timeline do you have?"
                  {...register("description", {
                    required: "Description is required",
                    minLength: {
                      value: 30,
                      message: "Description must be at least 30 characters",
                    },
                  })}
                />
                {errors.description ? <span className="pj-field-error">{errors.description.message}</span> : null}
              </label>

              <div className="pj-grid">
                <label>
                  Category
                  <select {...register("category", { required: "Category is required" })}>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category[0].toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.category ? <span className="pj-field-error">{errors.category.message}</span> : null}
                </label>

                <label>
                  Budget type
                  <select {...register("budgetType")}>
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </label>

                <label>
                  Budget ($)
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="500"
                    {...register("budget", {
                      required: "Budget is required",
                      min: {
                        value: 1,
                        message: "Budget must be greater than 0",
                      },
                    })}
                  />
                  {errors.budget ? <span className="pj-field-error">{errors.budget.message}</span> : null}
                </label>

                <label>
                  Deadline
                  <input type="date" {...register("deadline")} />
                </label>
              </div>

              <div className="pj-grid">
                <label>
                  Location (optional)
                  <input type="text" placeholder="Remote / New York / etc" {...register("location")} />
                </label>

                <label>
                  Tags (comma separated)
                  <input type="text" placeholder="react, landing-page, ui" {...register("tags")} />
                </label>
              </div>

              <div className="pj-actions">
                <Button type="submit" variant="primary" loading={isSubmitting}>
                  Publish Job
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostJob;
