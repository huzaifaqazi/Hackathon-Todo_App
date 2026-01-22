(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/frontend/src/services/auth.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/frontend/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/axios/lib/axios.js [client] (ecmascript)");
;
class AuthService {
    apiUrl;
    constructor(){
        this.apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || 'http://localhost:8002';
    }
    async login(email, password) {
        try {
            // Check if we're in the browser (not server-side)
            if (("TURBOPACK compile-time value", "object") === 'undefined' || typeof localStorage === 'undefined') {
                throw new Error('Not in browser environment');
            }
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].post(`${this.apiUrl}/api/v1/auth/login`, {
                email,
                password
            });
            if (response.data.success) {
                // Store token in localStorage using consistent key
                const token = response.data.data?.token;
                if (token) {
                    localStorage.setItem('access_token', token);
                }
            }
            return response.data;
        } catch (error) {
            console.error('Login error details:', error); // Log the full error for debugging
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const errorMessage = error.response.data?.detail || error.response.data?.message || error.response.statusText || 'Login failed';
                throw new Error(errorMessage);
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error('Network error: Unable to reach the server. Please check if the backend is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                throw new Error(error.message || 'Login failed');
            }
        }
    }
    async register(userData) {
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].post(`${this.apiUrl}/api/v1/auth/register`, userData);
            return response.data;
        } catch (error) {
            console.error('Registration error details:', error); // Log the full error for debugging
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const errorMessage = error.response.data?.detail || error.response.data?.message || error.response.statusText || 'Registration failed';
                throw new Error(errorMessage);
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error('Network error: Unable to reach the server. Please check if the backend is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                throw new Error(error.message || 'Registration failed');
            }
        }
    }
    async logout() {
        try {
            // Check if we're in the browser (not server-side)
            if (("TURBOPACK compile-time value", "object") === 'undefined' || typeof localStorage === 'undefined') {
                throw new Error('Not in browser environment');
            }
            const token = this.getTokenWithMigration();
            if (!token) {
                throw new Error('No token found');
            }
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].post(`${this.apiUrl}/api/v1/auth/logout`, {
                token
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Remove token from localStorage
            localStorage.removeItem('access_token');
            return response.data;
        } catch (error) {
            console.error('Logout error details:', error); // Log the full error for debugging
            // Even if the server call fails, remove the token locally
            if (("TURBOPACK compile-time value", "object") !== 'undefined' && typeof localStorage !== 'undefined') {
                localStorage.removeItem('access_token');
            }
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const errorMessage = error.response.data?.detail || error.response.data?.message || error.response.statusText || 'Logout failed';
                throw new Error(errorMessage);
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error('Network error: Unable to reach the server. Please check if the backend is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                throw new Error(error.message || 'Logout failed');
            }
        }
    }
    async getCurrentUser() {
        try {
            // Check if we're in the browser (not server-side)
            if (("TURBOPACK compile-time value", "object") === 'undefined' || typeof localStorage === 'undefined') {
                throw new Error('Not in browser environment');
            }
            const token = this.getTokenWithMigration();
            if (!token) {
                throw new Error('No token found');
            }
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].get(`${this.apiUrl}/api/v1/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.success) {
                return response.data.data.user;
            } else {
                throw new Error('Failed to get user data');
            }
        } catch (error) {
            console.error('Get current user error details:', error); // Log the full error for debugging
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const errorMessage = error.response.data?.detail || error.response.data?.message || error.response.statusText || 'Failed to get user data';
                throw new Error(errorMessage);
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error('Network error: Unable to reach the server. Please check if the backend is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                throw new Error(error.message || 'Failed to get user data');
            }
        }
    }
    // Helper method to get token with migration support
    getTokenWithMigration() {
        if (("TURBOPACK compile-time value", "object") !== 'undefined' && typeof localStorage !== 'undefined') {
            // First check for new token key
            let token = localStorage.getItem('access_token');
            if (!token) {
                // Check for old token key and migrate it
                const oldToken = localStorage.getItem('token');
                if (oldToken) {
                    // Migrate old token to new key
                    localStorage.setItem('access_token', oldToken);
                    localStorage.removeItem('token'); // Clean up old key
                    token = oldToken;
                }
            }
            return token;
        }
        return null;
    }
    isAuthenticated() {
        const token = this.getTokenWithMigration();
        return !!token;
    }
    getToken() {
        return this.getTokenWithMigration();
    }
}
const __TURBOPACK__default__export__ = new AuthService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/context/AuthContext.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/services/auth.ts [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
// Create the context
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const AuthProvider = ({ children })=>{
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Check if user is authenticated on initial load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const checkAuthStatus = {
                "AuthProvider.useEffect.checkAuthStatus": async ()=>{
                    try {
                        if (__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].isAuthenticated()) {
                            await getCurrentUser();
                            setIsAuthenticated(true);
                        } else {
                            // If no token exists, explicitly set as not authenticated
                            setIsAuthenticated(false);
                        }
                    } catch (error) {
                        console.error('Auth check failed:', error);
                        // Clear any invalid token
                        localStorage.removeItem('access_token');
                        // Explicitly set as not authenticated after clearing invalid token
                        setIsAuthenticated(false);
                        setUser(null);
                    } finally{
                        setLoading(false);
                    }
                }
            }["AuthProvider.useEffect.checkAuthStatus"];
            checkAuthStatus();
        }
    }["AuthProvider.useEffect"], []);
    const login = async (email, password)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].login(email, password);
            if (response.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            // Ensure authentication state is properly reset on login failure
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        }
    };
    const register = async (userData)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].register(userData);
            if (response.success) {
                // Optionally log the user in after registration
                await login(userData.email, userData.password);
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error) {
            // Ensure authentication state is properly reset on registration failure
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        }
    };
    const logout = async ()=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].logout();
        } catch (error) {
            console.error('Logout error:', error);
        // Even if server logout fails, clear local state
        } finally{
            // Always clear the local state after logout attempt
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('access_token');
        }
    };
    const getCurrentUser = async ()=>{
        try {
            const currentUser = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
            return currentUser; // Return the user data for calling functions to use
        } catch (error) {
            console.error('Failed to get current user:', error);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('access_token');
            throw error; // Re-throw the error so calling functions can handle it
        }
    };
    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        getCurrentUser
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/src/context/AuthContext.tsx",
        lineNumber: 141,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AuthProvider, "xBgiRagNfQVCfEr2dT2PptfN+TE=");
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/services/api.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "taskApi",
    ()=>taskApi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/frontend/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/axios/lib/axios.js [client] (ecmascript)");
;
// Create an axios instance with base configuration
const apiClient = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: ("TURBOPACK compile-time value", "http://localhost:8000") || 'http://localhost:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});
// Request interceptor to add auth token to requests
apiClient.interceptors.request.use((config)=>{
    // Check if we're in the browser (not server-side)
    if (("TURBOPACK compile-time value", "object") !== 'undefined' && typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    // If no token, let the request proceed without authorization
    // The backend will return 401 which will be handled by response interceptor
    // This avoids redirect loops during page initialization
    }
    return config;
}, (error)=>{
    return Promise.reject(error);
});
// Response interceptor to handle common errors
apiClient.interceptors.response.use((response)=>{
    return response;
}, (error)=>{
    // Handle specific error cases
    if (error.response?.status === 401) {
        // Token might be expired, remove invalid token
        localStorage.removeItem('access_token');
        // Redirect to login page
        if ("TURBOPACK compile-time truthy", 1) {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
const taskApi = {
    // Get all tasks for the authenticated user
    getTasks: async (params)=>{
        const response = await apiClient.get('/api/v1/tasks', {
            params
        });
        return response.data;
    },
    // Create a new task
    createTask: async (taskData)=>{
        const response = await apiClient.post('/api/v1/tasks', taskData);
        return response.data;
    },
    // Get a specific task by ID
    getTaskById: async (taskId)=>{
        const response = await apiClient.get(`/api/v1/tasks/${taskId}`);
        return response.data;
    },
    // Update a task (full update)
    updateTask: async (taskId, taskData)=>{
        const response = await apiClient.put(`/api/v1/tasks/${taskId}`, taskData);
        return response.data;
    },
    // Update a task (partial update)
    patchTask: async (taskId, taskData)=>{
        const response = await apiClient.patch(`/api/v1/tasks/${taskId}`, taskData);
        return response.data;
    },
    // Delete a task
    deleteTask: async (taskId)=>{
        const response = await apiClient.delete(`/api/v1/tasks/${taskId}`);
        return response.data;
    }
};
const __TURBOPACK__default__export__ = apiClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/context/TaskContext.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TaskProvider",
    ()=>TaskProvider,
    "useTaskContext",
    ()=>useTaskContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/services/api.ts [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
// Create the context
const TaskContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
// Reducer function
const taskReducer = (state, action)=>{
    switch(action.type){
        case 'FETCH_TASKS_START':
            return {
                ...state,
                loading: true,
                error: null
            };
        case 'FETCH_TASKS_SUCCESS':
            return {
                ...state,
                loading: false,
                tasks: action.payload,
                error: null
            };
        case 'FETCH_TASKS_ERROR':
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case 'CREATE_TASK_SUCCESS':
            return {
                ...state,
                loading: false,
                tasks: [
                    ...state.tasks,
                    action.payload
                ],
                error: null
            };
        case 'UPDATE_TASK_SUCCESS':
            return {
                ...state,
                loading: false,
                tasks: state.tasks.map((task)=>task.id === action.payload.id ? action.payload : task),
                error: null
            };
        case 'DELETE_TASK_SUCCESS':
            return {
                ...state,
                loading: false,
                tasks: state.tasks.filter((task)=>task.id !== action.payload),
                error: null
            };
        case 'TASK_ERROR':
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
};
const TaskProvider = ({ children })=>{
    _s();
    const [state, dispatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useReducer"])(taskReducer, {
        tasks: [],
        loading: false,
        error: null
    });
    const fetchTasks = async (params)=>{
        try {
            dispatch({
                type: 'FETCH_TASKS_START'
            });
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["taskApi"].getTasks(params);
            dispatch({
                type: 'FETCH_TASKS_SUCCESS',
                payload: response.data.tasks
            });
        } catch (error) {
            dispatch({
                type: 'FETCH_TASKS_ERROR',
                payload: error.message || 'Failed to fetch tasks'
            });
        }
    };
    const createTask = async (taskData)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["taskApi"].createTask(taskData);
            dispatch({
                type: 'CREATE_TASK_SUCCESS',
                payload: response.data.task
            });
        } catch (error) {
            dispatch({
                type: 'TASK_ERROR',
                payload: error.message || 'Failed to create task'
            });
        }
    };
    const updateTask = async (taskId, taskData)=>{
        try {
            // Optimistic update: update the task in the UI immediately
            dispatch({
                type: 'UPDATE_TASK_SUCCESS',
                payload: {
                    ...state.tasks.find((t)=>t.id === taskId),
                    ...taskData
                }
            });
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["taskApi"].updateTask(taskId, taskData);
            dispatch({
                type: 'UPDATE_TASK_SUCCESS',
                payload: response.data.task
            });
        } catch (error) {
            dispatch({
                type: 'TASK_ERROR',
                payload: error.message || 'Failed to update task'
            });
            // Optionally revert the optimistic update if it failed
            fetchTasks(); // Refresh tasks from server
        }
    };
    // Add patchTask function for partial updates
    const patchTask = async (taskId, taskData)=>{
        try {
            // Optimistic update: update the task in the UI immediately
            dispatch({
                type: 'UPDATE_TASK_SUCCESS',
                payload: {
                    ...state.tasks.find((t)=>t.id === taskId),
                    ...taskData
                }
            });
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["taskApi"].patchTask(taskId, taskData);
            dispatch({
                type: 'UPDATE_TASK_SUCCESS',
                payload: response.data.task
            });
        } catch (error) {
            dispatch({
                type: 'TASK_ERROR',
                payload: error.message || 'Failed to update task'
            });
            // Optionally revert the optimistic update if it failed
            fetchTasks(); // Refresh tasks from server
        }
    };
    const deleteTask = async (taskId)=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["taskApi"].deleteTask(taskId);
            dispatch({
                type: 'DELETE_TASK_SUCCESS',
                payload: taskId
            });
        } catch (error) {
            dispatch({
                type: 'TASK_ERROR',
                payload: error.message || 'Failed to delete task'
            });
        }
    };
    // Fetch tasks on initial load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TaskProvider.useEffect": ()=>{
            fetchTasks();
        }
    }["TaskProvider.useEffect"], []);
    const value = {
        tasks: state.tasks,
        loading: state.loading,
        error: state.error,
        fetchTasks,
        createTask,
        updateTask,
        patchTask,
        deleteTask
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TaskContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/src/context/TaskContext.tsx",
        lineNumber: 178,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(TaskProvider, "W+oZ5rOCELOIH+siNR1f+jd+/yo=");
_c = TaskProvider;
const useTaskContext = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
};
_s1(useTaskContext, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "TaskProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/pages/_app.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/context/AuthContext.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$TaskContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/context/TaskContext.tsx [client] (ecmascript)");
;
;
;
;
function MyApp({ Component, pageProps }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$TaskContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["TaskProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {
                ...pageProps
            }, void 0, false, {
                fileName: "[project]/frontend/src/pages/_app.tsx",
                lineNumber: 11,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/src/pages/_app.tsx",
            lineNumber: 10,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/src/pages/_app.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = MyApp;
const __TURBOPACK__default__export__ = MyApp;
var _c;
__turbopack_context__.k.register(_c, "MyApp");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/frontend/src/pages/_app.tsx [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/_app";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/frontend/src/pages/_app.tsx [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/frontend/src/pages/_app\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/frontend/src/pages/_app.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__87cfe467._.js.map