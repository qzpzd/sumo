export const site = {
  name: "素墨",
  description: "极简水墨个人博客。留白、记录、慢慢写。",
  author: "素墨",
  get url() {
    return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  },
};

export const pageSize = 6;
