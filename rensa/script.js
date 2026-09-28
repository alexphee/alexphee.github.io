const SUPABASE_URL = 'https://eqyfqrhdwneddizfrdjq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r4ax1Hb3sM4DwAcNk22B4A_c9H-6yAd';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let activeAppMode = 'pulse';

// Pulse State
let localPRs = [];
let localRoutines = {};
let localLibrary = [];
let selectedDayName = 'Monday';
let chartInstance = null;
let currentActiveTab = null;
let libraryTargetContext = 'routine';
let draggedCardIndex = null;

// Macros State
let macroSelectedDate = new Date().toISOString().split('T')[0];
let macroFoods = [];
let macroLogs = [];
let macroTargets = { calories: 2000, protein: 160, carbs: 220, fats: 65 };

const defaultMacroFoods = [
  { id: '1', name: 'Atlantic Salmon Filet', calories: 208, protein: 20, carbs: 0, fats: 13 },
  { id: '2', name: 'Avocado (Ripe)', calories: 160, protein: 2, carbs: 8.5, fats: 15 },
  { id: '3', name: 'Chicken Breast (Cooked)', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  { id: '4', name: 'Extra Virgin Olive Oil', calories: 884, protein: 0, carbs: 0, fats: 100 },
  { id: '5', name: 'Fresh Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
  { id: '6', name: 'Greek Yogurt 0%', calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
  { id: '7', name: 'Rolled Oats Flakes', calories: 389, protein: 16.9, carbs: 66, fats: 6.9 },
  { id: '8', name: 'Whey Protein Powder', calories: 380, protein: 80, carbs: 5, fats: 4 },
  { id: '9', name: 'White Rice (Cooked)', calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  { id: '10', name: 'Whole Eggs (Large)', calories: 155, protein: 13, carbs: 1.1, fats: 11 }
];

const MEAL_TYPES = ['Breakfast', 'Brunch', 'Lunch', 'Snack', 'Afternoon', 'Dinner'];

// Enriched Default Exercise Library
const defaultLibrary = [
  { exercise: "Barbell Bench Press", group_name: "Chest" },
  { exercise: "Cable Fly", group_name: "Chest" },
  { exercise: "Chest Dips", group_name: "Chest" },
  { exercise: "Decline Bench Press", group_name: "Chest" },
  { exercise: "Flat DB Bench Press", group_name: "Chest" },
  { exercise: "Incline Barbell Press", group_name: "Chest" },
  { exercise: "Incline DB Press", group_name: "Chest" },
  { exercise: "Machine Chest Press", group_name: "Chest" },
  { exercise: "Pec Deck Fly", group_name: "Chest" },
  { exercise: "Push Ups", group_name: "Chest" },
  { exercise: "Barbell Bent Over Row", group_name: "Back" },
  { exercise: "Chest Supported Row", group_name: "Back" },
  { exercise: "Chin Ups", group_name: "Back" },
  { exercise: "Face Pulls", group_name: "Back" },
  { exercise: "Lat Pulldown", group_name: "Back" },
  { exercise: "Pull Ups", group_name: "Back" },
  { exercise: "Seated Cable Row", group_name: "Back" },
  { exercise: "Single Arm DB Row", group_name: "Back" },
  { exercise: "Straight Arm Pulldown", group_name: "Back" },
  { exercise: "T-Bar Row", group_name: "Back" },
  { exercise: "Barbell Back Squat", group_name: "Legs" },
  { exercise: "Bulgarian Split Squat", group_name: "Legs" },
  { exercise: "Goblet Squat", group_name: "Legs" },
  { exercise: "Hack Squat", group_name: "Legs" },
  { exercise: "Leg Extensions", group_name: "Legs" },
  { exercise: "Leg Press", group_name: "Legs" },
  { exercise: "Lying Leg Curls", group_name: "Legs" },
  { exercise: "Romanian Deadlift (RDL)", group_name: "Legs" },
  { exercise: "Seated Calf Raises", group_name: "Legs" },
  { exercise: "Standing Calf Raises", group_name: "Legs" },
  { exercise: "Arnold Press", group_name: "Shoulders" },
  { exercise: "Barbell Shrugs", group_name: "Shoulders" },
  { exercise: "Cable Lateral Raises", group_name: "Shoulders" },
  { exercise: "Dumbbell Lateral Raises", group_name: "Shoulders" },
  { exercise: "Front DB Raises", group_name: "Shoulders" },
  { exercise: "Overhead Barbell Press", group_name: "Shoulders" },
  { exercise: "Rear Delt DB Flyes", group_name: "Shoulders" },
  { exercise: "Reverse Pec Deck", group_name: "Shoulders" },
  { exercise: "Seated DB Shoulder Press", group_name: "Shoulders" },
  { exercise: "Upright Rows", group_name: "Shoulders" },
  { exercise: "Barbell Curl", group_name: "Biceps" },
  { exercise: "Cable Bicep Curl", group_name: "Biceps" },
  { exercise: "Concentration Curls", group_name: "Biceps" },
  { exercise: "Dumbbell Bicep Curl", group_name: "Biceps" },
  { exercise: "EZ Bar Curls", group_name: "Biceps" },
  { exercise: "Hammer Curls", group_name: "Biceps" },
  { exercise: "Incline DB Curl", group_name: "Biceps" },
  { exercise: "Preacher Curl", group_name: "Biceps" },
  { exercise: "Spider Curls", group_name: "Biceps" },
  { exercise: "Bench Dips", group_name: "Triceps" },
  { exercise: "Cable French Press", group_name: "Triceps" },
  { exercise: "Close Grip Bench Press", group_name: "Triceps" },
  { exercise: "Parallel Bar Dips", group_name: "Triceps" },
  { exercise: "Single Arm Kickbacks", group_name: "Triceps" },
  { exercise: "Skull Crushers", group_name: "Triceps" },
  { exercise: "Straight Bar Pushdown", group_name: "Triceps" },
  { exercise: "Tricep Overhead Extension", group_name: "Triceps" },
  { exercise: "Tricep Rope Pushdown", group_name: "Triceps" },
  { exercise: "Ab Wheel Rollouts", group_name: "Core" },
  { exercise: "Cable Crunches", group_name: "Core" },
  { exercise: "Cable Woodchoppers", group_name: "Core" },
  { exercise: "Crunches", group_name: "Core" },
  { exercise: "Decline Sit-Ups", group_name: "Core" },
  { exercise: "Hanging Leg Raises", group_name: "Core" },
  { exercise: "Heel Touches", group_name: "Core" },
  { exercise: "Plank", group_name: "Core" },
  { exercise: "Russian Twists", group_name: "Core" },
  { exercise: "Road Running", group_name: "Run" },
  { exercise: "Sprint Intervals", group_name: "Run" },
  { exercise: "Tempo Run", group_name: "Run" },
  { exercise: "Track Intervals", group_name: "Run" },
  { exercise: "Treadmill Run", group_name: "Run" },
  { exercise: "Incline Treadmill Walk", group_name: "Walk" },
  { exercise: "Outdoor Power Walk", group_name: "Walk" },
  { exercise: "Weighted Vest Walk", group_name: "Walk" },
  { exercise: "Mountain Hike", group_name: "Trail" },
  { exercise: "Trail Run", group_name: "Trail" },
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

function getGroupDotClass(groupName) {
  if (!groupName) return 'dot-default';
  switch (groupName.toLowerCase().trim()) {
    case 'chest': return 'dot-chest';
    case 'back': return 'dot-back';
    case 'legs': return 'dot-legs';
    case 'shoulders': return 'dot-shoulders';
    case 'biceps': return 'dot-biceps';
    case 'triceps': return 'dot-triceps';
    case 'core': return 'dot-core';
    case 'run': return 'dot-run';
    case 'walk': return 'dot-walk';
    case 'trail': return 'dot-trail';
    default: return 'dot-default';
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
  const appSwitchBtn = document.getElementById('app-switch-btn');

  const tabRecords = document.getElementById('tab-records');
  const tabRoutine = document.getElementById('tab-routine');
  const tabChart = document.getElementById('tab-chart');
  const recordsView = document.getElementById('records-view');
  const routineView = document.getElementById('routine-view');
  const chartView = document.getElementById('chart-view');
  const chartSelect = document.getElementById('chart-select');

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

  // App Mode Switching
  appSwitchBtn.onclick = () => {
    activeAppMode = activeAppMode === 'pulse' ? 'macros' : 'pulse';
    localStorage.setItem('rensa_app_mode', activeAppMode);
    renderAppMode();
  };

  function renderAppMode() {
    const pulseContainer = document.getElementById('pulse-mode-container');
    const macrosContainer = document.getElementById('macros-mode-container');
    const titleDisplay = document.getElementById('app-title-display');

    if (activeAppMode === 'macros') {
      pulseContainer.classList.add('hidden');
      macrosContainer.classList.remove('hidden');
      titleDisplay.textContent = 'Rensa Macros';
      appSwitchBtn.textContent = '🏋️ Switch to Workout';
      loadMacroData();
    } else {
      macrosContainer.classList.add('hidden');
      pulseContainer.classList.remove('hidden');
      titleDisplay.textContent = 'Rensa Pulse';
      appSwitchBtn.textContent = '⚡ Switch to Nutrition';
    }
  }

  // Bind Menu Triggers for Accordion Library
  document.querySelectorAll('.open-lib-trigger').forEach(btn => {
    btn.onclick = (e) => {
      const isPR = e.target.closest('#pr-modal') !== null;
      libraryTargetContext = isPR ? 'pr' : 'routine';
      renderLibraryAccordion();
      libraryModal.classList.remove('hidden');
    };
  });

  libraryCloseBtn.onclick = () => libraryModal.classList.add('hidden');

  function renderLibraryAccordion() {
    libraryAccordion.innerHTML = '';
    const groups = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Run", "Walk", "Trail"];

    groups.forEach(groupName => {
      const items = localLibrary
        .filter(item => item.group_name === groupName)
        .sort((a, b) => a.exercise.localeCompare(b.exercise));

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

  // Percent Modal Calculations & Display
  window.showPercentages = function(id) {
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

  // Auth Handling
  if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
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
      const { error } = await supabaseClient.auth.signUp({ email, password, options: { data: { username } } });
      if (error) alert(error.message);
      else alert('Account created!');
    });
  }

  logoutBtn.onclick = async () => {
    localStorage.removeItem('apex_active_tab');
    await supabaseClient.auth.signOut();
  };

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      currentUser = session.user;
      userDisplay.textContent = `@${currentUser.user_metadata?.username || currentUser.email.split('@')[0]}`;
      authView.classList.add('hidden');
      appView.classList.remove('hidden');

      activeAppMode = localStorage.getItem('rensa_app_mode') || 'pulse';
      renderAppMode();

      await autoMigrateLocalStorage();
      await fetchAllUserData();

      const savedTab = localStorage.getItem('apex_active_tab');
      if (savedTab) switchTab(savedTab);
      else resetDashboardView();
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

  // Rensa Pulse Navigation & Tab Logic
  tabRoutine.onclick = () => switchTab('routine');
  tabRecords.onclick = () => switchTab('records');
  tabChart.onclick = () => switchTab('chart');

  function switchTab(tab) {
    currentActiveTab = tab;
    localStorage.setItem('apex_active_tab', tab);
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
    if (currentActiveTab === 'routine') window.openRoutineModal();
    else if (currentActiveTab === 'records') openModal();
  };

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
      const dotClass = getGroupDotClass(ex.muscleGroup);

      const card = document.createElement('div');
      card.className = 'routine-card';
      card.draggable = true;
      card.dataset.index = idx;

      card.innerHTML = `
        <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
        <span class="routine-num">${idx + 1}.</span>
        <div class="routine-card-content">
          <div class="routine-card-header">
            <span class="routine-card-title">${ex.exercise}</span>
            <span class="badge">${ex.sets} sets × ${ex.reps}</span>
          </div>
          ${ex.rotation ? `<div class="routine-card-sub">🔄 Rotation: ${ex.rotation}</div>` : ''}
          ${ex.tips ? `<div class="routine-card-tips">💡 ${ex.tips}</div>` : ''}
          
          <div class="routine-card-footer">
            <div class="routine-card-footer-left">
              <span class="group-square-badge ${dotClass}"></span>
              <span>${ex.muscleGroup || 'General'} ${ex.target ? '• ' + ex.target : ''}</span>
            </div>
          </div>
        </div>
        <div class="actions" style="flex-direction: column; align-items: center; justify-content: center;">
          <button class="btn-icon" style="width:24px; height:24px; margin-bottom: 4px;" onclick="openRoutineModal(${idx})">✎</button>
          <button class="btn-icon del" style="width:24px; height:24px;" onclick="deleteRoutineExercise(${idx})">✕</button>
        </div>
      `;

      // Touch handlers for mobile drag & drop
      const handleEl = card.querySelector('.drag-handle');
      handleEl.addEventListener('touchstart', () => {
        draggedCardIndex = idx;
        card.classList.add('dragging');
      }, { passive: true });

      handleEl.addEventListener('touchmove', (e) => {
        if (draggedCardIndex === null) return;
        const touch = e.touches[0];
        const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!targetEl) return;

        const targetCard = targetEl.closest('.routine-card');
        if (targetCard && targetCard !== card) {
          const allCards = Array.from(containerEl.querySelectorAll('.routine-card'));
          const targetIndex = allCards.indexOf(targetCard);
          const currentIndex = allCards.indexOf(card);

          if (targetIndex !== -1 && currentIndex !== -1 && targetIndex !== currentIndex) {
            if (targetIndex > currentIndex) {
              containerEl.insertBefore(card, targetCard.nextSibling);
            } else {
              containerEl.insertBefore(card, targetCard);
            }
          }
        }
      }, { passive: true });

      handleEl.addEventListener('touchend', async () => {
        card.classList.remove('dragging');
        if (draggedCardIndex !== null) {
          const allCards = Array.from(containerEl.querySelectorAll('.routine-card'));
          const originalList = [...localRoutines[selectedDayName].exercises];
          const newList = [];

          allCards.forEach((cEl) => {
            const origIdx = parseInt(cEl.dataset.index, 10);
            if (originalList[origIdx]) newList.push(originalList[origIdx]);
          });

          localRoutines[selectedDayName].exercises = newList;
          draggedCardIndex = null;
          await saveRoutineDayToSupabase(selectedDayName);
          renderRoutineDay(selectedDayName);
        }
      });

      containerEl.appendChild(card);
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

  window.deleteRoutineExercise = async (idx) => {
    localRoutines[selectedDayName].exercises.splice(idx, 1);
    await saveRoutineDayToSupabase(selectedDayName);
    renderRoutineDay(selectedDayName);
  };

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

    const newObj = { exercise, muscleGroup, sets, reps, target, rotation, tips };

    if (editIdx !== '') localRoutines[selectedDayName].exercises[editIdx] = newObj;
    else localRoutines[selectedDayName].exercises.push(newObj);

    await saveRoutineDayToSupabase(selectedDayName);
    routineModal.classList.add('hidden');
    renderRoutineDay(selectedDayName);
  };

  routineCancelBtn.onclick = () => routineModal.classList.add('hidden');

  window.openModal = function(pr = null) {
    prForm.reset();
    prSuggestionBox.classList.add('hidden');

    if (pr) {
      modalTitle.textContent = 'Edit PR';
      document.getElementById('edit-id').value = pr.id;
      prExInput.value = pr.exercise;
      categorySelect.value = pr.category;
      weightInput.value = pr.weight;
      repsInput.value = pr.reps;
    } else {
      modalTitle.textContent = 'Add New PR';
      document.getElementById('edit-id').value = '';
      categorySelect.selectedIndex = 0;
    }
    prModal.classList.remove('hidden');
  };

  cancelBtn.onclick = () => prModal.classList.add('hidden');

  prForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const exercise = prExInput.value.trim();
    const category = categorySelect.value;
    const weight = Math.max(0, parseFloat(weightInput.value) || 0);
    const reps = Math.max(0, parseFloat(repsInput.value) || 0);
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

    prModal.classList.add('hidden');
    await fetchAllUserData();
    renderPRs();
  };

  function renderPRs() {
    container.innerHTML = '';
    const filterText = searchBar.value.toLowerCase().trim();
    const prs = localPRs.filter(p => 
      p.exercise.toLowerCase().includes(filterText) || 
      p.category.toLowerCase().includes(filterText)
    );

    if (prs.length === 0) {
      container.innerHTML = `<div class="empty-state">No PRs recorded yet. Tap + to add one!</div>`;
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
        const badgeText = `${pr.weight} kg × ${pr.reps}`;
        const dotClass = getGroupDotClass(pr.category);

        ul.innerHTML += `
          <li style="position: relative; padding-bottom: 24px;">
            <strong class="pr-name">${pr.exercise}</strong>
            <div class="pr-right-group">
              <span class="badge">${badgeText}</span>
              <div class="actions">
                <button class="btn-icon" onclick="showPercentages(${pr.id})">%</button>
                <button class="btn-icon" onclick="editPr(${pr.id})">✎</button>
                <button class="btn-icon del" onclick="deletePr(${pr.id})">✕</button>
              </div>
            </div>
            <div style="position: absolute; bottom: 8px; left: 14px; display: flex; align-items: center; gap: 6px;">
              <span class="group-square-badge ${dotClass}"></span>
              <span style="font-size: 0.72rem; color: #64748b; font-weight: 600; text-transform: uppercase;">${pr.category}</span>
            </div>
          </li>
        `;
      });
      groupEl.appendChild(ul);
      container.appendChild(groupEl);
    }
  }

  window.editPr = (id) => {
    const pr = localPRs.find(p => p.id === id);
    if (pr) window.openModal(pr);
  };

  window.deletePr = async (id) => {
    await supabaseClient.from('prs').delete().eq('id', id);
    await fetchAllUserData();
    renderPRs();
  };

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

    if (chartInstance) chartInstance.destroy();
    const ctx = document.getElementById('prChart').getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: pr.history.map(h => h.date),
        datasets: [{ label: `${pr.exercise} (kg)`, data: pr.history.map(h => h.weight), borderColor: '#22c55e', fill: true, tension: 0.3 }]
      },
      options: { responsive: true }
    });
  }

  function resetDashboardView() {
    currentActiveTab = null;
    landingView.classList.remove('hidden');
    routineView.classList.add('hidden');
    recordsView.classList.add('hidden');
    chartView.classList.add('hidden');
    fabAdd.classList.add('hidden');
  }

  // ================= RENSA MACROS NUTRITION LOGIC =================
  window.switchMacroTab = function(tab) {
    document.querySelectorAll('.macro-tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`macro-tab-${tab}`).classList.remove('hidden');
    document.querySelectorAll('#macros-mode-container .tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-macro-${tab}`).classList.add('active');
  };

  async function loadMacroData() {
    document.getElementById('macro-date-picker').value = macroSelectedDate;
    const storedTargets = localStorage.getItem('rensa_macro_targets');
    if (storedTargets) macroTargets = JSON.parse(storedTargets);

    document.getElementById('target-calories').value = macroTargets.calories;
    document.getElementById('target-protein').value = macroTargets.protein;
    document.getElementById('target-carbs').value = macroTargets.carbs;
    document.getElementById('target-fats').value = macroTargets.fats;

    const { data: foodData } = await supabaseClient.from('macros_foods').select('*');
    macroFoods = (foodData && foodData.length > 0) ? foodData : defaultMacroFoods;

    sortMacroFoodsAlphabetically();

    const { data: logData } = await supabaseClient.from('macros_logs').select('*').eq('date', macroSelectedDate);
    macroLogs = logData || [];

    renderMacroLogs();
    renderMacroFoodLibrary();
  }

  function sortMacroFoodsAlphabetically() {
    macroFoods.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }

  function renderMacroLogs() {
    const consumed = macroLogs.reduce((acc, curr) => ({
      calories: acc.calories + (Number(curr.calories) || 0),
      protein: acc.protein + (Number(curr.protein) || 0),
      carbs: acc.carbs + (Number(curr.carbs) || 0),
      fats: acc.fats + (Number(curr.fats) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    document.getElementById('sum-cal-consumed').textContent = Math.round(consumed.calories);
    document.getElementById('sum-cal-target').textContent = macroTargets.calories;
    document.getElementById('bar-cal').style.width = `${Math.min(100, (consumed.calories / macroTargets.calories) * 100)}%`;

    document.getElementById('sum-protein-consumed').textContent = Math.round(consumed.protein);
    document.getElementById('sum-protein-target').textContent = macroTargets.protein;
    document.getElementById('bar-protein').style.width = `${Math.min(100, (consumed.protein / macroTargets.protein) * 100)}%`;

    document.getElementById('sum-carbs-consumed').textContent = Math.round(consumed.carbs);
    document.getElementById('sum-carbs-target').textContent = macroTargets.carbs;
    document.getElementById('bar-carbs').style.width = `${Math.min(100, (consumed.carbs / macroTargets.carbs) * 100)}%`;

    document.getElementById('sum-fats-consumed').textContent = Math.round(consumed.fats);
    document.getElementById('sum-fats-target').textContent = macroTargets.fats;
    document.getElementById('bar-fats').style.width = `${Math.min(100, (consumed.fats / macroTargets.fats) * 100)}%`;

    document.getElementById('macro-date-display').textContent = macroSelectedDate;

    const container = document.getElementById('meal-sections-container');
    container.innerHTML = '';

    MEAL_TYPES.forEach(meal => {
      const mealItems = macroLogs.filter(i => i.meal_type.toLowerCase() === meal.toLowerCase());
      const card = document.createElement('div');
      card.className = 'glass-card space-y-2';

      let itemsHtml = mealItems.length === 0 ? '<div style="font-size:0.75rem; color:#64748b; font-style:italic;">No items logged.</div>' :
        mealItems.map(item => `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; background:rgba(15,23,42,0.5); padding:6px 10px; border-radius:8px; margin-top:4px;">
            <div><strong>${item.food_name}</strong> - ${item.weight}g (${item.calories} kcal)</div>
            <button class="btn-icon del" onclick="deleteMacroLog('${item.id}')">✕</button>
          </div>
        `).join('');

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-weight:700; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">
          <span>${meal}</span>
          <button onclick="openAddLogModal('${meal}')" style="font-size:0.75rem; color:#00f0ff; background:none;">+ Add Food</button>
        </div>
        ${itemsHtml}
      `;
      container.appendChild(card);
    });
  }

  window.saveMacroTargets = function(e) {
    e.preventDefault();
    macroTargets = {
      calories: parseFloat(document.getElementById('target-calories').value) || 2000,
      protein: parseFloat(document.getElementById('target-protein').value) || 160,
      carbs: parseFloat(document.getElementById('target-carbs').value) || 220,
      fats: parseFloat(document.getElementById('target-fats').value) || 65
    };
    localStorage.setItem('rensa_macro_targets', JSON.stringify(macroTargets));
    renderMacroLogs();
    alert('Macro targets saved!');
  };

  window.renderMacroFoodLibrary = function(searchTerm = '') {
    const listContainer = document.getElementById('food-library-list');
    listContainer.innerHTML = '';
    
    sortMacroFoodsAlphabetically();
    const filtered = macroFoods.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filtered.length === 0) {
      listContainer.innerHTML = '<div class="empty-state">No matching food items found.</div>';
      return;
    }

    filtered.forEach(food => {
      const item = document.createElement('div');
      item.className = 'food-list-item';
      item.innerHTML = `
        <div class="food-item-header">
          <span class="food-item-name">${food.name}</span>
          <span class="food-item-cal">${food.calories} kcal / 100g</span>
        </div>
        <div class="food-item-macros">
          <span class="food-macro-pill text-pink">P: ${food.protein}g</span>
          <span>•</span>
          <span class="food-macro-pill text-amber">C: ${food.carbs}g</span>
          <span>•</span>
          <span class="food-macro-pill text-emerald">F: ${food.fats}g</span>
        </div>
      `;
      listContainer.appendChild(item);
    });
  };

  window.filterFoodLibrary = function(term) { renderMacroFoodLibrary(term); };
  window.changeMacroDate = function(offset) {
    const d = new Date(macroSelectedDate);
    d.setDate(d.getDate() + offset);
    macroSelectedDate = d.toISOString().split('T')[0];
    loadMacroData();
  };

  window.onMacroDateChange = function(val) { macroSelectedDate = val; loadMacroData(); };
  window.setMacroToday = function() { macroSelectedDate = new Date().toISOString().split('T')[0]; loadMacroData(); };

  window.openAddLogModal = function(meal = 'Lunch') {
    document.getElementById('modal-log-date').value = macroSelectedDate;
    document.getElementById('modal-log-meal').value = meal;
    const select = document.getElementById('modal-log-food');
    select.innerHTML = '';
    
    sortMacroFoodsAlphabetically();
    macroFoods.forEach(f => {
      select.innerHTML += `<option value="${f.id}">${f.name} (${f.calories} kcal/100g)</option>`;
    });
    updateModalCalculations();
    document.getElementById('modal-add-log').classList.remove('hidden');
  };

  window.closeAddLogModal = function() { document.getElementById('modal-add-log').classList.add('hidden'); };

  window.updateModalCalculations = function() {
    const foodId = document.getElementById('modal-log-food').value;
    const weight = parseFloat(document.getElementById('modal-log-weight').value) || 0;
    const food = macroFoods.find(f => f.id == foodId);
    if (food) {
      const factor = weight / 100;
      document.getElementById('preview-calc-cal').textContent = Math.round(food.calories * factor);
      document.getElementById('preview-calc-protein').textContent = `${Math.round(food.protein * factor * 10)/10}g`;
      document.getElementById('preview-calc-carbs').textContent = `${Math.round(food.carbs * factor * 10)/10}g`;
      document.getElementById('preview-calc-fats').textContent = `${Math.round(food.fats * factor * 10)/10}g`;
    }
  };

  window.saveLoggedFood = async function(e) {
    e.preventDefault();
    const date = document.getElementById('modal-log-date').value;
    const meal_type = document.getElementById('modal-log-meal').value;
    const foodId = document.getElementById('modal-log-food').value;
    const weight = parseFloat(document.getElementById('modal-log-weight').value) || 100;
    const food = macroFoods.find(f => f.id == foodId);
    if (!food) return;

    const factor = weight / 100;
    const logEntry = {
      user_id: currentUser.id,
      date, meal_type,
      food_name: food.name, weight,
      calories: Math.round(food.calories * factor),
      protein: Math.round(food.protein * factor * 10) / 10,
      carbs: Math.round(food.carbs * factor * 10) / 10,
      fats: Math.round(food.fats * factor * 10) / 10
    };

    const { data } = await supabaseClient.from('macros_logs').insert([logEntry]).select();
    if (data) macroLogs.push(data[0]);

    closeAddLogModal();
    renderMacroLogs();
  };

  window.deleteMacroLog = async function(id) {
    await supabaseClient.from('macros_logs').delete().eq('id', id);
    macroLogs = macroLogs.filter(i => i.id !== id);
    renderMacroLogs();
  };

  window.openNewFoodModal = function() { document.getElementById('modal-add-food').classList.remove('hidden'); };
  window.closeNewFoodModal = function() { document.getElementById('modal-add-food').classList.add('hidden'); };

  window.saveNewFoodItem = async function(e) {
    e.preventDefault();
    const newFood = {
      user_id: currentUser.id,
      name: document.getElementById('modal-food-name').value.trim(),
      calories: parseFloat(document.getElementById('modal-food-calories').value) || 0,
      protein: parseFloat(document.getElementById('modal-food-protein').value) || 0,
      carbs: parseFloat(document.getElementById('modal-food-carbs').value) || 0,
      fats: parseFloat(document.getElementById('modal-food-fats').value) || 0
    };

    const { data } = await supabaseClient.from('macros_foods').insert([newFood]).select();
    if (data) {
      macroFoods.push(data[0]);
    } else {
      macroFoods.push(newFood);
    }

    sortMacroFoodsAlphabetically();
    closeNewFoodModal();
    renderMacroFoodLibrary();
  };

  // OCR Label Scanning Handlers
  window.triggerCameraScan = function() {
    document.getElementById('scan-camera-input').click();
  };

  window.processLabelImage = function(inputEl) {
    if (!inputEl.files || !inputEl.files[0]) return;

    const file = inputEl.files[0];
    const banner = document.getElementById('scan-status-banner');
    const statusText = document.getElementById('scan-status-text');

    banner.classList.remove('hidden');
    statusText.textContent = "Analyzing nutrition label...";

    Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          statusText.textContent = `Scanning: ${Math.round(m.progress * 100)}%`;
        }
      }
    }).then(({ data: { text } }) => {
      banner.classList.add('hidden');
      parseAndAutofillNutrition(text);
    }).catch(err => {
      console.error("OCR Scan Error:", err);
      banner.classList.add('hidden');
      alert("Could not read nutrition label. Please type values manually.");
    });
  };

  function parseAndAutofillNutrition(ocrText) {
    const lines = ocrText.toLowerCase();

    const calMatch = lines.match(/(?:energy|calories|kcal)\s*[:\-\s]?\s*(\d+(?:\.\d+)?)/i);
    const proteinMatch = lines.match(/(?:protein|proteins)\s*[:\-\s]?\s*(\d+(?:\.\d+)?)/i);
    const carbMatch = lines.match(/(?:carbohydrate|carbohydrates|carbs)\s*[:\-\s]?\s*(\d+(?:\.\d+)?)/i);
    const fatMatch = lines.match(/(?:fat|fats|total fat)\s*[:\-\s]?\s*(\d+(?:\.\d+)?)/i);

    let filledCount = 0;

    if (calMatch && calMatch[1]) {
      document.getElementById('modal-food-calories').value = parseFloat(calMatch[1]);
      filledCount++;
    }
    if (proteinMatch && proteinMatch[1]) {
      document.getElementById('modal-food-protein').value = parseFloat(proteinMatch[1]);
      filledCount++;
    }
    if (carbMatch && carbMatch[1]) {
      document.getElementById('modal-food-carbs').value = parseFloat(carbMatch[1]);
      filledCount++;
    }
    if (fatMatch && fatMatch[1]) {
      document.getElementById('modal-food-fats').value = parseFloat(fatMatch[1]);
      filledCount++;
    }

    if (filledCount > 0) {
      alert(`Label scanned! Auto-filled ${filledCount} field(s). Please verify values before saving.`);
    } else {
      alert("Could not detect macro values clearly. Please verify the label orientation and type values manually.");
    }
  }
});