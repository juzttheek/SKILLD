import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./CreateService.css";

const categories = ["digital", "local", "professional"];

const CreateService = () => {
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
      subcategory: "",
      price: "",
      pricingType: "fixed",
      deliveryTime: "",
      tags: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("subcategory", values.subcategory || "");
      formData.append("price", String(Number(values.price)));
      formData.append("pricingType", values.pricingType);
      formData.append("deliveryTime", values.deliveryTime || "");
      formData.append("tags", values.tags || "");

      const files = values.images ? Array.from(values.images).slice(0, 5) : [];
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axiosInstance.post("/api/services", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Service published successfully");
      navigate(`/services/${response.data?._id}`);
    } catch (error) {
      const message =
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        "Unable to create service";
      toast.error(message);
    }
  };

  return (
    <div className="create-service-page">
      <Navbar />

      <main className="create-service-main">
        <div className="cs-shell">
          <section className="cs-header">
            <p className="cs-kicker">Worker Workspace</p>
            <h1>Create a Service</h1>
            <p>Package your offer clearly so clients can decide quickly.</p>
          </section>

          <section className="cs-form-card">
            <form className="cs-form" onSubmit={handleSubmit(onSubmit)}>
              <label>
                Service title
                <input
                  type="text"
                  placeholder="e.g. I will build a polished React dashboard"
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 6,
                      message: "Title must be at least 6 characters",
                    },
                  })}
                />
                {errors.title ? <span className="cs-field-error">{errors.title.message}</span> : null}
              </label>

              <label>
                Description
                <textarea
                  placeholder="Include deliverables, scope boundaries, and communication style."
                  {...register("description", {
                    required: "Description is required",
                    minLength: {
                      value: 30,
                      message: "Description must be at least 30 characters",
                    },
                  })}
                />
                {errors.description ? <span className="cs-field-error">{errors.description.message}</span> : null}
              </label>

              <div className="cs-grid">
                <label>
                  Category
                  <select {...register("category", { required: "Category is required" })}>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category[0].toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.category ? <span className="cs-field-error">{errors.category.message}</span> : null}
                </label>

                <label>
                  Subcategory
                  <input type="text" placeholder="e.g. UI Design" {...register("subcategory")} />
                </label>

                <label>
                  Pricing type
                  <select {...register("pricingType")}>
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </label>

                <label>
                  Price ($)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="120"
                    {...register("price", {
                      required: "Price is required",
                      min: {
                        value: 0,
                        message: "Price must be 0 or more",
                      },
                    })}
                  />
                  {errors.price ? <span className="cs-field-error">{errors.price.message}</span> : null}
                </label>

                <label>
                  Delivery time
                  <input type="text" placeholder="e.g. 5 days" {...register("deliveryTime")} />
                </label>

                <label>
                  Tags (comma separated)
                  <input type="text" placeholder="react, dashboard, ui" {...register("tags")} />
                </label>
              </div>

              <label>
                Images (up to 5)
                <input type="file" multiple accept="image/*" {...register("images")} />
              </label>

              <div className="cs-actions">
                <Button type="submit" variant="primary" loading={isSubmitting}>
                  Publish Service
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

export default CreateService;
