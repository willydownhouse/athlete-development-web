export type DeployInfo = {
  environment: string;
  branch: string;
  commit: string;
  url: string;
};

export function getDeployInfo(): DeployInfo {
  const commit = process.env["VERCEL_GIT_COMMIT_SHA"] ?? "local";

  return {
    environment: process.env["VERCEL_ENV"] ?? "local",
    branch: process.env["VERCEL_GIT_COMMIT_REF"] ?? "local",
    commit: commit.slice(0, 7),
    url: process.env["VERCEL_URL"] ?? "localhost",
  };
}
