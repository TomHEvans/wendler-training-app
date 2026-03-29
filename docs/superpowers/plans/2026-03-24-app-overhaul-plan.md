# Hyrox Prep App Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add progress tracking, historical performance hints, session feel logging, rest timer, export/import, and visual refinements to the Hyrox training tracker.

**Architecture:** Single-file HTML app (`index.html`) with embedded CSS and JS. No build tools, no dependencies. All state in localStorage. Verification is browser-based (no test framework). SVG sparkline charts are hand-rolled inline.

**Tech Stack:** HTML, CSS, vanilla JS, inline SVG, localStorage

**Spec:** `docs/superpowers/specs/2026-03-24-app-overhaul-design.md`

---

## File Map

All changes are in a single file:

- **Modify:** `index.html` — the entire app (CSS, HTML structure, JS data, JS logic)

Changes are grouped into logically independent tasks that can be committed separately.

---

### Task 1: Colour Darkening + State Schema Update

**Files:**
- Modify: `index.html` — CSS `:root` block (line ~9), ambient gradient (line ~26), `loadState()` function

This task has no dependencies and establishes the foundation for subsequent tasks.

- [ ] **Step 1: Update CSS custom properties**

In the `:root` block, change:
```css
--bg:#0a0a10;--surface:#111119;--surface2:#161620;--border:#1a1a24;
--text:#d8d8e0;
```

- [ ] **Step 2: Reduce ambient gradient opacity**

In `body::before`, change:
```css
background:radial-gradient(ellipse at 30% 0%,rgba(252,61,94,.07) 0%,transparent 60%),
           radial-gradient(ellipse at 70% 0%,rgba(61,200,252,.05) 0%,transparent 60%);
```

- [ ] **Step 3: Update loadState to handle new state keys**

Update `loadState()` to return `{sets, notes, feel, restTimer}`:
```js
function loadState(){
  try{
    let raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(raw) return {sets:raw.sets||{}, notes:raw.notes||{}, feel:raw.feel||{}, restTimer:raw.restTimer||90};
    const v1 = JSON.parse(localStorage.getItem('hyrox-prep-v1'));
    if(v1 && v1.notes){
      const notes={};
      Object.keys(v1.notes).forEach(k=>{ notes[k.replace('note-','n-')]=v1.notes[k] });
      return {sets:{}, notes, feel:{}, restTimer:90};
    }
    return {sets:{}, notes:{}, feel:{}, restTimer:90};
  }catch(e){ return {sets:{}, notes:{}, feel:{}, restTimer:90} }
}
```

- [ ] **Step 4: Verify in browser**

Open `index.html`, confirm darker background, surfaces, and text are visible and readable. Confirm no JS console errors.

- [ ] **Step 5: Commit**

```bash
git add index.html && git commit -m "Darken colour palette and update state schema for feel/restTimer"
```

---

### Task 2: e1RM on All Weighted Exercises

**Files:**
- Modify: `index.html` — `renderExercise()` function, `setVal()` function

Currently e1RM badge only shows when `p.amrap` is true. Extend to all `wendler` and `weighted` type exercises.

- [ ] **Step 1: Modify renderExercise to show e1RM for wendler and weighted types**

In `renderExercise()`, replace the AMRAP-only e1RM block:
```js
// OLD: if(p.amrap){
// NEW: show e1RM for any wendler or weighted exercise
if(p.type==='wendler'||p.type==='weighted'){
  const key=sKey(wk,di,si,ei,0), sd=getSD(key);
  const w=sd.v1||(p.per[0].w||''), r=sd.v2||(p.per[0].r||'');
  const e=epley(w,r);
  h += `<div class="e1rm" id="e1rm-${key}"><span class="e1rm-label">e1RM</span> <span class="e1rm-val">${e?e.toFixed(1)+'kg':'--'}</span></div>`;
}
```

For `weighted` type exercises with multiple sets, show the best e1RM across all sets:
```js
if(p.type==='weighted'){
  let bestE=null, bestKey='';
  for(let i=0;i<p.n;i++){
    const k=sKey(wk,di,si,ei,i), sd=getSD(k);
    const e=epley(sd.v1,sd.v2);
    if(e && (!bestE || e>bestE)){bestE=e; bestKey=k}
  }
  h += `<div class="e1rm" id="e1rm-w-${wk}-${di}-${si}-${ei}"><span class="e1rm-label">e1RM</span> <span class="e1rm-val">${bestE?bestE.toFixed(1)+'kg':'--'}</span></div>`;
}
```

- [ ] **Step 2: Update setVal to recalculate e1RM for weighted exercises**

In `setVal()`, extend the e1RM live-update logic to handle `weighted` type:
```js
const p=parseEx(ex.text,ex.detail,ex.amrap);
if(p.type==='wendler'){
  const e=epley(sd.v1,sd.v2);
  const el=document.getElementById('e1rm-'+key);
  if(el) el.querySelector('.e1rm-val').textContent=e?e.toFixed(1)+'kg':'--';
}
if(p.type==='weighted'){
  // Recalc best across all sets
  let bestE=null;
  for(let i=0;i<p.n;i++){
    const k=sKey(wk,di,si,ei,i), s=getSD(k);
    const e=epley(s.v1,s.v2);
    if(e&&(!bestE||e>bestE)) bestE=e;
  }
  const el=document.getElementById('e1rm-w-'+wk+'-'+di+'-'+si+'-'+ei);
  if(el) el.querySelector('.e1rm-val').textContent=bestE?bestE.toFixed(1)+'kg':'--';
}
```

- [ ] **Step 3: Verify in browser**

Expand Week 1 Monday. Check that:
- Wendler Set 1 (65kg x 5) shows e1RM badge → enter 65kg, 5 reps → should show 75.8kg
- Romanian Deadlift shows e1RM badge → enter 60kg, 12 reps → should show 84.0kg
- Leg Press shows e1RM badge similarly
- Sled Push (distance type) does NOT show e1RM

- [ ] **Step 4: Commit**

```bash
git add index.html && git commit -m "Show e1RM badge on all weighted exercises, not just AMRAP"
```

---

### Task 3: Previous Performance Inline Hints

**Files:**
- Modify: `index.html` — add CSS for `.prev-hint`, add `findPrevData()` function, modify `renderExercise()`

- [ ] **Step 1: Add CSS for previous performance hints**

Add after the `.e1rm` CSS block:
```css
.prev-hint{font-size:10px;color:var(--text-dim);padding:2px 0 4px 26px;border-left:2px solid var(--border);margin-left:34px}
```

- [ ] **Step 2: Add findPrevData function**

Add after the `epley()` function. This function:
1. Finds the previous week
2. Scans the same day index for an exercise with matching `text`
3. Returns the best logged set data from that exercise

```js
function findPrevData(wk,di,si,ei){
  const weekIdx=PLAN.weeks.findIndex(w=>w.id===wk);
  if(weekIdx<=0) return null; // Week 1 has no previous
  const prevWeek=PLAN.weeks[weekIdx-1];
  const curWeek=PLAN.weeks.find(w=>w.id===wk);
  const curEx=curWeek.days[di].sections[si].exercises[ei];
  const curName=curEx.text;
  const curP=parseEx(curEx.text,curEx.detail,curEx.amrap);
  if(curP.type==='check'||curP.type==='cardio'||curP.type==='warmup'||curP.type==='distance') return null;

  // Scan previous week same day for matching exercise name
  if(di>=prevWeek.days.length) return null;
  const prevDay=prevWeek.days[di];
  for(let psi=0;psi<prevDay.sections.length;psi++){
    for(let pei=0;pei<prevDay.sections[psi].exercises.length;pei++){
      if(prevDay.sections[psi].exercises[pei].text===curName){
        const pp=parseEx(prevDay.sections[psi].exercises[pei].text,prevDay.sections[psi].exercises[pei].detail,prevDay.sections[psi].exercises[pei].amrap);
        // Find best set
        let best=null;
        for(let s=0;s<pp.n;s++){
          const sd=getSD(sKey(prevWeek.id,di,psi,pei,s));
          if(!sd.done) continue;
          if(!best) best=sd;
          else{
            if(pp.type==='wendler'||pp.type==='weighted'){
              const eCur=epley(sd.v1,sd.v2), eBest=epley(best.v1,best.v2);
              if(eCur&&(!eBest||eCur>eBest)) best=sd;
            } else if(pp.type==='reps'){
              if(parseInt(sd.v1)>parseInt(best.v1||0)) best=sd;
            } else if(pp.type==='hold'){
              if(parseInt(sd.v1)>parseInt(best.v1||0)) best=sd;
            } else if(pp.type==='fortime'){
              if(sd.v1 && (!best.v1 || sd.v1<best.v1)) best=sd;
            }
          }
        }
        if(!best||!best.done) return null;
        return {type:pp.type, data:best, amrap:prevDay.sections[psi].exercises[pei].amrap};
      }
    }
  }
  return null;
}
```

- [ ] **Step 3: Add prev hint rendering to renderExercise**

In `renderExercise()`, after the set rows and e1RM badge, before the closing `</div>`:

```js
// Previous performance hint
const prev=findPrevData(wk,di,si,ei);
if(prev){
  let pText='';
  if(prev.type==='wendler'||prev.type==='weighted'){
    const e=epley(prev.data.v1,prev.data.v2);
    pText=`prev: ${prev.data.v1}kg × ${prev.data.v2}`;
    if(prev.amrap && e) pText+=` → e1RM ${e.toFixed(1)}kg`;
  } else if(prev.type==='reps'){
    pText=`prev: ${prev.data.v1} reps`;
  } else if(prev.type==='hold'){
    pText=`prev: ${prev.data.v1}s`;
  } else if(prev.type==='fortime'){
    pText=`prev: ${prev.data.v1}`;
  }
  if(pText) h+=`<div class="prev-hint">${pText}</div>`;
}
```

- [ ] **Step 4: Verify in browser**

Switch to Week 2. Since no data is logged for Week 1, no hints should appear. Manually test: switch to Week 1, log some data (check a few sets with values), switch to Week 2, confirm hints appear with the logged values.

- [ ] **Step 5: Commit**

```bash
git add index.html && git commit -m "Add previous-performance inline hints using name-based lookup"
```

---

### Task 4: Bottom Navigation Bar + View Structure

**Files:**
- Modify: `index.html` — add nav bar HTML after container div, add CSS, add JS for tab switching

This task creates the two-view structure (Train/Progress) but only stubs the Progress view. Task 5-8 fill it in.

- [ ] **Step 1: Add bottom nav CSS**

Add before the `@media` query:
```css
/* Bottom nav */
.bottom-nav{position:fixed;bottom:0;left:0;right:0;height:56px;background:var(--surface);border-top:1px solid var(--border);display:flex;z-index:100}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;position:relative;user-select:none;padding-top:6px}
.nav-item .nav-icon{font-size:18px;opacity:.3;transition:opacity .2s}
.nav-item.active .nav-icon{opacity:1}
.nav-item .nav-label{font-size:9px;color:var(--text-dim);margin-top:2px;transition:color .2s}
.nav-item.active .nav-label{background:var(--grad-red);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:600}
.nav-item.active::before{content:'';position:absolute;top:0;left:25%;right:25%;height:2px;background:var(--grad-red);border-radius:0 0 2px 2px}
.view{display:none}
.view.active{display:block}
```

- [ ] **Step 2: Update body padding**

Change `body` CSS from `padding-bottom:80px` to `padding-bottom:72px`.

- [ ] **Step 3: Restructure HTML — wrap existing content in Train view, add Progress view and nav**

Wrap the existing `.container` div contents (everything below header) in a `<div id="trainView" class="view active">`. Add a `<div id="progressView" class="view">` sibling. Add the nav bar HTML after the container.

The HTML structure becomes:
```html
<div class="container">
  <div class="header">...</div>
  <div id="trainView" class="view active">
    <!-- existing hero, countdown, week tabs, days container -->
  </div>
  <div id="progressView" class="view">
    <div style="padding:20px 0">
      <div class="hero-main" style="font-size:20px;margin-bottom:16px">Progress</div>
      <div id="progressContent"></div>
    </div>
  </div>
</div>
<div class="bottom-nav">
  <div class="nav-item active" onclick="switchTab('train')" id="navTrain">
    <div class="nav-icon">🏋️</div>
    <div class="nav-label">Train</div>
  </div>
  <div class="nav-item" onclick="switchTab('progress')" id="navProgress">
    <div class="nav-icon">📊</div>
    <div class="nav-label">Progress</div>
  </div>
</div>
```

- [ ] **Step 4: Add switchTab JS function**

Add to the Actions section:
```js
let trainScrollY=0;
function switchTab(tab){
  if(tab==='train'){
    trainView.style.display='block'; progressView.style.display='none';
    navTrain.classList.add('active'); navProgress.classList.remove('active');
    window.scrollTo(0,trainScrollY);
  } else {
    trainScrollY=window.scrollY;
    trainView.style.display='none'; progressView.style.display='block';
    navTrain.classList.remove('active'); navProgress.classList.add('active');
    renderProgress();
    window.scrollTo(0,0);
  }
}
function renderProgress(){
  document.getElementById('progressContent').innerHTML='<div style="color:var(--text-muted);text-align:center;padding:40px 0">Progress dashboard coming soon</div>';
}
```

- [ ] **Step 5: Verify in browser**

Confirm: bottom nav bar visible, tapping Train/Progress switches views, scroll position preserved on Train, Progress shows placeholder.

- [ ] **Step 6: Commit**

```bash
git add index.html && git commit -m "Add bottom nav bar with Train/Progress tab switching"
```

---

### Task 5: Progress Dashboard — Summary Stats

**Files:**
- Modify: `index.html` — expand `renderProgress()` with summary stats calculation

- [ ] **Step 1: Write summary stats calculation functions**

Add before `renderProgress()`:
```js
function calcTotalVolume(){
  let vol=0;
  PLAN.weeks.forEach(w=>{w.days.forEach((d,di)=>{d.sections.forEach((s,si)=>{s.exercises.forEach((ex,ei)=>{
    const p=parseEx(ex.text,ex.detail,ex.amrap);
    if(p.type==='wendler'||p.type==='weighted'){
      for(let i=0;i<p.n;i++){
        const sd=getSD(sKey(w.id,di,si,ei,i));
        if(sd.done&&sd.v1&&sd.v2) vol+=parseFloat(sd.v1)*parseInt(sd.v2);
      }
    }
  })})})});
  return vol;
}

function calcBestE1rm(){
  let best=null,name='';
  PLAN.weeks.forEach(w=>{w.days.forEach((d,di)=>{d.sections.forEach((s,si)=>{s.exercises.forEach((ex,ei)=>{
    const p=parseEx(ex.text,ex.detail,ex.amrap);
    if(p.type==='wendler'||p.type==='weighted'){
      for(let i=0;i<p.n;i++){
        const sd=getSD(sKey(w.id,di,si,ei,i));
        const e=epley(sd.v1,sd.v2);
        if(e&&(!best||e>best)){best=e;
          // Determine friendly name
          if(/Bench/.test(s.name)) name='Bench';
          else if(/OHP/.test(s.name)) name='OHP';
          else name=ex.text;
        }
      }
    }
  })})})});
  return best?{val:best,name}:null;
}

function calcStreak(){
  // Count consecutive completed training days backward from today
  let streak=0;
  const today=new Date();
  const allDays=[];
  PLAN.weeks.forEach(w=>{w.days.forEach((d,di)=>{
    const months={Jan:0,Feb:1,Mar:2,Apr:3,May:4};
    const parts=d.date.split(' ');
    const dt=new Date(2026,months[parts[2]],parseInt(parts[1]));
    const done=d.sections.every((s,si)=>s.exercises.every((e,ei)=>isExDone(w.id,di,si,ei)));
    allDays.push({dt,done});
  })});
  allDays.sort((a,b)=>b.dt-a.dt);
  for(const day of allDays){
    if(day.dt>today) continue;
    if(day.done) streak++; else break;
  }
  return streak;
}
```

- [ ] **Step 2: Render summary stats row in renderProgress**

Replace the placeholder `renderProgress()` with:
```js
function renderProgress(){
  const c=document.getElementById('progressContent');
  // Summary stats
  let totalSessions=0,doneSessions=0;
  PLAN.weeks.forEach(w=>{w.days.forEach((d,di)=>{
    totalSessions++;
    if(d.sections.every((s,si)=>s.exercises.every((e,ei)=>isExDone(w.id,di,si,ei)))) doneSessions++;
  })});
  const vol=calcTotalVolume();
  const bestE=calcBestE1rm();
  const streak=calcStreak();

  let h=`<div class="countdown-row" style="margin-bottom:20px">
    <div class="countdown-item"><div class="ci-val">${doneSessions}/${totalSessions}</div><div class="ci-label">Sessions</div></div>
    <div class="countdown-item"><div class="ci-val">${streak}</div><div class="ci-label">Streak</div></div>
    <div class="countdown-item"><div class="ci-val">${vol?Math.round(vol).toLocaleString()+'kg':'--'}</div><div class="ci-label">Volume</div></div>
    <div class="countdown-item"><div class="ci-val">${bestE?bestE.val.toFixed(1)+'kg':'--'}</div><div class="ci-label">${bestE?'Best e1RM ('+bestE.name+')':'Best e1RM'}</div></div>
  </div>`;

  h+='<div id="progressCharts"></div>';
  c.innerHTML=h;
  renderE1rmCharts();
  renderSkillTrends();
  renderFeelTrends();
}
```

- [ ] **Step 3: Add stub functions for remaining dashboard sections**

```js
function renderE1rmCharts(){ document.getElementById('progressCharts').innerHTML='' }
function renderSkillTrends(){}
function renderFeelTrends(){}
```

- [ ] **Step 4: Verify in browser**

Switch to Progress tab. Confirm 4 stat cards render with correct values (all zeros/dashes when no data logged).

- [ ] **Step 5: Commit**

```bash
git add index.html && git commit -m "Add Progress dashboard summary stats (sessions, streak, volume, best e1RM)"
```

---

### Task 6: Progress Dashboard — e1RM Sparkline Charts

**Files:**
- Modify: `index.html` — implement `renderE1rmCharts()`, add SVG sparkline helper

- [ ] **Step 1: Write data aggregation for e1RM per exercise per week**

```js
function getE1rmByWeek(matchFn){
  // Returns [{week:1, e1rm:119.9}, ...] for weeks with data
  const results=[];
  PLAN.weeks.forEach(w=>{
    let best=null;
    w.days.forEach((d,di)=>{d.sections.forEach((s,si)=>{s.exercises.forEach((ex,ei)=>{
      if(!matchFn(ex,s)) return;
      const p=parseEx(ex.text,ex.detail,ex.amrap);
      if(p.type!=='wendler'&&p.type!=='weighted') return;
      for(let i=0;i<p.n;i++){
        const sd=getSD(sKey(w.id,di,si,ei,i));
        const e=epley(sd.v1,sd.v2);
        if(e&&(!best||e>best)) best=e;
      }
    })})});
    if(best) results.push({week:w.id,val:best});
  });
  return results;
}
```

- [ ] **Step 2: Write SVG sparkline renderer**

```js
function svgSparkline(data, width, height, color1, color2){
  if(data.length<2) return '';
  const pad=20, w=width-pad*2, h=height-pad*2;
  const minV=Math.min(...data.map(d=>d.val))*0.95;
  const maxV=Math.max(...data.map(d=>d.val))*1.05;
  const range=maxV-minV||1;
  const pts=data.map((d,i)=>{
    const x=pad+i/(data.length-1)*w;
    const y=pad+(1-(d.val-minV)/range)*h;
    return {x,y,val:d.val,week:d.week};
  });
  const pathD=pts.map((p,i)=>(i===0?'M':'L')+p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');
  const gradId='sg'+Math.random().toString(36).slice(2,8);
  let svg=`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg+=`<defs><linearGradient id="${gradId}"><stop stop-color="${color1}"/><stop offset="1" stop-color="${color2}"/></linearGradient></defs>`;
  svg+=`<path d="${pathD}" fill="none" stroke="url(#${gradId})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  pts.forEach((p,i)=>{
    svg+=`<circle cx="${p.x}" cy="${p.y}" r="4" fill="${i===pts.length-1?color2:color1}" stroke="var(--surface)" stroke-width="2"/>`;
  });
  // Label last point
  const last=pts[pts.length-1];
  svg+=`<text x="${last.x}" y="${last.y-10}" fill="${color2}" font-size="11" font-weight="700" text-anchor="middle">${last.val.toFixed(1)}</text>`;
  // Week labels on x-axis
  pts.forEach(p=>{
    svg+=`<text x="${p.x}" y="${height-4}" fill="var(--text-dim)" font-size="9" text-anchor="middle">W${p.week}</text>`;
  });
  svg+=`</svg>`;
  return svg;
}
```

- [ ] **Step 3: Implement renderE1rmCharts**

```js
function renderE1rmCharts(){
  const container=document.getElementById('progressCharts');
  const charts=[
    {label:'Bench e1RM Trend', match:(ex,sec)=>/Wendler Bench/.test(sec.name), c1:'#fc3d5e', c2:'#fc6d3d'},
    {label:'OHP e1RM Trend', match:(ex,sec)=>/Wendler OHP/.test(sec.name), c1:'#3dc8fc', c2:'#a83dfc'},
    {label:'Romanian Deadlift e1RM', match:(ex)=>/Romanian Deadlift/.test(ex.text), c1:'#5dfc3d', c2:'#3dc8fc'},
    {label:'Leg Press e1RM', match:(ex)=>/Leg Press/.test(ex.text), c1:'#fcc93d', c2:'#fc6d3d'},
  ];
  let h='';
  charts.forEach(ch=>{
    const data=getE1rmByWeek(ch.match);
    if(data.length<2) return;
    h+=`<div style="background:var(--surface);border-radius:var(--radius-lg);padding:16px;margin-bottom:12px;position:relative;overflow:hidden">`;
    h+=`<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${ch.c1},${ch.c2})"></div>`;
    h+=`<div style="font-size:12px;font-weight:600;margin-bottom:8px">${ch.label}</div>`;
    h+=svgSparkline(data, 400, 120, ch.c1, ch.c2);
    h+=`</div>`;
  });
  container.innerHTML=h+(container.innerHTML||'');
}
```

- [ ] **Step 4: Add CSS for sparkline SVGs to be responsive**

```css
.progress-chart svg{width:100%;height:auto}
```

Wrap each chart SVG in a `<div class="progress-chart">`.

- [ ] **Step 5: Verify in browser**

Charts won't show with no data. Manually log some weighted exercise data across Week 1 and Week 2 to confirm sparklines render with gradient lines and dot markers.

- [ ] **Step 6: Commit**

```bash
git add index.html && git commit -m "Add e1RM sparkline trend charts to Progress dashboard"
```

---

### Task 7: Progress Dashboard — Skill Trends + Feel Trends

**Files:**
- Modify: `index.html` — implement `renderSkillTrends()` and `renderFeelTrends()`

- [ ] **Step 1: Implement renderSkillTrends**

Scans all exercises of type `reps` or `hold` across all weeks, groups by exact `text` match, finds the best value per week, and shows an arrow progression for those with 2+ weeks of data.

```js
function renderSkillTrends(){
  const container=document.getElementById('progressCharts');
  const skills={}; // name -> [{week, val}]
  PLAN.weeks.forEach(w=>{w.days.forEach((d,di)=>{d.sections.forEach((s,si)=>{s.exercises.forEach((ex,ei)=>{
    const p=parseEx(ex.text,ex.detail,ex.amrap);
    if(p.type!=='reps'&&p.type!=='hold') return;
    let best=null;
    for(let i=0;i<p.n;i++){
      const sd=getSD(sKey(w.id,di,si,ei,i));
      if(sd.done&&sd.v1){
        const v=parseInt(sd.v1);
        if(!best||v>best) best=v;
      }
    }
    if(best===null) return;
    if(!skills[ex.text]) skills[ex.text]=[];
    // Only keep best per week for this exercise
    const existing=skills[ex.text].find(s=>s.week===w.id);
    if(existing){if(best>existing.val) existing.val=best}
    else skills[ex.text].push({week:w.id,val:best});
  })})})});

  const entries=Object.entries(skills).filter(([k,v])=>v.length>=2).sort((a,b)=>a[0].localeCompare(b[0]));
  if(!entries.length) return;

  let h=`<div style="background:var(--surface);border-radius:var(--radius-lg);padding:16px;margin-bottom:12px;position:relative;overflow:hidden">`;
  h+=`<div style="position:absolute;top:0;left:0;right:0;height:2px;background:var(--grad-green)"></div>`;
  h+=`<div style="font-size:12px;font-weight:600;margin-bottom:12px">Skill & Conditioning Trends</div>`;
  entries.forEach(([name,data])=>{
    data.sort((a,b)=>a.week-b.week);
    const arrow=data.map(d=>d.val).join(' → ');
    const unit=name.match(/Hold|Isometric/i)?'s':'';
    h+=`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px">`;
    h+=`<span style="color:var(--text-muted)">${name}</span>`;
    h+=`<span style="color:var(--text);font-weight:500">${arrow}${unit}</span>`;
    h+=`</div>`;
  });
  h+=`</div>`;
  container.innerHTML+=h;
}
```

- [ ] **Step 2: Implement renderFeelTrends**

```js
function renderFeelTrends(){
  const container=document.getElementById('progressCharts');
  const labels=['','Terrible','Low','Okay','Good','Great'];
  const preData=[],postData=[];
  PLAN.weeks.forEach(w=>{
    let preSum=0,preN=0,postSum=0,postN=0;
    w.days.forEach((d,di)=>{
      const pre=state.feel['f-'+w.id+'-'+di+'-pre'];
      const post=state.feel['f-'+w.id+'-'+di+'-post'];
      if(pre){preSum+=pre;preN++}
      if(post){postSum+=post;postN++}
    });
    if(preN) preData.push({week:w.id,val:preSum/preN});
    if(postN) postData.push({week:w.id,val:postSum/postN});
  });
  if(preData.length<2&&postData.length<2) return;

  let h=`<div style="background:var(--surface);border-radius:var(--radius-lg);padding:16px;margin-bottom:12px;position:relative;overflow:hidden">`;
  h+=`<div style="position:absolute;top:0;left:0;right:0;height:2px;background:var(--grad-blue)"></div>`;
  h+=`<div style="font-size:12px;font-weight:600;margin-bottom:8px">Session Feel Trends</div>`;
  if(preData.length>=2) h+=`<div style="margin-bottom:4px"><span style="font-size:10px;color:var(--text-muted)">Before: </span>${svgSparkline(preData,400,80,'#fc6d3d','#fcc93d')}</div>`;
  if(postData.length>=2) h+=`<div><span style="font-size:10px;color:var(--text-muted)">After: </span>${svgSparkline(postData,400,80,'#5dfc3d','#3dc8fc')}</div>`;
  h+=`</div>`;
  container.innerHTML+=h;
}
```

- [ ] **Step 3: Verify in browser**

Switch to Progress. With no data, skill trends and feel trends should not appear. Log some data to test.

- [ ] **Step 4: Commit**

```bash
git add index.html && git commit -m "Add skill/conditioning trends and session feel trends to Progress dashboard"
```

---

### Task 8: Session Feel Logging

**Files:**
- Modify: `index.html` — add feel selector CSS, add feel UI to `renderDays()`, add `setFeel()` handler

- [ ] **Step 1: Add feel selector CSS**

```css
.feel-row{display:flex;gap:4px;padding:8px 16px;align-items:center}
.feel-label{font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-right:6px;flex-shrink:0}
.feel-opt{font-size:11px;padding:4px 8px;border-radius:6px;background:var(--surface2);color:var(--text-dim);cursor:pointer;transition:all .15s;user-select:none;text-align:center}
.feel-opt:active{transform:scale(.95)}
.feel-opt.sel{background:var(--grad-cta);color:#fff;font-weight:600}
```

- [ ] **Step 2: Add feel selectors to renderDays**

In the day card's `day-body` innerHTML, add a "Before" feel row at the top (before sections) and an "After" feel row just above the notes textarea:

```js
// Before feel selector (at top of day-body)
const preVal=state.feel['f-'+week.id+'-'+dayIdx+'-pre']||0;
const feelBefore=`<div class="feel-row">
  <span class="feel-label">Before</span>
  ${['Terrible','Low','Okay','Good','Great'].map((l,i)=>
    `<div class="feel-opt ${preVal===i+1?'sel':''}" onclick="setFeel(${week.id},${dayIdx},'pre',${i+1})">${l}</div>`
  ).join('')}
</div>`;

// After feel selector (above notes)
const postVal=state.feel['f-'+week.id+'-'+dayIdx+'-post']||0;
const feelAfter=`<div class="feel-row">
  <span class="feel-label">After</span>
  ${['Terrible','Low','Okay','Good','Great'].map((l,i)=>
    `<div class="feel-opt ${postVal===i+1?'sel':''}" onclick="setFeel(${week.id},${dayIdx},'post',${i+1})">${l}</div>`
  ).join('')}
</div>`;
```

Insert `feelBefore` at the start of day-body, and `feelAfter` before the notes-area div.

- [ ] **Step 3: Add setFeel handler**

```js
function setFeel(wk,di,when,val){
  const key='f-'+wk+'-'+di+'-'+when;
  state.feel[key]=state.feel[key]===val?0:val; // tap again to deselect
  saveState();
  render();
}
```

- [ ] **Step 4: Verify in browser**

Expand today's session. Confirm "Before" and "After" rows appear with 5 tap targets. Tap to select, tap again to deselect. Reload page — selection persists.

- [ ] **Step 5: Commit**

```bash
git add index.html && git commit -m "Add session feel logging (before/after 5-point scale)"
```

---

### Task 9: Export / Import

**Files:**
- Modify: `index.html` — add Export button to header, add Import link to Progress view, add JS handlers

- [ ] **Step 1: Add Export button to header HTML**

In the `.header` div, replace the "6-Week Plan" text with:
```html
<div style="display:flex;align-items:center;gap:8px">
  <span style="font-size:12px;color:var(--text-muted)">6-Week Plan</span>
  <span style="font-size:10px;color:var(--text-dim);border:1px solid var(--border);padding:2px 8px;border-radius:10px;cursor:pointer" onclick="exportData()">Export</span>
</div>
```

- [ ] **Step 2: Add Import link at bottom of Progress view**

In `renderProgress()`, append after all chart sections:
```js
h+=`<div style="text-align:center;padding:20px 0">
  <label style="font-size:10px;color:var(--text-dim);cursor:pointer;border-bottom:1px solid var(--border)">
    Import Backup <input type="file" accept=".json" style="display:none" onchange="importData(this)">
  </label>
</div>`;
```

- [ ] **Step 3: Add exportData function**

```js
function exportData(){
  const json=JSON.stringify(state,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  const d=new Date();
  a.download=`hyrox-prep-backup-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Add importData function with validation and shallow-recursive merge**

```js
function importData(input){
  const file=input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const data=JSON.parse(e.target.result);
      if(!data.sets||typeof data.sets!=='object'||Array.isArray(data.sets)) throw new Error('Invalid');
      if(!data.notes||typeof data.notes!=='object'||Array.isArray(data.notes)) throw new Error('Invalid');
      // Shallow-recursive merge
      function merge(target,source){
        Object.keys(source).forEach(k=>{
          if(source[k]&&typeof source[k]==='object'&&!Array.isArray(source[k])
            &&target[k]&&typeof target[k]==='object'&&!Array.isArray(target[k])){
            merge(target[k],source[k]);
          } else { target[k]=source[k] }
        });
      }
      merge(state,data);
      saveState();
      render();
      if(document.getElementById('progressView').style.display!=='none') renderProgress();
      alert('Imported successfully');
    }catch(err){ alert('Invalid backup file') }
  };
  reader.readAsText(file);
  input.value='';
}
```

- [ ] **Step 5: Verify in browser**

Click Export — should download a JSON file. Open the JSON file to verify structure. Delete localStorage, click Import with the file — data should restore.

- [ ] **Step 6: Commit**

```bash
git add index.html && git commit -m "Add JSON export/import for data backup and restore"
```

---

### Task 10: Customisable Rest Timer

**Files:**
- Modify: `index.html` — add timer CSS, add timer HTML (floating pill), add timer JS logic

- [ ] **Step 1: Add rest timer CSS**

```css
/* Rest timer */
.rest-pill{position:fixed;bottom:68px;right:16px;background:var(--surface);border:1px solid var(--border);border-radius:28px;padding:8px 14px;display:flex;align-items:center;gap:8px;z-index:99;cursor:pointer;user-select:none;transition:all .2s;box-shadow:0 4px 20px rgba(0,0,0,.4)}
.rest-pill.running{border-color:rgba(168,61,252,.3)}
.rest-pill.done{border-color:rgba(93,252,61,.4);animation:timerFlash .5s}
@keyframes timerFlash{0%,100%{border-color:rgba(93,252,61,.4)}50%{border-color:rgba(93,252,61,.8)}}
.rest-pill .timer-val{font-size:16px;font-weight:700;font-variant-numeric:tabular-nums;min-width:36px;text-align:center}
.rest-pill .timer-btn{font-size:14px;opacity:.6}
.rest-pill .timer-cog{font-size:12px;opacity:.4;padding:2px}
.rest-config{position:fixed;bottom:130px;right:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:8px;z-index:99;display:none;box-shadow:0 4px 20px rgba(0,0,0,.4)}
.rest-config.show{display:flex;flex-wrap:wrap;gap:4px}
.rest-opt{padding:6px 10px;border-radius:6px;font-size:12px;background:var(--surface2);color:var(--text-muted);cursor:pointer}
.rest-opt.sel{background:var(--grad-cta);color:#fff}
```

- [ ] **Step 2: Add timer HTML before the bottom nav**

```html
<div class="rest-pill" id="restPill" style="display:none" onclick="toggleTimer()">
  <span class="timer-btn" id="timerBtn">▶</span>
  <span class="timer-val" id="timerVal">1:30</span>
  <span class="timer-cog" onclick="event.stopPropagation();toggleRestConfig()">⚙</span>
</div>
<div class="rest-config" id="restConfig">
  <div class="rest-opt" onclick="setRestDuration(30)">30s</div>
  <div class="rest-opt" onclick="setRestDuration(60)">60s</div>
  <div class="rest-opt" onclick="setRestDuration(90)">90s</div>
  <div class="rest-opt" onclick="setRestDuration(120)">2m</div>
  <div class="rest-opt" onclick="setRestDuration(150)">2:30</div>
  <div class="rest-opt" onclick="setRestDuration(180)">3m</div>
</div>
```

- [ ] **Step 3: Add timer JS logic**

```js
let timerInterval=null, timerRemaining=0, timerHideTimeout=null;

function showRestPill(){
  const pill=document.getElementById('restPill');
  timerRemaining=state.restTimer||90;
  document.getElementById('timerVal').textContent=fmtTimer(timerRemaining);
  document.getElementById('timerBtn').textContent='▶';
  pill.style.display='flex';
  pill.classList.remove('running','done');
  clearTimeout(timerHideTimeout);
}

function fmtTimer(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}

function toggleTimer(){
  if(timerInterval){
    // Pause
    clearInterval(timerInterval);timerInterval=null;
    document.getElementById('timerBtn').textContent='▶';
    document.getElementById('restPill').classList.remove('running');
  } else {
    // Start
    if(timerRemaining<=0) timerRemaining=state.restTimer||90;
    document.getElementById('timerBtn').textContent='⏸';
    document.getElementById('restPill').classList.add('running');
    document.getElementById('restPill').classList.remove('done');
    timerInterval=setInterval(()=>{
      timerRemaining--;
      document.getElementById('timerVal').textContent=fmtTimer(Math.max(0,timerRemaining));
      if(timerRemaining<=0){
        clearInterval(timerInterval);timerInterval=null;
        document.getElementById('timerBtn').textContent='✓';
        document.getElementById('restPill').classList.remove('running');
        document.getElementById('restPill').classList.add('done');
        if(navigator.vibrate) navigator.vibrate([200,100,200]);
        timerHideTimeout=setTimeout(()=>{document.getElementById('restPill').style.display='none'},3000);
      }
    },1000);
  }
}

function toggleRestConfig(){
  const cfg=document.getElementById('restConfig');
  cfg.classList.toggle('show');
  // Highlight current
  cfg.querySelectorAll('.rest-opt').forEach(el=>{
    el.classList.toggle('sel',parseInt(el.onclick.toString().match(/\d+/)[0])===state.restTimer);
  });
}

function setRestDuration(secs){
  state.restTimer=secs;saveState();
  timerRemaining=secs;
  document.getElementById('timerVal').textContent=fmtTimer(secs);
  document.getElementById('restConfig').classList.remove('show');
}
```

- [ ] **Step 4: Trigger rest pill on set check**

In `toggleSet()`, after marking a set as done and before `render()`, add:
```js
if(sd.done) showRestPill();
```

Also hide the rest pill and config when switching to the Progress tab (in `switchTab`).

- [ ] **Step 5: Verify in browser**

Check off a set → rest pill appears at bottom-right. Tap to start countdown. Tap cog to change duration. Countdown reaches 0 → flash + vibrate (on mobile). Pill auto-hides after 3s.

- [ ] **Step 6: Commit**

```bash
git add index.html && git commit -m "Add customisable floating rest timer with countdown and vibration"
```

---

### Task 11: Maintainability Comments + Final Polish

**Files:**
- Modify: `index.html` — add guide comment block above PLAN object

- [ ] **Step 1: Add editing guide comment above PLAN data**

Insert immediately before `const PLAN = {`:
```js
// ─── EDITING THIS PLAN ─────────────────────────────────────────
// To ADD an exercise: push {text, detail, amrap?} to the end of
//   a section's exercises array. Existing state is unaffected.
// To REMOVE an exercise: splice it out. State for exercises after
//   the removed one in that section will be orphaned. Clear with:
//   localStorage.removeItem('hyrox-prep-v2') to reset all data.
// To RENAME: just change text/detail. Type detection is automatic.
// Exercise types are auto-detected from text + detail strings.
//   See parseEx() for the classification logic.
// ────────────────────────────────────────────────────────────────
```

- [ ] **Step 2: Final browser verification**

Walk through the full app:
1. Train view: colour palette is darker, exercises show set rows with inputs
2. e1RM badges appear on all weighted exercises
3. Previous performance hints appear when switching weeks (after logging data)
4. Feel selectors work (before/after each day)
5. Rest timer triggers on set completion
6. Bottom nav switches between Train/Progress
7. Progress dashboard: stats, charts, trends, feel
8. Export downloads JSON, Import restores data

- [ ] **Step 3: Commit**

```bash
git add index.html && git commit -m "Add editing guide comments and final polish"
```

---

### Task 12: Deploy to Netlify

**Files:** None — deployment only

- [ ] **Step 1: Create Netlify site and deploy**

```bash
netlify sites:create --name hyrox-prep-plan
netlify deploy --prod --dir .
```

- [ ] **Step 2: Verify live URL**

Open the deployed URL in a browser. Confirm all features work.

- [ ] **Step 3: Share URL with user**
