import { useAuth } from "../../contexts/AuthContext";

export default function Account() {
  const { user, isAuthenticating } = useAuth();

  if (isAuthenticating) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <p className="text-gray-500">No user information available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Account</h2>
        <p className="text-gray-500">View your account information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
        {/* Email */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
              <p className="text-base text-gray-900">{user.email}</p>
            </div>
            {user.email_confirmed_at && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified
              </span>
            )}
          </div>
        </div>

        {/* User ID */}
        <div className="p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">User ID</p>
          <p className="text-gray-900 font-mono text-sm">{user.id}</p>
        </div>

        {/* Account Created */}
        <div className="p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Account Created
          </p>
          <p className="text-base text-gray-900">
            {new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Last Sign In */}
        {user.last_sign_in_at && (
          <div className="p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">
              Last Sign In
            </p>
            <p className="text-base text-gray-900">
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
            <p className="text-sm font-medium text-gray-500 mb-1">
              Sign-in Method
            </p>
            <p className="text-base text-gray-900 capitalize">
              {user.app_metadata.provider}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
