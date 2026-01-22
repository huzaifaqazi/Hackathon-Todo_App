module.exports = [
"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}),
"[externals]/axios [external] (axios, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("axios");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/frontend/src/services/auth.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/axios [external] (axios, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
class AuthService {
    apiUrl;
    constructor(){
        this.apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || 'http://localhost:8002';
    }
    async login(email, password) {
        try {
            // Check if we're in the browser (not server-side)
            if ("TURBOPACK compile-time truthy", 1) {
                throw new Error('Not in browser environment');
            }
            const response = await __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__["default"].post(`${this.apiUrl}/api/v1/auth/login`, {
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
            const response = await __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__["default"].post(`${this.apiUrl}/api/v1/auth/register`, userData);
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
            if ("TURBOPACK compile-time truthy", 1) {
                throw new Error('Not in browser environment');
            }
            const token = this.getTokenWithMigration();
            if (!token) {
                throw new Error('No token found');
            }
            const response = await __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__["default"].post(`${this.apiUrl}/api/v1/auth/logout`, {
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
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
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
            if ("TURBOPACK compile-time truthy", 1) {
                throw new Error('Not in browser environment');
            }
            const token = this.getTokenWithMigration();
            if (!token) {
                throw new Error('No token found');
            }
            const response = await __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__["default"].get(`${this.apiUrl}/api/v1/auth/me`, {
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
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/frontend/src/context/AuthContext.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/services/auth.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// Create the context
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["createContext"])(undefined);
const AuthProvider = ({ children })=>{
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    // Check if user is authenticated on initial load
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const checkAuthStatus = async ()=>{
            try {
                if (__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["default"].isAuthenticated()) {
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
        };
        checkAuthStatus();
    }, []);
    const login = async (email, password)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["default"].login(email, password);
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
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["default"].register(userData);
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
            await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["default"].logout();
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
            const currentUser = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$auth$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["default"].getCurrentUser();
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/src/context/AuthContext.tsx",
        lineNumber: 141,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useAuth = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/frontend/src/services/api.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "taskApi",
    ()=>taskApi
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/axios [external] (axios, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// Create an axios instance with base configuration
const apiClient = __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__["default"].create({
    baseURL: ("TURBOPACK compile-time value", "http://localhost:8000") || 'http://localhost:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});
// Request interceptor to add auth token to requests
apiClient.interceptors.request.use((config)=>{
    // Check if we're in the browser (not server-side)
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
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
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/frontend/src/context/TaskContext.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "TaskProvider",
    ()=>TaskProvider,
    "useTaskContext",
    ()=>useTaskContext
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/services/api.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// Create the context
const TaskContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["createContext"])(undefined);
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
    const [state, dispatch] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useReducer"])(taskReducer, {
        tasks: [],
        loading: false,
        error: null
    });
    const fetchTasks = async (params)=>{
        try {
            dispatch({
                type: 'FETCH_TASKS_START'
            });
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["taskApi"].getTasks(params);
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
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["taskApi"].createTask(taskData);
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
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["taskApi"].updateTask(taskId, taskData);
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
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["taskApi"].patchTask(taskId, taskData);
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
            await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$services$2f$api$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["taskApi"].deleteTask(taskId);
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
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        fetchTasks();
    }, []);
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(TaskContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/src/context/TaskContext.tsx",
        lineNumber: 178,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useTaskContext = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/frontend/src/pages/_app.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/context/AuthContext.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$TaskContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/context/TaskContext.tsx [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$TaskContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$TaskContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function MyApp({ Component, pageProps }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$TaskContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["TaskProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Component, {
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
const __TURBOPACK__default__export__ = MyApp;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4bd45877._.js.map