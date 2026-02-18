import { useAuth } from "../../contexts/AuthContext";
import "./settings.css";

export default function Account() {
  const { user, isAuthenticating } = useAuth();

  if (isAuthenticating) {
    return (
      <div className="settings-card" style={{ padding: "2rem" }}>
        <div className="account-skeleton">
          <div className="account-skeleton-line" style={{ width: "25%" }} />
          <div className="account-skeleton-line" style={{ width: "50%" }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="settings-card" style={{ padding: "2rem" }}>
        <p className="settings-page-subtitle">No user information available.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 className="settings-page-title">Account</h2>
        <p className="settings-page-subtitle">View your account information</p>
      </div>

      <div className="settings-card">
        {/* Email */}
        <div className="settings-card-row">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p className="settings-label">Email</p>
              <p className="settings-value">{user.email}</p>
            </div>
            {user.email_confirmed_at && (
              <span className="account-badge">Verified</span>
            )}
          </div>
        </div>

        {/* User ID */}
        <div className="settings-card-row">
          <p className="settings-label">User ID</p>
          <p className="account-mono">{user.id}</p>
        </div>

        {/* Account Created */}
        <div className="settings-card-row">
          <p className="settings-label">Account Created</p>
          <p className="settings-value">
            {new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Last Sign In */}
        {user.last_sign_in_at && (
          <div className="settings-card-row">
            <p className="settings-label">Last Sign In</p>
            <p className="settings-value">
              {new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {/* Provider */}
        {user.app_metadata?.provider && (
          <div className="settings-card-row">
            <p className="settings-label">Sign-in Method</p>
            <p
              className="settings-value"
              style={{ textTransform: "capitalize" }}
            >
              {user.app_metadata.provider}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
