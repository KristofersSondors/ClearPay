import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "./asyncStorage";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_KEY ||
  process.env.SUPABASE_KEY;

const profileAvatarBucket =
  process.env.EXPO_PUBLIC_SUPABASE_AVATAR_BUCKET ||
  process.env.VITE_SUPABASE_AVATAR_BUCKET ||
  process.env.SUPABASE_AVATAR_BUCKET ||
  "avatars";

const usePublicAvatarUrls =
  (process.env.EXPO_PUBLIC_SUPABASE_AVATAR_PUBLIC || "true").toLowerCase() !==
  "false";

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

let client;

function fallbackDisplayName(email = "") {
  if (!email) {
    return "Your Profile";
  }

  const [localPart = ""] = email.split("@");

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function mapAuthUserToProfile(user) {
  if (!user) {
    return null;
  }

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    fallbackDisplayName(user.email);

  return {
    id: user.id,
    name,
    email: user.email || "",
    plan: user.app_metadata?.plan || user.user_metadata?.plan || "Free Plan",
    avatarUrl: user.user_metadata?.avatar_url || "",
    avatarPath: user.user_metadata?.avatar_path || "",
  };
}

export async function getSignedAvatarUrl(avatarPath, expiresIn = 60 * 60) {
  if (!hasSupabaseConfig || !avatarPath) {
    return { signedUrl: "", error: null };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(profileAvatarBucket)
    .createSignedUrl(avatarPath, expiresIn);

  if (error) {
    const errorMessage = (error.message || "").toLowerCase();
    const readAccessIssue =
      errorMessage.includes("row") ||
      errorMessage.includes("policy") ||
      errorMessage.includes("permission") ||
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("forbidden");

    return {
      signedUrl: "",
      error: new Error(
        readAccessIssue
          ? `Avatar uploaded but cannot be read from bucket "${profileAvatarBucket}". Add a SELECT policy on storage.objects for authenticated users' own folder paths.`
          : error.message,
      ),
    };
  }

  return { signedUrl: data?.signedUrl || "", error: null };
}

function getPublicAvatarUrl(avatarPath) {
  if (!hasSupabaseConfig || !avatarPath) {
    return "";
  }

  const supabase = getSupabaseClient();
  const { data } = supabase.storage
    .from(profileAvatarBucket)
    .getPublicUrl(avatarPath);

  return data?.publicUrl || "";
}

export async function getAvatarUrlByPath(avatarPath, expiresIn = 60 * 60) {
  if (!avatarPath) {
    return { avatarUrl: "", error: null };
  }

  if (usePublicAvatarUrls) {
    return { avatarUrl: getPublicAvatarUrl(avatarPath), error: null };
  }

  const { signedUrl, error } = await getSignedAvatarUrl(avatarPath, expiresIn);
  return { avatarUrl: signedUrl || "", error };
}

async function getLatestAvatarPathForUser(userId) {
  if (!hasSupabaseConfig || !userId) {
    return "";
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(profileAvatarBucket)
    .list(userId, { limit: 100 });

  if (error || !Array.isArray(data) || data.length === 0) {
    return "";
  }

  const avatars = data
    .map((file) => {
      const match = /^avatar-(\d+)\./.exec(file.name || "");
      return {
        name: file.name,
        timestamp: match ? Number(match[1]) : 0,
      };
    })
    .filter((file) => file.name);

  if (avatars.length === 0) {
    return "";
  }

  avatars.sort((a, b) => b.timestamp - a.timestamp);

  return `${userId}/${avatars[0].name}`;
}

export async function getAuthenticatedProfile() {
  if (!hasSupabaseConfig) {
    return { profile: null, error: new Error("Supabase is not configured.") };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { profile: null, error };
  }

  const profile = mapAuthUserToProfile(data?.user);

  if (!profile) {
    return { profile: null, error: null };
  }

  const resolvedAvatarPath =
    profile.avatarPath || (await getLatestAvatarPathForUser(profile.id));

  if (resolvedAvatarPath) {
    profile.avatarPath = resolvedAvatarPath;

    const { avatarUrl, error: avatarUrlError } =
      await getAvatarUrlByPath(resolvedAvatarPath);
    profile.avatarUrl = avatarUrl || "";

    if (avatarUrlError) {
      return {
        profile,
        error: avatarUrlError,
      };
    }
  }

  return { profile, error: null };
}

export async function updateAuthenticatedProfile({
  name,
  email,
  password,
  avatarPath,
}) {
  if (!hasSupabaseConfig) {
    return { profile: null, error: new Error("Supabase is not configured.") };
  }

  const supabase = getSupabaseClient();
  const updatePayload = {};
  const metadata = {};

  if (name) {
    metadata.full_name = name;
  }

  if (avatarPath) {
    metadata.avatar_path = avatarPath;
    metadata.avatar_url = getPublicAvatarUrl(avatarPath) || null;
  }

  if (Object.keys(metadata).length > 0) {
    updatePayload.data = metadata;
  }

  if (email) {
    updatePayload.email = email;
  }

  if (password) {
    updatePayload.password = password;
  }

  const { data, error } = await supabase.auth.updateUser(updatePayload);

  if (error) {
    return { profile: null, error };
  }

  return { profile: mapAuthUserToProfile(data?.user), error: null };
}

function inferFileExtension(uri = "", mimeType = "") {
  const extensionFromUri = uri.split("?")[0].split(".").pop()?.toLowerCase();

  if (extensionFromUri && extensionFromUri.length <= 5) {
    return extensionFromUri;
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export async function uploadAuthenticatedProfilePhoto(imageUri) {
  if (!hasSupabaseConfig) {
    return {
      avatarUrl: "",
      avatarPath: "",
      error: new Error("Supabase is not configured."),
    };
  }

  if (!imageUri) {
    return {
      avatarUrl: "",
      avatarPath: "",
      error: new Error("No image was selected."),
    };
  }

  const supabase = getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    return { avatarUrl: "", avatarPath: "", error: userError };
  }

  const user = userData?.user;

  if (!user?.id) {
    return {
      avatarUrl: "",
      avatarPath: "",
      error: new Error("No authenticated user was found."),
    };
  }

  const response = await fetch(imageUri);
  const blob = await response.blob();
  const fileExtension = inferFileExtension(imageUri, blob.type);
  const avatarPath = `${user.id}/avatar-${Date.now()}.${fileExtension}`;
  const contentType = blob.type || `image/${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from(profileAvatarBucket)
    .upload(avatarPath, blob, {
      cacheControl: "3600",
      contentType,
      upsert: true,
    });

  if (uploadError) {
    const uploadMessage = (uploadError.message || "").toLowerCase();
    const bucketLikelyMisconfigured =
      uploadMessage.includes("bucket") ||
      uploadMessage.includes("not found") ||
      uploadMessage.includes("does not exist") ||
      uploadMessage.includes("permission") ||
      uploadMessage.includes("unauthorized");

    return {
      avatarUrl: "",
      avatarPath: "",
      error: new Error(
        bucketLikelyMisconfigured
          ? `Unable to upload profile photo. The Supabase bucket "${profileAvatarBucket}" is missing or inaccessible. Create it in Supabase Storage and allow authenticated uploads, or set EXPO_PUBLIC_SUPABASE_AVATAR_BUCKET to an existing bucket name.`
          : uploadError.message || "Unable to upload the profile photo.",
      ),
    };
  }

  const { avatarUrl, error: avatarUrlError } =
    await getAvatarUrlByPath(avatarPath);

  if (avatarUrlError) {
    return {
      avatarUrl: "",
      avatarPath,
      error: avatarUrlError,
    };
  }

  return {
    avatarUrl: avatarUrl || "",
    avatarPath,
    error: null,
  };
}

export function getSupabaseClient() {
  if (!hasSupabaseConfig) {
    return null;
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}
