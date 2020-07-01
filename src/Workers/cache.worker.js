/*
*license
 */

/* eslint-disable */
import localforage from 'localforage';

self.addEventListener('message', async ({ data }) => {
    const { handlerKey, key, command, cache } = data;
    switch (command) {
        case 'load': {
            await loadCache(handlerKey, key);
            break;
        }
        case 'save': {
            await saveCache(handlerKey, key, cache);
            break;
        }
    }
});

async function loadCache(handlerKey, key) {
    const store = localforage.createInstance({ name: 'telegram' });
    const cache = await store.getItem(key);

    postMessage({ handlerKey, cache });
}

async function saveCache(handlerKey, key, cache) {
    const store = localforage.createInstance({ name: 'telegram' });
    store.setItem(key, cache);

    postMessage({ handlerKey });
}
