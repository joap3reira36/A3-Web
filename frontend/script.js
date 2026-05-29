// --- FRONTEND STATE MANAGEMENT ---
const API_URL = 'https://a3-web-1.onrender.com';
let isDemoMode = false;
let apiOnline = false;
let currentUser = null;
let currentRole = 'Administrador';
let systemLogs = [];
let chartPoints = [150, 120, 170, 80, 110, 40, 90, 90]; // Initial heights for the SVG activity chart
let checkConnectionInterval = null;
let chartInterval = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Check connection to the Flask API
    pingBackend();
    
    // Periodically ping the backend to update connection badges
    checkConnectionInterval = setInterval(pingBackend, 8000);

    // Load mock database users if they don't exist
    initializeMockDatabase();

    // Start simulating server chart data
    startChartSimulation();

    // Log load event
    addLog("Painel administrativo carregado e pronto.", "info");
});

// --- BACKEND CONNECTION CHECKS ---
async function pingBackend() {
    try {
        // We do a POST check to /login with empty body. 
        // This will return 400 or validation errors, but if the server responds, it's ONLINE.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        // If we got a response (even a 400/500), the server is alive
        setConnectionState(true);
    } catch (error) {
        // Fetch failed, server is offline
        setConnectionState(false);
    }
}

function setConnectionState(online) {
    apiOnline = online;
    
    const dot = document.getElementById('api-status-dot');
    const text = document.getElementById('api-status-text');
    const dashDot = document.getElementById('dash-status-dot');
    const dashText = document.getElementById('dash-status-text');
    const offlineBanner = document.getElementById('offline-alert-banner');

    if (online) {
        // Main Screen badge
        if (dot) {
            dot.className = 'status-dot online';
            text.textContent = 'Servidor Flask: Online';
        }
        // Dashboard status
        if (dashDot) {
            dashDot.className = 'status-dot online';
            dashText.textContent = 'Modo API (Conectado)';
        }
        // Hide offline alert banner
        if (offlineBanner && !isDemoMode) {
            offlineBanner.classList.remove('active');
        }
    } else {
        // Main Screen badge
        if (dot) {
            dot.className = 'status-dot offline';
            text.textContent = 'Servidor Flask: Offline';
        }
        // Dashboard status
        if (dashDot) {
            dashDot.className = 'status-dot warning';
            dashText.textContent = isDemoMode ? 'Modo Demo (Local)' : 'Sem conexão';
        }
        // Show offline alert banner if we haven't entered demo mode yet
        if (offlineBanner && !isDemoMode && document.getElementById('auth-screen').classList.contains('active')) {
            offlineBanner.classList.add('active');
        }
    }
}

function retryServerConnection() {
    showToast("Tentando reconectar ao servidor Flask...", "info");
    pingBackend().then(() => {
        if (apiOnline) {
            showToast("Conexão com servidor estabelecida com sucesso!", "success");
            document.getElementById('offline-alert-banner').classList.remove('active');
        } else {
            showToast("Servidor ainda indisponível. Continuando em modo local.", "warning");
        }
    });
}

// --- MOCK DATABASE IN LOCAL STORAGE ---
function initializeMockDatabase() {
    if (!localStorage.getItem('a3_mock_users')) {
        const defaultUsers = [
            { id: 1, login: 'admin', senha: '123', date: '2026-05-01', role: 'Administrador' },
            { id: 2, login: 'suporte', senha: '123', date: '2026-05-15', role: 'Suporte Técnico' },
            { id: 3, login: 'vicenzzo', senha: '123', date: '2026-05-29', role: 'Operador Principal' }
        ];
        localStorage.setItem('a3_mock_users', JSON.stringify(defaultUsers));
    }
}

function getMockUsers() {
    return JSON.parse(localStorage.getItem('a3_mock_users') || '[]');
}

function saveMockUsers(users) {
    localStorage.setItem('a3_mock_users', JSON.stringify(users));
}

function resetLocalStorageUsers() {
    localStorage.removeItem('a3_mock_users');
    initializeMockDatabase();
    showToast("Banco de dados mock local redefinido!", "success");
    addLog("Banco de dados mock redefinido pelo administrador.", "warning");
    refreshUsersTable();
    updateOverviewStats();
}

// --- TAB SWITCHING (AUTH SCREEN) ---
function switchAuthTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const panelLogin = document.getElementById('panel-login');
    const panelRegister = document.getElementById('panel-register');

    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        panelLogin.classList.add('active');
        panelRegister.classList.remove('active');
    } else {
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
        panelLogin.classList.remove('active');
        panelRegister.classList.add('active');
    }
}

// --- PASSWORD VISIBILITY TOGGLE ---
function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const toggleBtn = field.nextElementSibling;
    if (field.type === 'password') {
        field.type = 'text';
        toggleBtn.innerHTML = `
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        field.type = 'password';
        toggleBtn.innerHTML = `
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

// --- PASSWORD STRENGTH REALTIME VALIDATOR ---
function validatePasswordStrength(password) {
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const reqLength = document.getElementById('req-length');
    const reqNumber = document.getElementById('req-number');

    let score = 0;

    // Condition 1: Length
    if (password.length >= 6) {
        score += 1;
        reqLength.classList.add('valid');
    } else {
        reqLength.classList.remove('valid');
    }

    // Condition 2: Number check
    if (/\d/.test(password)) {
        score += 1;
        reqNumber.classList.add('valid');
    } else {
        reqNumber.classList.remove('valid');
    }

    // Additional checks for UI richness (uppercase and special char)
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (hasUppercase) score += 0.5;
    if (hasSpecial) score += 0.5;

    // Render bar UI
    let width = "0%";
    let color = "var(--status-error)";
    let text = "Muito fraca";

    if (password.length > 0) {
        if (score <= 1) {
            width = "30%";
            color = "var(--status-error)";
            text = "Senha fraca";
        } else if (score < 3) {
            width = "65%";
            color = "var(--status-warning)";
            text = "Senha média";
        } else {
            width = "100%";
            color = "var(--status-success)";
            text = "Senha forte";
        }
    }

    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
}

// --- AUTHENTICATION ACTIONS ---
async function handleLogin(event) {
    event.preventDefault();
    
    const loginUser = document.getElementById('login-username').value.trim();
    const loginPass = document.getElementById('login-password').value;
    const btnSubmit = document.getElementById('btn-submit-login');

    if (!loginUser || !loginPass) {
        showToast("Preencha todos os campos.", "error");
        return;
    }

    // Simulate lag if enabled
    if (document.getElementById('setting-simulate-lag').checked) {
        btnSubmit.disabled = true;
        btnSubmit.querySelector('span').textContent = 'Conectando...';
        await new Promise(resolve => setTimeout(resolve, 1000));
        btnSubmit.disabled = false;
        btnSubmit.querySelector('span').textContent = 'Entrar';
    }

    if (isDemoMode || !apiOnline) {
        // Fallback to local storage auth
        const users = getMockUsers();
        const found = users.find(u => u.login === loginUser && u.senha === loginPass);
        
        if (found) {
            currentUser = found.login;
            currentRole = found.role || 'Operador Local';
            showToast(`Bem-vindo, ${currentUser}! Login autorizado via banco local.`, "success");
            enterDashboard();
        } else {
            showToast("Usuário ou senha inválidos no banco de dados local.", "error");
            addLog(`Falha na tentativa de login local para: ${loginUser}`, "error");
        }
    } else {
        // Perform login to Flask backend
        try {
            btnSubmit.disabled = true;
            btnSubmit.querySelector('span').textContent = 'Verificando...';

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: loginUser, senha: loginPass })
            });

            const data = await response.json();

            if (response.ok && data.status === "sucesso") {
                currentUser = loginUser;
                currentRole = 'Administrador Geral';
                showToast(data.mensagem || "Login aprovado!", "success");
                enterDashboard();
            } else {
                showToast(data.mensagem || "Credenciais incorretas.", "error");
                addLog(`Falha de login remoto para: ${loginUser}`, "error");
            }
        } catch (error) {
            showToast("Erro de conexão com o servidor. Use o Modo Demo.", "warning");
            console.error("Login fetch error:", error);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.querySelector('span').textContent = 'Entrar';
        }
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const registerUser = document.getElementById('register-username').value.trim();
    const registerPass = document.getElementById('register-password').value;
    const btnSubmit = document.getElementById('btn-submit-register');

    if (!registerUser || !registerPass) {
        showToast("Preencha todos os campos.", "error");
        return;
    }

    if (registerPass.length < 6) {
        showToast("A senha precisa ter pelo menos 6 caracteres.", "warning");
        return;
    }

    // Simulate lag if enabled
    if (document.getElementById('setting-simulate-lag').checked) {
        btnSubmit.disabled = true;
        btnSubmit.querySelector('span').textContent = 'Cadastrando...';
        await new Promise(resolve => setTimeout(resolve, 1000));
        btnSubmit.disabled = false;
        btnSubmit.querySelector('span').textContent = 'Cadastrar';
    }

    if (isDemoMode || !apiOnline) {
        // Register in local database
        const users = getMockUsers();
        const exists = users.some(u => u.login === registerUser);

        if (exists) {
            showToast("Este usuário já está cadastrado no banco local.", "error");
            return;
        }

        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const newUser = {
            id: newId,
            login: registerUser,
            senha: registerPass,
            date: new Date().toISOString().split('T')[0],
            role: 'Operador Local'
        };

        users.push(newUser);
        saveMockUsers(users);

        showToast(`Conta '${registerUser}' criada com sucesso no banco local!`, "success");
        addLog(`Novo usuário registrado localmente: ${registerUser}`, "success");
        
        // Reset and redirect
        document.getElementById('form-register-action').reset();
        validatePasswordStrength("");
        switchAuthTab('login');
    } else {
        // Register with API
        try {
            btnSubmit.disabled = true;
            btnSubmit.querySelector('span').textContent = 'Registrando...';

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: registerUser, senha: registerPass })
            });

            const data = await response.json();

            if (response.status === 201 && data.status === "sucesso") {
                showToast(data.mensagem || "Registro efetuado com sucesso!", "success");
                addLog(`Usuário remoto cadastrado: ${registerUser}`, "success");
                
                // Clear fields
                document.getElementById('form-register-action').reset();
                validatePasswordStrength("");
                switchAuthTab('login');
            } else {
                showToast(data.mensagem || "Falha ao registrar usuário.", "error");
            }
        } catch (error) {
            showToast("Erro na requisição. Verifique o servidor local.", "error");
            console.error("Register fetch error:", error);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.querySelector('span').textContent = 'Cadastrar';
        }
    }
}

function activateDemoMode() {
    isDemoMode = true;
    showToast("Modo de Demonstração (Local) Ativado.", "info");
    addLog("Modo demo forçado pelo usuário.", "warning");
    
    // Update badge styling immediately
    setConnectionState(apiOnline);
    
    // Automatically fill fields with demo values to speed up evaluation
    document.getElementById('login-username').value = 'vicenzzo';
    document.getElementById('login-password').value = '123';
    
    showToast("Campos preenchidos com credenciais demo (vicenzzo / 123)", "info");
}

// --- DASHBOARD LIFECYCLE ---
function enterDashboard() {
    // Hide Auth Screen
    const authScreen = document.getElementById('auth-screen');
    authScreen.classList.remove('active');
    
    // Remove active state classes and set timeout for rendering next panel to handle smooth transitions
    setTimeout(() => {
        const dashboardScreen = document.getElementById('dashboard-screen');
        dashboardScreen.classList.add('active');
        
        // Render Profile Badge in Sidebar
        document.getElementById('user-display-name').textContent = currentUser;
        document.getElementById('user-display-role').textContent = currentRole;
        document.getElementById('avatar-letters').textContent = currentUser.slice(0, 2).toUpperCase();

        // Refresh dynamic UI modules
        updateOverviewStats();
        refreshUsersTable();
        
        // Log entry
        addLog(`Sessão iniciada por: ${currentUser} (${currentRole})`, "success");
    }, 450);

    // Hide floating warning banner since user is authenticated
    document.getElementById('offline-alert-banner').classList.remove('active');
}

function performLogout() {
    const dashScreen = document.getElementById('dashboard-screen');
    dashScreen.classList.remove('active');

    // Add log
    addLog(`Sessão encerrada por: ${currentUser}`, "info");

    setTimeout(() => {
        const authScreen = document.getElementById('auth-screen');
        authScreen.classList.add('active');
        
        // Clear variables
        currentUser = null;
        isDemoMode = false;
        
        // Clear login fields
        document.getElementById('login-password').value = '';
        
        // Refresh connection check
        pingBackend();
    }, 450);
}

// --- DASHBOARD ACTIONS & PANELS ---
function switchDashboardTab(tabName) {
    const tabs = ['overview', 'users', 'settings'];
    
    tabs.forEach(t => {
        const navLink = document.getElementById(`nav-${t}`);
        const panel = document.getElementById(`dash-panel-${t}`);
        
        if (t === tabName) {
            navLink.classList.add('active');
            panel.classList.add('active');
        } else {
            navLink.classList.remove('active');
            panel.classList.remove('active');
        }
    });

    // Update Header Title
    const headerTitle = document.getElementById('dashboard-title');
    if (tabName === 'overview') headerTitle.textContent = "Visão Geral";
    if (tabName === 'users') headerTitle.textContent = "Lista de Usuários";
    if (tabName === 'settings') headerTitle.textContent = "Parâmetros do Sistema";
}

function updateOverviewStats() {
    // 1. Total users
    const userCount = getMockUsers().length;
    document.getElementById('stat-total-users').textContent = isDemoMode ? userCount : (apiOnline ? `${userCount} +` : userCount);

    // 2. Ping time simulation
    const pingEl = document.getElementById('stat-ping-time');
    if (apiOnline && !isDemoMode) {
        pingEl.textContent = `${Math.floor(Math.random() * 15 + 5)} ms`;
    } else {
        pingEl.textContent = 'Demo';
    }

    // 3. System Load Status
    const loadEl = document.getElementById('stat-system-load');
    if (apiOnline && !isDemoMode) {
        loadEl.textContent = 'API Ativa';
        loadEl.style.color = 'var(--status-success)';
    } else {
        loadEl.textContent = 'Banco Local';
        loadEl.style.color = 'var(--accent-cyan)';
    }
}

function refreshUsersTable(filterText = "") {
    const tbody = document.getElementById('users-table-body');
    const users = getMockUsers();
    tbody.innerHTML = '';

    const query = filterText.toLowerCase().trim();
    const filteredUsers = users.filter(u => 
        u.login.toLowerCase().includes(query) || 
        u.role.toLowerCase().includes(query) || 
        u.id.toString().includes(query)
    );

    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;color:var(--text-muted);padding:2rem;">
                    Nenhum usuário correspondente encontrado.
                </td>
            </tr>
        `;
        return;
    }

    filteredUsers.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${u.id}</td>
            <td style="font-weight:600;color:#fff;">${u.login}</td>
            <td>${u.date || '2026-05-29'}</td>
            <td>
                <span class="status-badge" style="background:rgba(255,255,255,0.02);padding:0.25rem 0.75rem;border-radius:6px;border-color:var(--card-border);">
                    ${u.role || 'Operador'}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterUsersTable(value) {
    refreshUsersTable(value);
}

// --- DYNAMIC SVG CHART MODULE ---
function startChartSimulation() {
    chartInterval = setInterval(() => {
        if (!document.getElementById('dashboard-screen').classList.contains('active')) return;
        
        // Remove first element and append new random height
        chartPoints.shift();
        
        // Generate values based on whether API is online or offline demo
        let newHeight = 120;
        if (isDemoMode) {
            newHeight = Math.floor(Math.random() * 80 + 80); // Smooth oscillations
        } else if (apiOnline) {
            newHeight = Math.floor(Math.random() * 120 + 40); // Larger spikes representing real API loads
        } else {
            newHeight = 180; // Flat line indicating no traffic
        }
        
        chartPoints.push(newHeight);

        // Render path
        const path = document.getElementById('chart-svg-path');
        const area = document.getElementById('chart-svg-area');
        if (!path || !area) return;

        // Construct coordinates
        const stepX = 500 / (chartPoints.length - 1);
        let pathString = `M 0 ${chartPoints[0]}`;
        let areaString = `M 0 200 L 0 ${chartPoints[0]}`;

        for (let i = 1; i < chartPoints.length; i++) {
            const x = i * stepX;
            const y = chartPoints[i];
            
            // Draw smooth bezier curves
            const prevX = (i - 1) * stepX;
            const prevY = chartPoints[i - 1];
            const cpX1 = prevX + stepX / 2;
            const cpY1 = prevY;
            const cpX2 = x - stepX / 2;
            const cpY2 = y;
            
            pathString += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
            areaString += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
        }

        areaString += ` L 500 200 Z`;

        // Update svg attributes
        path.setAttribute('d', pathString);
        area.setAttribute('d', areaString);

        // Trigger animation reset
        path.style.animation = 'none';
        path.offsetHeight; // Trigger reflow
        path.style.animation = null;

    }, 3000);
}

// --- LOGGING ENGINE ---
function addLog(text, type = "info") {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    
    // Add to state
    systemLogs.unshift({ text, type, time: timestamp });
    
    // Keep last 30 logs only
    if (systemLogs.length > 30) systemLogs.pop();

    renderLogs();
}

function renderLogs() {
    const logsContainer = document.getElementById('logs-container-list');
    if (!logsContainer) return;

    logsContainer.innerHTML = '';
    
    if (systemLogs.length === 0) {
        logsContainer.innerHTML = `
            <div style="color:var(--text-muted);font-size:0.8rem;text-align:center;padding:1.5rem 0;">
                Sem registros recentes.
            </div>
        `;
        return;
    }

    systemLogs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'log-item';
        item.innerHTML = `
            <span class="log-dot ${log.type}"></span>
            <div class="log-content">
                <div class="log-text">${log.text}</div>
                <div class="log-time">${log.time}</div>
            </div>
        `;
        logsContainer.appendChild(item);
    });
}

function clearSystemLogs() {
    systemLogs = [];
    renderLogs();
    showToast("Fila de logs limpa.", "info");
}

// --- TOAST NOTIFICATIONS ENGINE ---
function showToast(message, type = "info") {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Select icon based on type
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Audio feedback if enabled
    const audioEnabled = document.getElementById('setting-audio-feedback') ? document.getElementById('setting-audio-feedback').checked : true;
    if (audioEnabled && (type === 'error' || type === 'warning')) {
        // Simple synthetic beep using browser AudioContext
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(type === 'error' ? 220 : 330, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
            // Ignore audio context initialization blocks
        }
    }

    // Auto-remove toast
    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 4000);
}

// --- OPTIONAL THEME TOGGLE ---
function toggleHighContrastTheme(checked) {
    if (checked) {
        // Shift global colors to high-contrast blue/cyan and white borders
        document.documentElement.style.setProperty('--bg-primary', '#020208');
        document.documentElement.style.setProperty('--card-bg', 'rgba(0, 0, 0, 0.85)');
        document.documentElement.style.setProperty('--card-border', 'rgba(255, 255, 255, 0.2)');
        showToast("Tema de alto contraste ativado.", "info");
        addLog("Esquema visual alterado para alto contraste.", "info");
    } else {
        // Revert to variables defined in style.css
        document.documentElement.style.removeProperty('--bg-primary');
        document.documentElement.style.removeProperty('--card-bg');
        document.documentElement.style.removeProperty('--card-border');
        showToast("Tema padrão restaurado.", "info");
        addLog("Esquema visual restaurado para o padrão.", "info");
    }
}
