import os from "os";

type NetItem = { address: string; family: string | number; internal: boolean };

const virtualName = /vethernet|virtual|vbox|vmware|wsl|hyper-v|docker|loopback|bluetooth|npcap|tunnel/i;

export function pickLanIPv4(interfaces: NodeJS.Dict<NetItem[]>) {
  const found: { address: string; score: number }[] = [];
  for (const [name, list] of Object.entries(interfaces)) {
    if (virtualName.test(name)) continue;
    for (const item of list ?? []) {
      const ipv4 = item.family === "IPv4" || item.family === 4;
      if (!ipv4 || item.internal || item.address.startsWith("169.254.")) continue;
      let score = 0;
      if (item.address.startsWith("192.168.")) score = 3;
      else if (item.address.startsWith("10.")) score = 2;
      else if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(item.address)) score = 1;
      if (score > 0) found.push({ address: item.address, score });
    }
  }
  found.sort((a, b) => b.score - a.score);
  return found[0]?.address;
}

export function reachableSiteUrl(siteUrl: string) {
  let url: URL;
  try {
    url = new URL(siteUrl);
  } catch {
    return siteUrl.replace(/\/$/, "");
  }
  if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    return siteUrl.replace(/\/$/, "");
  }
  const host = pickLanIPv4(os.networkInterfaces());
  if (!host) return siteUrl.replace(/\/$/, "");
  url.hostname = host;
  return url.toString().replace(/\/$/, "");
}
