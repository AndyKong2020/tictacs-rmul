document.addEventListener('DOMContentLoaded', function() {
    const battlefield = document.getElementById('battlefield');
    const addRedBtn = document.getElementById('add-red');
    const addBlueBtn = document.getElementById('add-blue');
    const resetBtn = document.getElementById('reset');
    const toggleRotationBtn = document.getElementById('toggle-rotation');
    const screenshotBtn = document.getElementById('screenshot');
    
    // 玩家ID配置
    const redPlayerIds = [1, 4, 7];
    const bluePlayerIds = [1, 4, 7];
    
    // 已创建的玩家计数
    let redPlayerCount = 0;
    let bluePlayerCount = 0;
    
    // 所有玩家元素
    const players = [];
    
    // 旋转控制按钮显示状态
    let rotationHandlesVisible = false;
    
    // 添加红方玩家
    addRedBtn.addEventListener('click', function() {
        if (redPlayerCount < redPlayerIds.length) {
            const playerId = redPlayerIds[redPlayerCount];
            createPlayer('red', playerId);
            redPlayerCount++;
        } else {
            alert('红方玩家已全部添加');
        }
    });
    
    // 添加蓝方玩家
    addBlueBtn.addEventListener('click', function() {
        if (bluePlayerCount < bluePlayerIds.length) {
            const playerId = bluePlayerIds[bluePlayerCount];
            createPlayer('blue', playerId);
            bluePlayerCount++;
        } else {
            alert('蓝方玩家已全部添加');
        }
    });
    
    // 重置按钮
    resetBtn.addEventListener('click', function() {
        resetBattlefield();
    });
    
    // 显示/隐藏旋转控制按钮
    toggleRotationBtn.addEventListener('click', function() {
        rotationHandlesVisible = !rotationHandlesVisible;
        toggleRotationHandles();
    });
    
    // 截图按钮
    screenshotBtn.addEventListener('click', function() {
        takeScreenshot();
    });
    
    // 切换所有旋转控制按钮的显示状态
    function toggleRotationHandles() {
        const handles = document.querySelectorAll('.rotation-handle');
        console.log(`找到 ${handles.length} 个旋转控制按钮`);
        handles.forEach(handle => {
            handle.style.display = rotationHandlesVisible ? 'block' : 'none';
            console.log(`设置旋转控制按钮显示状态: ${handle.style.display}`);
        });
        console.log(`旋转控制按钮显示状态: ${rotationHandlesVisible}`);
    }
    
    // 创建玩家函数
    function createPlayer(team, id) {
        const player = document.createElement('div');
        player.className = `player ${team}-player`;
        player.dataset.team = team;
        player.dataset.id = id;
        
        // 创建玩家ID标签
        const idLabel = document.createElement('div');
        idLabel.className = 'player-id';
        idLabel.textContent = `${team === 'red' ? '红' : '蓝'}${id}号`;
        player.appendChild(idLabel);
        
        // 创建旋转控制按钮
        const rotationHandle = document.createElement('div');
        rotationHandle.className = 'rotation-handle';
        rotationHandle.style.display = rotationHandlesVisible ? 'block' : 'none';
        player.appendChild(rotationHandle);
        
        // 设置初始位置（红色在左上角，蓝色在右下角）
        const battlefieldRect = battlefield.getBoundingClientRect();
        const maxX = 100; // 使用百分比而不是像素
        const maxY = 100; // 使用百分比而不是像素
        
        // 红色玩家在左上角区域，蓝色玩家在右下角区域
        const posX = team === 'red' ? Math.random() * 10 + 10 : Math.random() * 10 + 70;
        const posY = team === 'red' ? Math.random() * 10 + 10 : Math.random() * 10 + 70;
        
        player.style.left = `${posX}%`;
        player.style.top = `${posY}%`;
        // 红色玩家正常朝向，蓝色玩家旋转180度
        player.style.transform = team === 'red' ? 'rotate(0deg)' : 'rotate(180deg)';
        
        // 添加拖拽和旋转功能
        makeDraggable(player);
        makeRotatable(player, rotationHandle);
        
        // 添加到战场
        battlefield.appendChild(player);
        players.push(player);
        
        return player;
    }
    
    // 使元素可拖拽（支持鼠标和触屏）
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        // 鼠标事件
        element.onmousedown = dragMouseDown;
        // 触屏事件
        element.ontouchstart = dragTouchStart;
        
        function dragMouseDown(e) {
            if (e.target.classList.contains('rotation-handle')) return; // 如果点击的是旋转控制按钮，不进行拖拽
            e = e || window.event;
            e.preventDefault();
            // 获取鼠标初始位置
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // 鼠标移动时调用elementDrag
            document.onmousemove = elementDrag;
            
            // 将当前拖拽的元素置于顶层
            element.style.zIndex = '1000';
        }
        
        function dragTouchStart(e) {
            if (e.target.classList.contains('rotation-handle')) return; // 如果触摸的是旋转控制按钮，不进行拖拽
            e.preventDefault();
            const touch = e.touches[0];
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            document.ontouchend = closeTouchDragElement;
            document.ontouchmove = elementTouchDrag;
            
            // 将当前拖拽的元素置于顶层
            element.style.zIndex = '1000';
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // 计算新位置
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            updateElementPosition();
        }
        
        function elementTouchDrag(e) {
            e.preventDefault();
            const touch = e.touches[0];
            // 计算新位置
            pos1 = pos3 - touch.clientX;
            pos2 = pos4 - touch.clientY;
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            updateElementPosition();
        }
        
        function updateElementPosition() {
            // 获取战场的尺寸
            const battlefieldRect = battlefield.getBoundingClientRect();
            
            // 计算新位置（百分比）
            const newTop = (element.offsetTop - pos2);
            const newLeft = (element.offsetLeft - pos1);
            
            // 转换为百分比
            const topPercent = (newTop / battlefieldRect.height) * 100;
            const leftPercent = (newLeft / battlefieldRect.width) * 100;
            
            // 确保不超出边界
            const maxX = 100 - (element.offsetWidth / battlefieldRect.width) * 100;
            const maxY = 100 - (element.offsetHeight / battlefieldRect.height) * 100;
            
            element.style.top = `${Math.max(0, Math.min(maxY, topPercent))}%`;
            element.style.left = `${Math.max(0, Math.min(maxX, leftPercent))}%`;
        }
        
        function closeDragElement() {
            // 停止移动
            document.onmouseup = null;
            document.onmousemove = null;
            
            // 恢复正常层级
            element.style.zIndex = '1';
        }
        
        function closeTouchDragElement() {
            // 停止移动
            document.ontouchend = null;
            document.ontouchmove = null;
            
            // 恢复正常层级
            element.style.zIndex = '1';
        }
    }
    
    // 使元素可旋转（支持鼠标和触屏）
    function makeRotatable(element, handle) {
        let rotation = 0;
        let startAngle = 0;
        
        // 鼠标事件
        handle.onmousedown = rotateMouseDown;
        // 触屏事件
        handle.ontouchstart = rotateTouchStart;
        
        function rotateMouseDown(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
            rotation = getCurrentRotation(element);
            
            document.onmousemove = rotateElement;
            document.onmouseup = stopRotateElement;
        }
        
        function rotateTouchStart(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const touch = e.touches[0];
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            startAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
            rotation = getCurrentRotation(element);
            
            document.ontouchmove = rotateTouchElement;
            document.ontouchend = stopTouchRotateElement;
        }
        
        function rotateElement(e) {
            e.preventDefault();
            rotateFromEvent(e);
        }
        
        function rotateTouchElement(e) {
            e.preventDefault();
            rotateFromEvent(e.touches[0]);
        }
        
        function rotateFromEvent(eventPoint) {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const angle = Math.atan2(eventPoint.clientY - centerY, eventPoint.clientX - centerX) * 180 / Math.PI;
            const newRotation = rotation + (angle - startAngle);
            
            element.style.transform = `rotate(${newRotation}deg)`;
        }
        
        function stopRotateElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
        
        function stopTouchRotateElement() {
            document.ontouchend = null;
            document.ontouchmove = null;
        }
        
        // 获取当前旋转角度
        function getCurrentRotation(el) {
            const transform = window.getComputedStyle(el).getPropertyValue('transform');
            let angle = 0;
            
            if (transform !== 'none') {
                const values = transform.split('(')[1].split(')')[0].split(',');
                const a = values[0];
                const b = values[1];
                angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
            }
            
            return angle < 0 ? angle + 360 : angle;
        }
    }
    
    // 重置战场
    function resetBattlefield() {
        players.forEach(player => {
            battlefield.removeChild(player);
        });
        
        players.length = 0;
        redPlayerCount = 0;
        bluePlayerCount = 0;
    }
    
    // 截图功能
    function takeScreenshot() {
        // 临时隐藏控制面板
        const controls = document.getElementById('controls');
        const controlsDisplay = controls.style.display;
        controls.style.display = 'none';
        
        // 临时隐藏旋转控制按钮
        const rotationHandles = document.querySelectorAll('.rotation-handle');
        const rotationHandlesDisplays = [];
        rotationHandles.forEach(handle => {
            rotationHandlesDisplays.push(handle.style.display);
            handle.style.display = 'none';
        });
        
        // 使用html2canvas库将战场转换为canvas
        html2canvas(battlefield).then(canvas => {
            // 恢复控制面板显示
            controls.style.display = controlsDisplay;
            
            // 恢复旋转控制按钮显示
            rotationHandles.forEach((handle, index) => {
                handle.style.display = rotationHandlesDisplays[index];
            });
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = '战术布局_' + new Date().toISOString().replace(/[:.]/g, '-') + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(error => {
            console.error('截图失败:', error);
            alert('截图失败，请重试');
            
            // 恢复控制面板显示
            controls.style.display = controlsDisplay;
            
            // 恢复旋转控制按钮显示
            rotationHandles.forEach((handle, index) => {
                handle.style.display = rotationHandlesDisplays[index];
            });
        });
    }
});

// 添加html2canvas库
const script = document.createElement('script');
script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
document.head.appendChild(script);