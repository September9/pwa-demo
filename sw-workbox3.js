// 首先引入 Workbox 框架
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/3.3.0/workbox-sw.js"
);
if (workbox) {
  console.log(`Yay! workbox is loaded 🎉`, workbox);
} else {
  console.log(`Boo! workbox didn't load 😬`);
}
workbox.precaching.precacheAndRoute([
  // 注册成功后要立即缓存的资源列表
  "./index.html",
  "./main.css",
  "./dog.png"
]);

// html的缓存策略
workbox.routing.registerRoute(
  new RegExp(".*.html"),
  workbox.strategies.networkFirst()
);

workbox.routing.registerRoute(
  new RegExp(".*.(?:js|css)"),
  workbox.strategies.cacheFirst()
);

workbox.routing.registerRoute(
  new RegExp("https://your.cdn.com/"),
  workbox.strategies.staleWhileRevalidate()
);

// workbox.routing.registerRoute(
//   new RegExp("https://your.img.cdn.com/"),
//   workbox.strategies.cacheFirst({
//     cacheName: "example:img"
//   })
// );
