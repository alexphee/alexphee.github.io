const SUPABASE_URL = 'https://eqyfqrhdwneddizfrdjq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r4ax1Hb3sM4DwAcNk22B4A_c9H-6yAd';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let localPRs = [];
let localRoutines = {};
let localLibrary = [];
let selectedDayName = 'Monday';
let chartInstance = null;
let currentActiveTab = null;
let libraryTargetContext = 'routine';

// Default Exercise Library
const defaultLibrary = [
  { exercise: "Barbell Bench Press", group_name: "Chest" },
  { exercise: "Incline DB Press", group_name: "Chest" },
  { exercise: "Flat DB Bench Press", group_name: "Chest" },
  { exercise: "Incline Barbell Press", group_name: "Chest" },
  { exercise: "Cable Fly", group_name: "Chest" },
  { exercise: "Chest Dips", group_name: "Chest" },
  { exercise: "Pec Deck Fly", group_name: "Chest" },
  { exercise: "Machine Chest Press", group_name: "Chest" },
  { exercise: "Push Ups", group_name: "Chest" },
  { exercise: "Decline Bench Press", group_name: "Chest" },
  { exercise: "Pull Ups", group_name: "Back" },
  { exercise: "Lat Pulldown", group_name: "Back" },
  { exercise: "Barbell Bent Over Row", group_name: "Back" },
  { exercise: "Seated Cable Row", group_name: "Back" },
  { exercise: "Single Arm DB Row", group_name: "Back" },
  { exercise: "T-Bar Row", group_name: "Back" },
  { exercise: "Chest Supported Row", group_name: "Back" },
  { exercise: "Chin Ups", group_name: "Back" },
  { exercise: "Face Pulls", group_name: "Back" },
  { exercise: "Straight Arm Pulldown", group_name: "Back" },
  { exercise: "Barbell Back Squat", group_name: "Legs" },
  { exercise: "Romanian Deadlift (RDL)", group_name: "Legs" },
  { exercise: "Leg Press", group_name: "Legs" },
  { exercise: "Bulgarian Split Squat", group_name: "Legs" },
  { exercise: "Hack Squat", group_name: "Legs" },
  { exercise: "Leg Extensions", group_name: "Legs" },
  { exercise: "Lying Leg Curls", group_name: "Legs" },
  { exercise: "Standing Calf Raises", group_name: "Legs" },
  { exercise: "Seated Calf Raises", group_name: "Legs" },
  { exercise: "Goblet Squat", group_name: "Legs" },
  { exercise: "Overhead Barbell Press", group_name: "Shoulders" },
  { exercise: "Seated DB Shoulder Press", group_name: "Shoulders" },
  { exercise: "Dumbbell Lateral Raises", group_name: "Shoulders" },
  { exercise: "Cable Lateral Raises", group_name: "Shoulders" },
  { exercise: "Arnold Press", group_name: "Shoulders" },
  { exercise: "Rear Delt DB Flyes", group_name: "Shoulders" },
  { exercise: "Reverse Pec Deck", group_name: "Shoulders" },
  { exercise: "Front DB Raises", group_name: "Shoulders" },
  { exercise: "Barbell Shrugs", group_name: "Shoulders" },
  { exercise: "Upright Rows", group_name: "Shoulders" },
  { exercise: "Barbell Curl", group_name: "Biceps" },
  { exercise: "Dumbbell Bicep Curl", group_name: "Biceps" },
  { exercise: "Hammer Curls", group_name: "Biceps" },
  { exercise: "Preacher Curl", group_name: "Biceps" },
  { exercise: "Incline DB Curl", group_name: "Biceps" },
  { exercise: "EZ Bar Curls", group_name: "Biceps" },
  { exercise: "Cable Bicep Curl", group_name: "Biceps" },
  { exercise: "Concentration Curls", group_name: "Biceps" },
  { exercise: "Spider Curls", group_name: "Biceps" },
  { exercise: "Tricep Rope Pushdown", group_name: "Triceps" },
  { exercise: "Skull Crushers", group_name: "Triceps" },
  { exercise: "Close Grip Bench Press", group_name: "Triceps" },
  { exercise: "Tricep Overhead Extension", group_name: "Triceps" },
  { exercise: "Cable French Press", group_name: "Triceps" },
  { exercise: "Straight Bar Pushdown", group_name: "Triceps" },
  { exercise: "Parallel Bar Dips", group_name: "Triceps" },
  { exercise: "Single Arm Kickbacks", group_name: "Triceps" },
  { exercise: "Bench Dips", group_name: "Triceps" },
  { exercise: "Hanging Leg Raises", group_name: "Core" },
  { exercise: "Cable Woodchoppers", group_name: "Core" },
  { exercise: "Ab Wheel Rollouts", group_name: "Core" },
  { exercise: "Crunches", group_name: "Core" },
  { exercise: "Plank", group_name: "Core" },
  { exercise: "Russian Twists", group_name: "Core" },
  { exercise: "Heel Touches", group_name: "Core" },
  { exercise: "Decline Sit-Ups", group_name: "Core" },
  { exercise: "Cable Crunches", group_name: "Core" },
  { exercise: "Road Running", group_name: "Run" },
  { exercise: "Treadmill Run", group_name: "Run" },
  { exercise: "Track Intervals", group_name: "Run" },
  { exercise: "Tempo Run", group_name: "Run" },
  { exercise: "Sprint Intervals", group_name: "Run" },
  { exercise: "Incline Treadmill Walk", group_name: "Walk" },
  { exercise: "Outdoor Power Walk", group_name: "Walk" },
  { exercise: "Weighted Vest Walk", group_name: "Walk" },
  { exercise: "Trail Run", group_name: "Trail" },
  { exercise: "Mountain Hike", group_name: "Trail" },
  { exercise: "Ultra Trail Run", group_name: "Trail" }
];

const defaultRoutines = {
  Monday: { title: "Workout Title", exercises: [] },
  Tuesday: { title: "Workout Title", exercises: [] },
  Wednesday: { title: "Workout Title", exercises: [] },
  Thursday: { title: "Workout Title", exercises: [] },
  Friday: { title: "Workout Title", exercises: [] },
  Saturday: { title: "Workout Title", exercises: [] },
  Sunday: { title: "Workout Title", exercises: [] }
};

// Filter All Matching Exercises Starting With / Containing Input
function getMatchingExerciseSuggestions(input) {
  const cleanInput = input.trim().toLowerCase();
  if (cleanInput.length < 2) return [];

  const startsWithMatches = [];
  const containsMatches = [];

  localLibrary.forEach(item => {
    const cleanEx = item.exercise.toLowerCase();
    if (cleanEx === cleanInput) return;

    if (cleanEx.startsWith(cleanInput)) {
      startsWithMatches.push(item);
    } else if (cleanEx.includes(cleanInput)) {
      containsMatches.push(item);
    }
  });

  return [...startsWithMatches, ...containsMatches].slice(0, 6);
}

// Ensure Exercise Exists in User's Library
async function ensureExerciseInLibrary(exerciseName, groupName) {
  const exists = localLibrary.some(l => l.exercise.toLowerCase() === exerciseName.toLowerCase());
  if (!exists) {
    const { data } = await supabaseClient
      .from('library')
      .insert([{ user_id: currentUser.id, exercise: exerciseName, group_name: groupName }])
      .select();
      
    if (data && data.length) {
      localLibrary.push(data[0]);
    } else {
      localLibrary.push({ exercise: exerciseName, group_name: groupName });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const authView = document.getElementById('auth-view');
  const appView = document.getElementById('app-view');
  const landingView = document.getElementById('landing-view');
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
  const prExInput = document.getElementById('exercise');
  const prSuggestionBox = document.getElementById('pr-suggestion-box');
  const cancelBtn = document.getElementById('cancel-btn');
  const modalTitle = document.getElementById('modal-title');
  const categorySelect = document.getElementById('category');
  const weightInput = document.getElementById('weight');
  const repsInput = document.getElementById('reps');

  const routineModal = document.getElementById('routine-modal');
  const routineForm = document.getElementById('routine-form');
  const routineCancelBtn = document.getElementById('routine-cancel-btn');
  const routineExName = document.getElementById('routine-ex-name');
  const routineSuggestionBox = document.getElementById('routine-suggestion-box');

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

  // Input Suggestion Event Listeners
  routineExName.addEventListener('input', () => {
    renderSuggestionList(routineExName.value, routineSuggestionBox, (selectedObj) => {
      routineExName.value = selectedObj.exercise;
      document.getElementById('routine-ex-group').value = selectedObj.group_name;
      routineSuggestionBox.classList.add('hidden');
    });
  });

  prExInput.addEventListener('input', () => {
    renderSuggestionList(prExInput.value, prSuggestionBox, (selectedObj) => {
      prExInput.value = selectedObj.exercise;
      categorySelect.value = selectedObj.group_name;
      updatePRModalLabels();
      prSuggestionBox.classList.add('hidden');
    });
  });

  function renderSuggestionList(inputVal, containerEl, onSelect) {
    const matches = getMatchingExerciseSuggestions(inputVal);
    
    if (matches.length === 0) {
      containerEl.classList.add('hidden');
      containerEl.innerHTML = '';
      return;
    }

    containerEl.className = 'suggestion-list-container';
    containerEl.innerHTML = matches.map(item => `
      <div class="suggestion-item">
        <span class="item-title">${item.exercise}</span>
        <span class="item-group">${item.group_name}</span>
      </div>
    `).join('');

    const items = containerEl.querySelectorAll('.suggestion-item');
    items.forEach((itemEl, idx) => {
      itemEl.onclick = () => onSelect(matches[idx]);
    });

    containerEl.classList.remove('hidden');
  }

  // Open Library Accordion for PR or Routine
  document.querySelectorAll('.open-lib-trigger').forEach(btn => {
    btn.onclick = (e) => {
      const isPR = e.target.closest('#pr-modal') !== null;
      libraryTargetContext = isPR ? 'pr' : 'routine';
      renderLibraryAccordion();
      libraryModal.classList.remove('hidden');
    };
  });

  categorySelect.onchange = () => updatePRModalLabels();

  function updatePRModalLabels() {
    const isCardio = ['Run', 'Walk', 'Trail'].includes(categorySelect.value);
    weightInput.placeholder = isCardio ? "Distance (km)" : "Weight (kg)";
    repsInput.placeholder = isCardio ? "Time (min)" : "Reps";
  }

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

  if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        alert('Please enter both email and password.');
        return;
      }

      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!username || !email || !password) {
        alert('Please fill in a username, email, and password to sign up.');
        return;
      }

      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });

      if (error) alert(error.message);
      else alert('Account created! Please check your email if confirmation is required.');
    });
  }

  if (logoutBtn) {
    logoutBtn.onclick = async () => { 
      await supabaseClient.auth.signOut(); 
    };
  }

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      currentUser = session.user;
      const customName = currentUser.user_metadata?.username || currentUser.email.split('@')[0];
      userDisplay.textContent = `@${customName}`;
      
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

  async function autoMigrateLocalStorage() {
    const usersLS = JSON.parse(localStorage.getItem('prs_users')) || {};
    const username = currentUser.user_metadata?.username || currentUser.email.split('@')[0];
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

  libraryCloseBtn.onclick = () => libraryModal.classList.add('hidden');

  function renderLibraryAccordion() {
    libraryAccordion.innerHTML = '';
    const groups = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Run", "Walk", "Trail"];

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
          if (libraryTargetContext === 'pr') {
            prExInput.value = item.exercise;
            categorySelect.value = item.group_name;
            updatePRModalLabels();
          } else {
            routineExName.value = item.exercise;
            document.getElementById('routine-ex-group').value = item.group_name;
          }
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

  // Globals for editing routine exercises
  window.openRoutineModal = function(editIdx = null) {
    routineForm.reset();
    routineSuggestionBox.classList.add('hidden');
    document.getElementById('routine-edit-idx').value = editIdx !== null ? editIdx : '';

    if (editIdx !== null && localRoutines[selectedDayName] && localRoutines[selectedDayName].exercises[editIdx]) {
      const ex = localRoutines[selectedDayName].exercises[editIdx];
      routineExName.value = ex.exercise || '';
      document.getElementById('routine-ex-group').value = ex.muscleGroup || 'Chest';
      document.getElementById('routine-ex-sets').value = ex.sets || '';
      document.getElementById('routine-ex-reps').value = ex.reps || '';
      document.getElementById('routine-ex-target').value = ex.target || '';
      document.getElementById('routine-ex-rotation').value = ex.rotation || '';
      document.getElementById('routine-ex-tips').value = ex.tips || '';
    }

    routineModal.classList.remove('hidden');
  };

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

    await ensureExerciseInLibrary(exercise, muscleGroup);

    const newObj = { exercise, muscleGroup, sets, reps, target, rotation, tips };

    if (editIdx !== '') localRoutines[selectedDayName].exercises[editIdx] = newObj;
    else localRoutines[selectedDayName].exercises.push(newObj);

    await saveRoutineDayToSupabase(selectedDayName);
    routineModal.classList.add('hidden');
    renderRoutineDay(selectedDayName);
  };

  routineCancelBtn.onclick = () => routineModal.classList.add('hidden');

  function openModal(pr = null) {
    prForm.reset();
    prSuggestionBox.classList.add('hidden');

    if (pr) {
      modalTitle.textContent = 'Edit PR';
      document.getElementById('edit-id').value = pr.id;
      prExInput.value = pr.exercise;
      categorySelect.value = pr.category;
      updatePRModalLabels();
      weightInput.value = pr.weight;
      repsInput.value = pr.reps;
    } else {
      modalTitle.textContent = 'Add New PR';
      document.getElementById('edit-id').value = '';
      categorySelect.selectedIndex = 0;
      updatePRModalLabels();
    }
    prModal.classList.remove('hidden');
  }

  function closeModal() { prModal.classList.add('hidden'); prForm.reset(); }
  cancelBtn.onclick = closeModal;

  prForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const exercise = prExInput.value.trim();
    const category = categorySelect.value;
    const weight = Math.max(0, parseFloat(weightInput.value) || 0);
    const reps = Math.max(0, parseFloat(repsInput.value) || 0);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    await ensureExerciseInLibrary(exercise, category);

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

  window.showPercentages = (id) => {
    const pr = localPRs.find(p => p.id === id);
    if (!pr) return;

    const isCardio = ['Run', 'Walk', 'Trail'].includes(pr.category);

    percentTitle.textContent = pr.exercise;
    
    if (isCardio) {
      percentSubtitle.textContent = `Best: ${pr.weight} km in ${pr.reps} min`;
      oneRmBox.textContent = `Pace: ~${(pr.reps / pr.weight).toFixed(2)} min/km`;
    } else {
      percentSubtitle.textContent = `100% PR = ${pr.weight} kg (${pr.reps} reps)`;
      const est1RM = pr.reps === 1 ? pr.weight : Math.round(pr.weight * (1 + pr.reps / 30));
      oneRmBox.textContent = `Est. 1-Rep Max (1RM): ~${est1RM} kg`;
    }

    const percentages = [];
    for (let pct = 95; pct >= 50; pct -= 5) percentages.push(pct);

    const renderColumn = (pctList) => {
      return pctList.map(pct => {
        const calculatedVal = ((pr.weight * pct) / 100).toFixed(1);
        const unit = isCardio ? 'km' : 'kg';
        return `<div class="percent-row"><span>${pct}%</span><span>${parseFloat(calculatedVal)} ${unit}</span></div>`;
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

  function renderPRs() {
    container.innerHTML = '';
    const filterText = searchBar.value.toLowerCase().trim();
    const prs = localPRs.filter(p => 
      p.exercise.toLowerCase().includes(filterText) || 
      p.category.toLowerCase().includes(filterText)
    );

    if (prs.length === 0) {
      container.innerHTML = `<div class="empty-state">${filterText ? 'No matching exercises or categories.' : 'No PRs recorded yet. Tap + to add one!'}</div>`;
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
        const isCardio = ['Run', 'Walk', 'Trail'].includes(pr.category);
        const badgeText = isCardio ? `${pr.weight} km in ${pr.reps} min` : `${pr.weight} kg × ${pr.reps}`;

        ul.innerHTML += `
          <li>
            <strong class="pr-name">${pr.exercise}</strong>
            <div class="pr-right-group">
              <span class="badge">${badgeText}</span>
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

    const isCardio = ['Run', 'Walk', 'Trail'].includes(pr.category);
    const unitLabel = isCardio ? 'km' : 'kg';

    const labels = pr.history.map(h => h.date);
    const data = pr.history.map(h => h.weight);

    if (chartInstance) chartInstance.destroy();

    const ctx = document.getElementById('prChart').getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${pr.exercise} (${unitLabel})`,
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
          <span><strong>${point.weight} ${unitLabel}</strong> on ${point.date}</span>
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
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .catch(err => console.log('ServiceWorker registration skipped:', err));
}