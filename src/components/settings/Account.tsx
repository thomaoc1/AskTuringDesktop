import { useAuth } from "../../contexts/AuthContext";

export default function Account() {
  const { user, isAuthenticating } = useAuth();

  if (isAuthenticating) {
    return (
      <div
        className="rounded-xl shadow-sm p-8"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="animate-pulse space-y-4">
          <div
            className="h-4 rounded w-1/4"
            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
          />
          <div
            className="h-4 rounded w-1/2"
            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="rounded-xl shadow-sm p-8"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <p style={{ color: "var(--color-text-secondary)" }}>
          No user information available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Account
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>
          View your account information
        </p>
      </div>

      <div
        className="rounded-xl shadow-sm"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Email */}
        <div
          className="p-6"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Email
              </p>
              <p
                className="text-base"
                style={{ color: "var(--color-text-primary)" }}
              >
                {user.email}
              </p>
            </div>
            {user.email_confirmed_at && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "var(--color-success-bg)",
                  color: "var(--color-success-text)",
                }}
              >
                Verified
              </span>
            )}
          </div>
        </div>

        {/* User ID */}
        <div
          className="p-6"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            User ID
          </p>
          <p
            className="font-mono text-sm"
            style={{ color: "var(--color-text-primary)" }}
          >
            {user.id}
          </p>
        </div>

        {/* Account Created */}
        <div
          className="p-6"
          style={
            user.last_sign_in_at || user.app_metadata?.provider
              ? { borderBottom: "1px solid var(--color-border)" }
              : {}
          }
        >
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Account Created
          </p>
          <p
            className="text-base"
            style={{ color: "var(--color-text-primary)" }}
          >
            {new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Last Sign In */}
        {user.last_sign_in_at && (
          <div
            className="p-6"
            style={
              user.app_metadata?.provider
                ? { borderBottom: "1px solid var(--color-border)" }
                : {}
            }
          >
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Last Sign In
            </p>
            <p
              className="text-base"
              style={{ color: "var(--color-text-primary)" }}
            >
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
          <div className="p-6">
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Sign-in Method
            </p>
            <p
              className="text-base capitalize"
              style={{ color: "var(--color-text-primary)" }}
            >
              {user.app_metadata.provider}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
