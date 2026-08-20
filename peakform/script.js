const SUPABASE_URL = 'https://eqyfqrhdwneddizfrdjq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r4ax1Hb3sM4DwAcNk22B4A_c9H-6yAd';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let localPRs = [];
let localRoutines = {};
let localLibrary = [];
let selectedDayName = 'Monday';
let chartInstance = null;
let currentActiveTab = null;

// Seeds
const defaultLibrary = [
  { exercise: "Bench Press", group_name: "Chest" },
  { exercise: "Incline DB Press", group_name: "Chest" },
  { exercise: "Cable Fly", group_name: "Chest" },
  { exercise: "Machine Chest Press", group_name: "Chest" },
  { exercise: "Pull Ups", group_name: "Back" },
  { exercise: "Seated Cable Row", group_name: "Back" },
  { exercise: "Lat Pulldown", group_name: "Back" },
  { exercise: "Chest Supported Row", group_name: "Back" },
  { exercise: "Smith Back Squat", group_name: "Legs" },
  { exercise: "Leg Press", group_name: "Legs" },
  { exercise: "RDL", group_name: "Legs" },
  { exercise: "Hack Squat", group_name: "Legs" },
  { exercise: "Overhead Press", group_name: "Shoulders" },
  { exercise: "Lateral Raises", group_name: "Shoulders" },
  { exercise: "Rear Delt Flies", group_name: "Shoulders" },
  { exercise: "Preacher Curl", group_name: "Biceps" },
  { exercise: "EZ Bar Curls", group_name: "Biceps" },
  { exercise: "Incline DB Curl", group_name: "Biceps" },
  { exercise: "Hammer Curl", group_name: "Biceps" },
  { exercise: "Skull Crushers", group_name: "Triceps" },
  { exercise: "Close Grip Bench Press", group_name: "Triceps" },
  { exercise: "Rope Pushdown", group_name: "Triceps" },
  { exercise: "Cable French Press", group_name: "Triceps" }
];

const defaultRoutines = {
  Monday: {
    title: "Upper - Chest/Back focus",
    exercises: [
      { exercise: "Pull Ups", muscleGroup: "Back", sets: "4", reps: "MAX", target: "Lats, Back width", rotation: "Neutral grip/Chin Ups", tips: "Elbows to hips/ Full stretch" },
      { exercise: "Bench Press", muscleGroup: "Chest", sets: "1 WU + 3", reps: "MAX", target: "Mid chest, sternal head", rotation: "Test", tips: "" },
      { exercise: "Seated Cable Row", muscleGroup: "Back", sets: "3", reps: "MAX", target: "Rhomboids, mid traps", rotation: "T-bar Row", tips: "Pause 1 sec at contraction" },
      { exercise: "Incline DB Press", muscleGroup: "Chest", sets: "3", reps: "6-8", target: "Clavicular head", rotation: "", tips: "30° for upper chest" },
      { exercise: "Preacher Curl", muscleGroup: "Biceps", sets: "3", reps: "8-10", target: "Biceps long head, overall mass", rotation: "Barbell Curl", tips: "" },
      { exercise: "Skull Crushers", muscleGroup: "Triceps", sets: "3", reps: "8-10", target: "Triceps long head", rotation: "", tips: "EZ bar inside grips, bar behind head" },
      { exercise: "Chest Supported Row", muscleGroup: "Back", sets: "3", reps: "8-10", target: "Upper back, rhomboids, rear delts", rotation: "", tips: "" },
      { exercise: "Machine Chest Press", muscleGroup: "Chest", sets: "3", reps: "6-8", target: "Mid-lower chest, sternal fibers", rotation: "Pec Deck", tips: "" }
    ]
  },
  Tuesday: {
    title: "Lower - Legs/Shoulders",
    exercises: [
      { exercise: "Smith Back Squat", muscleGroup: "Legs", sets: "1 WU + 3", reps: "6-8", target: "Quads, glutes", rotation: "Leg Press (feet low)", tips: "" },
      { exercise: "Leg Press", muscleGroup: "Legs", sets: "3", reps: "8-10", target: "Quads, vastus lateralis & medialis", rotation: "", tips: "" },
      { exercise: "Overhead Press", muscleGroup: "Shoulders", sets: "3", reps: "10", target: "Front delts", rotation: "Arnold Press", tips: "Stop just before lockout" },
      { exercise: "RDL", muscleGroup: "Legs", sets: "3", reps: "MAX", target: "Hamstrings, glutes", rotation: "", tips: "" },
      { exercise: "Lateral Raises", muscleGroup: "Shoulders", sets: "4", reps: "12-15", target: "Side delts, shoulder width", rotation: "Cable lateral raises", tips: "" },
      { exercise: "Standing Calf Raises", muscleGroup: "Legs", sets: "4", reps: "15", target: "Gastrcnemius", rotation: "", tips: "" },
      { exercise: "Hanging Leg Raises", muscleGroup: "Core", sets: "3", reps: "12-15", target: "Lower abs", rotation: "", tips: "" },
      { exercise: "Ball crunches", muscleGroup: "Core", sets: "3", reps: "15-20", target: "Upper abs", rotation: "", tips: "" }
    ]
  },
  Wednesday: {
    title: "Running",
    exercises: [
      { exercise: "Running", muscleGroup: "Run", sets: "1", reps: "6-8km", target: "Cardiovascular endurance, fat oxidation", rotation: "", tips: "" }
    ]
  },
  Thursday: {
    title: "Upper - Arms focus",
    exercises: [
      { exercise: "Lat Pulldown", muscleGroup: "Back", sets: "3", reps: "10", target: "Lats, width", rotation: "Single Arm Pulldown", tips: "" },
      { exercise: "Close Grip Bench Press", muscleGroup: "Triceps", sets: "4", reps: "6-8", target: "Triceps medial, lateral head", rotation: "Dips", tips: "Elbows super close to body" },
      { exercise: "Cable Fly", muscleGroup: "Chest", sets: "3", reps: "12-15", target: "Inner chest, chest stretch contraction", rotation: "DB Flies", tips: "" },
      { exercise: "EZ Bar Curls", muscleGroup: "Biceps", sets: "4", reps: "8-10", target: "Overall mass", rotation: "", tips: "" },
      { exercise: "Rope Pushdown", muscleGroup: "Triceps", sets: "3", reps: "12", target: "Triceps lateral head", rotation: "", tips: "Spread rope at bottom" },
      { exercise: "Incline DB Curl", muscleGroup: "Biceps", sets: "3", reps: "10-12", target: "Biceps long head, stretch emphasis", rotation: "", tips: "" },
      { exercise: "Cable French Press", muscleGroup: "Triceps", sets: "3", reps: "10-12", target: "Tricep long head", rotation: "", tips: "" },
      { exercise: "Hammer Curl", muscleGroup: "Biceps", sets: "3", reps: "10", target: "Brachialis, Brachioradialis, arm thickness", rotation: "", tips: "Slow tempo" }
    ]
  },
  Friday: {
    title: "Lower - Hypertrophy",
    exercises: [
      { exercise: "Hack Squat", muscleGroup: "Legs", sets: "3", reps: "8-10", target: "Quads", rotation: "", tips: "" },
      { exercise: "Bulgarian Split Squat", muscleGroup: "Legs", sets: "3", reps: "10", target: "Quads, glutes", rotation: "", tips: "" },
      { exercise: "Lateral Raises", muscleGroup: "Shoulders", sets: "4", reps: "15", target: "Side delts", rotation: "", tips: "" },
      { exercise: "Hamstring Curls", muscleGroup: "Legs", sets: "3", reps: "12", target: "Hamstrings", rotation: "", tips: "" },
      { exercise: "Rear Delt Flies", muscleGroup: "Shoulders", sets: "3", reps: "10-12", target: "Delts", rotation: "Face Pulls", tips: "" },
      { exercise: "Seated Calf Raises", muscleGroup: "Legs", sets: "4", reps: "15", target: "Overall thickness", rotation: "", tips: "" },
      { exercise: "Leg Extensions Dropset", muscleGroup: "Legs", sets: "3", reps: "12-15", target: "Quads", rotation: "", tips: "Hold 2 sec on top, 3 sec negative" }
    ]
  },
  Saturday: {
    title: "Upper - Balanced pump",
    exercises: [
      { exercise: "Bench Press", muscleGroup: "Chest", sets: "1 WU + 3", reps: "8-10", target: "Mid chest, sternal head", rotation: "", tips: "" },
      { exercise: "Single-arm lat pulldown", muscleGroup: "Back", sets: "3", reps: "12", target: "Lower lats", rotation: "", tips: "" },
      { exercise: "Incline Dumbbell Press", muscleGroup: "Chest", sets: "3", reps: "12", target: "Upper chest", rotation: "", tips: "" },
      { exercise: "Seated Cable Row", muscleGroup: "Back", sets: "3", reps: "8-10", target: "Rhomboids, mid traps", rotation: "Straight-arm pulldown", tips: "" },
      { exercise: "Hammer Curl", muscleGroup: "Biceps", sets: "3", reps: "10", target: "Brachialis, Brachioradialis, arm thickness", rotation: "", tips: "" },
      { exercise: "Straight Bar Pushdown", muscleGroup: "Triceps", sets: "3", reps: "12", target: "Triceps lateral head", rotation: "", tips: "" },
      { exercise: "Concentration curls", muscleGroup: "Biceps", sets: "3", reps: "10", target: "Biceps peak contraction", rotation: "", tips: "" },
      { exercise: "Single-arm kickbacks", muscleGroup: "Triceps", sets: "3", reps: "12", target: "Triceps - All heads", rotation: "", tips: "" },
      { exercise: "Crunches", muscleGroup: "Core", sets: "3", reps: "15-20", target: "Upper abs", rotation: "", tips: "" },
      { exercise: "Heel touches", muscleGroup: "Core", sets: "3", reps: "20", target: "Obliques", rotation: "", tips: "" }
    ]
  },
  Sunday: {
    title: "Recovery",
    exercises: [
      { exercise: "Incline walking", muscleGroup: "Walk", sets: "1", reps: "30-40 min", target: "Fat burning, active recovery", rotation: "", tips: "" }
    ]
  }
};

// Elements
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const landingView = document.getElementById('landing-view');
const authForm = document.getElementById('auth-form');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');
const container = document.getElementById('pr-container');
const searchBar = document.getElementById('search-bar');
const fabAdd = document.getElementById('fab-add');

const tabRecords = document.getElementById('tab-records');
const tabRoutine = document.getElementById('tab-routine');
const tabChart = document.getElementById('tab-chart');
const recordsView = document.getElementById('records-view');
const routineView = document.getElementById('routine-view');
const chartView = document.getElementById('chart-view');
const chartSelect = document.getElementById('chart-select');
const historyManager = document.getElementById('history-manager');

const prModal = document.getElementById('pr-modal');
const prForm = document.getElementById('pr-form');
const cancelBtn = document.getElementById('cancel-btn');
const modalTitle = document.getElementById('modal-title');

const routineModal = document.getElementById('routine-modal');
const routineForm = document.getElementById('routine-form');
const routineCancelBtn = document.getElementById('routine-cancel-btn');
const routineExName = document.getElementById('routine-ex-name');
const openLibraryBtn = document.getElementById('open-library-btn');

const libraryModal = document.getElementById('library-modal');
const libraryAccordion = document.getElementById('library-accordion');
const libraryCloseBtn = document.getElementById('library-close-btn');

const dayTitleModal = document.getElementById('day-title-modal');
const dayTitleForm = document.getElementById('day-title-form');
const dayTitleCancelBtn = document.getElementById('day-title-cancel-btn');

const percentModal = document.getElementById('percent-modal');
const percentTitle = document.getElementById('percent-title');
const percentSubtitle = document.getElementById('percent-subtitle');
const oneRmBox = document.getElementById('one-rm-box');
const percentColumns = document.getElementById('percent-columns');
const percentCloseBtn = document.getElementById('percent-close-btn');

// Navigation Tabs
tabRoutine.onclick = () => switchTab('routine');
tabRecords.onclick = () => switchTab('records');
tabChart.onclick = () => switchTab('chart');

function switchTab(tab) {
  currentActiveTab = tab;
  landingView.classList.add('hidden');

  tabRoutine.classList.toggle('active', tab === 'routine');
  tabRecords.classList.toggle('active', tab === 'records');
  tabChart.classList.toggle('active', tab === 'chart');

  routineView.classList.toggle('hidden', tab !== 'routine');
  recordsView.classList.toggle('hidden', tab !== 'records');
  chartView.classList.toggle('hidden', tab !== 'chart');

  fabAdd.classList.remove('hidden');

  if (tab === 'routine') renderRoutineDay(selectedDayName);
  if (tab === 'records') renderPRs();
  if (tab === 'chart') populateChartDropdown();
}

fabAdd.onclick = () => {
  if (currentActiveTab === 'routine') openRoutineModal();
  else if (currentActiveTab === 'records') openModal();
};

// Supabase Auth
loginBtn.onclick = async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
};

signupBtn.onclick = async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const { data, error } = await auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert('Account created! Please check your email to confirm signup.');
};

logoutBtn.onclick = async () => { await .auth.signOut(); };

supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    currentUser = session.user;
    userDisplay.textContent = `@${currentUser.email.split('@')[0]}`;
    authView.classList.add('hidden');
    appView.classList.remove('hidden');
    
    await autoMigrateLocalStorage();
    await fetchAllUserData();
    resetDashboardView();
  } else {
    currentUser = null;
    authView.classList.remove('hidden');
    appView.classList.add('hidden');
  }
});

// Supabase Data Sync
async function fetchAllUserData() {
  const { data: prData } = await supabaseClient.from('prs').select('*').order('created_at', { ascending: true });
  localPRs = prData || [];

  const { data: routineData } = await supabaseClient.from('routines').select('*');
  localRoutines = {};
  if (routineData && routineData.length > 0) {
    routineData.forEach(r => { localRoutines[r.day_name] = { title: r.title, exercises: r.exercises }; });
  } else {
    localRoutines = JSON.parse(JSON.stringify(defaultRoutines));
    for (const [dName, dVal] of Object.entries(localRoutines)) {
      await supabaseClient.from('routines').insert([{ day_name: dName, title: dVal.title, exercises: dVal.exercises }]);
    }
  }

  const { data: libData } = await supabaseClient.from('library').select('*');
  if (libData && libData.length > 0) {
    localLibrary = libData;
  } else {
    localLibrary = defaultLibrary;
    const seedItems = defaultLibrary.map(i => ({ user_id: currentUser.id, exercise: i.exercise, group_name: i.group_name }));
    await supabaseClient.from('library').insert(seedItems);
  }
}

// Auto-Migration Function
async function autoMigrateLocalStorage() {
  const usersLS = JSON.parse(localStorage.getItem('prs_users')) || {};
  const username = currentUser.email.split('@')[0];
  const userData = usersLS[username] || usersLS[currentUser.email];

  if (!userData || userData.migrated) return;

  if (userData.prs && userData.prs.length) {
    const prInserts = userData.prs.map(p => ({
      user_id: currentUser.id, exercise: p.exercise, category: p.category, weight: p.weight, reps: p.reps, history: p.history || []
    }));
    await supabaseClient.from('prs').insert(prInserts);
  }

  if (userData.routines) {
    for (const [dName, dVal] of Object.entries(userData.routines)) {
      await supabaseClient.from('routines').upsert([{ user_id: currentUser.id, day_name: dName, title: dVal.title, exercises: dVal.exercises }], { onConflict: 'user_id, day_name' });
    }
  }

  userData.migrated = true;
  localStorage.setItem('prs_users', JSON.stringify(usersLS));
}

// Library Accordion Menu
openLibraryBtn.onclick = () => {
  renderLibraryAccordion();
  libraryModal.classList.remove('hidden');
};

libraryCloseBtn.onclick = () => libraryModal.classList.add('hidden');

function renderLibraryAccordion() {
  libraryAccordion.innerHTML = '';
  const groups = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Run", "Walk"];

  groups.forEach(groupName => {
    const items = localLibrary.filter(item => item.group_name === groupName);
    if (items.length === 0) return;

    const groupDiv = document.createElement('div');
    groupDiv.className = 'accordion-group';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'accordion-header';
    headerDiv.innerHTML = `<span>${groupName} (${items.length})</span> <span class="acc-icon">[+]</span>`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'accordion-content';

    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'accordion-item';
      itemDiv.textContent = item.exercise;
      itemDiv.onclick = () => {
        routineExName.value = item.exercise;
        document.getElementById('routine-ex-group').value = item.group_name;
        libraryModal.classList.add('hidden');
      };
      contentDiv.appendChild(itemDiv);
    });

    headerDiv.onclick = () => {
      const isOpen = contentDiv.classList.contains('open');
      contentDiv.classList.toggle('open', !isOpen);
      headerDiv.querySelector('.acc-icon').textContent = isOpen ? '[+]' : '[-]';
    };

    groupDiv.appendChild(headerDiv);
    groupDiv.appendChild(contentDiv);
    libraryAccordion.appendChild(groupDiv);
  });
}

// Routine & Day Selection
window.selectDay = (dayName) => {
  selectedDayName = dayName;
  document.querySelectorAll('.day-pill').forEach(pill => {
    pill.classList.toggle('active', pill.textContent.trim().startsWith(dayName.slice(0, 3)));
  });
  renderRoutineDay(dayName);
};

function renderRoutineDay(dayName) {
  const dayData = localRoutines[dayName];
  const titleEl = document.getElementById('routine-title');
  const containerEl = document.getElementById('routine-container');

  titleEl.textContent = dayData ? dayData.title : `${dayName} Plan`;
  containerEl.innerHTML = '';

  if (!dayData || !dayData.exercises.length) {
    containerEl.innerHTML = '<div class="empty-state">No workout entries set for this day. Tap + to add one!</div>';
    return;
  }

  dayData.exercises.forEach((ex, idx) => {
    containerEl.innerHTML += `
      <div class="routine-card">
        <span class="routine-num">${idx + 1}.</span>
        <div class="routine-card-content">
          <div class="routine-card-header">
            <span class="routine-card-title">${ex.exercise}</span>
            <span class="badge">${ex.sets} sets × ${ex.reps}</span>
          </div>
          <div class="routine-card-meta">Target: ${ex.target || 'General'} (${ex.muscleGroup || 'General'})</div>
          ${ex.rotation ? `<div class="routine-card-sub">🔄 Rotation: ${ex.rotation}</div>` : ''}
          ${ex.tips ? `<div class="routine-card-tips">💡 ${ex.tips}</div>` : ''}
        </div>
        <div class="actions" style="flex-direction: column; align-items: center;">
          <div class="reorder-actions">
            <button class="btn-icon reorder-btn" onclick="moveRoutineExercise(${idx}, -1)">▲</button>
            <button class="btn-icon reorder-btn" onclick="moveRoutineExercise(${idx}, 1)">▼</button>
          </div>
          <button class="btn-icon" style="width:24px; height:24px; margin-top: 4px;" onclick="openRoutineModal(${idx})">✎</button>
          <button class="btn-icon del" style="width:24px; height:24px;" onclick="deleteRoutineExercise(${idx})">✕</button>
        </div>
      </div>
    `;
  });
}

async function saveRoutineDayToSupabase(dayName) {
  const dayData = localRoutines[dayName];
  await supabaseClient.from('routines').upsert([{
    user_id: currentUser.id,
    day_name: dayName,
    title: dayData.title,
    exercises: dayData.exercises
  }], { onConflict: 'user_id, day_name' });
}

window.moveRoutineExercise = async (idx, direction) => {
  const list = localRoutines[selectedDayName].exercises;
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= list.length) return;

  const temp = list[idx];
  list[idx] = list[targetIdx];
  list[targetIdx] = temp;

  await saveRoutineDayToSupabase(selectedDayName);
  renderRoutineDay(selectedDayName);
};

window.deleteRoutineExercise = async (idx) => {
  localRoutines[selectedDayName].exercises.splice(idx, 1);
  await saveRoutineDayToSupabase(selectedDayName);
  renderRoutineDay(selectedDayName);
};

// Day Title Editing
window.openDayTitleModal = () => {
  document.getElementById('day-title-input').value = localRoutines[selectedDayName]?.title || '';
  dayTitleModal.classList.remove('hidden');
};

dayTitleForm.onsubmit = async (e) => {
  e.preventDefault();
  localRoutines[selectedDayName].title = document.getElementById('day-title-input').value.trim();
  await saveRoutineDayToSupabase(selectedDayName);
  dayTitleModal.classList.add('hidden');
  renderRoutineDay(selectedDayName);
};

dayTitleCancelBtn.onclick = () => dayTitleModal.classList.add('hidden');

function openRoutineModal(editIdx = null) {
  routineForm.reset();
  document.getElementById('routine-edit-idx').value = editIdx !== null ? editIdx : '';

  if (editIdx !== null) {
    const ex = localRoutines[selectedDayName].exercises[editIdx];
    routineExName.value = ex.exercise;
    document.getElementById('routine-ex-group').value = ex.muscleGroup || 'Chest';
    document.getElementById('routine-ex-sets').value = ex.sets;
    document.getElementById('routine-ex-reps').value = ex.reps;
    document.getElementById('routine-ex-target').value = ex.target || '';
    document.getElementById('routine-ex-rotation').value = ex.rotation || '';
    document.getElementById('routine-ex-tips').value = ex.tips || '';
  }

  routineModal.classList.remove('hidden');
}

routineForm.onsubmit = async (e) => {
  e.preventDefault();
  const editIdx = document.getElementById('routine-edit-idx').value;
  const exercise = routineExName.value.trim();
  const muscleGroup = document.getElementById('routine-ex-group').value;
  const sets = document.getElementById('routine-ex-sets').value.trim();
  const reps = document.getElementById('routine-ex-reps').value.trim();
  const target = document.getElementById('routine-ex-target').value.trim();
  const rotation = document.getElementById('routine-ex-rotation').value.trim();
  const tips = document.getElementById('routine-ex-tips').value.trim();

  const existsInLib = localLibrary.some(l => l.exercise.toLowerCase() === exercise.toLowerCase());
  if (!existsInLib) {
    const { data } = await supabaseClient.from('library').insert([{ user_id: currentUser.id, exercise, group_name: muscleGroup }]).select();
    if (data && data.length) localLibrary.push(data[0]);
  }

  const newObj = { exercise, muscleGroup, sets, reps, target, rotation, tips };

  if (editIdx !== '') localRoutines[selectedDayName].exercises[editIdx] = newObj;
  else localRoutines[selectedDayName].exercises.push(newObj);

  await saveRoutineDayToSupabase(selectedDayName);
  routineModal.classList.add('hidden');
  renderRoutineDay(selectedDayName);
};

routineCancelBtn.onclick = () => routineModal.classList.add('hidden');

// PR Modal
function openModal(pr = null) {
  prForm.reset();
  if (pr) {
    modalTitle.textContent = 'Edit PR';
    document.getElementById('edit-id').value = pr.id;
    document.getElementById('exercise').value = pr.exercise;
    document.getElementById('category').value = pr.category;
    document.getElementById('weight').value = pr.weight;
    document.getElementById('reps').value = pr.reps;
  } else {
    modalTitle.textContent = 'Add New PR';
    document.getElementById('edit-id').value = '';
  }
  prModal.classList.remove('hidden');
}

function closeModal() { prModal.classList.add('hidden'); prForm.reset(); }
cancelBtn.onclick = closeModal;

prForm.onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const exercise = document.getElementById('exercise').value.trim();
  const category = document.getElementById('category').value;
  const weight = Math.max(0, parseFloat(document.getElementById('weight').value) || 0);
  const reps = Math.max(0, parseInt(document.getElementById('reps').value) || 0);
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (id) {
    const existing = localPRs.find(p => p.id == id);
    let history = existing.history || [];
    if (weight > existing.weight || history.length === 0) {
      history.push({ date: dateStr, weight });
    }
    await supabaseClient.from('prs').update({ exercise, category, weight, reps, history }).eq('id', id);
  } else {
    const history = [{ date: dateStr, weight }];
    await supabaseClient.from('prs').insert([{ user_id: currentUser.id, exercise, category, weight, reps, history }]);
  }

  closeModal();
  await fetchAllUserData();
  renderPRs();
};

window.editPr = (id) => {
  const pr = localPRs.find(p => p.id === id);
  if (pr) openModal(pr);
};

window.deletePr = async (id) => {
  await supabaseClient.from('prs').delete().eq('id', id);
  await fetchAllUserData();
  renderPRs();
};

// Percentages Modal
window.showPercentages = (id) => {
  const pr = localPRs.find(p => p.id === id);
  if (!pr) return;

  percentTitle.textContent = pr.exercise;
  percentSubtitle.textContent = `100% PR = ${pr.weight} kg (${pr.reps} reps)`;

  const est1RM = pr.reps === 1 ? pr.weight : Math.round(pr.weight * (1 + pr.reps / 30));
  oneRmBox.textContent = `Est. 1-Rep Max (1RM): ~${est1RM} kg`;

  const percentages = [];
  for (let pct = 95; pct >= 50; pct -= 5) percentages.push(pct);

  const renderColumn = (pctList) => {
    return pctList.map(pct => {
      const calculatedWeight = ((pr.weight * pct) / 100).toFixed(1);
      return `<div class="percent-row"><span>${pct}%</span><span>${parseFloat(calculatedWeight)} kg</span></div>`;
    }).join('');
  };

  percentColumns.innerHTML = `
    <div class="percent-col">${renderColumn(percentages.filter(p => p >= 75))}</div>
    <div class="percent-col">${renderColumn(percentages.filter(p => p < 75))}</div>
  `;

  percentModal.classList.remove('hidden');
};

percentCloseBtn.onclick = () => percentModal.classList.add('hidden');
searchBar.oninput = () => renderPRs();

// Render PR List
function renderPRs() {
  container.innerHTML = '';
  const filterText = searchBar.value.toLowerCase().trim();
  const prs = localPRs.filter(p => 
    p.exercise.toLowerCase().includes(filterText) || 
    p.category.toLowerCase().includes(filterText)
  );

  if (prs.length === 0) {
    container.innerHTML = `<div class="empty-state">${filterText ? 'No matching exercises or muscle groups.' : 'No PRs recorded yet. Tap + to add one!'}</div>`;
    return;
  }

  const grouped = prs.reduce((acc, pr) => {
    (acc[pr.category] = acc[pr.category] || []).push(pr);
    return acc;
  }, {});

  for (const [category, items] of Object.entries(grouped)) {
    const groupEl = document.createElement('div');
    groupEl.innerHTML = `<div class="group-header">${category}</div>`;
    const ul = document.createElement('ul');

    items.forEach(pr => {
      ul.innerHTML += `
        <li>
          <strong class="pr-name">${pr.exercise}</strong>
          <div class="pr-right-group">
            <span class="badge">${pr.weight} kg × ${pr.reps}</span>
            <div class="actions">
              <button class="btn-icon" onclick="showPercentages(${pr.id})">%</button>
              <button class="btn-icon" onclick="editPr(${pr.id})">✎</button>
              <button class="btn-icon del" onclick="deletePr(${pr.id})">✕</button>
            </div>
          </div>
        </li>
      `;
    });
    groupEl.appendChild(ul);
    container.appendChild(groupEl);
  }
}

// Chart & History
function populateChartDropdown() {
  chartSelect.innerHTML = '<option value="" disabled selected>Select Exercise to View Graph</option>';
  localPRs.forEach(pr => {
    chartSelect.innerHTML += `<option value="${pr.id}">${pr.exercise}</option>`;
  });
}

chartSelect.onchange = (e) => {
  const id = Number(e.target.value);
  renderChartForExercise(id);
};

function renderChartForExercise(id) {
  const pr = localPRs.find(p => p.id === id);
  if (!pr || !pr.history) return;

  const labels = pr.history.map(h => h.date);
  const data = pr.history.map(h => h.weight);

  if (chartInstance) chartInstance.destroy();

  const ctx = document.getElementById('prChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${pr.exercise} (kg)`,
        data,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.15)',
        borderWidth: 2, fill: true, tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#f8fafc' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });

  historyManager.innerHTML = '<div class="group-header">History Points</div>';
  pr.history.forEach((point, index) => {
    historyManager.innerHTML += `
      <div class="history-item">
        <span><strong>${point.weight} kg</strong> on ${point.date}</span>
        <button class="btn-icon del" onclick="deleteHistoryPoint(${pr.id}, ${index})">✕</button>
      </div>
    `;
  });
}

window.deleteHistoryPoint = async (prId, index) => {
  const pr = localPRs.find(p => p.id === prId);
  if (!pr) return;

  pr.history.splice(index, 1);
  const maxWeight = pr.history.length > 0 ? Math.max(...pr.history.map(h => h.weight)) : 0;

  await supabaseClient.from('prs').update({ weight: maxWeight, history: pr.history }).eq('id', prId);
  await fetchAllUserData();
  renderChartForExercise(prId);
};

// Reset Dashboard to Blank Landing State
function resetDashboardView() {
  currentActiveTab = null;
  landingView.classList.remove('hidden');
  routineView.classList.add('hidden');
  recordsView.classList.add('hidden');
  chartView.classList.add('hidden');
  fabAdd.classList.add('hidden');

  tabRoutine.classList.remove('active');
  tabRecords.classList.remove('active');
  tabChart.classList.remove('active');
}

// App Initialization
function initApp() {
  if (currentUser) {
    authView.classList.add('hidden');
    appView.classList.remove('hidden');
    userDisplay.textContent = `@${currentUser.email.split('@')[0]}`;
    resetDashboardView();
  } else {
    authView.classList.remove('hidden');
    appView.classList.add('hidden');
  }
}

if ('serviceWorker' in navigator) {
  const swCode = `self.addEventListener('fetch', e => e.respondWith(fetch(e.request)));`;
  navigator.serviceWorker.register(URL.createObjectURL(new Blob([swCode], { type: 'text/javascript' })));
}