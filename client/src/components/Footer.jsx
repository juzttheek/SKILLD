import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./components.css";

const Footer = () => {
  const { user } = useAuth();
  const role = user?.role || "guest";

  const quickLinksByRole = {
    guest: [
      { to: "/services", label: "Services" },
      { to: "/jobs", label: "Jobs" },
      { to: "/register", label: "Signup" },
    ],
    client: [
      { to: "/services", label: "Services" },
      { to: "/post-job", label: "Post Job" },
      { to: "/dashboard", label: "Dashboard" },
    ],
    worker: [
      { to: "/jobs", label: "Jobs" },
      { to: "/create-service", label: "Create Service" },
      { to: "/dashboard", label: "Dashboard" },
    ],
    both: [
      { to: "/post-job", label: "Post Job" },
      { to: "/create-service", label: "Create Service" },
      { to: "/dashboard", label: "Dashboard" },
    ],
    admin: [
      { to: "/admin", label: "Admin" },
      { to: "/services", label: "Services" },
      { to: "/jobs", label: "Jobs" },
    ],
  };

  const quickLinks = quickLinksByRole[role] || quickLinksByRole.guest;

  return (
    <footer className="sh-footer">
      <div className="sh-footer-grid">
        <div>
          <p className="sh-footer-title">ServiceHire</p>
          <p>Hire trusted workers or get hired for the services you do best.</p>
        </div>

        <div>
          <p className="sh-footer-title">Quick Links</p>
          {quickLinks.map((item) => (
            <p key={item.to}>
              <Link to={item.to}>{item.label}</Link>
            </p>
          ))}
        </div>

        <div>
          <p className="sh-footer-title">Contact</p>
          <p>Email: hello@servicehire.app</p>
          <p>Phone: +1 (555) 010-2030</p>
          <p>Address: Remote First, Worldwide</p>
        </div>
      </div>

      <div className="sh-footer-bottom">© 2025 ServiceHire</div>
    </footer>
  );
};

export default Footer;
