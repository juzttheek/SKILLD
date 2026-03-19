import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Badge from "../components/Badge";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        const [jobsResponse, servicesResponse] = await Promise.all([
          axiosInstance.get("/api/jobs?limit=100&status=open"),
          axiosInstance.get("/api/services?limit=100"),
        ]);

        setJobs(jobsResponse.data?.data || []);
        setServices(servicesResponse.data?.data || []);
      } catch (error) {
        setJobs([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const stats = useMemo(() => {
    const activeServices = services.filter((service) => service.isActive).length;
    const digitalJobs = jobs.filter((job) => job.category === "digital").length;

    return [
      { label: "Open Jobs", value: jobs.length },
      { label: "Active Services", value: activeServices },
      { label: "Digital Jobs", value: digitalJobs },
      { label: "Categories", value: new Set(jobs.map((job) => job.category)).size },
    ];
  }, [jobs, services]);

  return (
    <div className="admin-panel-page">
      <Navbar />

      <main className="admin-panel-main">
        <div className="ap-shell">
          <section className="ap-header">
            <h1>Admin Panel</h1>
            <p>Monitor marketplace activity and review high-impact listings.</p>
          </section>

          {loading ? (
            <div className="ap-loading-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`admin-skeleton-${index}`} className="ap-skeleton" />
              ))}
            </div>
          ) : (
            <>
              <section className="ap-stats-grid">
                {stats.map((item) => (
                  <article key={item.label} className="ap-stat-card">
                    <p className="ap-stat-value">{item.value}</p>
                    <p className="ap-stat-label">{item.label}</p>
                  </article>
                ))}
              </section>

              <section className="ap-grid">
                <article className="ap-panel">
                  <div className="ap-panel-head">
                    <h2>Recent Jobs</h2>
                    <Badge tone="yellow">{jobs.length} open</Badge>
                  </div>

                  <div className="ap-list">
                    {jobs.slice(0, 10).map((job) => (
                      <div key={job._id} className="ap-list-item">
                        <div>
                          <p className="ap-item-title">{job.title}</p>
                          <p className="ap-item-subtitle">{job.client?.name || "Unknown client"}</p>
                        </div>
                        <div className="ap-item-meta">
                          <Badge tone="gray">{job.category}</Badge>
                          <span>${job.budget || 0}</span>
                        </div>
                      </div>
                    ))}
                    {jobs.length === 0 ? <p className="ap-empty">No open jobs found.</p> : null}
                  </div>
                </article>

                <article className="ap-panel">
                  <div className="ap-panel-head">
                    <h2>Recent Services</h2>
                    <Badge tone="green">{services.length} listed</Badge>
                  </div>

                  <div className="ap-list">
                    {services.slice(0, 10).map((service) => (
                      <div key={service._id} className="ap-list-item">
                        <div>
                          <p className="ap-item-title">{service.title}</p>
                          <p className="ap-item-subtitle">{service.worker?.name || "Unknown worker"}</p>
                        </div>
                        <div className="ap-item-meta">
                          <Badge tone={service.isActive ? "green" : "gray"}>
                            {service.isActive ? "active" : "inactive"}
                          </Badge>
                          <span>${service.price || 0}</span>
                        </div>
                      </div>
                    ))}
                    {services.length === 0 ? <p className="ap-empty">No services found.</p> : null}
                  </div>
                </article>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPanel;
