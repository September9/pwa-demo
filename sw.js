const cacheStorageKey = "dog-cache-v2";
const cacheList = ["./index.html", "./main.css", "./dog.png"]; //立即缓存列表
let port;

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches
      .open(cacheStorageKey)
      .then(cache => {
        cache.addAll(cacheList);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活时触发 activate 事件
self.addEventListener("activate", function(e) {
  const cacheDeletePromises = caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(name => {
        if (name !== cacheStorageKey) {
          return caches.delete(name);
        } else {
          return Promise.resolve();
        }
      })
    );
  });

  e.waitUntil(Promise.all([self.clients.claim(), cacheDeletePromises]));
});

self.addEventListener("fetch", function(e) {
  if (
    e.request.cache === "only-if-cached" &&
    e.request.mode !== "same-origin"
  ) {
    return;
  }
  // 在此编写缓存策略
  console.log(1111, "fetch event");
  e.respondWith(
    // 可以通过匹配缓存中的资源返回
    caches.match(e.request).then(hit => {
      // 返回缓存中命中的文件
      if (hit) {
        return hit;
      }

      const fetchRequest = e.request.clone();

      return fetch(fetchRequest).then(httpRes => {
        if (!httpRes || httpRes.status !== 200) {
          return httpRes;
        }

        // 请求成功的话，将请求缓存起来。
        var responseClone = httpRes.clone();
        caches.open(cacheStorageKey).then(cache => {
          cache.put(e.request, responseClone);
        });

        return httpRes;
      });

      // if (navigator.online) {
      //     // 如果为联网状态
      //     return onlineRequest(fetchRequest);
      // } else {
      //     // 如果为离线状态
      //     return offlineRequest(fetchRequest);
      // }
    })
    // 也可以从远端拉取
    // fetch(e.request.url)
    // 也可以自己造
    // new Response('自己造')
    // 也可以通过吧 fetch 拿到的响应通过 caches.put 方法放进 caches
  );
});



function sendNotify(title, options, event) {
  if (Notification.permission !== "granted") {
    if (port && port.postMessage) {
      port.postMessage({
        type: "applyNotify",
        info: { title, options }
      });
    }

    return;
  }

  const notificationPromise = self.registration.showNotification(
    title || "Hi",
    Object.assign(
      {
        body: "测试测试测试测试测试测试测试",
        icon: "//lzw.me/images/avatar/lzwme-80x80.png",
        tag: "push"
      },
      options
    )
  );

  return event && event.waitUntil(notificationPromise);
}

/**
 * onPush
 */

function onPush(event) {
  console.log("onPush ", event);
  sendNotify(
    "Hi:",
    {
      body: `12344566 ~`
    },
    event
  );
}

/**
 * onSync
 */

function onSync(event) {
  console.log("onSync", event);
  sendNotify(
    "Hi:",
    {
      body: `test${new Date()} ~`
    },
    event
  );
}

/**
 * onMessage
 */

function onMessage(event) {
  console.log("onMessage", event);

  if (event.ports) {
    port = event.ports[0];
  }

  if (!event.data) {
    return;
  }

  if (event.data.type === "notify") {
    const { title, options } = event.data.info || {};
    sendNotify(title, options, event);
  }
}

self.addEventListener("push", onPush);
self.addEventListener("sync", onSync);
self.addEventListener("message", onMessage);
