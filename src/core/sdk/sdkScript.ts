/**
 * AiPhone 客户端通信 SDK 注入脚本
 * 注入至每个自定义应用 iframe 的 head 中，暴露标准全局 window.AiPhone 命名空间
 */
export const AIPHONE_CLIENT_SDK_SCRIPT = `
(function() {
  if (window.AiPhone) return;

  var rpcCounter = 0;
  var pendingRequests = new Map();

  function callRpc(method, params) {
    return new Promise(function(resolve, reject) {
      var id = 'rpc_' + (++rpcCounter) + '_' + Math.random().toString(36).slice(2, 9);
      pendingRequests.set(id, { resolve: resolve, reject: reject });

      window.parent.postMessage({
        type: 'AIPHONE_RPC_REQUEST',
        id: id,
        method: method,
        params: params || {}
      }, '*');

      setTimeout(function() {
        if (pendingRequests.has(id)) {
          pendingRequests.delete(id);
          reject(new Error('AiPhone RPC 请求超时: ' + method));
        }
      }, 45000);
    });
  }

  window.addEventListener('message', function(event) {
    var data = event.data;
    if (!data || data.type !== 'AIPHONE_RPC_RESPONSE') return;
    var req = pendingRequests.get(data.id);
    if (!req) return;
    pendingRequests.delete(data.id);
    if (data.error) {
      req.reject(new Error(data.error));
    } else {
      req.resolve(data.result);
    }
  });

  window.AiPhone = {
    version: '1.0',
    app: {
      getManifest: function() { return callRpc('app.getManifest'); },
      close: function() { return callRpc('app.close'); }
    },
    ui: {
      toast: function(message) { return callRpc('ui.toast', { message: String(message) }); },
      confirm: function(title, content) { return callRpc('ui.confirm', { title: title, content: content }); }
    },
    characters: {
      list: function() { return callRpc('characters.list'); },
      get: function(characterId) { return callRpc('characters.get', { characterId: characterId }); }
    },
    ai: {
      generate: function(options) { return callRpc('ai.generate', options || {}); },
      chat: function(messages, options) { return callRpc('ai.chat', { messages: messages, options: options }); }
    },
    db: {
      create: function(collection, data) { return callRpc('db.create', { collection: collection, data: data }); },
      list: function(collection, query) { return callRpc('db.list', { collection: collection, query: query }); },
      get: function(collection, id) { return callRpc('db.get', { collection: collection, id: id }); },
      update: function(collection, id, data) { return callRpc('db.update', { collection: collection, id: id, data: data }); },
      delete: function(collection, id) { return callRpc('db.delete', { collection: collection, id: id }); }
    },
    notifications: {
      setBadge: function(count) { return callRpc('notifications.setBadge', { count: Number(count) }); },
      clearBadge: function() { return callRpc('notifications.clearBadge'); }
    }
  };
})();
`;
