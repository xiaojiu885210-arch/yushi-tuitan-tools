/** Self-contained script injected via bookmark / console on goofish.com */
export const BOOKMARKLET_SOURCE = `(() => {
  const items = [];
  const seen = new Set();
  const links = document.querySelectorAll('a[href*="item"]');
  for (const a of links) {
    const href = a.href || a.getAttribute("href") || "";
    const m = href.match(/[?&]id=(\\d{5,})/);
    if (!m || seen.has(m[1])) continue;
    let node = a;
    for (let i = 0; i < 6 && node.parentElement; i++) {
      const len = (node.innerText || "").replace(/\\s+/g, " ").trim().length;
      if (len > 18 && len < 500) break;
      node = node.parentElement;
    }
    const text = (node.innerText || "").replace(/\\s+/g, " ").trim();
    const img = a.querySelector("img");
    let title = a.getAttribute("title") || (img && img.getAttribute("alt")) || "";
    if (!title) {
      title = text.replace(/[¥￥]\\s*[\\d.]+.*$/, "").replace(/\\d+\\s*人想要.*$/, "").trim();
    }
    title = title.split(" ").filter((s) => s.length > 1).slice(0, 16).join(" ").slice(0, 80);
    if (!title || title.length < 2) continue;
    seen.add(m[1]);
    const pm = text.match(/[¥￥]\\s*([\\d.]+)/);
    const wm = text.match(/(\\d+)\\s*人想要/) || text.match(/想要\\s*(\\d+)/);
    const am = text.match(/(北京|上海|广州|深圳|杭州|成都|重庆|武汉|南京|苏州|西安|长沙|天津|郑州|青岛|厦门|合肥|福州|宁波|无锡|东莞|佛山)/);
    items.push({
      id: m[1],
      title,
      price: pm ? Number(pm[1]) : 0,
      want: wm ? Number(wm[1]) : 0,
      area: am ? am[1] : "",
      url: href.indexOf("http") === 0 ? href : "https://www.goofish.com/item?id=" + m[1],
      pic: img ? img.src : ""
    });
  }
  if (!items.length) {
    alert("没抓到商品。等搜索结果出齐后再点一次书签。");
    return;
  }
  const payload = { source: "yushi-bookmarklet", items };
  let sent = false;
  try {
    if (window.opener) {
      window.opener.postMessage(payload, "*");
      sent = true;
    }
  } catch (e) {}
  const text = JSON.stringify(payload);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      alert("已抓到 " + items.length + " 条。" + (sent ? "已回传到鱼市雷达。" : "已复制，回到鱼市点「从剪贴板导入」。"));
    }).catch(function () {
      prompt("复制下面这一整段，回到鱼市雷达粘贴：", text);
    });
  } else {
    prompt("复制下面这一整段，回到鱼市雷达粘贴：", text);
  }
})()`;

export function bookmarkletHref(): string {
  return `javascript:${encodeURIComponent(BOOKMARKLET_SOURCE)}`;
}

export function buildGoofishSearchUrl(opts: {
  keyword: string;
  categoryGoofishId?: string;
  sort?: string;
}): string {
  const u = new URL("https://www.goofish.com/search");
  const q = opts.keyword.trim();
  if (q) u.searchParams.set("q", q);
  if (opts.categoryGoofishId) u.searchParams.set("categoryId", opts.categoryGoofishId);
  return u.toString();
}
