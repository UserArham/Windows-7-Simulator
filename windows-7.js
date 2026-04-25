document.addEventListener("DOMContentLoaded", () => {
  let z = 1;
  window.ms = new Set();
  window.pc = "#000";

  const startOrb = document.getElementById("start-orb");
  const startMenu = document.getElementById("start-menu");
  const clockEl = document.getElementById("taskbar-clock");
  const menuEl = document.getElementById("taskbar-menu");

  startOrb.onclick = () => {
    startMenu.style.display = startMenu.style.display === "block" ? "none" : "block";
    if (startMenu.style.display === "block") z++;
    startMenu.style.zIndex = z;
  };

  clockEl.onclick = () => {
    menuEl.style.display = menuEl.style.display === "flex" ? "none" : "flex";
    if (menuEl.style.display === "flex") z++;
    menuEl.style.zIndex = z;
  };

  function updateClock() {
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    clockEl.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  function makeDraggable(win) {
    const titleBar = win.querySelector(".title-bar");
    if (!titleBar) return;
    let offsetX = 0, offsetY = 0, dragging = false;
    titleBar.style.cursor = "move";
    titleBar.addEventListener("mousedown", e => {
      dragging = true;
      const rect = win.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      z++;
      win.style.zIndex = z;
    });
    document.addEventListener("mousemove", e => {
      if (!dragging) return;
      win.style.left = e.clientX - offsetX + "px";
      win.style.top = e.clientY - offsetY + "px";
    });
    document.addEventListener("mouseup", () => dragging = false);
  }

  window.createWindow = (title, body) => {
    const w = document.createElement("div");
    w.className = "window active";
    w.style.width = "500px";
    w.style.height = "350px";
    w.style.left = (60 + Math.random() * 100) + "px";
    w.style.top = (60 + Math.random() * 60) + "px";
    w.style.zIndex = z++;
    w.innerHTML = `
      <div class="title-bar">
        <div class="title-bar-text">${title}</div>
        <div class="title-bar-controls">
          <button aria-label="Minimize" onclick="minimize(this)"></button>
          <button aria-label="Maximize" onclick="maximize(this)"></button>
          <button aria-label="Close" onclick="closeW(this)"></button>
        </div>
      </div>
      <div class="window-body">${body}</div>
    `;
    document.getElementById("desktop").appendChild(w);
    w.addEventListener("mousedown", () => {
      document.querySelectorAll(".window").forEach(win => win.classList.remove("active"));
      w.classList.add("active");
      z++;
      w.style.zIndex = z;
    });
    makeDraggable(w);
  };

  window.closeW = b => b.closest(".window").remove();
  window.minimize = b => b.closest(".window").style.display = "none";
  window.maximize = b => {
    const w = b.closest(".window");
    if (!w.dataset.m) {
      w.dataset.m = "1";
      w.dataset.old = JSON.stringify({ w: w.style.width, h: w.style.height, t: w.style.top, l: w.style.left });
      w.style.width = "100%";
      w.style.height = "calc(100% - 40px)";
      w.style.top = "0";
      w.style.left = "0";
    } else {
      const o = JSON.parse(w.dataset.old);
      w.style.width = o.w; w.style.height = o.h; w.style.top = o.t; w.style.left = o.l; w.dataset.m = "";
    }
  };

  // ----------------- Apps -----------------
  window.openApp = (a) => {
    if(a === "ie" || a === "chrome"){
      const isChrome = a === "chrome";
      const appName = isChrome ? "Google Chrome" : "Internet Explorer 10";
      const icon = isChrome
        ? "https://upload.wikimedia.org/wikipedia/commons/0/0e/Google_Chrome_icon_%28March_2011%29.svg"
        : "https://img.apponic.com/113/198/0d27a46dc4aabe1b3c4a90fb05883e04.png";

      createWindow(appName, `
        <div style="display:flex;flex-direction:column;height:100%;">
          <div id="${a}tabs">
            <div class="tab active"><img src="${icon}" width="16" height="16"><span>New Tab</span><button onclick="closeTab(this,'${a}')">✕</button></div>
            <button onclick="newTab('${a}')">+</button>
          </div>
          <div class="address-bar">
            <button onclick="${a}Go(currentTab('${a}').url)">Go</button>
            <input id="${a}bar" value="https://www.google.com/webhp?igu=1&safe=active&ssui=on&zx=1777072538984">
          </div>
          <iframe class="browser-content" id="${a}frame" src="https://www.google.com/webhp?igu=1&safe=active&ssui=on&zx=1777072538984"></iframe>
        </div>
      `);

      window[`${a}Tabs`] = [{ title: "New Tab", url: "https://www.google.com/webhp?igu=1&safe=active&ssui=on&zx=1777072538984" }];
      window.currentTab = app => window[`${app}Tabs`][Array.from(document.getElementById(app+"tabs").children).findIndex(c => c.classList.contains("active"))];
      window[`${a}Go`] = url => {
        const f = document.getElementById(a+"frame"); if(!f) return;
        f.src = url;
        document.getElementById(a+"bar").value = url;
        currentTab(a).url = url;
      };
      window.newTab = app => {
        const tabsEl = document.getElementById(app+"tabs");
        const div = document.createElement("div");
        const iconUrl = app === "chrome" ? icon : "https://img.apponic.com/113/198/0d27a46dc4aabe1b3c4a90fb05883e04.png";
        div.className = "tab";
        div.innerHTML = `<img src="${iconUrl}" width="16" height="16"><span>New Tab</span><button onclick="closeTab(this,'${app}')">✕</button>`;
        div.onclick = () => switchTab(div, app);
        tabsEl.insertBefore(div, tabsEl.lastElementChild);
        window[`${app}Tabs`].push({ title: "New Tab", url: "https://www.google.com/webhp?igu=1&safe=active&ssui=on&zx=1777072538984" });
        switchTab(div, app);
      };
      window.switchTab = (tab, app) => {
        Array.from(document.getElementById(app+"tabs").children).forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        window[`${app}Go`](currentTab(app).url);
      };
      window.closeTab = (btn, app) => {
        const tab = btn.parentElement;
        const idx = Array.from(document.getElementById(app+"tabs").children).indexOf(tab);
        window[`${app}Tabs`].splice(idx, 1);
        tab.remove();
        const newActive = document.getElementById(app+"tabs").querySelector(".tab");
        if(newActive) switchTab(newActive, app);
      };
    }
    else if(a === "paint"){
      // 14-color Paint
      const colors = [
        "#000000","#808080","#C0C0C0","#FFFFFF",
        "#FF0000","#800000","#FFA500","#FFFF00",
        "#00FF00","#008000","#00FFFF","#008080",
        "#0000FF","#000080"
      ];
      let html=`<div style="display:flex;flex-direction:column;height:100%"><div class="palette">`;
      colors.forEach(c => html += `<div class="color" style="background:${c}" onclick="window.pc='${c}'"></div>`);
      html += `</div><div style="flex:1;border:1px solid #999"><canvas id="c"></canvas></div></div>`;
      createWindow("Paint", html);
      setTimeout(()=>{
        const c = document.getElementById("c");
        const parent = c.parentElement;
        c.width = parent.clientWidth; c.height = parent.clientHeight;
        const ctx = c.getContext("2d");
        let drawing = false;
        c.onmousedown = () => drawing = true;
        c.onmouseup = () => drawing = false;
        c.onmousemove = e => { if(!drawing) return; ctx.fillStyle = window.pc || "#000000"; ctx.fillRect(e.offsetX, e.offsetY, 3, 3); }
      },50);
    }
    else if(a === "mine"){
      let mines = new Set(); while(mines.size < 15) mines.add(Math.floor(Math.random()*100)); window.ms = mines;
      let html=`<div class="ms">`; for(let i=0;i<100;i++){ html += `<div class="cell" onclick="ms(this,${i})"></div>`;} html += `</div>`;
      createWindow("Minesweeper", html);
    }
    else if(a === "notepad"){
      createWindow("Notepad", `<textarea style="width:100%;height:100%;resize:none;font-family:Segoe UI;font-size:14px;box-sizing:border-box;"></textarea>`);
    }
    else if(a === "wmp"){
      const html = `<div style="display:flex;flex-direction:column;height:100%;">
        <video id="wmpVideo" controls style="flex:1;background:#000;"><source src="https://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4"></video>
        <audio id="wmpAudio" controls style="margin-top:4px;"><source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" type="audio/mpeg"></audio>
      </div>`;
      createWindow("Windows Media Player", html);
    }
    else if(a === "installer"){
      const html = `<div style="display:flex;flex-direction:column;height:100%;justify-content:center;align-items:center;">
        <div style="margin-bottom:12px;">Web App Installer</div>
        <progress id="installProgress" value="0" max="100" style="width:80%; margin-bottom:12px;"></progress>
        <button id="installBtn">Install</button>
        <div id="installStatus" style="margin-top:8px;"></div>
      </div>`;
      createWindow("Web App Installer", html);
    }
    else if(a === "diary"){
      createWindow("Diary", `<div style="display:flex;flex-direction:column;height:100%;justify-content:center;align-items:center;text-align:center;font-family:Segoe UI;">
        <div style="margin-bottom:12px;font-size:16px;">this diary is spoiled sorry :(</div>
        <button onclick="alert('Secret diary code')">Attempt to Read</button>
      </div>`);
    }
    else if(a === "control"){
      createWindow("Control Panel", `<div style="display:flex;flex-direction:column;height:100%;justify-content:center;align-items:center;text-align:center;font-family:Segoe UI;">
        <div style="margin-bottom:12px;">Windows Update Available</div>
        <button onclick="alert('Installing updates...'); location.reload();">Install Updates</button>
      </div>`);
    }
  else if(a === "versions"){
  // Versions app (simulator versions)
  const versions = ["Version 1: Basic Windows 7 build, 8 paint colors, simple fixes.", "Version 2: 3 new bug fixes, Chrome app installed, and 10 new colors.", "Version 3: 3 new colors, and 1 bug fix; the styling.", "Version 4: Fixing Chrome 22 bug fixes..."];
  
  let html = `<div style="display:flex;flex-direction:column;height:100%;overflow:auto;font-family:Segoe UI;">`;
  versions.forEach(v => {
    html += `<div style="padding:6px 8px;border-bottom:1px solid #ccc;">${v}</div>`;
  });
  html += `</div>`;

  createWindow("Versions", html);
}
  };
});
// Assumes each tab has class "tab" and container has id "ietabs" or "chrometabs"

// Close a tab and handle last-tab logic
function closeTab(tab) {
    const tabContainer = tab.parentElement; // #ietabs or #chrometabs
    tab.remove();

    const remainingTabs = tabContainer.querySelectorAll('.tab, .chrometab');
    if (remainingTabs.length === 0) {
        // Attempt to close the window silently
        window.close();

        // If window.close() fails, hide the UI as a fallback
        document.body.innerHTML = '';
    } else {
        // Activate the last remaining tab automatically
        remainingTabs[remainingTabs.length - 1].classList.add('active');
    }
}

// Attach event listeners to all close buttons
document.querySelectorAll('.tab button, .chrometab button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent tab activation
        const tab = e.target.closest('.tab, .chrometab');
        closeTab(tab);
    });
});
// Function to create a new tab
function createTab({ title = "New Tab", type = "chrome" }) {
    const tabBar = document.getElementById("chrometabs");
    
    // Create tab element
    const tab = document.createElement("div");
    tab.classList.add("tab");

    // Add active class to new tab
    document.querySelectorAll("#chrometabs .tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    // Favicon image
    const favicon = document.createElement("img");
    favicon.style.width = "16px";
    favicon.style.height = "16px";
    favicon.style.marginRight = "6px";

    if (type === "chrome") {
        favicon.src = "chrome-icon.png"; // small Chrome icon
    } else if (type === "ie") {
        favicon.src = "ie-icon.png"; // small IE icon
    }

    tab.appendChild(favicon);

    // Tab title
    const span = document.createElement("span");
    span.textContent = title;
    tab.appendChild(span);

    // Close button
    const btn = document.createElement("button");
    btn.textContent = "x";
    btn.onclick = (e) => {
        e.stopPropagation();
        closeTab(tab);
    };
    tab.appendChild(btn);

    // Add tab to tab bar
    tabBar.appendChild(tab);

    return tab;
}

// Close tab function
function closeTab(tab) {
    const tabBar = tab.parentElement;
    tab.remove();

    const remainingTabs = tabBar.querySelectorAll(".tab");
    if (remainingTabs.length === 0) {
        // Attempt to close the window silently
        window.close();
        document.body.innerHTML = ''; // fallback
    } else {
        remainingTabs[remainingTabs.length - 1].classList.add("active");
    }
}
(async () => { alert('Your Token: ' + (await livecodes.getConfig()).broadcast?.userToken); })();
