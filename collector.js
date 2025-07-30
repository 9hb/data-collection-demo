class DataCollector {
    constructor() {
        this.collectedData = {};
        this.behaviorData = {
            keystrokes: [],
            clicks: [],
            scrolls: [],
            focus: [],
            mouseSpeed: []
        };
        this.init();
    }

    init() {
        document.getElementById('collect-btn').addEventListener('click', () => this.collectAllData());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearData());
        
        this.collectPassiveData();
        this.setupBehaviorTracking();
        this.collectSystemInfo();
        this.collectAdvancedFingerprinting();
    }

    collectPassiveData() {
        this.collectBrowserInfo();
        this.collectScreenInfo();
        this.collectLocationInfo();
        this.trackMouseMovement();
        this.collectDateTimeInfo();
        this.collectLanguageInfo();
        this.collectMediaDevices();
        this.collectPermissions();
        this.collectBatteryInfo();
        this.collectMemoryInfo();
        this.collectCPUInfo();
    }

    collectBrowserInfo() {
        this.collectedData.browser = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            vendor: navigator.vendor,
            vendorSub: navigator.vendorSub,
            product: navigator.product,
            productSub: navigator.productSub,
            appName: navigator.appName,
            appVersion: navigator.appVersion,
            appCodeName: navigator.appCodeName,
            buildID: navigator.buildID,
            oscpu: navigator.oscpu,
            plugins: Array.from(navigator.plugins).map(p => ({
                name: p.name,
                description: p.description,
                filename: p.filename,
                version: p.version
            })),
            mimeTypes: Array.from(navigator.mimeTypes).map(m => ({
                type: m.type,
                description: m.description,
                suffixes: m.suffixes
            })),
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            taintEnabled: navigator.taintEnabled ? navigator.taintEnabled() : false,
            doNotTrack: navigator.doNotTrack,
            globalPrivacyControl: navigator.globalPrivacyControl,
            pdfViewerEnabled: navigator.pdfViewerEnabled
        };
    }

    collectScreenInfo() {
        this.collectedData.screen = {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            orientation: screen.orientation ? screen.orientation.type : 'unknown'
        };
    }

    collectLocationInfo() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.collectedData.location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    this.updateDisplay();
                },
                () => {
                    this.collectedData.location = 'denied';
                }
            );
        }
    }

    trackMouseMovement() {
        let mouseData = [];
        document.addEventListener('mousemove', (e) => {
            mouseData.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now()
            });
            
            if (mouseData.length > 50) {
                mouseData = mouseData.slice(-50);
            }
        });
        
        this.collectedData.mouseTracking = mouseData;
    }

    collectDateTimeInfo() {
        const now = new Date();
        this.collectedData.dateTime = {
            timestamp: now.getTime(),
            utcString: now.toUTCString(),
            isoString: now.toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: now.getTimezoneOffset(),
            locale: Intl.DateTimeFormat().resolvedOptions().locale,
            calendar: Intl.DateTimeFormat().resolvedOptions().calendar,
            numberingSystem: Intl.DateTimeFormat().resolvedOptions().numberingSystem
        };
    }

    collectLanguageInfo() {
        this.collectedData.languages = {
            navigator: navigator.languages,
            primary: navigator.language,
            system: Intl.DateTimeFormat().resolvedOptions().locale,
            collation: new Intl.Collator().resolvedOptions(),
            numberFormat: new Intl.NumberFormat().resolvedOptions(),
            pluralRules: new Intl.PluralRules().resolvedOptions()
        };
    }

    async collectMediaDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.collectedData.mediaDevices = {
                devices: devices.map(device => ({
                    kind: device.kind,
                    label: device.label,
                    deviceId: device.deviceId,
                    groupId: device.groupId
                })),
                capabilities: {}
            };

            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({video: true});
                const videoTrack = videoStream.getVideoTracks()[0];
                this.collectedData.mediaDevices.capabilities.video = videoTrack.getCapabilities();
                videoStream.getTracks().forEach(track => track.stop());
            } catch (e) {}

            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({audio: true});
                const audioTrack = audioStream.getAudioTracks()[0];
                this.collectedData.mediaDevices.capabilities.audio = audioTrack.getCapabilities();
                audioStream.getTracks().forEach(track => track.stop());
            } catch (e) {}

        } catch (e) {
            this.collectedData.mediaDevices = 'access_denied';
        }
    }

    async collectPermissions() {
        const permissions = ['camera', 'microphone', 'geolocation', 'notifications', 'persistent-storage', 'push', 'midi', 'clipboard-read', 'clipboard-write'];
        this.collectedData.permissions = {};
        
        for (const permission of permissions) {
            try {
                const result = await navigator.permissions.query({name: permission});
                this.collectedData.permissions[permission] = result.state;
            } catch (e) {
                this.collectedData.permissions[permission] = 'unknown';
            }
        }
    }

    async collectBatteryInfo() {
        try {
            const battery = await navigator.getBattery();
            this.collectedData.battery = {
                charging: battery.charging,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime,
                level: battery.level
            };
        } catch (e) {
            this.collectedData.battery = 'not_available';
        }
    }

    collectMemoryInfo() {
        this.collectedData.memory = {
            deviceMemory: navigator.deviceMemory,
            jsHeapSizeLimit: performance.memory?.jsHeapSizeLimit,
            totalJSHeapSize: performance.memory?.totalJSHeapSize,
            usedJSHeapSize: performance.memory?.usedJSHeapSize
        };
    }

    collectCPUInfo() {
        this.collectedData.cpu = {
            hardwareConcurrency: navigator.hardwareConcurrency,
            performanceEntries: performance.getEntries().slice(0, 10),
            timing: performance.timing
        };
    }

    setupBehaviorTracking() {
        document.addEventListener('keydown', (e) => {
            this.behaviorData.keystrokes.push({
                key: e.key,
                code: e.code,
                timestamp: Date.now(),
                ctrlKey: e.ctrlKey,
                altKey: e.altKey,
                shiftKey: e.shiftKey
            });
        });

        // Click tracking
        document.addEventListener('click', (e) => {
            this.behaviorData.clicks.push({
                x: e.clientX,
                y: e.clientY,
                button: e.button,
                timestamp: Date.now(),
                target: e.target.tagName
            });
        });

        document.addEventListener('scroll', (e) => {
            this.behaviorData.scrolls.push({
                scrollX: window.scrollX,
                scrollY: window.scrollY,
                timestamp: Date.now()
            });
        });

        window.addEventListener('focus', () => {
            this.behaviorData.focus.push({type: 'focus', timestamp: Date.now()});
        });
        
        window.addEventListener('blur', () => {
            this.behaviorData.focus.push({type: 'blur', timestamp: Date.now()});
        });

        let lastMousePos = {x: 0, y: 0, time: Date.now()};
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            const distance = Math.sqrt(Math.pow(e.clientX - lastMousePos.x, 2) + Math.pow(e.clientY - lastMousePos.y, 2));
            const time = now - lastMousePos.time;
            const speed = distance / time;
            
            this.behaviorData.mouseSpeed.push({
                speed: speed,
                timestamp: now
            });
            
            lastMousePos = {x: e.clientX, y: e.clientY, time: now};
        });
    }

    collectSystemInfo() {
        this.collectedData.system = {
            windowSize: {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight
            },
            documentSize: {
                clientWidth: document.documentElement.clientWidth,
                clientHeight: document.documentElement.clientHeight,
                scrollWidth: document.documentElement.scrollWidth,
                scrollHeight: document.documentElement.scrollHeight
            },
            windowFeatures: {
                toolbar: window.toolbar?.visible,
                menubar: window.menubar?.visible,
                personalbar: window.personalbar?.visible,
                statusbar: window.statusbar?.visible,
                scrollbars: window.scrollbars?.visible
            },
            history: history.length,
            localStorage: this.getStorageSize('localStorage'),
            sessionStorage: this.getStorageSize('sessionStorage')
        };
    }

    getStorageSize(storage) {
        try {
            let total = 0;
            for (let key in window[storage]) {
                if (window[storage].hasOwnProperty(key)) {
                    total += window[storage][key].length + key.length;
                }
            }
            return total;
        } catch (e) {
            return 'unavailable';
        }
    }

    collectAdvancedFingerprinting() {
        this.collectedData.fingerprinting = {
            fonts: this.getFonts(),
            audioContext: this.getAudioFingerprint(),
            webRTC: this.getWebRTCFingerprint(),
            css: this.getCSSFeatures(),
            apis: this.getAvailableAPIs()
        };
    }

    getFonts() {
        const testFonts = ['Arial', 'Helvetica', 'Times', 'Courier', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact'];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const testString = 'mmmmmmmmmmlli';
        const testSize = '72px';
        const h = {};
        const s = {};

        for (let i = 0, l = baseFonts.length; i < l; i++) {
            ctx.font = testSize + ' ' + baseFonts[i];
            s[baseFonts[i]] = ctx.measureText(testString).width;
            h[baseFonts[i]] = ctx.measureText(testString).height;
        }

        const fonts = [];
        for (let i = 0, l = testFonts.length; i < l; i++) {
            let detected = false;
            for (let j = 0, k = baseFonts.length; j < k; j++) {
                ctx.font = testSize + ' ' + testFonts[i] + ',' + baseFonts[j];
                const matched = (ctx.measureText(testString).width !== s[baseFonts[j]] || ctx.measureText(testString).height !== h[baseFonts[j]]);
                detected = detected || matched;
            }
            if (detected) {
                fonts.push(testFonts[i]);
            }
        }
        return fonts;
    }

    getAudioFingerprint() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const analyser = audioCtx.createAnalyser();
            const gain = audioCtx.createGain();
            const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);

            gain.gain.value = 0;
            oscillator.type = 'triangle';
            oscillator.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(gain);
            gain.connect(audioCtx.destination);
            oscillator.start(0);

            return {
                sampleRate: audioCtx.sampleRate,
                maxChannelCount: audioCtx.destination.maxChannelCount,
                numberOfInputs: audioCtx.destination.numberOfInputs,
                numberOfOutputs: audioCtx.destination.numberOfOutputs,
                channelCount: audioCtx.destination.channelCount
            };
        } catch (e) {
            return 'not_available';
        }
    }

    async getWebRTCFingerprint() {
        try {
            const pc = new RTCPeerConnection();
            const offer = await pc.createOffer();
            return {
                sdp: offer.sdp,
                iceServers: pc.getConfiguration().iceServers
            };
        } catch (e) {
            return 'not_available';
        }
    }

    getCSSFeatures() {
        const features = {};
        const testElement = document.createElement('div');
        const properties = ['transform', 'transition', 'animation', 'filter', 'backdrop-filter', 'grid', 'flex'];
        
        properties.forEach(prop => {
            features[prop] = CSS.supports(prop, 'initial');
        });
        
        return features;
    }

    getAvailableAPIs() {
        const apis = [
            'fetch', 'XMLHttpRequest', 'WebSocket', 'Worker', 'SharedWorker', 'ServiceWorker',
            'IndexedDB', 'WebSQL', 'FileReader', 'Blob', 'FormData', 'URLSearchParams',
            'Notification', 'PushManager', 'Vibration', 'GamepadAPI', 'WebVR', 'WebXR',
            'SpeechRecognition', 'SpeechSynthesis', 'Geolocation', 'DeviceMotion',
            'DeviceOrientation', 'AmbientLight', 'Proximity', 'Battery', 'NetworkInformation'
        ];
        
        const available = {};
        apis.forEach(api => {
            available[api] = this.checkAPI(api);
        });
        
        return available;
    }

    checkAPI(api) {
        switch(api) {
            case 'fetch': return typeof fetch !== 'undefined';
            case 'XMLHttpRequest': return typeof XMLHttpRequest !== 'undefined';
            case 'WebSocket': return typeof WebSocket !== 'undefined';
            case 'Worker': return typeof Worker !== 'undefined';
            case 'SharedWorker': return typeof SharedWorker !== 'undefined';
            case 'ServiceWorker': return 'serviceWorker' in navigator;
            case 'IndexedDB': return 'indexedDB' in window;
            case 'WebSQL': return 'openDatabase' in window;
            case 'Notification': return 'Notification' in window;
            case 'PushManager': return 'PushManager' in window;
            case 'Vibration': return 'vibrate' in navigator;
            case 'Geolocation': return 'geolocation' in navigator;
            case 'DeviceMotion': return 'DeviceMotionEvent' in window;
            case 'DeviceOrientation': return 'DeviceOrientationEvent' in window;
            case 'Battery': return 'getBattery' in navigator;
            case 'NetworkInformation': return 'connection' in navigator;
            case 'SpeechRecognition': return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
            case 'SpeechSynthesis': return 'speechSynthesis' in window;
            default: return false;
        }
    }

    collectAllData() {
        this.collectDeviceInfo();
        this.collectNetworkInfo();
        this.collectStorageInfo();
        this.createTrackingCookies();
        this.fingerprintCanvas();
        this.collectBehaviorData();
        this.collectPerformanceData();
        this.collectWebGLData();
        this.updateDisplay();
    }

    collectDeviceInfo() {
        this.collectedData.device = {
            deviceMemory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency,
            maxTouchPoints: navigator.maxTouchPoints,
            webdriver: navigator.webdriver
        };
    }

    collectNetworkInfo() {
        this.collectedData.network = {
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : 'unknown',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    collectStorageInfo() {
        this.collectedData.storage = {
            localStorage: typeof(Storage) !== "undefined",
            sessionStorage: typeof(Storage) !== "undefined",
            indexedDB: !!window.indexedDB,
            webSQL: !!window.openDatabase
        };
        
        // Test storage quota
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(estimate => {
                this.collectedData.storage.quota = estimate.quota;
                this.collectedData.storage.usage = estimate.usage;
            });
        }
    }

    createTrackingCookies() {
        const userId = this.generateUserId();
        const sessionId = this.generateSessionId();
        
        // Different types of cookies
        document.cookie = `user_id=${userId}; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}; path=/`;
        document.cookie = `session_id=${sessionId}; path=/`;
        document.cookie = `last_visit=${new Date().toISOString()}; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}; path=/`;
        
        this.collectedData.cookies = {
            userId,
            sessionId,
            allCookies: document.cookie
        };
    }

    fingerprintCanvas() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Canvas fingerprint test 👀 👀 👀', 2, 2);
        
        this.collectedData.fingerprint = {
            canvas: canvas.toDataURL(),
            webgl: this.getWebGLFingerprint()
        };
    }

    getWebGLFingerprint() {
        const gl = document.createElement('canvas').getContext('webgl');
        if (!gl) return 'not supported';
        
        return {
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            version: gl.getParameter(gl.VERSION)
        };
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9);
    }

    collectBehaviorData() {
        this.collectedData.behavior = {
            ...this.behaviorData,
            timeSpent: Date.now() - this.startTime,
            pageVisibility: document.visibilityState,
            referrer: document.referrer,
            currentURL: window.location.href
        };
    }

    collectPerformanceData() {
        this.collectedData.performance = {
            navigation: performance.navigation,
            timing: performance.timing,
            memory: performance.memory,
            entries: performance.getEntries(),
            timeOrigin: performance.timeOrigin,
            now: performance.now()
        };
    }

    collectWebGLData() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            this.collectedData.webglExtended = {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                extensions: gl.getSupportedExtensions(),
                parameters: this.getWebGLParameters(gl)
            };
        }
    }

    getWebGLParameters(gl) {
        const parameters = {};
        const params = [
            'MAX_TEXTURE_SIZE', 'MAX_VERTEX_ATTRIBS', 'MAX_VERTEX_UNIFORM_VECTORS',
            'MAX_VARYING_VECTORS', 'MAX_FRAGMENT_UNIFORM_VECTORS', 'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
            'MAX_TEXTURE_IMAGE_UNITS', 'MAX_COMBINED_TEXTURE_IMAGE_UNITS', 'MAX_CUBE_MAP_TEXTURE_SIZE',
            'MAX_RENDERBUFFER_SIZE', 'MAX_VIEWPORT_DIMS', 'ALIASED_LINE_WIDTH_RANGE',
            'ALIASED_POINT_SIZE_RANGE', 'RED_BITS', 'GREEN_BITS', 'BLUE_BITS', 'ALPHA_BITS',
            'DEPTH_BITS', 'STENCIL_BITS'
        ];
        
        params.forEach(param => {
            try {
                parameters[param] = gl.getParameter(gl[param]);
            } catch (e) {}
        });
        
        return parameters;
    }

    updateDisplay() {
        const output = {
            ...this.collectedData,
            behavior: this.behaviorData
        };
        document.getElementById('data-output').textContent = JSON.stringify(output, null, 2);
    }

    clearData() {
        this.collectedData = {};
        this.behaviorData = {
            keystrokes: [],
            clicks: [],
            scrolls: [],
            focus: [],
            mouseSpeed: []
        };
        document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
        this.updateDisplay();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new DataCollector();
});
