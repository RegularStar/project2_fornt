export function getOrCreateUid() {
  if (typeof window === "undefined") return null;
  let uid = localStorage.getItem("uid");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("uid", uid);
  }
  return uid;
}

export function getNickname() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("nickname") || "";
}

export function setNickname(name) {
  if (typeof window === "undefined") return;
  localStorage.setItem("nickname", name);
}

export function maskName(name) {
  if (!name) return "게스트";
  const chars = [...name];
  return chars[0] + "*".repeat(Math.max(1, chars.length - 1));
}
