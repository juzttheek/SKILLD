import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const clientSections = [
  "Overview",
  "My Posted Jobs",
  "Hired Workers",
  "Messages",
  "Account Settings",
];

const workerSections = [
  "Overview",
  "My Services",
  "Job Applications",
  "Active Work",
  "Earnings",
  "Messages",
  "Account Settings",
];

const clientStats = [
  { label: "Jobs Posted", value: 14 },
  { label: "Active Jobs", value: 5 },
  { label: "Completed Jobs", value: 9 },
  { label: "Workers Hired", value: 11 },
];

const workerStats = [
  { label: "Services Listed", value: 8 },
  { label: "Applications Sent", value: 27 },
  { label: "Jobs Completed", value: 19 },
  { label: "Avg. Rating", value: 4.8, isRating: true },
];

const postedJobsMock = [
  {
    id: "1",
    title: "Build a landing page for my startup",
    status: "open",
    budget: 400,
    applications: 7,
    datePosted: "2026-03-14",
  },
  {
    id: "2",
    title: "Monthly bookkeeping and reporting",
    status: "in-progress",
    budget: 650,
    applications: 4,
    datePosted: "2026-03-02",
  },
  {
    id: "3",
    title: "Logo and brand style refresh",
    status: "completed",
    budget: 280,
    applications: 9,
    datePosted: "2026-02-18",
  },
];

const hiredWorkersMock = [
  { id: "w1", name: "Asha Patel", role: "UI Designer", jobsDone: 4 },
  { id: "w2", name: "Daniel Brooks", role: "Accountant", jobsDone: 2 },
  { id: "w3", name: "Mo Chen", role: "Frontend Developer", jobsDone: 3 },
];

const servicesMock = [
  {
    id: "s1",
    title: "Custom React dashboard development",
    thumbnail: "https://via.placeholder.com/160x96?text=Service",
    price: 450,
    orders: 12,
    rating: 5,
    active: true,
  },
  {
    id: "s2",
    title: "Bookkeeping setup for small businesses",
    thumbnail: "https://via.placeholder.com/160x96?text=Service",
    price: 320,
    orders: 7,
    rating: 4,
    active: true,
  },
  {
    id: "s3",
    title: "Mobile app QA testing package",
    thumbnail: "https://via.placeholder.com/160x96?text=Service",
    price: 220,
    orders: 3,
    rating: 4,
    active: false,
  },
];

const jobApplicationsMock = [
  {
    id: "a1",
    jobTitle: "Need a brand identity package",
    clientName: "Olivia Smith",
    dateApplied: "2026-03-17",
    proposedRate: 300,
    status: "pending",
  },
  {
    id: "a2",
    jobTitle: "Monthly social media creatives",
    clientName: "Ravi Nair",
    dateApplied: "2026-03-12",
    proposedRate: 480,
    status: "accepted",
  },
  {
    id: "a3",
    jobTitle: "Website speed optimization",
    clientName: "Emma Stone",
    dateApplied: "2026-03-05",
    proposedRate: 180,
    status: "rejected",
  },
];

const recentActivityMock = [
  "You received a new review from Peter (5 stars)",
  "Your service 'React dashboard' was added to favorites",
  "Application accepted for 'Social media creatives'",
  "Client message received from Olivia Smith",
  "You completed order #8931 successfully",
];

const activeWorkMock = [
  { id: "w1", title: "Landing page build", client: "Acme Labs", due: "2026-03-22" },
  { id: "w2", title: "Accounting clean-up", client: "Nova Retail", due: "2026-03-25" },
];

const earningsMock = [
  { month: "Jan", amount: 1200 },
  { month: "Feb", amount: 1980 },
  { month: "Mar", amount: 1740 },
];

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleDateString();
};

const statusToTone = {
  open: "green",
  "in-progress": "yellow",
  completed: "gray",
  pending: "yellow",
  accepted: "green",
  rejected: "gray",
};

const Dashboard = () => {
  const { user, updateUser, loading: authLoading } = useAuth();

  const role = user?.role || "client";
  const isBoth = role === "both";
  const sectionList = isBoth
    ? [
        "Overview",
        "My Posted Jobs",
        "Hired Workers",
        "My Services",
        "Job Applications",
        "Active Work",
        "Earnings",
        "Messages",
        "Account Settings",
      ]
    : role === "worker"
      ? workerSections
      : clientSections;
  const [activeSection, setActiveSection] = useState("Overview");
  const [services, setServices] = useState(servicesMock);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [skills, setSkills] = useState(["React", "UI Design"]);
  const [skillInput, setSkillInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      location: "",
      bio: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      hourlyRate: "45",
      availability: true,
    },
  });

  const newPasswordValue = watch("newPassword");

  const welcomeName = user?.name || "there";

  const isWorker = role === "worker" || role === "both";

  useEffect(() => {
    reset({
      name: user?.name || "",
      location: "",
      bio: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      hourlyRate: "45",
      availability: true,
    });
    setAvatarPreview(user?.avatar || "");
  }, [user, reset]);

  const overviewSection = useMemo(() => {
    if (isBoth) {
      return (
        <>
          <div className="dash-stats-grid">
            {[...clientStats, ...workerStats].map((stat) => (
              <article key={stat.label} className="dash-stat-card">
                <p className="dash-stat-value">{stat.value}</p>
                <p className="dash-stat-label">{stat.label}</p>
                {stat.isRating ? <StarRating rating={stat.value} size={14} /> : null}
              </article>
            ))}
          </div>

          <section className="dash-panel">
            <h2>Recent Activity</h2>
            <ul className="dash-timeline">
              {recentActivityMock.slice(0, 5).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </section>
        </>
      );
    }

    if (isWorker) {
      return (
        <>
          <div className="dash-stats-grid">
            {workerStats.map((stat) => (
              <article key={stat.label} className="dash-stat-card">
                <p className="dash-stat-value">{stat.value}</p>
                <p className="dash-stat-label">{stat.label}</p>
                {stat.isRating ? <StarRating rating={stat.value} size={14} /> : null}
              </article>
            ))}
          </div>

          <section className="dash-panel">
            <h2>Recent Activity</h2>
            <ul className="dash-timeline">
              {recentActivityMock.slice(0, 5).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </section>
        </>
      );
    }

    return (
      <>
        <div className="dash-stats-grid">
          {clientStats.map((stat) => (
            <article key={stat.label} className="dash-stat-card">
              <p className="dash-stat-value">{stat.value}</p>
              <p className="dash-stat-label">{stat.label}</p>
            </article>
          ))}
        </div>

        <section className="dash-cta-card">
          <div>
            <p>Need something done? Post a new job →</p>
          </div>
          <Button variant="secondary">Post New Job</Button>
        </section>
      </>
    );
  }, [isWorker, isBoth]);

  const renderClientSection = () => {
    switch (activeSection) {
      case "Overview":
        return overviewSection;
      case "My Posted Jobs":
        return (
          <section className="dash-panel">
            <h2>My Posted Jobs</h2>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Budget</th>
                    <th>Applications</th>
                    <th>Date Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postedJobsMock.map((job) => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>
                        <Badge tone={statusToTone[job.status]}>{job.status}</Badge>
                      </td>
                      <td>${job.budget}</td>
                      <td>{job.applications}</td>
                      <td>{formatDate(job.datePosted)}</td>
                      <td className="dash-actions-inline">
                        <button type="button">Edit</button>
                        <button type="button">Delete</button>
                        <button type="button">View Applications</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      case "Hired Workers":
        return (
          <section className="dash-panel">
            <h2>Hired Workers</h2>
            <div className="dash-list">
              {hiredWorkersMock.map((worker) => (
                <article key={worker.id} className="dash-list-item">
                  <div>
                    <p className="dash-item-title">{worker.name}</p>
                    <p className="dash-item-subtitle">{worker.role}</p>
                  </div>
                  <Badge tone="green">{worker.jobsDone} jobs</Badge>
                </article>
              ))}
            </div>
          </section>
        );
      case "Messages":
        return (
          <section className="dash-panel">
            <h2>Messages</h2>
            <p className="dash-muted">Open your inbox to manage conversations with workers.</p>
            <Button variant="primary">Go to Messages</Button>
          </section>
        );
      case "Account Settings":
        return renderAccountSettings();
      default:
        return null;
    }
  };

  const renderWorkerSection = () => {
    switch (activeSection) {
      case "Overview":
        return overviewSection;
      case "My Services":
        return (
          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>My Services</h2>
              <Button variant="primary">Add New Service</Button>
            </div>

            <div className="dash-list">
              {services.map((service) => (
                <article key={service.id} className="dash-service-item">
                  <img src={service.thumbnail} alt={service.title} />
                  <div className="dash-service-main">
                    <p className="dash-item-title">{service.title}</p>
                    <p className="dash-item-subtitle">
                      ${service.price} • {service.orders} orders
                    </p>
                    <StarRating rating={service.rating} size={14} />
                  </div>

                  <div className="dash-service-controls">
                    <label className="dash-toggle-row">
                      <input
                        type="checkbox"
                        checked={service.active}
                        onChange={(event) => {
                          setServices((prev) =>
                            prev.map((item) =>
                              item.id === service.id ? { ...item, active: event.target.checked } : item
                            )
                          );
                        }}
                      />
                      <span>{service.active ? "Active" : "Inactive"}</span>
                    </label>

                    <div className="dash-actions-inline">
                      <button type="button">Edit</button>
                      <button type="button">Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      case "Job Applications":
        return (
          <section className="dash-panel">
            <h2>Job Applications</h2>
            <div className="dash-list">
              {jobApplicationsMock.map((application) => (
                <article key={application.id} className="dash-list-item">
                  <div>
                    <p className="dash-item-title">{application.jobTitle}</p>
                    <p className="dash-item-subtitle">
                      {application.clientName} • {formatDate(application.dateApplied)}
                    </p>
                    <p className="dash-item-subtitle">Proposed Rate: ${application.proposedRate}</p>
                  </div>

                  <Badge tone={statusToTone[application.status]}>{application.status}</Badge>
                </article>
              ))}
            </div>
          </section>
        );
      case "Active Work":
        return (
          <section className="dash-panel">
            <h2>Active Work</h2>
            <div className="dash-list">
              {activeWorkMock.map((work) => (
                <article key={work.id} className="dash-list-item">
                  <div>
                    <p className="dash-item-title">{work.title}</p>
                    <p className="dash-item-subtitle">Client: {work.client}</p>
                  </div>
                  <Badge tone="yellow">Due {formatDate(work.due)}</Badge>
                </article>
              ))}
            </div>
          </section>
        );
      case "Earnings":
        return (
          <section className="dash-panel">
            <h2>Earnings</h2>
            <div className="dash-list">
              {earningsMock.map((item) => (
                <article key={item.month} className="dash-list-item">
                  <p className="dash-item-title">{item.month}</p>
                  <p className="dash-item-title" style={{ color: "#3B6D11" }}>
                    ${item.amount}
                  </p>
                </article>
              ))}
            </div>
          </section>
        );
      case "Messages":
        return (
          <section className="dash-panel">
            <h2>Messages</h2>
            <p className="dash-muted">Manage your conversations with clients from the inbox.</p>
            <Button variant="primary">Go to Messages</Button>
          </section>
        );
      case "Account Settings":
        return renderAccountSettings();
      default:
        return null;
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;
    setSkills((prev) => [...prev, skill]);
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const saveAccountSettings = (values) => {
    updateUser({ name: values.name, avatar: avatarPreview || user?.avatar || "" });
    toast.success("Account settings saved.");
    reset({
      ...values,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const renderAccountSettings = () => (
    <section className="dash-panel">
      <h2>Account Settings</h2>

      <form className="dash-settings-form" onSubmit={handleSubmit(saveAccountSettings)} noValidate>
        <div className="dash-settings-grid">
          <label>
            Name
            <input
              type="text"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
            />
            {errors.name ? <span className="dash-field-error">{errors.name.message}</span> : null}
          </label>

          <label>
            Location
            <input
              type="text"
              {...register("location", {
                required: "Location is required",
                minLength: {
                  value: 2,
                  message: "Location must be at least 2 characters",
                },
              })}
            />
            {errors.location ? <span className="dash-field-error">{errors.location.message}</span> : null}
          </label>
        </div>

        <label>
          Avatar Upload
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setAvatarPreview(URL.createObjectURL(file));
            }}
          />
        </label>

        {avatarPreview ? <img src={avatarPreview} alt="Avatar preview" className="dash-avatar-preview" /> : null}

        <label>
          Bio
          <textarea {...register("bio", { required: "Bio is required", minLength: { value: 10, message: "Bio must be at least 10 characters" } })} />
          {errors.bio ? <span className="dash-field-error">{errors.bio.message}</span> : null}
        </label>

        <div className="dash-settings-grid">
          <label>
            Current Password
            <input type="password" {...register("currentPassword")} />
          </label>
          <label>
            New Password
            <input
              type="password"
              {...register("newPassword", {
                minLength: {
                  value: 8,
                  message: "New password must be at least 8 characters",
                },
              })}
            />
            {errors.newPassword ? <span className="dash-field-error">{errors.newPassword.message}</span> : null}
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              {...register("confirmPassword", {
                validate: (value) => {
                  if (!newPasswordValue) return true;
                  return value === newPasswordValue || "Passwords do not match";
                },
              })}
            />
            {errors.confirmPassword ? <span className="dash-field-error">{errors.confirmPassword.message}</span> : null}
          </label>
        </div>

        {isWorker ? (
          <>
            <div className="dash-settings-grid">
              <label>
                Hourly Rate
                <input
                  type="number"
                  {...register("hourlyRate", {
                    required: "Hourly rate is required",
                    min: {
                      value: 1,
                      message: "Hourly rate must be greater than 0",
                    },
                  })}
                />
                {errors.hourlyRate ? <span className="dash-field-error">{errors.hourlyRate.message}</span> : null}
              </label>

              <label className="dash-toggle-row">
                <input
                  type="checkbox"
                  {...register("availability")}
                />
                <span>Available for work</span>
              </label>
            </div>

            <div>
              <p className="dash-field-label">Skills</p>
              <div className="dash-skill-input-row">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  placeholder="Add a skill"
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  Add
                </Button>
              </div>

              <div className="dash-skill-tags">
                {skills.map((skill) => (
                  <button key={skill} type="button" className="dash-skill-chip" onClick={() => removeSkill(skill)}>
                    {skill} ×
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <Button type="submit" variant="primary" loading={isSubmitting}>
          Save
        </Button>
      </form>
    </section>
  );

  if (authLoading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <main className="dashboard-main">
          <div className="dash-shell">
            <div className="dash-loading-grid">
              <div className="dash-loading-block" />
              <div className="dash-loading-block" />
              <div className="dash-loading-block" />
              <div className="dash-loading-block" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        <div className="dash-shell">
          <h1>Welcome back, {welcomeName}</h1>

          <div className="dash-layout">
            <aside className="dash-sidebar">
              {sectionList.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`dash-nav-item ${item === activeSection ? "active" : ""}`.trim()}
                  onClick={() => setActiveSection(item)}
                >
                  {item}
                </button>
              ))}
            </aside>

            <div className="dash-mobile-tabs">
              {sectionList.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`dash-tab-item ${item === activeSection ? "active" : ""}`.trim()}
                  onClick={() => setActiveSection(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <section className="dash-content">
              {isBoth
                ? (["My Services", "Job Applications", "Active Work", "Earnings"].includes(activeSection)
                    ? renderWorkerSection()
                    : renderClientSection())
                : isWorker
                  ? renderWorkerSection()
                  : renderClientSection()}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
