import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./ClientProfile.css";

const ClientProfile = () => {
  const { id } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/jobs?limit=200");
        const allJobs = response.data?.data || [];
        const ownerJobs = allJobs.filter((job) => (job.client?._id || job.client) === id);
        setJobs(ownerJobs);
      } catch (error) {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [id]);

  const clientName = jobs[0]?.client?.name || "Client";
  const openJobs = jobs.filter((job) => job.status === "open").length;
  const completedJobs = jobs.filter((job) => job.status === "completed").length;
  const totalBudget = useMemo(() => jobs.reduce((acc, job) => acc + (Number(job.budget) || 0), 0), [jobs]);

  return (
    <div className="client-profile-page">
      <Navbar />

      <main className="client-profile-main">
        <div className="cp-shell">
          <section className="cp-header">
            <h1>{clientName}</h1>
            <p>Client profile and job posting history</p>
          </section>

          {loading ? (
            <div className="cp-skeleton" />
          ) : (
            <>
              <section className="cp-stats-grid">
                <article className="cp-stat-card">
                  <p className="cp-stat-value">{jobs.length}</p>
                  <p className="cp-stat-label">Total Jobs</p>
                </article>
                <article className="cp-stat-card">
                  <p className="cp-stat-value">{openJobs}</p>
                  <p className="cp-stat-label">Open Jobs</p>
                </article>
                <article className="cp-stat-card">
                  <p className="cp-stat-value">{completedJobs}</p>
                  <p className="cp-stat-label">Completed Jobs</p>
                </article>
                <article className="cp-stat-card">
                  <p className="cp-stat-value">${totalBudget}</p>
                  <p className="cp-stat-label">Total Posted Budget</p>
                </article>
              </section>

              <section className="cp-panel">
                <h2>Recent Job Posts</h2>
                <div className="cp-list">
                  {jobs.slice(0, 12).map((job) => (
                    <article key={job._id} className="cp-item">
                      <div>
                        <p className="cp-item-title">{job.title}</p>
                        <p className="cp-item-subtitle">{job.category}</p>
                      </div>
                      <div className="cp-item-meta">
                        <span>${job.budget || 0}</span>
                        <span>{job.status}</span>
                      </div>
                    </article>
                  ))}
                  {jobs.length === 0 ? <p className="cp-empty">No jobs posted yet.</p> : null}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientProfile;
