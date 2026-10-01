// Chase Geer Mod - Auto Farm Edition (No Player Shooting)
(function() {
    "use strict";

    console.log('🚀 Chase Geer Mod - Auto Farm Edition');

    // ========== CREATE MENU ==========
    function createMenu() {
        const oldMenu = document.getElementById('chaseGeerMenu');
        if (oldMenu) oldMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'chaseGeerMenu';
        menu.style.cssText = `
            position: fixed !important;
            top: 10px !important;
            left: 10px !important;
            z-index: 9999999 !important;
            background: rgba(0,0,0,0.95) !important;
            border: 2px solid #ffd700 !important;
            border-radius: 12px !important;
            padding: 15px 20px !important;
            color: white !important;
            font-family: Arial, sans-serif !important;
            font-size: 13px !important;
            min-width: 200px !important;
            user-select: none !important;
            pointer-events: auto !important;
            box-shadow: 0 0 30px rgba(255,215,0,0.3) !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
        `;

        menu.innerHTML = `
            <div style="color:#ffd700;font-weight:bold;font-size:16px;margin-bottom:10px;">⚡ CHASE GEER</div>
            
            <div style="margin-bottom:8px;border-bottom:1px solid #333;padding-bottom:8px;">
                <div style="color:#aaa;font-size:11px;margin-bottom:4px;">🎯 FARM TARGET</div>
                <select id="cgTarget" style="width:100%;padding:4px;background:#222;color:#fff;border:1px solid #444;border-radius:4px;">
                    <option value="all" selected>🎯 All Items</option>
                    <option value="squares">⬜ Squares</option>
                    <option value="triangles">🔺 Triangles</option>
                    <option value="hexagons">⬡ Hexagons</option>
                </select>
            </div>
            
            <label style="display:block;margin:5px 0;cursor:pointer;color:#fff;">
                <input type="checkbox" id="cgAimbot" style="margin-right:8px;" checked> 🎯 Auto-Farm
            </label>
            <label style="display:block;margin:5px 0;cursor:pointer;color:#fff;">
                <input type="checkbox" id="cgSpinner" style="margin-right:8px;"> 🌀 Spinner
            </label>
            <label style="display:block;margin:5px 0;cursor:pointer;color:#fff;">
                <input type="checkbox" id="cgPaths" style="margin-right:8px;"> 📐 Show Targets
            </label>
            
            <div style="margin-top:10px;padding-top:8px;border-top:1px solid #333;font-size:11px;color:#666;">
                <span id="cgStatus">● Inactive</span>
                <span style="float:right;" id="cgDebug">Ready</span>
            </div>
        `;

        document.body.appendChild(menu);
        console.log('✅ Menu created!');
        return menu;
    }

    // Create menu
    let menu = null;
    try {
        menu = createMenu();
    } catch(e) {
        setTimeout(() => { menu = createMenu(); }, 1000);
    }

    // ========== GET ELEMENTS ==========
    function getElements() {
        const aimbot = document.getElementById('cgAimbot');
        const spinner = document.getElementById('cgSpinner');
        const paths = document.getElementById('cgPaths');
        const target = document.getElementById('cgTarget');
        const status = document.getElementById('cgStatus');
        const debug = document.getElementById('cgDebug');
        
        if (!aimbot || !spinner || !paths || !target || !status) {
            setTimeout(getElements, 500);
            return null;
        }
        
        return { aimbot, spinner, paths, target, status, debug };
    }

    let elements = null;
    setTimeout(() => {
        elements = getElements();
        if (elements) {
            console.log('✅ Elements found!');
            elements.aimbot.addEventListener('change', updateStatus);
            elements.spinner.addEventListener('change', updateStatus);
            elements.paths.addEventListener('change', updateStatus);
            elements.target.addEventListener('change', () => {
                console.log('🎯 Target changed to:', elements.target.value);
                updateStatus();
            });
            updateStatus();
        }
    }, 1000);

    function updateStatus() {
        if (!elements) return;
        const active = elements.aimbot.checked || elements.spinner.checked || elements.paths.checked;
        elements.status.textContent = active ? '🟢 Active' : '⚫ Inactive';
        elements.status.style.color = active ? '#4caf50' : '#666';
    }

    // ========== SIMULATE MOUSE ==========
    function moveMouse(x, y) {
        const event = new MouseEvent('mousemove', {
            clientX: x,
            clientY: y,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    function clickMouse(x, y) {
        const downEvent = new MouseEvent('mousedown', {
            clientX: x,
            clientY: y,
            button: 0,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(downEvent);
        
        setTimeout(() => {
            const upEvent = new MouseEvent('mouseup', {
                clientX: x,
                clientY: y,
                button: 0,
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(upEvent);
        }, 10);
    }

    // ========== DETECT ITEMS (AVOID PLAYER COLOR) ==========
    function detectItems() {
        const canvas = document.querySelector('canvas');
        if (!canvas) return { squares: [], triangles: [], hexagons: [] };
        
        const objects = { squares: [], triangles: [], hexagons: [] };
        
        try {
            const ctx = canvas.getContext('2d');
            const step = 3;
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = data.data;
            
            // Player color: rgba(241, 78, 84) = rgb(241, 78, 84)
            // Allow a tolerance range around it
            const PLAYER_R_MIN = 230;
            const PLAYER_R_MAX = 255;
            const PLAYER_G_MIN = 65;
            const PLAYER_G_MAX = 95;
            const PLAYER_B_MIN = 70;
            const PLAYER_B_MAX = 100;
            
            for (let y = 0; y < canvas.height; y += step) {
                for (let x = 0; x < canvas.width; x += step) {
                    const i = (y * canvas.width + x) * 4;
                    const r = pixels[i];
                    const g = pixels[i+1];
                    const b = pixels[i+2];
                    
                    // CHECK IF IT'S THE PLAYER COLOR (AVOID THIS!)
                    const isPlayerColor = (r >= PLAYER_R_MIN && r <= PLAYER_R_MAX &&
                                          g >= PLAYER_G_MIN && g <= PLAYER_G_MAX &&
                                          b >= PLAYER_B_MIN && b <= PLAYER_B_MAX);
                    
                    // If it's the player color, skip it entirely
                    if (isPlayerColor) continue;
                    
                    // RED TRIANGLES - Must have shape-like properties
                    const isTriangle = (r > 150 && g > 50 && g < 130 && b < 130 && b > 30);
                    
                    // HEXAGONS - Blue/Purple
                    const isHexagon = (r < 130 && g < 130 && b > 180);
                    
                    // SQUARES - Yellow/Gold
                    const isSquare = (r > 180 && g > 180 && b < 120 && g > 150);
                    
                    // Also check if it's a dark red (could be player)
                    const isDarkRed = (r > 150 && g < 80 && b < 80);
                    
                    // Only add if NOT a player color and NOT dark red
                    if (isSquare && !isDarkRed) {
                        objects.squares.push({ x, y, type: 'square' });
                    }
                    else if (isTriangle && !isDarkRed) {
                        objects.triangles.push({ x, y, type: 'triangle' });
                    }
                    else if (isHexagon && !isDarkRed) {
                        objects.hexagons.push({ x, y, type: 'hexagon' });
                    }
                }
            }
        } catch(e) {}
        
        return objects;
    }

    // ========== FIND NEAREST ITEM ==========
    function findNearestItem() {
        if (!elements) return null;
        
        const canvas = document.querySelector('canvas');
        if (!canvas) return null;
        
        const targetType = elements.target.value;
        const objects = detectItems();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        let targets = [];
        
        if (targetType === 'all' || targetType === 'squares') {
            targets = targets.concat(objects.squares);
        }
        if (targetType === 'all' || targetType === 'triangles') {
            targets = targets.concat(objects.triangles);
        }
        if (targetType === 'all' || targetType === 'hexagons') {
            targets = targets.concat(objects.hexagons);
        }
        
        if (targets.length === 0) return null;
        
        // Find nearest
        let nearest = null;
        let nearestDist = Infinity;
        
        for (const target of targets) {
            const dx = target.x - centerX;
            const dy = target.y - centerY;
            const dist = dx*dx + dy*dy;
            if (dist < nearestDist && dist > 100) {
                nearestDist = dist;
                nearest = target;
            }
        }
        
        return nearest;
    }

    // ========== DRAW TARGET INDICATORS ==========
    function drawTargets() {
        let overlay = document.getElementById('cgPathOverlay');
        if (!overlay) {
            overlay = document.createElement('canvas');
            overlay.id = 'cgPathOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 99998;
                width: 100%;
                height: 100%;
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.width = window.innerWidth;
        overlay.height = window.innerHeight;
        const ctx2 = overlay.getContext('2d');
        ctx2.clearRect(0, 0, overlay.width, overlay.height);
        
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // Find nearest target
        const target = findNearestItem();
        if (target) {
            const screenX = rect.left + (target.x / scaleX);
            const screenY = rect.top + (target.y / scaleY);
            
            // Get color based on type
            let color = 'rgba(255, 215, 0, 0.8)';
            if (target.type === 'square') color = 'rgba(255, 215, 0, 0.8)';
            else if (target.type === 'triangle') color = 'rgba(255, 50, 50, 0.8)';
            else if (target.type === 'hexagon') color = 'rgba(50, 100, 255, 0.8)';
            
            // Target circle
            ctx2.beginPath();
            ctx2.arc(screenX, screenY, 20, 0, Math.PI * 2);
            ctx2.strokeStyle = color;
            ctx2.lineWidth = 2;
            ctx2.stroke();
            
            // Crosshair
            ctx2.beginPath();
            ctx2.moveTo(screenX - 25, screenY);
            ctx2.lineTo(screenX + 25, screenY);
            ctx2.moveTo(screenX, screenY - 25);
            ctx2.lineTo(screenX, screenY + 25);
            ctx2.strokeStyle = color.replace('0.8', '0.5');
            ctx2.lineWidth = 1;
            ctx2.stroke();
            
            // Line from player to target
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            ctx2.beginPath();
            ctx2.strokeStyle = 'rgba(255, 215, 0, 0.2)';
            ctx2.lineWidth = 1;
            ctx2.setLineDash([5, 5]);
            ctx2.moveTo(cx, cy);
            ctx2.lineTo(screenX, screenY);
            ctx2.stroke();
            ctx2.setLineDash([]);
            
            // Show target type
            ctx2.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx2.font = '12px Arial';
            ctx2.fillText(target.type.toUpperCase(), screenX + 25, screenY + 5);
        }
        
        if (elements && elements.debug) {
            const targetType = elements.target.value;
            const label = targetType === 'all' ? '🎯 All' :
                         targetType === 'squares' ? '⬜ Squares' :
                         targetType === 'triangles' ? '🔺 Triangles' : '⬡ Hexagons';
            elements.debug.textContent = target ? `${label} ✓` : `${label} ...`;
        }
    }

    // ========== MAIN LOOP ==========
    let frameCount = 0;
    let spinnerAngle = 0;

    setInterval(() => {
        frameCount++;
        
        if (!elements) return;
        
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        // ===== AUTO-FARM (AIMBOT) =====
        if (elements.aimbot && elements.aimbot.checked) {
            if (frameCount % 2 === 0) {
                const target = findNearestItem();
                if (target) {
                    const rect = canvas.getBoundingClientRect();
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;
                    const screenX = rect.left + (target.x / scaleX);
                    const screenY = rect.top + (target.y / scaleY);
                    moveMouse(screenX, screenY);
                    clickMouse(screenX, screenY);
                }
            }
        }

        // ===== SPINNER =====
        if (elements.spinner && elements.spinner.checked) {
            spinnerAngle += 0.15;
            const radius = 200;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const x = centerX + Math.cos(spinnerAngle) * radius;
            const y = centerY + Math.sin(spinnerAngle) * radius;
            moveMouse(x, y);
            if (frameCount % 2 === 0) {
                clickMouse(x, y);
            }
        }

        // ===== SHOW TARGETS =====
        if (elements.paths && elements.paths.checked) {
            drawTargets();
        } else {
            const overlay = document.getElementById('cgPathOverlay');
            if (overlay) {
                overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height);
            }
        }

    }, 30);

    // ========== MAKE MENU DRAGGABLE ==========
    setTimeout(() => {
        const menuEl = document.getElementById('chaseGeerMenu');
        if (menuEl) {
            let isDragging = false;
            let offsetX, offsetY;
            
            menuEl.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
                isDragging = true;
                offsetX = e.clientX - menuEl.offsetLeft;
                offsetY = e.clientY - menuEl.offsetTop;
                menuEl.style.cursor = 'grabbing';
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                menuEl.style.left = (e.clientX - offsetX) + 'px';
                menuEl.style.top = (e.clientY - offsetY) + 'px';
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
                menuEl.style.cursor = 'default';
            });
        }
    }, 2000);

    console.log('✅ Chase Geer Mod - Auto Farm Ready!');
    console.log('🎯 Auto-farms: Squares (yellow), Triangles (red), Hexagons (blue)');
    console.log('🚫 AVOIDS: rgba(241, 78, 84) - Player Color!');
    console.log('💡 You control upgrades manually!');
})();