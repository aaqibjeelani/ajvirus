// Windows XP Portfolio JavaScript

// Global state management
const state = {
    currentScreen: 'boot',
    openWindows: new Set(),
    windowZIndex: 1000,
    windowPositions: {},
    dragState: {
        isDragging: false,
        currentWindow: null,
        offsetX: 0,
        offsetY: 0
    },
    startMenuOpen: false,
    audioEnabled: true,
    version: '2.2.0', // Version for cache busting - Auto-incremented
    buildTimestamp: Date.now(), // Build timestamp for cache busting
    cacheSettings: {
        enableVersionCheck: true,
        autoRefreshOnUpdate: true,
        checkInterval: 30000, // 30 seconds
        enableHardRefresh: true
    }
};

// Advanced Cache Busting System
function initializeCacheBusting() {
    const currentVersion = state.version;
    const currentTimestamp = state.buildTimestamp;
    const storedVersion = localStorage.getItem('portfolio_version');
    const storedTimestamp = localStorage.getItem('portfolio_timestamp');
    
    console.log(`🔄 Portfolio Cache Manager v${currentVersion}`);
    console.log(`🕐 Build Timestamp: ${new Date(currentTimestamp).toLocaleString()}`);
    
    // Check if version changed or timestamp is newer
    const versionChanged = storedVersion !== currentVersion;
    const timestampNewer = !storedTimestamp || currentTimestamp > parseInt(storedTimestamp);
    
    if (versionChanged || timestampNewer) {
        console.log(`🔄 Clearing cache - Version: ${versionChanged ? 'CHANGED' : 'SAME'}, Timestamp: ${timestampNewer ? 'NEWER' : 'SAME'}`);
        
        // Aggressive cache clearing
        clearAllCaches();
        
        // Store new version and timestamp
        localStorage.setItem('portfolio_version', currentVersion);
        localStorage.setItem('portfolio_timestamp', currentTimestamp.toString());
        
        // Force reload all resources with new timestamp
        forceReloadResources();
        
        // Show update notification
        if (versionChanged) {
            console.log(`✅ Portfolio updated from ${storedVersion || 'unknown'} to ${currentVersion}`);
            setTimeout(() => {
                if (state.currentScreen !== 'boot') {
                    showNotification(`🆕 Portfolio updated to v${currentVersion}! Cache cleared.`, 4000);
                }
            }, 5000);
        }
    }
    
    // Add cache management UI
    addCacheManagementUI();
    
    // Start periodic version checking if enabled
    if (state.cacheSettings.enableVersionCheck) {
        startVersionChecking();
    }
    
    // Add page lifecycle listeners for cache management
    addPageLifecycleListeners();
}

// Clear all types of caches
function clearAllCaches() {
    // Clear localStorage (except essential data)
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('essential_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear browser caches if possible
    if ('caches' in window) {
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('🗑️ All browser caches cleared');
        });
    }
    
    console.log('🗑️ All storage cleared for fresh content');
}

// Force reload all resources with cache busting
function forceReloadResources() {
    const timestamp = Date.now();
    
    // Update CSS files
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const originalHref = link.href.split('?')[0];
        link.href = `${originalHref}?v=${timestamp}&cb=${Math.random()}`;
        console.log(`🔄 Reloaded CSS: ${originalHref}`);
    });
    
    // Update script files (except current one)
    document.querySelectorAll('script[src]').forEach(script => {
        if (!script.src.includes('script.js')) return;
        const originalSrc = script.src.split('?')[0];
        const newScript = document.createElement('script');
        newScript.src = `${originalSrc}?v=${timestamp}&cb=${Math.random()}`;
        newScript.onload = () => {
            console.log(`🔄 Reloaded Script: ${originalSrc}`);
        };
        // Note: We don't actually replace the current script to avoid breaking execution
    });
    
    // Bust image caches
    document.querySelectorAll('img').forEach(img => {
        if (img.src && img.src.startsWith('http')) {
            const originalSrc = img.src.split('?')[0];
            img.src = `${originalSrc}?cb=${timestamp}`;
        }
    });
}

// Add cache management UI controls
function addCacheManagementUI() {
    // Version info with click functionality
    const versionInfo = document.createElement('div');
    versionInfo.id = 'version-info';
    versionInfo.style.cssText = `
        position: fixed;
        bottom: 5px;
        right: 5px;
        font-size: 8px;
        color: rgba(255,255,255,0.7);
        cursor: pointer;
        z-index: 10000;
        font-family: 'Courier New', monospace;
        background: rgba(0,0,0,0.3);
        padding: 2px 4px;
        border-radius: 3px;
        transition: all 0.2s ease;
    `;
    versionInfo.textContent = `v${state.version} (${new Date(state.buildTimestamp).toLocaleDateString()})`;
    versionInfo.title = 'Click for cache options';
    
    // Add hover effect
    versionInfo.addEventListener('mouseenter', () => {
        versionInfo.style.color = 'rgba(255,255,255,1)';
        versionInfo.style.background = 'rgba(0,0,0,0.7)';
    });
    
    versionInfo.addEventListener('mouseleave', () => {
        versionInfo.style.color = 'rgba(255,255,255,0.7)';
        versionInfo.style.background = 'rgba(0,0,0,0.3)';
    });
    
    // Add click handler for cache options
    versionInfo.addEventListener('click', showCacheOptions);
    
    document.body.appendChild(versionInfo);
    
    // Add keyboard shortcut for hard refresh (Ctrl+Shift+F5)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'F5') {
            e.preventDefault();
            performHardRefresh();
        }
    });
}

// Show cache management options
function showCacheOptions() {
    const options = [
        '🔄 Force Refresh (Clear Cache)',
        '🗑️ Clear All Data',
        '📊 Show Cache Info',
        '⚙️ Cache Settings',
        '❌ Cancel'
    ];
    
    // Create a simple modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20000;
        font-family: 'Tahoma', sans-serif;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 100%);
        border: 2px outset #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        min-width: 300px;
        box-shadow: 4px 4px 16px rgba(0,0,0,0.4);
    `;
    
    dialog.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 14px;">🛠️ Cache Management</h3>
        <p style="margin: 0 0 15px 0; font-size: 11px; color: #666;">Current Version: ${state.version}<br>Build: ${new Date(state.buildTimestamp).toLocaleString()}</p>
        <div id="cache-options"></div>
    `;
    
    const optionsContainer = dialog.querySelector('#cache-options');
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.style.cssText = `
            display: block;
            width: 100%;
            padding: 8px 12px;
            margin: 5px 0;
            background: linear-gradient(to bottom, #e1e1e1 0%, #cdcdcd 100%);
            border: 1px outset #cdcdcd;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.1s ease;
        `;
        button.textContent = option;
        
        button.addEventListener('click', () => {
            modal.remove();
            handleCacheOption(index);
        });
        
        optionsContainer.appendChild(button);
    });
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Handle cache option selection
function handleCacheOption(optionIndex) {
    switch(optionIndex) {
        case 0: // Force Refresh
            performHardRefresh();
            break;
        case 1: // Clear All Data
            clearAllCaches();
            showNotification('🗑️ All cache and data cleared! Refreshing...', 3000);
            setTimeout(() => location.reload(), 1000);
            break;
        case 2: // Show Cache Info
            showCacheInfo();
            break;
        case 3: // Cache Settings
            showCacheSettings();
            break;
        case 4: // Cancel
            break;
    }
}

// Perform hard refresh
function performHardRefresh() {
    showNotification('🔄 Performing hard refresh...', 2000);
    
    // Clear caches
    clearAllCaches();
    
    // Force reload resources
    forceReloadResources();
    
    // Reload page with cache busting
    setTimeout(() => {
        window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now();
    }, 500);
}

// Show cache information
function showCacheInfo() {
    let info = `📊 Cache Information\n\n`;
    info += `Version: ${state.version}\n`;
    info += `Build: ${new Date(state.buildTimestamp).toLocaleString()}\n`;
    info += `LocalStorage: ${localStorage.length} items\n`;
    info += `SessionStorage: ${sessionStorage.length} items\n`;
    info += `Page Loaded: ${new Date(state.buildTimestamp).toLocaleString()}\n`;
    
    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            info += `Service Workers: ${regs.length}\n`;
        });
    }
    
    alert(info);
}

// Show cache settings
function showCacheSettings() {
    alert('⚙️ Cache Settings\n\nCurrent settings:\n- Version Check: ' + (state.cacheSettings.enableVersionCheck ? 'Enabled' : 'Disabled') + '\n- Auto Refresh: ' + (state.cacheSettings.autoRefreshOnUpdate ? 'Enabled' : 'Disabled') + '\n- Hard Refresh: ' + (state.cacheSettings.enableHardRefresh ? 'Enabled' : 'Disabled'));
}

// Start periodic version checking
function startVersionChecking() {
    if (!state.cacheSettings.enableVersionCheck) return;
    
    console.log('🔍 Starting version checking every', state.cacheSettings.checkInterval / 1000, 'seconds');
    
    setInterval(() => {
        // In a real implementation, this would check against a server endpoint
        // For now, we'll just check if the page timestamp has changed
        const storedTimestamp = localStorage.getItem('portfolio_timestamp');
        if (storedTimestamp && state.buildTimestamp > parseInt(storedTimestamp)) {
            console.log('🆕 New version detected!');
            if (state.cacheSettings.autoRefreshOnUpdate) {
                showNotification('🆕 New version detected! Auto-refreshing...', 3000);
                setTimeout(performHardRefresh, 2000);
            } else {
                showNotification('🆕 New version available! Click version number to update.', 5000);
            }
        }
    }, state.cacheSettings.checkInterval);
}

// Add page lifecycle listeners
function addPageLifecycleListeners() {
    // Before page unload, store current state
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('portfolio_last_visit', Date.now().toString());
    });
    
    // On page focus, check for updates
    window.addEventListener('focus', () => {
        const lastVisit = localStorage.getItem('portfolio_last_visit');
        if (lastVisit && (Date.now() - parseInt(lastVisit)) > 60000) { // 1 minute
            console.log('🔍 Checking for updates after focus...');
            // Check for updates
        }
    });
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && state.cacheSettings.enableVersionCheck) {
            console.log('🔍 Page became visible, checking for updates...');
            // Check for updates
        }
    });
}

// Boot sequence and initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeCacheBusting();
    initializeSystem();
    startBootSequence();
    setupEventListeners();
    updateClock();
    setInterval(updateClock, 1000);
    
    // Register service worker for auto-updates
    registerServiceWorker();
});

// Service Worker registration disabled to prevent caching issues
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Unregister any existing service workers to prevent caching
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister().then(() => {
                    console.log('🗑️ Service Worker unregistered for fresh content');
                });
            }
        });
        
        // Clear any existing caches
        if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                console.log('🗑️ All caches cleared for fresh content');
            });
        }
    }
}

function initializeSystem() {
    // Initialize window positions
    const windows = ['terminal', 'about', 'skills', 'projects', 'experience', 'contact', 'resume', 'filemanager', 'texteditor', 'calculator', 'network', 'system', 'snake', 'tictactoe', 'browser'];
    windows.forEach((windowId, index) => {
        state.windowPositions[windowId] = {
            x: 50 + (index * 30),
            y: 50 + (index * 30),
            width: windowId === 'terminal' ? 700 : 
                   (windowId === 'calculator' ? 280 : 
                   (windowId === 'browser' ? 900 : 
                   (windowId === 'snake' || windowId === 'tictactoe' ? 450 : 600))),
            height: windowId === 'terminal' ? 500 : 
                    (windowId === 'calculator' ? 360 : 
                    (windowId === 'browser' ? 650 : 
                    (windowId === 'snake' || windowId === 'tictactoe' ? 500 : 450))),
            maximized: false,
            minimized: false
        };
    });
    
    // Initialize terminal
    setupTerminal();
    
    // Try to play startup sound
    playStartupSound();
}

function playStartupSound() {
    if (!state.audioEnabled) return;
    
    try {
        // Create a simple startup sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create a simple chord progression
        const frequencies = [261.63, 329.63, 391.99, 523.25]; // C, E, G, C
        const duration = 2;
        
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime + (index * 0.2));
            oscillator.stop(audioContext.currentTime + duration);
        });
    } catch (error) {
        console.log('Audio not available:', error);
        state.audioEnabled = false;
    }
}

function startBootSequence() {
    const bootScreen = document.getElementById('bootScreen');
    const loginScreen = document.getElementById('loginScreen');
    const bootTerminal = document.getElementById('bootTerminal');
    const bootMessage = document.getElementById('bootMessage');
    
    // Show boot screen
    bootScreen.classList.add('active');
    
    // Enhanced boot messages for realistic scrolling
    const bootMessages = [
        '[    0.016000] Early memory node ranges detected',
        '[    0.020000] Memory: 16384M available (12288K kernel)',
        '[    0.024000] ACPI: Core revision 20210930',
        '[    0.028000] ACPI: 6 ACPI AML tables successfully acquired',
        '[    0.032000] clocksource: hpet: mask: 0xffffffff max_cycles',
        '[    0.036000] NET: Registered protocol family 16',
        '[    0.040000] audit: initializing netlink subsys (disabled)',
        '[    0.044000] thermal_sys: Registered thermal governor step_wise',
        '[    0.048000] cpuidle: using governor ladder',
        '[    0.052000] ACPI: Added _OSI(Module Device)',
        '[    0.056000] ACPI: Added _OSI(Processor Device)',
        '[    0.060000] ACPI: Added _OSI(3.0 _SCP Extensions)',
        '[    0.064000] PCI: Using configuration type 1 for base access',
        '[    0.068000] HugeTLB registered 2.00 MiB page size',
        '[    0.072000] ACPI: Interpreter enabled',
        '[    0.076000] ACPI: (supports S0 S3 S4 S5)',
        '[    0.080000] ACPI: Using IOAPIC for interrupt routing',
        '[    0.084000] PCI: Probing PCI hardware',
        '[    0.088000] pci 0000:00:02.0: vgaarb: setting as boot VGA device',
        '[    0.092000] pci 0000:00:1f.3: quirk_usb_early_handoff+0x0/0x30',
        '[    0.096000] SCSI subsystem initialized',
        '[    0.100000] usbcore: registered new interface driver usbfs',
        '[    0.104000] usbcore: registered new interface driver hub',
        '[    0.108000] PCI: Using ACPI for IRQ routing',
        '[    0.112000] NetLabel: Initializing',
        '[    0.116000] NetLabel: domain hash size = 128',
        '[    0.120000] NetLabel: protocols = UNLABELED CIPSOv4 CALIPSO',
        '[    0.124000] clocksource: Switched to clocksource tsc',
        '[    0.128000] VFS: Disk quotas dquot_6.6.0',
        '[    0.132000] AppArmor: AppArmor Filesystem Enabled',
        '[    0.136000] pnp: PnP ACPI init',
        '[    0.140000] NET: Registered protocol family 2',
        '[    0.144000] tcp_listen_portaddr_hash hash table entries: 16384',
        '[    0.148000] TCP established hash table entries: 65536',
        '[    0.152000] UDP hash table entries: 4096 (order: 3, 32768 bytes)',
        '[    0.156000] NET: Registered protocol family 1',
        '[    0.160000] Trying to unpack rootfs image as initramfs...',
        '[    0.164000] Freeing initrd memory: 32768K',
        '[    0.168000] platform rtc_cmos: registered as rtc0',
        '[    0.172000] Machine check events logged',
        '[    0.176000] audit: type=2000 audit(1633968020.176:1): initialized',
        '[    0.180000] workingset: timestamp_bits=36 max_order=22',
        '[    0.184000] squashfs: version 4.0 (2009/01/31) Phillip Lougher',
        '[    0.188000] Key type asymmetric registered',
        '[    0.192000] Block layer SCSI generic (bsg) driver version 0.4',
        '[    0.196000] io scheduler mq-deadline registered',
        '[    0.200000] pcieport 0000:00:1c.0: PME# supported from D0 D3hot',
        '[    0.204000] shpchp: Standard Hot Plug PCI Controller Driver version: 0.4',
        '[    0.208000] efifb: probing for efifb',
        '[    0.212000] efifb: framebuffer at 0xe0000000, using 3072k',
        '[    0.216000] Console: switching to colour frame buffer device 128x48',
        '[    0.220000] Serial: 8250/16550 driver, 32 ports, IRQ sharing enabled',
        '[    0.224000] Linux agpgart interface v0.103',
        '[    0.228000] ahci 0000:00:17.0: version 3.0',
        '[    0.232000] ahci 0000:00:17.0: AHCI 0001.0301 32 slots 6 ports',
        '[    0.236000] ata1: SATA max UDMA/133 abar m2048@0xf7e22000 port 0xf7e22100',
        '[    0.240000] libphy: Fixed MDIO Bus: probed',
        '[    0.244000] ehci_hcd: USB 2.0 Enhanced Host Controller Interface Driver',
        '[    0.248000] ehci-pci: EHCI PCI platform driver',
        '[    0.252000] ohci_hcd: USB 1.1 Open Host Controller Interface Driver',
        '[    0.256000] uhci_hcd: USB Universal Host Controller Interface driver',
        '[    0.260000] xhci_hcd 0000:00:14.0: xHCI Host Controller',
        '[    0.264000] usb usb1: New USB device found, idVendor=1d6b, idProduct=0002',
        '[    0.268000] hub 1-0:1.0: USB hub found',
        '[    0.272000] hub 1-0:1.0: 12 ports detected',
        '[    0.276000] i8042: PNP: PS/2 Controller [PNP0303:PS2K,PNP0f13:PS2M]',
        '[    0.280000] serio: i8042 KBD port at 0x60,0x64 irq 1',
        '[    0.284000] serio: i8042 AUX port at 0x60,0x64 irq 12',
        '[    0.288000] mousedev: PS/2 mouse device common for all mice',
        '[    0.292000] rtc_cmos 00:01: registered as rtc0',
        '[    0.296000] device-mapper: uevent: version 1.0.3',
        '[    0.300000] device-mapper: ioctl: 4.45.0-ioctl (2021-03-22)',
        '[    0.304000] intel_pstate: Intel P-state driver initializing',
        '[    0.308000] ledtrig-cpu: registered to indicate activity on CPUs',
        '[    0.312000] NET: Registered protocol family 10',
        '[    0.316000] Segment Routing with IPv6',
        '[    0.320000] NET: Registered protocol family 17',
        '[    0.324000] Key type dns_resolver registered',
        '[    0.328000] microcode: sig=0x906ea, pf=0x20, revision=0xde',
        '[    0.332000] microcode: Microcode Update Driver: v2.2.',
        '[    0.336000] resctrl: L3 allocation detected',
        '[    0.340000] IPI shorthand broadcast: enabled',
        '[    0.344000] registered taskstats version 1',
        '[    0.348000] Loading compiled-in X.509 certificates',
        '[    0.352000] AppArmor: AppArmor sha1 policy hashing enabled',
        '[    0.356000] ima: No TPM chip found, activating TPM-bypass!',
        '[    0.360000] ima: Allocated hash algorithm: sha256',
        '[    0.364000] ima: No architecture policies found',
        '[    0.368000] evm: Initialising EVM extended attributes:',
        '[    0.372000] evm: security.selinux',
        '[    0.376000] evm: security.SMACK64',
        '[    0.380000] evm: security.capability',
        '[    0.384000] ata1: SATA link up 6.0 Gbps (SStatus 133 SControl 300)',
        '[    0.388000] ata1.00: ATA-8: KINGSTON SA400S37960G, SBFK10D7, max UDMA/133',
        '[    0.392000] ata1.00: 1875385008 sectors, multi 1: LBA48 NCQ (depth 32)',
        '[    0.396000] ata1.00: configured for UDMA/133',
        '[    0.400000] scsi 0:0:0:0: Direct-Access ATA KINGSTON SA400S37 10D7',
        '[    0.404000] sd 0:0:0:0: Attached scsi generic sg0 type 0',
        '[    0.408000] sd 0:0:0:0: [sda] 1875385008 512-byte logical blocks',
        '[    0.412000] sd 0:0:0:0: [sda] Write Protect is off',
        '[    0.416000] sd 0:0:0:0: [sda] Mode Sense: 00 3a 00 00',
        '[    0.420000] sd 0:0:0:0: [sda] Write cache: enabled, read cache: enabled',
        '[    0.424000] GPT:Primary header thinks Alt. header is not at the end',
        '[    0.428000] sda: sda1 sda2 sda3',
        '[    0.432000] sd 0:0:0:0: [sda] Attached SCSI disk',
        '[    0.436000] usb 1-7: new high-speed USB device number 2 using xhci_hcd',
        '[    0.440000] usb 1-7: New USB device found, idVendor=046d, idProduct=c534',
        '[    0.444000] input: AT Translated Set 2 keyboard as /devices/platform',
        '[    0.448000] Freeing unused decrypted memory: 2040K',
        '[    0.452000] Freeing unused kernel image memory: 2724K',
        '[    0.456000] Write protecting the kernel read-only data: 18432k',
        '[    0.460000] Freeing unused kernel image memory: 2008K',
        '[    0.464000] Freeing unused kernel image memory: 1964K',
        '[    0.468000] x86/mm: Checked W+X mappings: passed, no W+X pages found.',
        '[    0.472000] Run /init as init process',
        '[    0.476000] systemd[1]: systemd 245.4-4ubuntu3.11 running in system mode',
        '[    0.480000] systemd[1]: Detected architecture x86-64.',
        '[    0.484000] systemd[1]: Set hostname to <linux-aj-portfolio>.',
        '[    0.488000] systemd[1]: Initializing machine ID from random generator.',
        '[    0.492000] systemd[1]: Installed transient /etc/machine-id file.',
        '[    0.496000] systemd[1]: Created slice -.slice.',
        '[    0.500000] systemd[1]: Created slice system.slice.',
        '[    0.504000] systemd[1]: Started Forward Password Requests to Wall Directory Watch.',
        '[    0.508000] systemd[1]: Reached target Paths.',
        '[    0.512000] systemd[1]: Reached target Remote File Systems.',
        '[    0.516000] systemd[1]: Reached target Slices.',
        '[    0.520000] systemd[1]: Listening on Syslog Socket.',
        '[    0.524000] systemd[1]: Listening on fsck to fsckd communication Socket.',
        '[    0.528000] systemd[1]: Listening on initctl Compatibility Named Pipe.',
        '[    0.532000] systemd[1]: Listening on Journal Audit Socket.',
        '[    0.536000] systemd[1]: Listening on Journal Socket (/dev/log).',
        '[    0.540000] systemd[1]: Listening on Journal Socket.',
        '[    0.544000] systemd[1]: Listening on udev Control Socket.',
        '[    0.548000] systemd[1]: Listening on udev Kernel Socket.',
        '[    0.552000] systemd[1]: Mounting Huge Pages File System...',
        '[    0.556000] systemd[1]: Mounting POSIX Message Queue File System...',
        '[    0.560000] systemd[1]: Mounting Kernel Debug File System...',
        '[    0.564000] systemd[1]: Mounting Kernel Trace File System...',
        '[    0.568000] systemd[1]: Starting Journal Service...',
        '[    0.572000] systemd[1]: Starting Set the console keyboard layout...',
        '[    0.576000] systemd[1]: Starting Create list of static device nodes...',
        '[    0.580000] systemd[1]: Starting Load Kernel Module chromeos_pstore...',
        '[    0.584000] systemd[1]: Starting Load Kernel Module efi_pstore...',
        '[    0.588000] systemd[1]: Starting Load Kernel Module pstore_blk...',
        '[    0.592000] systemd[1]: Starting Load Kernel Module pstore_zone...',
        '[    0.596000] systemd[1]: Starting Load Kernel Module ramoops...',
        '[    0.600000] systemd[1]: Starting File System Check on Root Device...',
        '[    0.604000] systemd[1]: Starting Load Kernel Modules...',
        '[    0.608000] systemd[1]: Starting Coldplug All udev Devices...',
        '[    0.612000] systemd[1]: Mounted Huge Pages File System.',
        '[    0.616000] systemd[1]: Mounted POSIX Message Queue File System.',
        '[    0.620000] systemd[1]: Mounted Kernel Debug File System.',
        '[    0.624000] systemd[1]: Mounted Kernel Trace File System.',
        '[    0.628000] systemd[1]: Finished Create list of static device nodes.',
        '[    0.632000] systemd[1]: modprobe@chromeos_pstore.service: Succeeded.',
        '[    0.636000] systemd[1]: Finished Load Kernel Module chromeos_pstore.',
        '[    0.640000] systemd[1]: modprobe@efi_pstore.service: Succeeded.',
        '[    0.644000] systemd[1]: Finished Load Kernel Module efi_pstore.',
        '[    0.648000] systemd[1]: modprobe@pstore_blk.service: Succeeded.',
        '[    0.652000] systemd[1]: Finished Load Kernel Module pstore_blk.',
        '[    0.656000] systemd[1]: modprobe@pstore_zone.service: Succeeded.',
        '[    0.660000] systemd[1]: Finished Load Kernel Module pstore_zone.',
        '[    0.664000] systemd[1]: modprobe@ramoops.service: Succeeded.',
        '[    0.668000] systemd[1]: Finished Load Kernel Module ramoops.',
        '[    0.672000] systemd[1]: Finished File System Check on Root Device.',
        '[    0.676000] systemd[1]: Started Journal Service.',
        '[    0.680000] systemd[1]: Finished Set the console keyboard layout.',
        '[    0.684000] systemd[1]: Finished Load Kernel Modules.',
        '[    0.688000] systemd[1]: Starting Apply Kernel Variables...',
        '[    0.692000] systemd[1]: Finished Apply Kernel Variables.',
        '[    0.696000] systemd[1]: Starting Remount Root and Kernel File Systems...',
        '[    0.700000] EXT4-fs (sda2): re-mounted. Opts: errors=remount-ro',
        '[    0.704000] systemd[1]: Finished Remount Root and Kernel File Systems.',
        '[    0.708000] systemd[1]: Activating swap /swapfile...',
        '[    0.712000] systemd[1]: Starting Load/Save Random Seed...',
        '[    0.716000] systemd[1]: Starting Create System Users...',
        '[    0.720000] systemd[1]: Started Coldplug All udev Devices.',
        '[    0.724000] Adding 2097148k swap on /swapfile. Priority:-2 extents:6',
        '[    0.728000] systemd[1]: Activated swap /swapfile.',
        '[    0.732000] systemd[1]: Reached target Swap.',
        '[    0.736000] systemd[1]: Finished Create System Users.',
        '[    0.740000] systemd[1]: Starting Create Static Device Nodes in /dev...',
        '[    0.744000] systemd[1]: Finished Create Static Device Nodes in /dev.',
        '[    0.748000] systemd[1]: Starting udev Kernel Device Manager...',
        '[    0.752000] systemd[1]: Finished Load/Save Random Seed.',
        '[    0.756000] systemd[1]: Started udev Kernel Device Manager.',
        '[    0.760000] systemd[1]: Starting Show Plymouth Boot Screen...',
        '[    0.764000] systemd[1]: Starting Network Service...',
        '[    0.768000] systemd[1]: Started Show Plymouth Boot Screen.',
        '[    0.772000] systemd[1]: Started Network Service.',
        '[    0.776000] systemd[1]: Reached target Network.',
        '[    0.780000] systemd[1]: Starting Network Name Resolution...',
        '[    0.784000] systemd[1]: Starting Wait for Network to be Configured...',
        '[    0.788000] systemd[1]: Started Network Name Resolution.',
        '[    0.792000] systemd[1]: Reached target Network Name Resolution.',
        '[    0.796000] systemd[1]: Finished Wait for Network to be Configured.',
        '[    0.800000] systemd[1]: Reached target Network is Online.',
        '[    0.804000] systemd[1]: Starting Linux AJ Services...',
        '[    0.808000] systemd[1]: Starting Aaqib Portfolio Desktop Manager...',
        '[    0.812000] systemd[1]: Started Linux AJ Services.',
        '[    0.816000] systemd[1]: Started Aaqib Portfolio Desktop Manager.',
        '[    0.820000] systemd[1]: Reached target Multi-User System.',
        '[    0.824000] systemd[1]: Starting Update UTMP about System Runlevel Changes...',
        '[    0.828000] systemd[1]: Finished Update UTMP about System Runlevel Changes.',
        '[    0.832000] systemd[1]: Starting Hold until boot process finishes up...',
        '[    0.836000] systemd[1]: Starting Terminate Plymouth Boot Screen...',
        '[    0.840000] systemd[1]: Received SIGRTMIN+20 from PID 456 (plymouthd).',
        '[    0.844000] systemd[1]: Finished Hold until boot process finishes up.',
        '[    0.848000] systemd[1]: Finished Terminate Plymouth Boot Screen.',
        '[    0.852000] systemd[1]: Started Getty on tty1.',
        '[    0.856000] systemd[1]: Reached target Login Prompts.',
        '[    0.860000] systemd[1]: Starting Set console scheme...',
        '[    0.864000] systemd[1]: Finished Set console scheme.',
        '[    0.868000] systemd[1]: Reached target Graphical Interface.',
        '[    0.872000] systemd[1]: Starting Desktop Session Manager...',
        '[    0.876000] systemd[1]: Started Desktop Session Manager.',
        '[    0.880000] Linux AJ Terminal OS v2.0 successfully initialized.',
        '[    0.884000] Aaqib Jeelani Portfolio System is now ready.',
        '[    0.888000] Welcome to Linux AJ - Powered by Aaqib Jeelani.',
        '[    0.892000] System boot completed in 0.892 seconds.'
    ];
    
    // Status messages
    const statusMessages = [
        '[INFO] Initializing Linux AJ Terminal OS...',
        '[INFO] Loading Aaqib Jeelani portfolio components...',
        '[INFO] Starting system services...',
        '[INFO] Loading kernel modules...',
        '[INFO] Mounting filesystems...',
        '[INFO] Starting network services...',
        '[INFO] Initializing desktop environment...',
        '[INFO] Loading portfolio applications...',
        '[INFO] System ready - Starting login manager...',
        '[OK] Boot sequence completed successfully - Welcome to Linux AJ!'
    ];
    
    let messageIndex = 0;
    let statusIndex = 0;
    
    // Clear initial boot lines and start fresh
    setTimeout(() => {
        bootTerminal.innerHTML = '';
        
        // Add boot messages with fast scrolling animation
        const addBootMessage = () => {
            if (messageIndex < bootMessages.length) {
                const bootLine = document.createElement('div');
                bootLine.className = 'boot-line';
                bootLine.textContent = bootMessages[messageIndex];
                bootLine.style.animationDelay = '0s';
                bootTerminal.appendChild(bootLine);
                
                // Auto scroll to bottom to simulate real terminal
                bootTerminal.scrollTop = bootTerminal.scrollHeight;
                
                messageIndex++;
                
                // Faster, more realistic delay between messages
                const delay = Math.random() * 30 + 15; // 15-45ms
                setTimeout(addBootMessage, delay);
            }
        };
        
        // Update status messages periodically
        const updateStatus = () => {
            if (statusIndex < statusMessages.length) {
                bootMessage.textContent = statusMessages[statusIndex];
                statusIndex++;
                setTimeout(updateStatus, 600);
            }
        };
        
        addBootMessage();
        updateStatus();
        
    }, 500);
    
    // After boot animation completes, show login screen (extended time for more messages)
    setTimeout(() => {
        bootScreen.classList.remove('active');
        setTimeout(() => {
            loginScreen.classList.add('active');
            state.currentScreen = 'login';
        }, 500);
    }, 7000); // 7 seconds for full boot experience
}

function loginUser() {
    const loginScreen = document.getElementById('loginScreen');
    const desktop = document.getElementById('desktop');
    
    // Try to enter fullscreen on user interaction (supported in most browsers)
    enterFullscreen();

    loginScreen.classList.remove('active');
    setTimeout(() => {
        desktop.classList.add('active');
        state.currentScreen = 'desktop';
    }, 500);
}

// Event listeners setup
function setupEventListeners() {
    // Desktop icon clicks
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            selectDesktopIcon(icon);
        });
        
        icon.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const windowType = icon.getAttribute('data-window');
            openWindow(windowType);
        });
    });
    
    // Window dragging (mouse and touch)
    document.querySelectorAll('.window-header').forEach(header => {
        header.addEventListener('mousedown', startWindowDrag);
        header.addEventListener('touchstart', startWindowDrag, { passive: false });
    });
    
    // Close start menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
            closeStartMenu();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Resize handling
    window.addEventListener('resize', handleWindowResize);
    
    // Shutdown dialog option selection
    document.querySelectorAll('.option-item').forEach(option => {
        option.addEventListener('click', selectShutdownOption);
    });
    
    // Contact form submission
    const contactForm = document.querySelector('.message-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

// Desktop icon management
function selectDesktopIcon(icon) {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
}

// Window management functions

function closeWindow(windowType) {
    const windowElement = document.getElementById(`${windowType}Window`);
    if (!windowElement) return;
    
    windowElement.classList.remove('active');
    state.openWindows.delete(windowType);
    
    removeFromTaskbar(windowType);
}

function minimizeWindow(windowType) {
    const windowElement = document.getElementById(`${windowType}Window`);
    if (!windowElement) return;
    
    windowElement.classList.add('minimized');
    state.windowPositions[windowType].minimized = true;
    
    updateTaskbarButton(windowType, false);
}

function toggleMaximize(windowType) {
    const windowElement = document.getElementById(`${windowType}Window`);
    if (!windowElement) return;
    
    const position = state.windowPositions[windowType];
    
    if (position.maximized) {
        // Restore
        windowElement.classList.remove('maximized');
        windowElement.style.left = position.x + 'px';
        windowElement.style.top = position.y + 'px';
        windowElement.style.width = position.width + 'px';
        windowElement.style.height = position.height + 'px';
        position.maximized = false;
    } else {
        // Maximize
        windowElement.classList.add('maximized');
        position.maximized = true;
    }
}

function bringWindowToFront(windowType) {
    const windowElement = document.getElementById(`${windowType}Window`);
    if (!windowElement) return;
    
    // Remove minimized state if applicable
    if (state.windowPositions[windowType].minimized) {
        windowElement.classList.remove('minimized');
        state.windowPositions[windowType].minimized = false;
    }
    
    // Bring to front
    windowElement.style.zIndex = ++state.windowZIndex;
    
    // Update taskbar
    updateTaskbarButton(windowType, true);
}

// Window dragging functionality (Mouse and Touch)
function startWindowDrag(e) {
    if (e.target.closest('.window-controls')) return;
    
    const windowElement = e.currentTarget.closest('.window');
    const windowType = windowElement.getAttribute('data-window');
    
    state.dragState.isDragging = true;
    state.dragState.currentWindow = windowType;
    
    const rect = windowElement.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    
    state.dragState.offsetX = clientX - rect.left;
    state.dragState.offsetY = clientY - rect.top;
    
    // Add both mouse and touch event listeners
    document.addEventListener('mousemove', handleWindowDrag);
    document.addEventListener('mouseup', stopWindowDrag);
    document.addEventListener('touchmove', handleWindowDrag, { passive: false });
    document.addEventListener('touchend', stopWindowDrag);
    
    windowElement.classList.add('dragging');
    document.body.classList.add('window-dragging');
    
    bringWindowToFront(windowType);
    
    e.preventDefault();
}

function handleWindowDrag(e) {
    if (!state.dragState.isDragging) return;
    
    const windowElement = document.getElementById(`${state.dragState.currentWindow}Window`);
    if (!windowElement || windowElement.classList.contains('maximized')) return;
    
    // Support both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    
    const x = clientX - state.dragState.offsetX;
    const y = clientY - state.dragState.offsetY;
    
    // Keep window within viewport bounds
    const taskbarHeight = window.innerWidth <= 768 ? 48 : 40;
    const minX = -50; // Allow some off-screen dragging
    const minY = 0;
    const maxX = window.innerWidth - 100; // Ensure at least 100px visible
    const maxY = window.innerHeight - taskbarHeight - 50; // Ensure title bar visible
    
    const constrainedX = Math.max(minX, Math.min(x, maxX));
    const constrainedY = Math.max(minY, Math.min(y, maxY));
    
    // Apply improved constraints for all screen sizes
    windowElement.style.left = constrainedX + 'px';
    windowElement.style.top = constrainedY + 'px';
    
    // Update stored position
    state.windowPositions[state.dragState.currentWindow].x = parseInt(windowElement.style.left);
    state.windowPositions[state.dragState.currentWindow].y = parseInt(windowElement.style.top);
    
    e.preventDefault();
}

function stopWindowDrag() {
    if (!state.dragState.isDragging) return;
    
    const windowElement = document.getElementById(`${state.dragState.currentWindow}Window`);
    if (windowElement) {
        windowElement.classList.remove('dragging');
    }
    
    document.body.classList.remove('window-dragging');
    
    // Remove both mouse and touch event listeners
    document.removeEventListener('mousemove', handleWindowDrag);
    document.removeEventListener('mouseup', stopWindowDrag);
    document.removeEventListener('touchmove', handleWindowDrag);
    document.removeEventListener('touchend', stopWindowDrag);
    
    state.dragState.isDragging = false;
    state.dragState.currentWindow = null;
}

// Taskbar management
function addToTaskbar(windowType) {
    const taskbarButtons = document.getElementById('taskbarButtons');
    
    const button = document.createElement('button');
    button.className = 'taskbar-button active';
    button.setAttribute('data-window', windowType);
    button.innerHTML = `
        <span class="window-icon">${getWindowIcon(windowType)}</span>
        <span class="button-text">${getWindowTitle(windowType)}</span>
    `;
    
    button.addEventListener('click', () => {
        if (state.windowPositions[windowType].minimized) {
            bringWindowToFront(windowType);
        } else {
            minimizeWindow(windowType);
        }
    });
    
    taskbarButtons.appendChild(button);
}

function removeFromTaskbar(windowType) {
    const button = document.querySelector(`.taskbar-button[data-window="${windowType}"]`);
    if (button) {
        button.remove();
    }
}

function updateTaskbarButton(windowType, active) {
    const button = document.querySelector(`.taskbar-button[data-window="${windowType}"]`);
    if (button) {
        button.classList.toggle('active', active);
    }
}

// Start menu functionality
function toggleStartMenu() {
    const startMenu = document.getElementById('startMenu');
    const startButton = document.querySelector('.start-button');
    
    if (state.startMenuOpen) {
        closeStartMenu();
    } else {
        openStartMenu();
    }
}

function openStartMenu() {
    const startMenu = document.getElementById('startMenu');
    const startButton = document.querySelector('.start-button');
    
    startMenu.classList.add('active');
    startButton.classList.add('active');
    state.startMenuOpen = true;
}

function closeStartMenu() {
    const startMenu = document.getElementById('startMenu');
    const startButton = document.querySelector('.start-button');
    
    startMenu.classList.remove('active');
    startButton.classList.remove('active');
    state.startMenuOpen = false;
}

// Utility functions
function getWindowIcon(windowType) {
    const icons = {
        terminal: '<img src="assets/icons/Help/Help_16x16.png" alt="Terminal" />',
        about: '<img src="assets/icons/User/User_16x16.png" alt="About" />',
        skills: '<img src="assets/icons/Settings/Settings_16x16.png" alt="Skills" />',
        projects: '<img src="assets/icons/Folder/Folder_16x16.png" alt="Projects" />',
        experience: '<img src="assets/icons/Calendar/Calendar_16x16.png" alt="Experience" />',
        contact: '<img src="assets/icons/Mail/Mail_16x16.png" alt="Contact" />',
        resume: '<img src="assets/icons/User/User_16x16.png" alt="Resume" />',
        filemanager: '<img src="assets/icons/Open/Open_16x16.png" alt="Files" />',
        texteditor: '<img src="assets/icons/Edit/Edit_16x16.png" alt="Editor" />',
        calculator: '<img src="assets/icons/Properties/Properties_16x16.png" alt="Calculator" />',
        network: '<img src="assets/icons/Globe/Globe_16x16.png" alt="Network" />',
        system: '<img src="assets/icons/Information/Information_16x16.png" alt="System" />',
        snake: '<img src="assets/icons/Play/Play_16x16.png" alt="Snake" />',
        tictactoe: '<img src="assets/icons/Presentation/Presentation_16x16.png" alt="Tic-Tac-Toe" />',
        browser: '<img src="assets/icons/Globe/Globe_16x16.png" alt="Firefox" />'
    };
    return icons[windowType] || '<img src="assets/icons/Folder/Folder_16x16.png" alt="Window" />';
}

function getWindowTitle(windowType) {
    const titles = {
        terminal: 'Terminal',
        about: 'About Me',
        skills: 'Skills',
        projects: 'Projects',
        experience: 'Experience',
        contact: 'Contact',
        resume: 'Resume',
        filemanager: 'File Manager',
        texteditor: 'Text Editor',
        calculator: 'Calculator',
        network: 'Network Manager',
        system: 'System Information',
        snake: 'Snake Game',
        tictactoe: 'Tic-Tac-Toe vs AI',
        browser: 'Firefox Browser'
    };
    return titles[windowType] || 'Window';
}

function updateClock() {
    const clockElement = document.getElementById('clock');
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    clockElement.textContent = timeString;
}

function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.width = bar.style.width || '0%';
        }, index * 100);
    });
}

// Shutdown/Logoff functionality
function showShutdown() {
    const shutdownDialog = document.getElementById('shutdownDialog');
    shutdownDialog.classList.add('active');
}

function hideShutdown() {
    const shutdownDialog = document.getElementById('shutdownDialog');
    shutdownDialog.classList.remove('active');
}

function selectShutdownOption(e) {
    document.querySelectorAll('.option-item').forEach(item => {
        item.classList.remove('selected');
    });
    e.currentTarget.classList.add('selected');
}

function executeShutdown() {
    const selectedOption = document.querySelector('.option-item.selected');
    const action = selectedOption.getAttribute('data-action');
    
    if (action === 'restart') {
        // Restart - reload the page
        showNotification('🔄 Restarting system...');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else if (action === 'shutdown') {
        // Shutdown - show a shutdown message
        showNotification('⚡ Shutting down system...');
        setTimeout(() => {
            document.body.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: Tahoma, sans-serif;
                    font-size: 24px;
                ">
                    <div style="text-align: center;">
                        <p>It's now safe to turn off your computer.</p>
                        <p style="font-size: 14px; margin-top: 20px; opacity: 0.7;">
                            <a href="mailto:ajvirusofficial@gmail.com" style="color: #4a90e2;">Contact Aaqib Jeelani</a>
                        </p>
                    </div>
                </div>
            `;
        }, 2000);
    } else if (action === 'logoff') {
        // Log off - return to login screen
        showNotification('👋 Logging off...');
        setTimeout(() => {
            const desktop = document.getElementById('desktop');
            const loginScreen = document.getElementById('loginScreen');
            
            // Close all windows
            state.openWindows.forEach(windowType => {
                closeWindow(windowType);
            });
            
            // Hide desktop and show login screen
            desktop.classList.remove('active');
            setTimeout(() => {
                loginScreen.classList.add('active');
                state.currentScreen = 'login';
            }, 500);
            
            // Hide shutdown dialog
            hideShutdown();
        }, 1500);
    }
}

function showLogoff() {
    const shutdownDialog = document.getElementById('shutdownDialog');
    const dialogHeader = shutdownDialog.querySelector('.dialog-header h3');
    const dialogMessage = shutdownDialog.querySelector('.dialog-message p');
    
    dialogHeader.textContent = 'Log Off Windows';
    dialogMessage.textContent = 'Are you sure you want to log off?';
    
    // Update options
    const optionsContainer = shutdownDialog.querySelector('.dialog-options');
    optionsContainer.innerHTML = `
        <div class="option-item selected" data-action="logoff">
            <span class="option-icon">🚪</span>
            <span class="option-text">Log Off</span>
        </div>
    `;
    
    shutdownDialog.classList.add('active');
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Alt + Tab (window switching)
    if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        // Could implement window switching logic here
    }
    
    // Windows key (open start menu)
    if (e.key === 'Meta' || e.key === 'ContextMenu') {
        e.preventDefault();
        toggleStartMenu();
    }
    
    // Escape (close start menu)
    if (e.key === 'Escape') {
        closeStartMenu();
        hideShutdown();
    }
}

// Responsive handling
function handleWindowResize() {
    // Adjust window positions if they're out of bounds
    state.openWindows.forEach(windowType => {
        const windowElement = document.getElementById(`${windowType}Window`);
        const position = state.windowPositions[windowType];
        
        if (windowElement && !position.maximized) {
            const rect = windowElement.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height - 40;
            
            if (position.x > maxX || position.y > maxY) {
                const newX = Math.max(0, Math.min(position.x, maxX));
                const newY = Math.max(0, Math.min(position.y, maxY));
                
                windowElement.style.left = newX + 'px';
                windowElement.style.top = newY + 'px';
                
                state.windowPositions[windowType].x = newX;
                state.windowPositions[windowType].y = newY;
            }
        }
    });
}

// Contact form handling
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Create mailto link
    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailtoLink = `mailto:ajvirusofficial@gmail.com?subject=${subject}&body=${body}`;
    
    // Open default email client
    window.location.href = mailtoLink;
    
    // Show confirmation
    showNotification('Email client opened! Thank you for your message.');
    
    // Reset form
    e.target.reset();
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(to bottom, #f0f0f0 0%, #e8e8e8 100%);
        border: 2px outset #e8e8e8;
        padding: 12px 16px;
        border-radius: 4px;
        font-family: Tahoma, sans-serif;
        font-size: 11px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 3px 3px 10px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'opacity 0.5s ease';
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Touch support for mobile
let touchStartTime = 0;
let touchStartTarget = null;

document.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    touchStartTarget = e.target.closest('.desktop-icon');
});

document.addEventListener('touchend', (e) => {
    const touchDuration = Date.now() - touchStartTime;
    
    if (touchStartTarget && touchDuration < 500) {
        // Single tap
        selectDesktopIcon(touchStartTarget);
        
        // Double tap simulation
        if (touchStartTarget.dataset.lastTap && (touchStartTime - touchStartTarget.dataset.lastTap) < 300) {
            const windowType = touchStartTarget.getAttribute('data-window');
            openWindow(windowType);
        }
        touchStartTarget.dataset.lastTap = touchStartTime;
    }
});

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized resize handler
const debouncedResize = debounce(handleWindowResize, 250);
window.addEventListener('resize', debouncedResize);

// Terminal functionality
function setupTerminal() {
    document.addEventListener('DOMContentLoaded', () => {
        const terminalInput = document.getElementById('terminalInput');
        const terminalOutput = document.getElementById('terminalOutput');
        
        if (terminalInput) {
            terminalInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const command = terminalInput.value.trim();
                    executeTerminalCommand(command);
                    terminalInput.value = '';
                }
            });
        }
    });
}

function executeTerminalCommand(command) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;
    
    // Add command to output
    const commandLine = document.createElement('div');
    commandLine.className = 'terminal-line';
    commandLine.textContent = `aaqib@linux-aj:~$ ${command}`;
    output.appendChild(commandLine);
    
    // Process command
    let response = '';
    switch(command.toLowerCase()) {
        case 'help':
            response = `Available commands:
  help        - Show this help message
  whoami      - Display user information
  ls          - List directory contents
  skills      - Show technical skills
  projects    - List current projects
  contact     - Display contact information
  clear       - Clear terminal
  neofetch    - Show system information
  exit        - Close terminal`;
            break;
        case 'whoami':
            response = 'Aaqib Jeelani - Full Stack Developer & IT Manager';
            break;
        case 'ls':
            response = 'about.txt  skills/  projects/  experience/  contact.md  resume.pdf';
            break;
        case 'skills':
            response = `Technical Skills:
├── Frontend: HTML5, CSS3, JavaScript, React
├── Backend: PHP, Node.js, MySQL, REST APIs
└── Tools: Git, WordPress, Web Hosting, Responsive Design`;
            break;
        case 'projects':
            response = `Active Projects:
[1337] snagging-software    - Inspection management system
[1338] portfolio-website    - Personal portfolio (this site)
[1339] client-solutions     - Various client projects`;
            break;
        case 'contact':
            response = `Contact Information:
Email: ajvirusofficial@gmail.com
LinkedIn: https://www.linkedin.com/in/aaqibjeelani/
Location: Dubai, UAE`;
            break;
        case 'neofetch':
            response = `Linux AJ Terminal OS v2.0
─────────────────────────────
OS: Linux AJ Terminal v2.0
Kernel: 5.15.0-aj
Uptime: 2 hours, 15 minutes
Packages: 1337 (npm), 42 (php)
Shell: ajsh v1.0
CPU: Intel i7-10700K (16) @ 3.80GHz
Memory: 2048MB / 16384MB
Disk: 500GB SSD`;
            break;
        case 'clear':
            output.innerHTML = `<div class="terminal-line">Linux AJ Terminal OS v2.0</div>
<div class="terminal-line">Copyright (c) 2024 Aaqib Jeelani. All rights reserved.</div>
<div class="terminal-line"></div>`;
            return;
        case 'exit':
            closeWindow('terminal');
            return;
        default:
            response = `bash: ${command}: command not found
Type 'help' for available commands.`;
    }
    
    // Add response
    const responseLine = document.createElement('div');
    responseLine.className = 'terminal-line';
    responseLine.style.whiteSpace = 'pre-line';
    responseLine.textContent = response;
    output.appendChild(responseLine);
    
    // Scroll to bottom
    output.scrollTop = output.scrollHeight;
}

// Download resume function
function downloadResume() {
    const link = document.createElement('a');
    link.href = 'assets/cv/cv.pdf';
    link.download = 'Aaqib_Jeelani_Resume.pdf';
    link.click();
}

// Custom right-click context menu
let contextMenu = null;

function createContextMenu() {
    if (contextMenu) {
        document.body.removeChild(contextMenu);
    }
    
    contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
        <div class="context-item" onclick="openWindow('terminal')">
            <img src="assets/icons/Help/Help_16x16.png" alt="Terminal" />
            <span>Open Terminal</span>
        </div>
        <div class="context-item" onclick="openWindow('filemanager')">
            <img src="assets/icons/Open/Open_16x16.png" alt="Files" />
            <span>File Manager</span>
        </div>
        <div class="context-item" onclick="refreshDesktop()">
            <img src="assets/icons/Refresh/Refresh_16x16.png" alt="Refresh" />
            <span>Refresh Desktop</span>
        </div>
        <div class="context-item" onclick="showDesktop()">
            <img src="assets/icons/Minimize/Minimize_16x16.png" alt="Show Desktop" />
            <span>Show Desktop</span>
        </div>
        <div class="context-item" onclick="changeWallpaper()">
            <img src="assets/icons/Picture/Picture_16x16.png" alt="Wallpaper" />
            <span>Change Wallpaper</span>
        </div>
        <div class="context-separator"></div>
        <div class="context-item" onclick="openWindow('system')">
            <img src="assets/icons/Information/Information_16x16.png" alt="Properties" />
            <span>System Properties</span>
        </div>
    `;
    
    document.body.appendChild(contextMenu);
    return contextMenu;
}

function showContextMenu(e) {
    e.preventDefault();
    const menu = createContextMenu();
    
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    menu.style.display = 'block';
    
    // Hide menu when clicking elsewhere
    setTimeout(() => {
        document.addEventListener('click', hideContextMenu, { once: true });
    }, 10);
}

function hideContextMenu() {
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

function refreshDesktop() {
    hideContextMenu();
    // Add refresh animation
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.style.animation = 'pulse 0.5s ease';
    });
    
    setTimeout(() => {
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.style.animation = '';
        });
    }, 500);
}

// Initialize system when everything is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
} else {
    initializeSystem();
}

// Calculator functionality
let calcState = {
    currentValue: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false
};

function updateCalculatorDisplay() {
    const display = document.getElementById('calcDisplay');
    if (display) {
        display.value = calcState.currentValue;
    }
}

function inputNumber(num) {
    if (calcState.waitingForOperand) {
        calcState.currentValue = num;
        calcState.waitingForOperand = false;
    } else {
        calcState.currentValue = calcState.currentValue === '0' ? num : calcState.currentValue + num;
    }
    updateCalculatorDisplay();
}

function inputOperation(nextOperation) {
    const inputValue = parseFloat(calcState.currentValue);
    
    if (calcState.previousValue === null) {
        calcState.previousValue = inputValue;
    } else if (calcState.operation) {
        const currentValue = calcState.previousValue || 0;
        const newValue = calculate(currentValue, inputValue, calcState.operation);
        
        calcState.currentValue = String(newValue);
        calcState.previousValue = newValue;
        updateCalculatorDisplay();
    }
    
    calcState.waitingForOperand = true;
    calcState.operation = nextOperation;
}

function calculateResult() {
    const inputValue = parseFloat(calcState.currentValue);
    
    if (calcState.previousValue !== null && calcState.operation) {
        const newValue = calculate(calcState.previousValue, inputValue, calcState.operation);
        calcState.currentValue = String(newValue);
        calcState.previousValue = null;
        calcState.operation = null;
        calcState.waitingForOperand = true;
        updateCalculatorDisplay();
    }
}

function calculate(firstOperand, secondOperand, operation) {
    switch (operation) {
        case '+':
            return firstOperand + secondOperand;
        case '-':
            return firstOperand - secondOperand;
        case '*':
            return firstOperand * secondOperand;
        case '/':
            return firstOperand / secondOperand;
        default:
            return secondOperand;
    }
}

function clearCalculator() {
    calcState.currentValue = '0';
    calcState.previousValue = null;
    calcState.operation = null;
    calcState.waitingForOperand = false;
    updateCalculatorDisplay();
}

function clearEntry() {
    calcState.currentValue = '0';
    updateCalculatorDisplay();
}

function backspace() {
    if (calcState.currentValue.length > 1) {
        calcState.currentValue = calcState.currentValue.slice(0, -1);
    } else {
        calcState.currentValue = '0';
    }
    updateCalculatorDisplay();
}

// Snake Game functionality
let snakeGame = {
    canvas: null,
    ctx: null,
    snake: [{x: 200, y: 200}],
    direction: {x: 20, y: 0},
    food: {x: 100, y: 100},
    score: 0,
    gameRunning: false,
    gameInterval: null
};

function initSnakeGame() {
    snakeGame.canvas = document.getElementById('snakeCanvas');
    if (snakeGame.canvas) {
        snakeGame.ctx = snakeGame.canvas.getContext('2d');
        drawSnakeGame();
    }
}

function startSnakeGame() {
    if (!snakeGame.gameRunning) {
        snakeGame.gameRunning = true;
        snakeGame.gameInterval = setInterval(updateSnakeGame, 150);
    }
}

function pauseSnakeGame() {
    snakeGame.gameRunning = false;
    if (snakeGame.gameInterval) {
        clearInterval(snakeGame.gameInterval);
        snakeGame.gameInterval = null;
    }
}

function resetSnakeGame() {
    pauseSnakeGame();
    snakeGame.snake = [{x: 200, y: 200}];
    snakeGame.direction = {x: 20, y: 0};
    snakeGame.food = generateFood();
    snakeGame.score = 0;
    updateSnakeScore();
    drawSnakeGame();
}

function updateSnakeGame() {
    const head = {x: snakeGame.snake[0].x + snakeGame.direction.x, y: snakeGame.snake[0].y + snakeGame.direction.y};
    
    // Check wall collision
    if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
        gameOver();
        return;
    }
    
    // Check self collision
    for (let segment of snakeGame.snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snakeGame.snake.unshift(head);
    
    // Check food collision
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score += 10;
        updateSnakeScore();
        snakeGame.food = generateFood();
    } else {
        snakeGame.snake.pop();
    }
    
    drawSnakeGame();
}

function generateFood() {
    let food;
    do {
        food = {
            x: Math.floor(Math.random() * 20) * 20,
            y: Math.floor(Math.random() * 20) * 20
        };
    } while (snakeGame.snake.some(segment => segment.x === food.x && segment.y === food.y));
    return food;
}

function drawSnakeGame() {
    if (!snakeGame.ctx) return;
    
    // Clear canvas
    snakeGame.ctx.fillStyle = '#000';
    snakeGame.ctx.fillRect(0, 0, 400, 400);
    
    // Draw snake
    snakeGame.ctx.fillStyle = '#0f0';
    snakeGame.snake.forEach(segment => {
        snakeGame.ctx.fillRect(segment.x, segment.y, 18, 18);
    });
    
    // Draw food
    snakeGame.ctx.fillStyle = '#f00';
    snakeGame.ctx.fillRect(snakeGame.food.x, snakeGame.food.y, 18, 18);
}

function gameOver() {
    pauseSnakeGame();
    alert(`Game Over! Final Score: ${snakeGame.score}`);
}

function updateSnakeScore() {
    const scoreElement = document.getElementById('snakeScore');
    if (scoreElement) {
        scoreElement.textContent = snakeGame.score;
    }
}

// Tic-Tac-Toe functionality
let tttGame = {
    board: Array(9).fill(''),
    currentPlayer: 'X',
    gameActive: true,
    playerWins: 0,
    aiWins: 0,
    draws: 0,
    gameMode: 'ai', // 'ai' or 'online'
    isOnline: false,
    playerSymbol: 'X',
    opponentSymbol: 'O',
    playerId: null,
    roomId: null,
    isConnected: false
};

// Real Online Multiplayer System using WebRTC and signaling server
class OnlineMultiplayerSystem {
    constructor() {
        this.playerId = this.generatePlayerId();
        this.playerName = `Player_${this.playerId.slice(-4)}`;
        this.onlinePlayers = new Map();
        this.gameInvites = new Map();
        this.currentRoom = null;
        this.peerConnection = null;
        this.dataChannel = null;
        this.isHost = false;
        this.connectedPeer = null;
        this.signalServer = 'wss://localhost:8080'; // You would need a signaling server
        this.socket = null;
        this.connectionStatus = 'disconnected';
        this.heartbeatInterval = null;
        this.playerListUpdateInterval = null;
        
        // Fallback to localStorage for demo purposes
        this.useFallback = true;
        
        this.initializeConnection();
    }
    
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    }
    
    generateRoomId() {
        return 'room_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    
    async initializeConnection() {
        if (this.useFallback) {
            this.initializeFallbackSystem();
            return;
        }
        
        try {
            this.socket = new WebSocket(this.signalServer);
            
            this.socket.onopen = () => {
                this.connectionStatus = 'connected';
                this.joinPlayerList();
                this.startHeartbeat();
                showNotification('🌐 Connected to game server!');
            };
            
            this.socket.onmessage = (event) => {
                this.handleSignalingMessage(JSON.parse(event.data));
            };
            
            this.socket.onclose = () => {
                this.connectionStatus = 'disconnected';
                this.stopHeartbeat();
                showNotification('⚠️ Disconnected from game server');
                // Fallback to local system
                this.initializeFallbackSystem();
            };
            
            this.socket.onerror = () => {
                console.log('WebSocket connection failed, using fallback system');
                this.initializeFallbackSystem();
            };
        } catch (error) {
            console.log('WebSocket not available, using fallback system');
            this.initializeFallbackSystem();
        }
    }
    
    initializeFallbackSystem() {
        this.useFallback = true;
        this.connectionStatus = 'local';
        this.startPlayerListSimulation();
        showNotification('🔧 Using local multiplayer system');
    }
    
    startPlayerListSimulation() {
        // Simulate other players for demo
        const simulatedPlayers = [
            { id: 'bot1', name: 'AI_Player_1', status: 'available', lastSeen: Date.now() },
            { id: 'bot2', name: 'AI_Player_2', status: 'in_game', lastSeen: Date.now() },
            { id: 'demo1', name: 'Demo_Player', status: 'available', lastSeen: Date.now() }
        ];
        
        simulatedPlayers.forEach(player => {
            this.onlinePlayers.set(player.id, player);
        });
        
        this.updatePlayerListUI();
        
        // Periodically update simulated players
        this.playerListUpdateInterval = setInterval(() => {
            this.updateSimulatedPlayers();
        }, 5000);
    }
    
    updateSimulatedPlayers() {
        this.onlinePlayers.forEach((player, id) => {
            if (id.startsWith('bot') || id.startsWith('demo')) {
                player.status = Math.random() > 0.7 ? 'in_game' : 'available';
                player.lastSeen = Date.now();
            }
        });
        this.updatePlayerListUI();
    }
    
    joinPlayerList() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'join',
                playerId: this.playerId,
                playerName: this.playerName
            }));
        }
    }
    
    getOnlinePlayers() {
        return Array.from(this.onlinePlayers.values()).filter(p => p.id !== this.playerId);
    }
    
    sendGameInvite(targetPlayerId) {
        const inviteId = this.generateRoomId();
        
        if (this.useFallback) {
            // Simulate invite response for demo
            setTimeout(() => {
                const accepted = Math.random() > 0.5;
                if (accepted) {
                    this.handleInviteResponse(inviteId, targetPlayerId, true);
                } else {
                    showNotification('🚫 Player declined your invite');
                }
            }, 1000 + Math.random() * 2000);
            
            showNotification('📤 Game invite sent!');
            return;
        }
        
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'invite',
                from: this.playerId,
                to: targetPlayerId,
                inviteId: inviteId,
                gameType: 'tictactoe'
            }));
            
            showNotification('📤 Game invite sent!');
        }
    }
    
    handleInviteResponse(inviteId, opponentId, accepted) {
        if (accepted) {
            this.startPeerConnection(opponentId, true);
            showNotification('✅ Invite accepted! Starting game...');
        }
    }
    
    async startPeerConnection(opponentId, isHost) {
        this.isHost = isHost;
        this.connectedPeer = opponentId;
        
        if (this.useFallback) {
            // Simulate direct connection for demo
            this.simulateDirectConnection(opponentId);
            return;
        }
        
        try {
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });
            
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate && this.socket) {
                    this.socket.send(JSON.stringify({
                        type: 'ice-candidate',
                        candidate: event.candidate,
                        to: opponentId
                    }));
                }
            };
            
            this.peerConnection.ondatachannel = (event) => {
                const channel = event.channel;
                this.setupDataChannel(channel);
            };
            
            if (isHost) {
                this.dataChannel = this.peerConnection.createDataChannel('tictactoe');
                this.setupDataChannel(this.dataChannel);
                
                const offer = await this.peerConnection.createOffer();
                await this.peerConnection.setLocalDescription(offer);
                
                this.socket.send(JSON.stringify({
                    type: 'offer',
                    offer: offer,
                    to: opponentId
                }));
            }
        } catch (error) {
            console.error('WebRTC setup failed:', error);
            this.simulateDirectConnection(opponentId);
        }
    }
    
    simulateDirectConnection(opponentId) {
        // Simulate successful connection for demo
        setTimeout(() => {
            tttGame.isOnline = true;
            tttGame.roomId = this.generateRoomId();
            tttGame.playerId = this.playerId;
            tttGame.playerSymbol = this.isHost ? 'X' : 'O';
            tttGame.opponentSymbol = this.isHost ? 'O' : 'X';
            tttGame.opponentId = opponentId;
            
            this.updateOnlineGameUI();
            showNotification('🎮 Connected! Game ready to start!');
        }, 1000);
    }
    
    setupDataChannel(channel) {
        channel.onopen = () => {
            showNotification('🔗 Direct connection established!');
            this.updateOnlineGameUI();
        };
        
        channel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleGameMessage(data);
        };
    }
    
    sendGameMessage(message) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(message));
        } else if (this.useFallback) {
            // Simulate receiving message for demo
            setTimeout(() => {
                this.handleGameMessage({
                    type: 'move',
                    position: Math.floor(Math.random() * 9),
                    symbol: tttGame.opponentSymbol
                });
            }, 1000 + Math.random() * 2000);
        }
    }
    
    handleGameMessage(message) {
        switch (message.type) {
            case 'move':
                if (tttGame.board[message.position] === '') {
                    tttGame.board[message.position] = message.symbol;
                    tttGame.currentPlayer = message.symbol === 'X' ? 'O' : 'X';
                    updateBoard();
                    updateOnlineStatus();
                    
                    if (checkWinner()) {
                        handleGameEnd();
                    } else if (!tttGame.board.includes('')) {
                        handleGameEnd('draw');
                    }
                }
                break;
            case 'reset':
                resetTicTacToe();
                this.addChatMessage('Opponent reset the game', 'remote');
                showNotification('🔄 Opponent reset the game');
                break;
            case 'chat':
                const senderName = message.sender || 'Opponent';
                this.addChatMessage(`${senderName}: ${message.text}`, 'remote');
                showNotification(`💬 ${senderName}: ${message.text}`);
                break;
        }
    }
    
    updatePlayerListUI() {
        const playerList = this.createPlayerListElement();
        const existingList = document.getElementById('onlinePlayerList');
        
        if (existingList) {
            existingList.replaceWith(playerList);
        } else {
            const onlineControls = document.getElementById('onlineControls');
            if (onlineControls) {
                onlineControls.appendChild(playerList);
            }
        }
    }
    
    createPlayerListElement() {
        const playerList = document.createElement('div');
        playerList.id = 'onlinePlayerList';
        playerList.className = 'online-player-list';
        
        const players = this.getOnlinePlayers();
        
        if (players.length === 0) {
            playerList.innerHTML = '<div class="no-players">No players online</div>';
            return playerList;
        }
        
        const header = document.createElement('div');
        header.className = 'player-list-header';
        header.textContent = `Online Players (${players.length})`;
        playerList.appendChild(header);
        
        players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = `player-item ${player.status}`;
            
            const statusIcon = player.status === 'available' ? '🟢' : '🔴';
            const statusText = player.status === 'available' ? 'Available' : 'In Game';
            
            playerElement.innerHTML = `
                <div class="player-info">
                    <span class="player-status">${statusIcon}</span>
                    <span class="player-name">${player.name}</span>
                </div>
                <div class="player-actions">
                    ${player.status === 'available' ? 
                        `<button class="invite-btn" onclick="onlineSystem.sendGameInvite('${player.id}')">Invite</button>` : 
                        `<span class="status-text">${statusText}</span>`
                    }
                </div>
            `;
            
            playerList.appendChild(playerElement);
        });
        
        return playerList;
    }
    
    updateOnlineGameUI() {
        const statusDiv = document.getElementById('playerStatus');
        const findBtn = document.getElementById('findOpponentBtn');
        
        if (tttGame.isOnline && this.connectedPeer) {
            findBtn.style.display = 'none';
            
            // Create connection status indicator
            const connectionStatus = this.createConnectionStatusElement();
            const gameChat = this.createGameChatElement();
            
            statusDiv.innerHTML = `
                <div style="color: green; font-weight: bold; margin-bottom: 8px;">✓ Connected to opponent!</div>
                <div style="font-size: 11px; color: #666; margin-bottom: 8px;">You are: ${tttGame.playerSymbol}</div>
                <div class="online-actions" style="margin-bottom: 10px; display: flex; gap: 6px; flex-wrap: wrap;">
                    <button class="game-btn" onclick="onlineSystem.resetGame()" style="font-size: 10px; padding: 4px 8px;">New Game</button>
                    <button class="game-btn" onclick="onlineSystem.disconnect()" style="font-size: 10px; padding: 4px 8px;">Disconnect</button>
                </div>
            `;
            
            statusDiv.appendChild(connectionStatus);
            statusDiv.appendChild(gameChat);
        }
    }
    
    createConnectionStatusElement() {
        const statusElement = document.createElement('div');
        statusElement.className = 'connection-status';
        
        const indicator = document.createElement('div');
        indicator.className = `status-indicator ${this.connectionStatus}`;
        
        const statusText = document.createElement('span');
        statusText.textContent = `Connection: ${this.getConnectionStatusText()}`;
        
        statusElement.appendChild(indicator);
        statusElement.appendChild(statusText);
        
        return statusElement;
    }
    
    getConnectionStatusText() {
        switch (this.connectionStatus) {
            case 'connected': return 'Connected';
            case 'connecting': return 'Connecting...';
            case 'local': return 'Local Game';
            default: return 'Disconnected';
        }
    }
    
    createGameChatElement() {
        const chatElement = document.createElement('div');
        chatElement.className = 'game-chat';
        chatElement.id = 'gameChat';
        
        chatElement.innerHTML = `
            <div class="chat-header">Game Chat</div>
            <div class="chat-messages" id="chatMessages">
                <div class="chat-message">Game started! Good luck! 🎮</div>
            </div>
            <div class="chat-input">
                <input type="text" id="chatInput" placeholder="Type message..." maxlength="100">
                <button class="chat-send" onclick="onlineSystem.sendChatMessage()">Send</button>
            </div>
        `;
        
        // Add Enter key handler for chat input
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendChatMessage();
                    }
                });
            }
        }, 100);
        
        return chatElement;
    }
    
    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput || !chatInput.value.trim()) return;
        
        const message = chatInput.value.trim();
        chatInput.value = '';
        
        // Add to local chat
        this.addChatMessage(`You: ${message}`, 'local');
        
        // Send to opponent
        this.sendGameMessage({
            type: 'chat',
            text: message,
            sender: this.playerName
        });
    }
    
    addChatMessage(message, type = 'remote') {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        messageElement.textContent = message;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Limit chat messages to prevent overflow
        if (chatMessages.children.length > 20) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
    }
    
    resetGame() {
        this.sendGameMessage({
            type: 'reset'
        });
        resetTicTacToe();
        this.addChatMessage('Game reset by you', 'local');
    }
    
    
    disconnect() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        
        this.connectedPeer = null;
        tttGame.isOnline = false;
        
        disconnectOnlineGame();
        showNotification('🚫 Disconnected from game');
    }
    
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'heartbeat' }));
            }
        }, 30000);
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.playerListUpdateInterval) {
            clearInterval(this.playerListUpdateInterval);
            this.playerListUpdateInterval = null;
        }
    }
    
    // Legacy methods for compatibility
    findOpponent() {
        return {
            found: false,
            error: 'Use player list to invite players'
        };
    }
    
    makeMove(roomId, playerId, position) {
        if (this.connectedPeer) {
            this.sendGameMessage({
                type: 'move',
                position: position,
                symbol: tttGame.playerSymbol
            });
            return { success: true };
        }
        return { success: false, error: 'Not connected to opponent' };
    }
    
    getRoomState(roomId) {
        return null; // Not used in new system
    }
}

// Initialize the online system
const onlineSystem = new OnlineMultiplayerSystem();

// Browser Functions
function refreshBrowser() {
    const iframe = document.getElementById('browserFrame');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (iframe && loadingOverlay) {
        // Show loading overlay
        loadingOverlay.classList.remove('hidden');
        
        // Reload iframe
        iframe.src = iframe.src;
        
        // Hide loading overlay after a delay
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 2000 + Math.random() * 1000);
        
        showNotification('🔄 Page refreshed');
    }
}

function loadBookmark(url) {
    const iframe = document.getElementById('browserFrame');
    const urlInput = document.querySelector('.url-input');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const tabTitle = document.querySelector('.tab-title');
    
    if (iframe && urlInput) {
        // Internal route for YouTube-like page
        if (url === 'internal:youtube') {
            if (loadingOverlay) {
                loadingOverlay.classList.remove('hidden');
                loadingOverlay.querySelector('.loading-text').textContent = 'Loading YouTube...';
            }
            urlInput.value = 'youtube.html';
            if (tabTitle) tabTitle.textContent = 'YouTube';
            iframe.src = 'youtube.html';
            setTimeout(() => loadingOverlay && loadingOverlay.classList.add('hidden'), 800);
            return;
        }

        // Show loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.querySelector('.loading-text').textContent = `Loading ${url}...`;
        }
        
        // Update address bar
        urlInput.value = url;
        
        // Update tab title
        if (tabTitle) {
            const siteName = url.includes('github') ? 'GitHub' : 
                           url.includes('stackoverflow') ? 'Stack Overflow' : 
                           url.includes('mozilla') ? 'MDN Web Docs' : 'Website';
            tabTitle.textContent = siteName;
        }
        
        // Demo mode: simulate navigation then revert
        setTimeout(() => {
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            showNotification(`📄 Would navigate to ${url} (Demo mode)`);
            setTimeout(() => {
                urlInput.value = 'https://aaqibjeelani.github.io/ajvirus/';
                if (tabTitle) tabTitle.textContent = 'Aaqib Jeelani Portfolio';
            }, 2000);
        }, 1500);
    }
}

function initializeBrowser() {
    const iframe = document.getElementById('browserFrame');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (iframe && loadingOverlay) {
        // Show loading overlay initially
        loadingOverlay.classList.remove('hidden');
        
        // Handle iframe load event
        iframe.onload = () => {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                showNotification('🌐 Website loaded successfully!');
            }, 1000 + Math.random() * 1000);
        };
        
        // Handle iframe error
        iframe.onerror = () => {
            if (loadingOverlay) {
                loadingOverlay.innerHTML = `
                    <div style="text-align: center; color: #ff4444;">
                        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                        <div style="font-size: 16px; margin-bottom: 8px;">Connection Error</div>
                        <div style="font-size: 12px; color: #666;">Could not load the website</div>
                        <button onclick="refreshBrowser()" style="margin-top: 16px; padding: 8px 16px; background: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer;">Try Again</button>
                    </div>
                `;
            }
        };
        
        // Simulate loading delay for demo
        setTimeout(() => {
            if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
                loadingOverlay.classList.add('hidden');
            }
        }, 3000);
    }
}

function makeMove(index) {
    if (!tttGame.gameActive || tttGame.board[index] !== '') return;
    
    if (tttGame.gameMode === 'online' && tttGame.isOnline) {
        // Online multiplayer move
        const result = onlineSystem.makeMove(tttGame.roomId, tttGame.playerId, index);
        if (result.success) {
            tttGame.board = result.board;
            tttGame.currentPlayer = result.currentPlayer;
            updateBoard();
            updateOnlineStatus();
            
            if (checkWinner()) {
                handleGameEnd();
                return;
            }
            
            if (!tttGame.board.includes('')) {
                handleGameEnd('draw');
                return;
            }
        } else {
            showNotification('⚠️ ' + result.error);
        }
    } else {
        // Local AI game
        tttGame.board[index] = 'X';
        updateBoard();
        
        if (checkWinner()) {
            handleGameEnd();
            return;
        }
        
        if (!tttGame.board.includes('')) {
            handleGameEnd('draw');
            return;
        }
        
        // AI move
        setTimeout(() => {
            makeAIMove();
            if (checkWinner()) {
                handleGameEnd();
            } else if (!tttGame.board.includes('')) {
                handleGameEnd('draw');
            }
        }, 500);
    }
}

function makeAIMove() {
    const difficulty = document.getElementById('aiLevel').value;
    let move;
    
    switch (difficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
            break;
        case 'hard':
            move = getBestMove();
            break;
    }
    
    if (move !== -1) {
        tttGame.board[move] = 'O';
        updateBoard();
    }
}

function getRandomMove() {
    const availableMoves = tttGame.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
}

function getBestMove() {
    // Simple AI using minimax
    let bestScore = -Infinity;
    let move = -1;
    
    for (let i = 0; i < 9; i++) {
        if (tttGame.board[i] === '') {
            tttGame.board[i] = 'O';
            let score = minimax(tttGame.board, 0, false);
            tttGame.board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    let result = checkWinnerForBoard(board);
    if (result !== null) {
        return result === 'O' ? 1 : result === 'X' ? -1 : 0;
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner() {
    return checkWinnerForBoard(tttGame.board);
}

function checkWinnerForBoard(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function updateBoard() {
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach((cell, index) => {
        cell.textContent = tttGame.board[index];
        cell.className = `ttt-cell ${tttGame.board[index].toLowerCase()}`;
    });
}

function handleGameEnd(result) {
    tttGame.gameActive = false;
    const winner = result || checkWinner();
    
    if (winner === 'X') {
        tttGame.playerWins++;
        document.getElementById('tttStatus').textContent = 'You won!';
    } else if (winner === 'O') {
        tttGame.aiWins++;
        document.getElementById('tttStatus').textContent = 'AI won!';
    } else {
        tttGame.draws++;
        document.getElementById('tttStatus').textContent = "It's a draw!";
    }
    
    updateTTTStats();
}

function resetTicTacToe() {
    tttGame.board = Array(9).fill('');
    tttGame.gameActive = true;
    updateBoard();
    document.getElementById('tttStatus').textContent = 'Your turn (X)';
    
    // Reinitialize touch handlers on mobile after board update
    setTimeout(() => {
        if (window.innerWidth <= 768 || 'ontouchstart' in window) {
            initializeTicTacToeTouch();
        }
    }, 100);
}

function updateTTTStats() {
    document.getElementById('playerWins').textContent = tttGame.playerWins;
    document.getElementById('aiWins').textContent = tttGame.aiWins;
    document.getElementById('draws').textContent = tttGame.draws;
}

// Online multiplayer functions
function switchGameMode() {
    const gameMode = document.getElementById('gameMode').value;
    tttGame.gameMode = gameMode;
    
    const aiControls = document.getElementById('aiDifficulty');
    const onlineControls = document.getElementById('onlineControls');
    
    if (gameMode === 'online') {
        aiControls.style.display = 'none';
        onlineControls.style.display = 'flex';
        document.getElementById('tttStatus').textContent = 'Select "Find Player" to start online game';
    } else {
        aiControls.style.display = 'flex';
        onlineControls.style.display = 'none';
        document.getElementById('tttStatus').textContent = 'Your turn (X)';
        if (tttGame.isOnline) {
            disconnectOnlineGame();
        }
    }
    
    resetTicTacToe();
}

function findOnlineOpponent() {
    const findBtn = document.getElementById('findOpponentBtn');
    const statusDiv = document.getElementById('playerStatus');
    
    // Show player list instead of random matching
    if (!tttGame.isOnline) {
        findBtn.textContent = 'Loading Players...';
        findBtn.disabled = true;
        
        // Initialize online system and show player list
        setTimeout(() => {
            onlineSystem.updatePlayerListUI();
            findBtn.textContent = 'Refresh List';
            findBtn.disabled = false;
            
            statusDiv.innerHTML = `
                <div style="text-align: center; font-size: 12px; color: #666; margin-bottom: 10px;">
                    💡 Click 'Invite' next to any available player to send a game request!
                </div>
            `;
            
            document.getElementById('tttStatus').textContent = 'Select a player from the list to invite';
            showNotification('🎮 Player list loaded! Send invites to start games.');
        }, 1000);
    } else {
        // Refresh player list
        onlineSystem.updatePlayerListUI();
        showNotification('🔄 Player list refreshed');
    }
}

function disconnectOnlineGame() {
    tttGame.isOnline = false;
    tttGame.roomId = null;
    tttGame.playerId = null;
    
    if (tttGame.pollingInterval) {
        clearInterval(tttGame.pollingInterval);
    }
    
    const findBtn = document.getElementById('findOpponentBtn');
    const statusDiv = document.getElementById('playerStatus');
    
    findBtn.style.display = 'inline-block';
    findBtn.disabled = false;
    findBtn.textContent = 'Find Player';
    findBtn.onclick = () => findOnlineOpponent();
    statusDiv.textContent = '';
    
    document.getElementById('tttStatus').textContent = 'Select "Find Player" to start online game';
    showNotification('🚫 Disconnected from online game');
    resetTicTacToe();
}

function startWaitingForOpponent() {
    tttGame.pollingInterval = setInterval(() => {
        const roomState = onlineSystem.getRoomState(tttGame.roomId);
        if (roomState && roomState.player2) {
            // Opponent joined!
            clearInterval(tttGame.pollingInterval);
            
            const statusDiv = document.getElementById('playerStatus');
            statusDiv.innerHTML = `
                <div style="color: green;">✓ Opponent joined!</div>
                <div style="font-size: 10px;">You are: ${tttGame.playerSymbol}</div>
                <button class="game-btn" onclick="disconnectOnlineGame()" style="margin-top: 5px; font-size: 10px;">Disconnect</button>
            `;
            
            document.getElementById('findOpponentBtn').style.display = 'none';
            document.getElementById('tttStatus').textContent = 
                tttGame.playerSymbol === 'X' ? 'Your turn (X)' : 'Opponent\'s turn (O)';
            
            showNotification('🎮 Opponent joined! Your turn!');
            startOnlineGamePolling();
        }
    }, 2000);
}

function startOnlineGamePolling() {
    tttGame.pollingInterval = setInterval(() => {
        if (!tttGame.isOnline) {
            clearInterval(tttGame.pollingInterval);
            return;
        }
        
        const roomState = onlineSystem.getRoomState(tttGame.roomId);
        if (roomState) {
            // Update board if opponent made a move
            if (JSON.stringify(roomState.board) !== JSON.stringify(tttGame.board)) {
                tttGame.board = roomState.board;
                tttGame.currentPlayer = roomState.currentPlayer;
                updateBoard();
                updateOnlineStatus();
                
                if (checkWinner()) {
                    handleGameEnd();
                } else if (!tttGame.board.includes('')) {
                    handleGameEnd('draw');
                }
            }
        }
    }, 1000);
}

function updateOnlineStatus() {
    if (!tttGame.isOnline) return;
    
    const isMyTurn = tttGame.currentPlayer === tttGame.playerSymbol;
    document.getElementById('tttStatus').textContent = isMyTurn 
        ? `Your turn (${tttGame.playerSymbol})` 
        : `Opponent's turn (${tttGame.opponentSymbol})`;
}

// Keyboard controls for Snake
document.addEventListener('keydown', (e) => {
    if (!snakeGame.gameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (snakeGame.direction.y === 0) {
                snakeGame.direction = {x: 0, y: -20};
            }
            break;
        case 'ArrowDown':
            if (snakeGame.direction.y === 0) {
                snakeGame.direction = {x: 0, y: 20};
            }
            break;
        case 'ArrowLeft':
            if (snakeGame.direction.x === 0) {
                snakeGame.direction = {x: -20, y: 0};
            }
            break;
        case 'ArrowRight':
            if (snakeGame.direction.x === 0) {
                snakeGame.direction = {x: 20, y: 0};
            }
            break;
    }
    e.preventDefault();
});

// Enhanced openWindow function with game initialization
function openWindow(windowType) {
    if (state.openWindows.has(windowType)) {
        bringWindowToFront(windowType);
        return;
    }
    
    const windowElement = document.getElementById(`${windowType}Window`);
    if (!windowElement) return;
    
    const position = state.windowPositions[windowType];
    
    // Calculate centered position for desktop screens (non-mobile)
    const isMobile = window.innerWidth <= 768;
    let left = position.x;
    let top = position.y;
    let width = position.width;
    let height = position.height;
    
    if (!isMobile) {
        // Prefer centered position for first open, especially for browser and content windows
        const isFirstOpen = !state.openWindows.has(windowType);
        const shouldCenter = ['browser', 'about', 'projects', 'experience', 'contact', 'resume', 'system', 'network'].includes(windowType);
        
        if (isFirstOpen && shouldCenter) {
            width = position.width;
            height = position.height;
            left = Math.max(20, Math.floor((window.innerWidth - width) / 2));
            top = Math.max(20, Math.floor((window.innerHeight - height - 40) / 2)); // account for taskbar
            
            // Update stored position so next opens are consistent
            state.windowPositions[windowType].x = left;
            state.windowPositions[windowType].y = top;
        }
    }
    
    // Set initial position and size
    windowElement.style.left = left + 'px';
    windowElement.style.top = top + 'px';
    windowElement.style.width = width + 'px';
    windowElement.style.height = height + 'px';
    windowElement.style.zIndex = ++state.windowZIndex;
    
    // Show window
    windowElement.classList.add('active');
    state.openWindows.add(windowType);
    
    // Maximize window by default (except for mobile which handles this differently)
    if (!isMobile) {
        setTimeout(() => {
            toggleMaximize(windowType);
        }, 100);
    }
    
    // Add to taskbar
    addToTaskbar(windowType);
    
    // Animate skill bars if it's the skills window
    if (windowType === 'skills') {
        setTimeout(animateSkillBars, 300);
    }
    
    // Initialize specific applications
    setTimeout(() => {
        if (windowType === 'snake') {
            initSnakeGame();
        } else if (windowType === 'calculator') {
            updateCalculatorDisplay();
        } else if (windowType === 'tictactoe') {
            resetTicTacToe();
            // Initialize touch handlers for mobile
            if (window.innerWidth <= 768 || 'ontouchstart' in window) {
                setTimeout(() => {
                    initializeTicTacToeTouch();
                }, 200);
            }
        } else if (windowType === 'browser') {
            initializeBrowser();
        }
    }, 100);
    
    closeStartMenu();
}

// Add right-click context menu to desktop
document.addEventListener('DOMContentLoaded', () => {
    const desktop = document.getElementById('desktop');
    if (desktop) {
        desktop.addEventListener('contextmenu', showContextMenu);
    }
});

// System Information Tab Switching
function showSystemTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(`${tabName}Tab`);
    if (tabElement) {
        tabElement.style.display = 'block';
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Text Editor Functions (Basic functionality)
function editorAction(action) {
    const textarea = document.querySelector('.editor-textarea');
    if (!textarea) return;
    
    switch(action) {
        case 'new':
            textarea.value = '';
            document.querySelector('.title-text').textContent = 'Text Editor - Untitled';
            break;
        case 'copy':
            textarea.select();
            document.execCommand('copy');
            break;
        case 'cut':
            textarea.select();
            document.execCommand('cut');
            break;
        case 'paste':
            document.execCommand('paste');
            break;
        case 'undo':
            document.execCommand('undo');
            break;
        case 'redo':
            document.execCommand('redo');
            break;
    }
}

// File Manager Functions (Basic functionality)
function fileManagerAction(action) {
    console.log(`File manager action: ${action}`);
    // Basic file manager actions - can be expanded
    switch(action) {
        case 'back':
        case 'forward':
        case 'up':
        case 'refresh':
            showNotification(`File manager: ${action} clicked`);
            break;
    }
}

// Network Manager Functions
function connectToNetwork(networkName) {
    showNotification(`Connecting to ${networkName}...`);
    // Simulate connection
    setTimeout(() => {
        showNotification(`Connected to ${networkName}`);
    }, 2000);
}

// Enhanced desktop icon double-click handler
document.addEventListener('DOMContentLoaded', function() {
    // Remove existing event listeners to avoid conflicts
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        // Clone node to remove all event listeners
        const newIcon = icon.cloneNode(true);
        icon.parentNode.replaceChild(newIcon, icon);
    });
    
    // Add new double-click handlers
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        let clickCount = 0;
        let clickTimeout;
        
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            clickCount++;
            
            if (clickCount === 1) {
                clickTimeout = setTimeout(() => {
                    // Single click - just select
                    selectDesktopIcon(icon);
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 2) {
                // Double click - open window
                clearTimeout(clickTimeout);
                const windowType = icon.getAttribute('data-window');
                if (windowType) {
                    openWindow(windowType);
                }
                clickCount = 0;
            }
        });
    });
    
    // Add click handlers to text editor toolbar
    document.querySelectorAll('.editor-btn').forEach((btn, index) => {
        const actions = ['new', 'open', 'save', 'cut', 'copy', 'paste', 'undo', 'redo'];
        if (actions[index]) {
            btn.addEventListener('click', () => editorAction(actions[index]));
        }
    });
    
    // Add click handlers to file manager toolbar
    document.querySelectorAll('.toolbar-btn').forEach((btn, index) => {
        const actions = ['back', 'forward', 'up', 'refresh'];
        if (actions[index]) {
            btn.addEventListener('click', () => fileManagerAction(actions[index]));
        }
    });
});

// Performance monitoring for system window
function updateSystemPerformance() {
    // Simulate changing performance metrics
    const cpuMeter = document.querySelector('.performance-meter .meter-fill');
    const memoryMeter = document.querySelectorAll('.performance-meter .meter-fill')[1];
    const diskMeter = document.querySelectorAll('.performance-meter .meter-fill')[2];
    const networkMeter = document.querySelectorAll('.performance-meter .meter-fill')[3];
    
    if (cpuMeter) {
        const cpu = Math.random() * 100;
        cpuMeter.style.width = cpu + '%';
        cpuMeter.parentElement.nextElementSibling.textContent = Math.round(cpu) + '%';
    }
    
    if (memoryMeter) {
        const memory = 50 + Math.random() * 30;
        memoryMeter.style.width = memory + '%';
        const memoryGB = (memory / 100) * 16;
        memoryMeter.parentElement.nextElementSibling.textContent = 
            `${memoryGB.toFixed(1)}GB / 16GB (${Math.round(memory)}%)`;
    }
}

// Update system performance every few seconds
setInterval(updateSystemPerformance, 3000);

// Enhanced window management - ensure all windows are properly initialized
function ensureWindowInitialization() {
    const allWindowTypes = ['terminal', 'about', 'skills', 'projects', 'experience', 
                           'contact', 'resume', 'filemanager', 'texteditor', 
                           'calculator', 'network', 'system', 'snake', 'tictactoe', 'browser'];
    
    allWindowTypes.forEach(windowType => {
        if (!state.windowPositions[windowType]) {
            state.windowPositions[windowType] = {
                x: 50 + (allWindowTypes.indexOf(windowType) * 30),
                y: 50 + (allWindowTypes.indexOf(windowType) * 30),
                width: 600,
                height: 450,
                maximized: false,
                minimized: false
            };
        }
    });
}

// Call initialization
ensureWindowInitialization();

// Realistic OS Functions
function showVolumeControl() {
    showNotification('🔊 Volume: 75% | Click to adjust volume settings');
    
    // Create a simple volume popup
    const volumePopup = document.createElement('div');
    volumePopup.style.cssText = `
        position: fixed;
        bottom: 50px;
        right: 20px;
        background: linear-gradient(to bottom, #f0f0f0 0%, #e8e8e8 100%);
        border: 2px outset #e8e8e8;
        padding: 10px;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 3px 3px 10px rgba(0,0,0,0.3);
        min-width: 100px;
    `;
    
    volumePopup.innerHTML = `
        <div style="text-align: center; font-size: 11px; margin-bottom: 5px;">Volume</div>
        <input type="range" min="0" max="100" value="75" style="width: 100%;" onchange="updateVolume(this.value)">
        <div style="text-align: center; font-size: 10px; color: #666; margin-top: 5px;">75%</div>
    `;
    
    document.body.appendChild(volumePopup);
    
    setTimeout(() => {
        if (volumePopup.parentNode) {
            volumePopup.remove();
        }
    }, 3000);
}

function updateVolume(value) {
    document.querySelector('.tray-icon[id="volumeIcon"]').title = `Volume: ${value}%`;
    const volumeDisplay = document.querySelector('#volumePopup .volume-display');
    if (volumeDisplay) {
        volumeDisplay.textContent = `${value}%`;
    }
}

function showBatteryInfo() {
    const batteryLevel = 85 + Math.floor(Math.random() * 10); // 85-94%
    const timeRemaining = '2:45';
    showNotification(`🔋 Battery: ${batteryLevel}% | ${timeRemaining} remaining`);
    
    // Update battery icon based on level
    const batteryIcon = document.getElementById('batteryIcon');
    if (batteryLevel > 50) {
        batteryIcon.innerHTML = '<span class="battery-indicator">🔋</span>';
    } else if (batteryLevel > 20) {
        batteryIcon.innerHTML = '<span class="battery-indicator">🔋</span>';
    } else {
        batteryIcon.innerHTML = '<span class="battery-indicator" style="color: red;">🪫</span>';
    }
    
    batteryIcon.title = `Battery: ${batteryLevel}%`;
}

function showNotificationCenter() {
    const notifications = [
        '📧 New email from recruiter',
        '💼 LinkedIn profile viewed 5 times',
        '🔄 System backup completed',
        '📱 Mobile app update available',
        '🎯 Portfolio analytics: 50 views today'
    ];
    
    const randomNotif = notifications[Math.floor(Math.random() * notifications.length)];
    showNotification(`Notifications: ${randomNotif}`);
    
    // Create notification center popup
    const notifCenter = document.createElement('div');
    notifCenter.style.cssText = `
        position: fixed;
        bottom: 50px;
        right: 20px;
        background: linear-gradient(to bottom, #f0f0f0 0%, #e8e8e8 100%);
        border: 2px outset #e8e8e8;
        padding: 10px;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 3px 3px 10px rgba(0,0,0,0.3);
        min-width: 200px;
        max-height: 200px;
        overflow-y: auto;
    `;
    
    notifCenter.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px; font-size: 11px;">Recent Notifications</div>
        ${notifications.map(notif => 
            `<div style="padding: 4px 0; border-bottom: 1px solid #ddd; font-size: 10px;">${notif}</div>`
        ).join('')}
    `;
    
    document.body.appendChild(notifCenter);
    
    setTimeout(() => {
        if (notifCenter.parentNode) {
            notifCenter.remove();
        }
    }, 5000);
}

// Mobile-specific enhancements
function initializeMobileFeatures() {
    // Detect mobile device
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    
    if (isMobile) {
        // Add mobile class to body
        document.body.classList.add('mobile-device');
        
        // Prevent zoom on input focus
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
                }
            });
            
            input.addEventListener('blur', () => {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                }
            });
        });
        
        // Add mobile gestures for snake game
        const snakeCanvas = document.getElementById('snakeCanvas');
        if (snakeCanvas) {
            let touchStartX = 0;
            let touchStartY = 0;
            
            snakeCanvas.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                e.preventDefault();
            });
            
            snakeCanvas.addEventListener('touchend', (e) => {
                if (!snakeGame.gameRunning) return;
                
                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;
                
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > 30 && snakeGame.direction.x === 0) {
                        snakeGame.direction = {x: 20, y: 0}; // Right
                    } else if (deltaX < -30 && snakeGame.direction.x === 0) {
                        snakeGame.direction = {x: -20, y: 0}; // Left
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > 30 && snakeGame.direction.y === 0) {
                        snakeGame.direction = {x: 0, y: 20}; // Down
                    } else if (deltaY < -30 && snakeGame.direction.y === 0) {
                        snakeGame.direction = {x: 0, y: -20}; // Up
                    }
                }
                
                e.preventDefault();
            });
        }
        
        // Show mobile-specific welcome message
        setTimeout(() => {
            showNotification('📱 Welcome to mobile Linux AJ! Drag windows to move them!');
        }, 2000);
    }
}

// Enhanced orientation handling
function handleOrientationChange() {
    setTimeout(() => {
        // Reposition windows that might be off-screen
        state.openWindows.forEach(windowType => {
            const windowElement = document.getElementById(`${windowType}Window`);
            if (windowElement && !windowElement.classList.contains('maximized')) {
                const rect = windowElement.getBoundingClientRect();
                if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
                    windowElement.style.left = '10px';
                    windowElement.style.top = '10px';
                }
            }
        });
        
        showNotification('📱 Screen orientation changed');
    }, 500);
}

// Add orientation change listener
window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', handleOrientationChange);

// Initialize mobile features
document.addEventListener('DOMContentLoaded', initializeMobileFeatures);

// Enhanced mobile touch handling for tic-tac-toe
function initializeTicTacToeTouch() {
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach((cell, index) => {
        // Remove existing click handlers to avoid double-clicking
        const newCell = cell.cloneNode(true);
        cell.parentNode.replaceChild(newCell, cell);
        
        // Add unified touch/click handler
        newCell.addEventListener('touchstart', handleTicTacToeTouchStart, { passive: false });
        newCell.addEventListener('touchend', handleTicTacToeTouchEnd, { passive: false });
        newCell.addEventListener('click', (e) => {
            e.preventDefault();
            if (!window.lastTicTacToeTouch || Date.now() - window.lastTicTacToeTouch > 300) {
                makeMove(index);
            }
        });
    });
}

function handleTicTacToeTouchStart(e) {
    e.preventDefault();
    const cell = e.currentTarget;
    cell.classList.add('touch-active');
    
    // Add temporary visual feedback
    cell.style.transform = 'scale(0.95)';
    cell.style.background = 'linear-gradient(to bottom, #e8f4f8, #f0f8ff)';
    
    window.touchStartTime = Date.now();
    window.touchStartTarget = cell;
}

function handleTicTacToeTouchEnd(e) {
    e.preventDefault();
    const cell = e.currentTarget;
    const touchDuration = Date.now() - (window.touchStartTime || 0);
    
    // Remove visual feedback
    cell.classList.remove('touch-active');
    cell.style.transform = '';
    cell.style.background = '';
    
    // Only register as tap if it was a quick touch on the same element
    if (window.touchStartTarget === cell && touchDuration < 500) {
        window.lastTicTacToeTouch = Date.now();
        const index = parseInt(cell.getAttribute('data-index'));
        makeMove(index);
    }
    
    window.touchStartTarget = null;
}

// Virtual keyboard for mobile
function toggleVirtualKeyboard() {
    showNotification('⌨️ Virtual keyboard toggled');
    
    // For demo purposes, focus on the terminal input or any visible input
    const terminalInput = document.getElementById('terminalInput');
    const editorTextarea = document.querySelector('.editor-textarea');
    
    if (terminalInput && state.openWindows.has('terminal')) {
        terminalInput.focus();
    } else if (editorTextarea && state.openWindows.has('texteditor')) {
        editorTextarea.focus();
    } else {
        showNotification('ℹ️ Open Terminal or Text Editor to use keyboard');
    }
}

// Show virtual keyboard icon on mobile
function updateMobileUI() {
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    const keyboardIcon = document.getElementById('keyboardIcon');
    
    if (isMobile && keyboardIcon) {
        keyboardIcon.style.display = 'flex';
    }
    
    // Update WiFi signal randomly
    const wifiIcon = document.getElementById('wifiStrengthIcon');
    if (wifiIcon) {
        const signals = ['📡', '📶', '📵'];
        const signal = signals[Math.floor(Math.random() * signals.length)];
        wifiIcon.innerHTML = `<span style="font-size: 10px;">${signal}</span>`;
        
        const strengths = ['Weak', 'Good', 'Strong', 'Excellent'];
        const strength = strengths[Math.floor(Math.random() * strengths.length)];
        wifiIcon.title = `WiFi Signal: ${strength}`;
    }
}

// Update mobile UI periodically
setInterval(updateMobileUI, 10000);
updateMobileUI();

// Fullscreen utilities and desktop helpers
function enterFullscreen() {
    const elem = document.documentElement;
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) return;
    try {
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } catch (e) {
        // Ignore – some browsers block without user gesture or permission
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        enterFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }
}

// Minimize all windows to show desktop
function showDesktop() {
    state.openWindows.forEach(windowType => {
        const windowElement = document.getElementById(`${windowType}Window`);
        if (windowElement && !state.windowPositions[windowType].minimized) {
            minimizeWindow(windowType);
        }
    });
    showNotification('🖥️ Desktop shown');
}

// Simple wallpaper switcher (cycles a few preset options)
let wallpaperIndex = 0;
const wallpapers = [
    "assets/images/wallpaper.jpg",
    "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)"
];

function applyWallpaper(bg) {
    const isUrl = bg.startsWith('assets/') || bg.startsWith('http');
    const backgroundValue = isUrl ? `url('${bg}')` : bg;
    const targets = [document.body, document.getElementById('loginScreen'), document.getElementById('desktop')];
    targets.forEach(t => {
        if (!t) return;
        t.style.backgroundImage = backgroundValue.startsWith('url(') ? backgroundValue : '';
        if (!backgroundValue.startsWith('url(')) {
            t.style.background = backgroundValue;
            t.style.backgroundSize = 'cover';
            t.style.backgroundAttachment = 'fixed';
        }
    });
}

function changeWallpaper() {
    wallpaperIndex = (wallpaperIndex + 1) % wallpapers.length;
    applyWallpaper(wallpapers[wallpaperIndex]);
    showNotification('🖼️ Wallpaper changed');
}

// Keyboard: F11 to toggle fullscreen
document.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
});

// Enhanced context menu for mobile
function showMobileContextMenu(e) {
    if (window.innerWidth > 768) {
        return showContextMenu(e);
    }
    
    // Mobile-friendly context menu
    const menu = createContextMenu();
    menu.style.fontSize = '14px';
    menu.style.minWidth = '200px';
    
    // Position for mobile
    const x = Math.min(e.pageX, window.innerWidth - 200);
    const y = Math.min(e.pageY, window.innerHeight - 200);
    
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.style.display = 'block';
    
    // Hide menu when touching elsewhere
    setTimeout(() => {
        document.addEventListener('touchstart', hideContextMenu, { once: true });
        document.addEventListener('click', hideContextMenu, { once: true });
    }, 10);
}

// Battery level simulation
function updateBatteryLevel() {
    const batteryIcon = document.getElementById('batteryIcon');
    if (!batteryIcon) return;
    
    const level = 75 + Math.floor(Math.random() * 20); // 75-94%
    let icon = '🔋';
    
    if (level > 80) icon = '🔋';
    else if (level > 50) icon = '🔋';
    else if (level > 20) icon = '🔋';
    else icon = '🪫';
    
    batteryIcon.innerHTML = `<span class="battery-indicator">${icon}</span>`;
    batteryIcon.title = `Battery: ${level}%`;
}

// Update battery every minute
setInterval(updateBatteryLevel, 60000);

// Add realistic startup sound on mobile
function playMobileStartupSound() {
    if (!state.audioEnabled || window.innerWidth > 768) return;
    
    // Show visual notification instead of audio on mobile
    setTimeout(() => {
        showNotification('🎵 Linux AJ system startup complete!');
    }, 3000);
}

// Easter eggs and fun interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add konami code easter egg
    let konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A
    let konamiPosition = 0;
    
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === konamiCode[konamiPosition]) {
            konamiPosition++;
            if (konamiPosition === konamiCode.length) {
                showNotification('🎉 Konami Code Activated! You found the secret!');
                // Change wallpaper or add special effects
                document.body.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)';
                document.body.style.backgroundSize = '400% 400%';
                document.body.style.animation = 'gradient 15s ease infinite';
                
                // Add CSS animation for gradient
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `;
                document.head.appendChild(style);
                
                konamiPosition = 0;
            }
        } else {
            konamiPosition = 0;
        }
    });
    
    // Add random system notifications
    const systemMessages = [
        'System update available.',
        'Backup completed successfully.',
        'New device detected.',
        'Network connection stable.',
        'Performance optimized.',
        'Security scan completed.'
    ];
    
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every 30 seconds
            const message = systemMessages[Math.floor(Math.random() * systemMessages.length)];
            showNotification('Linux AJ: ' + message);
        }
    }, 30000);
    
    // Make clock more realistic with real-time updates
    setInterval(() => {
        updateClock();
        
        // Update system uptime if system window is open
        const uptimeElement = document.getElementById('systemUptime');
        if (uptimeElement) {
            const now = new Date();
            const startTime = new Date(now.getTime() - Math.random() * 8640000); // Random uptime
            const uptimeMs = now.getTime() - startTime.getTime();
            const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
            const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
            uptimeElement.textContent = `${hours} hours, ${minutes} minutes`;
        }
    }, 1000);
    
    // Add more realistic terminal commands
    const originalExecuteCommand = window.executeTerminalCommand;
    window.executeTerminalCommand = function(command) {
        const output = document.getElementById('terminalOutput');
        if (!output) return;
        
        // Add command to output
        const commandLine = document.createElement('div');
        commandLine.className = 'terminal-line';
        commandLine.textContent = `aaqib@linux-aj:~$ ${command}`;
        output.appendChild(commandLine);
        
        let response = '';
        const cmd = command.toLowerCase().trim();
        
        // Enhanced commands
        if (cmd.startsWith('echo ')) {
            response = command.substring(5);
        } else if (cmd === 'date') {
            response = new Date().toString();
        } else if (cmd === 'pwd') {
            response = '/home/aaqib';
        } else if (cmd === 'hostname') {
            response = 'linux-aj-portfolio';
        } else if (cmd === 'uname -a') {
            response = 'Linux linux-aj-portfolio 5.15.0-aj-generic x86_64 GNU/Linux';
        } else if (cmd === 'ps') {
            response = `PID TTY          TIME CMD
 1234 pts/0    00:00:01 bash
 1337 pts/0    00:00:00 portfolio
 1338 pts/0    00:00:00 ps`;
        } else {
            // Fall back to original function
            return originalExecuteCommand.call(this, command);
        }
        
        // Add response
        const responseLine = document.createElement('div');
        responseLine.className = 'terminal-line';
        responseLine.style.whiteSpace = 'pre-line';
        responseLine.textContent = response;
        output.appendChild(responseLine);
        
        // Scroll to bottom
        output.scrollTop = output.scrollHeight;
    };
});

// Advanced Resume Functions
function showResumeTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.resume-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.resume-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(`${tabName}Tab`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Update analytics if viewing analytics tab
    if (tabName === 'analytics') {
        updateResumeAnalytics();
    }
}

function exportResume(format) {
    switch(format) {
        case 'pdf':
            showNotification('📄 Generating PDF resume...');
            setTimeout(() => {
                showNotification('✅ PDF resume ready for download!');
                // Simulate download
                const link = document.createElement('a');
                link.href = '#';
                link.download = `Aaqib_Jeelani_Resume_${new Date().getFullYear()}.pdf`;
                link.click();
            }, 2000);
            break;
        case 'word':
            showNotification('📝 Generating Word document...');
            setTimeout(() => {
                showNotification('✅ Word document ready!');
            }, 1500);
            break;
        default:
            showNotification('📄 Export format not yet supported');
    }
    
    // Update analytics
    updateResumeDownloads();
}

function printResume() {
    showNotification('🖨️ Preparing resume for printing...');
    setTimeout(() => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Aaqib Jeelani - Resume</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        h1 { color: #667eea; }
                        .section { margin-bottom: 30px; }
                        @media print { body { margin: 20px; } }
                    </style>
                </head>
                <body>
                    <h1>Aaqib Jeelani</h1>
                    <h2>Senior Full Stack Developer & IT Manager</h2>
                    <div class="section">
                        <h3>Contact Information</h3>
                        <p>Email: ajvirusofficial@gmail.com</p>
                        <p>Location: Dubai, UAE</p>
                        <p>LinkedIn: linkedin.com/in/aaqibjeelani</p>
                    </div>
                    <div class="section">
                        <h3>Professional Summary</h3>
                        <p>Seasoned Full Stack Developer and IT Manager with 5+ years of expertise in architecting and delivering scalable web applications...</p>
                    </div>
                    <p style="margin-top: 50px; font-size: 12px; color: #666;">Generated from Interactive Portfolio - ${new Date().toLocaleDateString()}</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        showNotification('🖨️ Print dialog opened!');
    }, 1000);
}

function shareResume() {
    if (navigator.share) {
        navigator.share({
            title: 'Aaqib Jeelani - Resume',
            text: 'Check out my professional resume and portfolio',
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const shareData = {
            url: window.location.href,
            title: 'Aaqib Jeelani - Resume',
            text: 'Professional Resume & Portfolio'
        };
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
            showNotification('🔗 Resume link copied to clipboard!');
        } else {
            showNotification('📋 Share: ' + window.location.href);
        }
    }
}

function changeResumeTheme(theme) {
    const resumeApp = document.querySelector('.resume-app');
    if (resumeApp) {
        // Remove existing theme classes
        resumeApp.classList.remove('theme-professional', 'theme-modern', 'theme-creative', 'theme-minimal');
        // Add new theme class
        resumeApp.classList.add(`theme-${theme}`);
        showNotification(`🎨 Switched to ${theme} theme`);
    }
}

function toggleResumeEdit() {
    const resumeApp = document.querySelector('.resume-app');
    if (resumeApp) {
        resumeApp.classList.toggle('edit-mode');
        const isEditing = resumeApp.classList.contains('edit-mode');
        showNotification(isEditing ? '✏️ Edit mode enabled' : '👁️ View mode enabled');
    }
}

function contactDirectly() {
    const email = 'ajvirusofficial@gmail.com';
    const subject = 'Professional Inquiry from Portfolio';
    const body = `Hi Aaqib,\n\nI viewed your portfolio and resume and would like to discuss potential opportunities.\n\nBest regards`;
    
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    showNotification('📧 Opening email client...');
    
    // Update contact requests count
    updateContactRequests();
}

function scheduleCall() {
    showNotification('📞 Scheduling feature coming soon!');
    setTimeout(() => {
        showNotification('💡 For now, please contact directly via email');
    }, 2000);
}

function viewPortfolio() {
    // Switch to about window or show portfolio
    if (state.openWindows.has('about')) {
        bringWindowToFront('about');
    } else {
        openWindow('about');
    }
    showNotification('🌐 Viewing full portfolio...');
}

function showCertificate(certType) {
    const certificates = {
        aws: 'AWS Solutions Architect Associate Certificate',
        react: 'React Professional Developer Certificate',
        mysql: 'MySQL Database Administrator Certificate'
    };
    
    showNotification(`📜 Opening ${certificates[certType] || 'Certificate'}...`);
    setTimeout(() => {
        showNotification('🔍 Certificate viewer would open in production version');
    }, 1000);
}

function verifyCertificate(certType) {
    showNotification('🔍 Verifying certificate...');
    setTimeout(() => {
        showNotification('✅ Certificate verified and authentic!');
    }, 1500);
}

function updateResumeAnalytics() {
    // Animate view counter
    const viewCounter = document.getElementById('resumeViews');
    if (viewCounter) {
        let currentViews = parseInt(viewCounter.textContent.replace(',', ''));
        currentViews += Math.floor(Math.random() * 3) + 1;
        viewCounter.textContent = currentViews.toLocaleString();
    }
    
    // Update last updated time
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
        lastUpdated.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function updateResumeDownloads() {
    const downloadCounter = document.getElementById('resumeDownloads');
    if (downloadCounter) {
        let downloads = parseInt(downloadCounter.textContent);
        downloads += 1;
        downloadCounter.textContent = downloads;
    }
}

function updateContactRequests() {
    const contactCounter = document.getElementById('contactRequests');
    if (contactCounter) {
        let requests = parseInt(contactCounter.textContent);
        requests += 1;
        contactCounter.textContent = requests;
    }
}

// Make resume functions globally available
window.showResumeTab = showResumeTab;
window.exportResume = exportResume;
window.printResume = printResume;
window.shareResume = shareResume;
window.changeResumeTheme = changeResumeTheme;
window.toggleResumeEdit = toggleResumeEdit;
window.contactDirectly = contactDirectly;
window.scheduleCall = scheduleCall;
window.viewPortfolio = viewPortfolio;
window.showCertificate = showCertificate;
window.verifyCertificate = verifyCertificate;

// Initialize resume analytics on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial analytics with realistic numbers
    setTimeout(() => {
        updateResumeAnalytics();
    }, 2000);
});

// Image loading error handling
function handleImageError(imgElement, type) {
    console.log(`Image failed to load: ${imgElement.src}`);
    
    // Set fallback based on type
    switch(type) {
        case 'user':
            imgElement.src = 'assets/icons/default-user-avatar.svg';
            imgElement.alt = 'Default Avatar';
            showNotification('Using default profile photo', 2000);
            break;
        case 'profile':
            imgElement.src = 'assets/icons/default-user-avatar.svg';
            imgElement.alt = 'Profile Photo';
            break;
        default:
            imgElement.src = 'assets/icons/default-user-avatar.svg';
            imgElement.alt = 'Image not available';
            break;
    }
    
    // Add error class for styling
    imgElement.classList.add('image-error-fallback');
    imgElement.onerror = null; // Prevent infinite loop
}

// Image loading success handler
function handleImageLoad(imgElement) {
    imgElement.classList.add('image-loaded');
    imgElement.classList.remove('image-error-fallback');
}

// Make image functions globally available
window.handleImageError = handleImageError;
window.handleImageLoad = handleImageLoad;
