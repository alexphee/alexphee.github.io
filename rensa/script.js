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
let macroWeightLogs = [];
let weightChartInstance = null;
let zxingCodeReader = null;
let currentRecipeIngredients = [];

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

// Default Exercise Library
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

  // Mode Switch
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

  // Accordion Menu Triggers
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

  // 1RM Breakdown
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

  // Render Routine Day with Grouped Supersets & Circuits
  function renderRoutineDay(dayName) {
    const dayData = localRoutines[dayName];
    const titleEl = document.getElementById('routine-title');
    const containerEl = document.getElementById('routine-container');

    titleEl.textContent = dayData ? dayData.title : `${dayName} Plan`;
    containerEl.innerHTML = '';

    if (!dayData || !dayData.exercises || !dayData.exercises.length) {
      containerEl.innerHTML = '<div class="empty-state">No workout entries set for this day. Tap + to add one!</div>';
      return;
    }

    const buildCardElement = (ex, idx) => {
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
          ${ex.superset ? `<div class="routine-card-sub" style="color:#a855f7;">🔗 Superset ${ex.superset}</div>` : ''}
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

      return card;
    };

    let i = 0;
    while (i < dayData.exercises.length) {
      const ex = dayData.exercises[i];

      if (ex.superset) {
        const groupTag = ex.superset;
        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'superset-group';
        groupWrapper.innerHTML = `
          <div class="superset-badge-header">
            <span class="superset-tag"><i class="fa-solid fa-link"></i> SUPERSET ${groupTag}</span>
            <span style="font-size:0.7rem; color:#94a3b8;">Perform Back-To-Back</span>
          </div>
        `;

        while (i < dayData.exercises.length && dayData.exercises[i].superset === groupTag) {
          groupWrapper.appendChild(buildCardElement(dayData.exercises[i], i));
          i++;
        }
        containerEl.appendChild(groupWrapper);
      } else {
        containerEl.appendChild(buildCardElement(ex, i));
        i++;
      }
    }
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
      document.getElementById('routine-ex-superset').value = ex.superset || '';
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
    const superset = document.getElementById('routine-ex-superset').value;

    const newObj = { exercise, muscleGroup, sets, reps, target, rotation, tips, superset };

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

    if (currentUser) {
      const { data: foodData } = await supabaseClient.from('macros_foods').select('*');
      macroFoods = (foodData && foodData.length > 0) ? foodData : defaultMacroFoods;

      const { data: logData } = await supabaseClient.from('macros_logs').select('*').eq('date', macroSelectedDate);
      macroLogs = logData || [];
    } else {
      macroFoods = JSON.parse(localStorage.getItem('rensa_macro_foods')) || defaultMacroFoods;
      const allLogs = JSON.parse(localStorage.getItem('rensa_macro_logs')) || [];
      macroLogs = allLogs.filter(l => l.date === macroSelectedDate);
    }

    sortMacroFoodsAlphabetically();
    renderMacroLogs();
    renderMacroFoodLibrary();
    await fetchWeightHistory();
  }

  function sortMacroFoodsAlphabetically() {
    macroFoods.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }

  window.setQuickPortion = function(grams) {
    const input = document.getElementById('modal-log-weight');
    input.value = grams;
    updateModalCalculations();
  };

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
      const mealTotals = mealItems.reduce((acc, curr) => ({
        calories: acc.calories + (Number(curr.calories) || 0),
        protein: acc.protein + (Number(curr.protein) || 0),
        carbs: acc.carbs + (Number(curr.carbs) || 0),
        fats: acc.fats + (Number(curr.fats) || 0)
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

      const card = document.createElement('div');
      card.className = 'glass-card space-y-2';

      let itemsHtml = mealItems.length === 0 ? '<div style="font-size:0.75rem; color:#64748b; font-style:italic;">No items logged.</div>' :
        mealItems.map(item => `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; background:rgba(15,23,42,0.5); padding:6px 10px; border-radius:8px; margin-top:4px;">
            <div><strong>${item.food_name}</strong> - ${item.weight}g (${item.calories} kcal)</div>
            <div style="display:flex; gap:4px;">
              <button class="btn-icon" style="width:24px; height:24px;" onclick="openEditPortionModal('${item.id}')" title="Edit Portion">✎</button>
              <button class="btn-icon del" style="width:24px; height:24px;" onclick="deleteMacroLog('${item.id}')" title="Delete">✕</button>
            </div>
          </div>
        `).join('');

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; font-weight:700; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>${meal}</span>
            <span style="font-size:0.72rem; color:#00f0ff; font-weight:800;">${Math.round(mealTotals.calories)} kcal</span>
          </div>
          <button onclick="openAddLogModal('${meal}')" style="font-size:0.75rem; color:#00f0ff; background:none;">+ Add Food</button>
        </div>

        ${mealItems.length > 0 ? `
          <div class="meal-header-macros">
            <span class="text-pink">P: ${Math.round(mealTotals.protein * 10) / 10}g</span> • 
            <span class="text-amber">C: ${Math.round(mealTotals.carbs * 10) / 10}g</span> • 
            <span class="text-emerald">F: ${Math.round(mealTotals.fats * 10) / 10}g</span>
          </div>
        ` : ''}

        ${itemsHtml}
      `;
      container.appendChild(card);
    });
  }

  // Copy Meals Helper
  window.copyCurrentDayMeals = async function() {
    if (!macroLogs || macroLogs.length === 0) {
      alert("No meals logged for the currently selected date to copy.");
      return;
    }

    const targetDate = prompt("Enter target date to copy these meals to (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!targetDate) return;

    if (currentUser) {
      const copyInserts = macroLogs.map(l => ({
        user_id: currentUser.id,
        date: String(targetDate),
        meal_type: String(l.meal_type),
        food_name: String(l.food_name),
        weight: Number(l.weight),
        calories: Number(l.calories),
        protein: Number(l.protein),
        carbs: Number(l.carbs),
        fats: Number(l.fats)
      }));

      const { error } = await supabaseClient.from('macros_logs').insert(copyInserts);
      if (error) {
        console.error("Supabase Copy Error:", error);
        alert("Failed to copy meals to Supabase: " + error.message);
        return;
      }
    } else {
      const copyInserts = macroLogs.map(l => ({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        user_id: 'local',
        date: String(targetDate),
        meal_type: String(l.meal_type),
        food_name: String(l.food_name),
        weight: Number(l.weight),
        calories: Number(l.calories),
        protein: Number(l.protein),
        carbs: Number(l.carbs),
        fats: Number(l.fats)
      }));

      let allLogs = JSON.parse(localStorage.getItem('rensa_macro_logs')) || [];
      allLogs = [...allLogs, ...copyInserts];
      localStorage.setItem('rensa_macro_logs', JSON.stringify(allLogs));
    }

    alert(`Successfully copied ${macroLogs.length} meal item(s) to ${targetDate}!`);

    macroSelectedDate = targetDate;
    document.getElementById('macro-date-picker').value = targetDate;
    await loadMacroData();
  };

  window.setEditPortionPreset = function(grams) {
    document.getElementById('edit-portion-weight').value = grams;
  };

  window.openEditPortionModal = function(logId) {
    const logItem = macroLogs.find(l => String(l.id) === String(logId));
    if (!logItem) return;

    document.getElementById('edit-portion-log-id').value = logItem.id;
    document.getElementById('edit-portion-food-name').textContent = `${logItem.food_name} (${logItem.meal_type})`;
    document.getElementById('edit-portion-weight').value = logItem.weight;

    document.getElementById('modal-edit-portion').classList.remove('hidden');
  };

  window.closeEditPortionModal = function() {
    document.getElementById('modal-edit-portion').classList.add('hidden');
  };

  window.saveEditedPortion = async function(e) {
    e.preventDefault();
    const logId = document.getElementById('edit-portion-log-id').value;
    const newWeight = parseFloat(document.getElementById('edit-portion-weight').value) || 0;

    if (newWeight <= 0) {
      alert("Please enter a valid weight in grams.");
      return;
    }

    const logItem = macroLogs.find(l => String(l.id) === String(logId));
    if (!logItem) return;

    const food = macroFoods.find(f => f.name.toLowerCase() === logItem.food_name.toLowerCase());

    let newCal, newP, newC, newF;

    if (food) {
      const factor = newWeight / 100;
      newCal = Math.round(food.calories * factor);
      newP = Math.round(food.protein * factor * 10) / 10;
      newC = Math.round(food.carbs * factor * 10) / 10;
      newF = Math.round(food.fats * factor * 10) / 10;
    } else {
      const oldWeight = logItem.weight || 100;
      const ratio = newWeight / oldWeight;
      newCal = Math.round(logItem.calories * ratio);
      newP = Math.round(logItem.protein * ratio * 10) / 10;
      newC = Math.round(logItem.carbs * ratio * 10) / 10;
      newF = Math.round(logItem.fats * ratio * 10) / 10;
    }

    if (currentUser) {
      const { error } = await supabaseClient
        .from('macros_logs')
        .update({
          weight: Number(newWeight),
          calories: Number(newCal),
          protein: Number(newP),
          carbs: Number(newC),
          fats: Number(newF)
        })
        .eq('id', logId);

      if (error) {
        console.error("Supabase Edit Portion Error:", error);
        alert("Failed to update portion: " + error.message);
        return;
      }
    } else {
      let allLogs = JSON.parse(localStorage.getItem('rensa_macro_logs')) || [];
      const idx = allLogs.findIndex(l => String(l.id) === String(logId));
      if (idx !== -1) {
        allLogs[idx].weight = newWeight;
        allLogs[idx].calories = newCal;
        allLogs[idx].protein = newP;
        allLogs[idx].carbs = newC;
        allLogs[idx].fats = newF;
        localStorage.setItem('rensa_macro_logs', JSON.stringify(allLogs));
      }
    }

    closeEditPortionModal();
    await loadMacroData();
  };

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
      const isRecipe = food.ingredients && food.ingredients.length > 0;
      const item = document.createElement('div');
      item.className = 'food-list-item';
      item.innerHTML = `
        <div class="food-item-header">
          <span class="food-item-name">${food.name} ${isRecipe ? '<span style="font-size:0.7rem; color:#f59e0b;">(Recipe)</span>' : ''}</span>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="food-item-cal">${food.calories} kcal ${isRecipe ? 'total' : '/ 100g'}</span>
            <div class="food-item-actions">
              <button class="btn-icon" style="width:24px; height:24px;" onclick="${isRecipe ? `openEditRecipeModal('${food.id}')` : `openEditFoodModal('${food.id}')`}">✎</button>
              <button class="btn-icon del" style="width:24px; height:24px;" onclick="deleteCustomFood('${food.id}')">✕</button>
            </div>
          </div>
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

  // Populates Food Dropdown with Categorized Single Foods & Recipes
window.openAddLogModal = function(meal = 'Lunch') {
    document.getElementById('modal-log-date').value = macroSelectedDate;
    document.getElementById('modal-log-meal').value = meal;
    const select = document.getElementById('modal-log-food');
    select.innerHTML = '';
    
    sortMacroFoodsAlphabetically();

    // Dual-check: ingredients array OR name ends with (Recipe)
    const singleFoods = macroFoods.filter(f => (!f.ingredients || f.ingredients.length === 0) && !f.name.includes('(Recipe)'));
    const recipes = macroFoods.filter(f => (f.ingredients && f.ingredients.length > 0) || f.name.includes('(Recipe)'));

    let optGroupFoods = '<optgroup label="Single Foods">';
    singleFoods.forEach(f => {
      optGroupFoods += `<option value="${f.id}">${f.name} (${f.calories} kcal/100g)</option>`;
    });
    optGroupFoods += '</optgroup>';

    let optGroupRecipes = '<optgroup label="Recipes">';
    recipes.forEach(r => {
      optGroupRecipes += `<option value="${r.id}">${r.name} (${r.calories} kcal total)</option>`;
    });
    optGroupRecipes += '</optgroup>';

    select.innerHTML = optGroupFoods + optGroupRecipes;
    updateModalCalculations();
    document.getElementById('modal-add-log').classList.remove('hidden');
  };

  window.closeAddLogModal = function() { document.getElementById('modal-add-log').classList.add('hidden'); };

  window.updateModalCalculations = function() {
    const foodId = document.getElementById('modal-log-food').value;
    const weight = parseFloat(document.getElementById('modal-log-weight').value) || 0;
    const food = macroFoods.find(f => String(f.id) === String(foodId));
    
    if (food) {
      const isRecipe = food.ingredients && food.ingredients.length > 0;
      const factor = isRecipe ? 1 : (weight / 100);

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
    
    const food = macroFoods.find(f => String(f.id) === String(foodId));
    if (!food) {
      alert("Please select a valid food item from the menu.");
      return;
    }

    const isRecipe = food.ingredients && food.ingredients.length > 0;
    const factor = isRecipe ? 1 : (weight / 100);

    const logEntry = {
      date: String(date),
      meal_type: String(meal_type),
      food_name: String(food.name),
      weight: Number(isRecipe ? 100 : weight),
      calories: Math.round(food.calories * factor),
      protein: Math.round(food.protein * factor * 10) / 10,
      carbs: Math.round(food.carbs * factor * 10) / 10,
      fats: Math.round(food.fats * factor * 10) / 10
    };

    if (currentUser) {
      logEntry.user_id = currentUser.id;
      const { data, error } = await supabaseClient.from('macros_logs').insert([logEntry]).select();
      if (error) {
        console.error("Supabase Save Log Error:", error);
        alert("Failed to save entry: " + error.message);
        return;
      }
    } else {
      logEntry.id = 'log_' + Date.now();
      logEntry.user_id = 'local';
      let allLogs = JSON.parse(localStorage.getItem('rensa_macro_logs')) || [];
      allLogs.push(logEntry);
      localStorage.setItem('rensa_macro_logs', JSON.stringify(allLogs));
    }

    closeAddLogModal();
    macroSelectedDate = date;
    document.getElementById('macro-date-picker').value = date;
    await loadMacroData();
  };

  window.deleteMacroLog = async function(id) {
    if (currentUser) {
      await supabaseClient.from('macros_logs').delete().eq('id', id);
    } else {
      let allLogs = JSON.parse(localStorage.getItem('rensa_macro_logs')) || [];
      allLogs = allLogs.filter(l => String(l.id) !== String(id));
      localStorage.setItem('rensa_macro_logs', JSON.stringify(allLogs));
    }
    macroLogs = macroLogs.filter(i => String(i.id) !== String(id));
    renderMacroLogs();
  };

  window.openNewFoodModal = function() {
    document.getElementById('modal-food-edit-id').value = '';
    document.getElementById('modal-food-title').innerHTML = `<i class="fa-solid fa-database text-pink"></i> Create Food Item (per 100g)`;
    document.getElementById('form-add-food').reset();
    document.getElementById('modal-add-food').classList.remove('hidden');
  };

  window.openEditFoodModal = function(id) {
    const food = macroFoods.find(f => String(f.id) === String(id));
    if (!food) return;

    document.getElementById('modal-food-edit-id').value = food.id;
    document.getElementById('modal-food-title').innerHTML = `<i class="fa-solid fa-pen text-pink"></i> Edit Custom Food`;
    document.getElementById('modal-food-name').value = food.name;
    document.getElementById('modal-food-calories').value = food.calories;
    document.getElementById('modal-food-protein').value = food.protein;
    document.getElementById('modal-food-carbs').value = food.carbs;
    document.getElementById('modal-food-fats').value = food.fats;

    document.getElementById('modal-add-food').classList.remove('hidden');
  };

  window.deleteCustomFood = async function(id) {
    if (!confirm("Delete this food item or recipe from your database?")) return;

    if (currentUser) {
      await supabaseClient.from('macros_foods').delete().eq('id', id);
    } else {
      localStorage.setItem('rensa_macro_foods', JSON.stringify(macroFoods.filter(f => String(f.id) !== String(id))));
    }

    macroFoods = macroFoods.filter(f => String(f.id) !== String(id));
    renderMacroFoodLibrary();
  };

  window.closeNewFoodModal = function() { 
    stopBarcodeScan();
    document.getElementById('modal-add-food').classList.add('hidden'); 
  };

  window.saveNewFoodItem = async function(e) {
    e.preventDefault();
    const editId = document.getElementById('modal-food-edit-id').value;
    const name = document.getElementById('modal-food-name').value.trim();
    const calories = parseFloat(document.getElementById('modal-food-calories').value) || 0;
    const protein = parseFloat(document.getElementById('modal-food-protein').value) || 0;
    const carbs = parseFloat(document.getElementById('modal-food-carbs').value) || 0;
    const fats = parseFloat(document.getElementById('modal-food-fats').value) || 0;

    if (editId) {
      if (currentUser) {
        await supabaseClient.from('macros_foods').update({ name, calories, protein, carbs, fats }).eq('id', editId);
      }
      const idx = macroFoods.findIndex(f => String(f.id) === String(editId));
      if (idx !== -1) macroFoods[idx] = { ...macroFoods[idx], name, calories, protein, carbs, fats };
      if (!currentUser) localStorage.setItem('rensa_macro_foods', JSON.stringify(macroFoods));
    } else {
      const newFood = { user_id: currentUser ? currentUser.id : 'local', name, calories, protein, carbs, fats };
      if (currentUser) {
        const { data } = await supabaseClient.from('macros_foods').insert([newFood]).select();
        if (data) macroFoods.push(data[0]);
      } else {
        newFood.id = 'f_' + Date.now();
        macroFoods.push(newFood);
        localStorage.setItem('rensa_macro_foods', JSON.stringify(macroFoods));
      }
    }

    sortMacroFoodsAlphabetically();
    closeNewFoodModal();
    renderMacroFoodLibrary();
  };

  // Recipe Builder Handlers (Calculates Total Recipe Accumulation)
  window.openRecipeModal = function() {
    currentRecipeIngredients = [];
    document.getElementById('recipe-edit-id').value = '';
    const recipeForm = document.getElementById('form-recipe-builder');
    if (recipeForm) recipeForm.reset();
    
    populateRecipeIngredientSelect();
    renderRecipeIngredientsList();
    document.getElementById('modal-recipe-builder').classList.remove('hidden');
  };

  window.openEditRecipeModal = function(id) {
    const recipe = macroFoods.find(f => String(f.id) === String(id));
    if (!recipe || !recipe.ingredients) return;

    document.getElementById('recipe-edit-id').value = recipe.id;
    document.getElementById('recipe-name').value = recipe.name.replace(' (Recipe)', '');

    currentRecipeIngredients = [...recipe.ingredients];
    populateRecipeIngredientSelect();
    renderRecipeIngredientsList();
    document.getElementById('modal-recipe-builder').classList.remove('hidden');
  };

  function populateRecipeIngredientSelect() {
    const select = document.getElementById('recipe-ingredient-food');
    if (select) {
      select.innerHTML = '';
      sortMacroFoodsAlphabetically();
      const singleFoods = macroFoods.filter(f => !f.ingredients || f.ingredients.length === 0);
      singleFoods.forEach(f => {
        select.innerHTML += `<option value="${f.id}">${f.name} (${f.calories} kcal/100g)</option>`;
      });
    }
  }

  window.closeRecipeModal = function() {
    document.getElementById('modal-recipe-builder').classList.add('hidden');
  };

  window.addIngredientToRecipe = function() {
    const foodId = document.getElementById('recipe-ingredient-food').value;
    const weight = parseFloat(document.getElementById('recipe-ingredient-weight').value) || 0;
    const food = macroFoods.find(f => String(f.id) === String(foodId));

    if (!food || weight <= 0) return;

    currentRecipeIngredients.push({ food, weight });
    document.getElementById('recipe-ingredient-weight').value = '';
    renderRecipeIngredientsList();
  };

  window.removeRecipeIngredient = function(index) {
    currentRecipeIngredients.splice(index, 1);
    renderRecipeIngredientsList();
  };

  function renderRecipeIngredientsList() {
    const list = document.getElementById('recipe-ingredients-list');
    if (!list) return;
    list.innerHTML = '';

    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;

    currentRecipeIngredients.forEach((item, idx) => {
      const factor = item.weight / 100;
      totalCal += item.food.calories * factor;
      totalP += item.food.protein * factor;
      totalC += item.food.carbs * factor;
      totalF += item.food.fats * factor;

      const row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; background:rgba(15,23,42,0.5); padding:4px 8px; border-radius:6px;';
      row.innerHTML = `
        <span>${item.food.name} (${item.weight}g)</span>
        <button type="button" class="btn-icon del" style="width:20px; height:20px;" onclick="removeRecipeIngredient(${idx})">✕</button>
      `;
      list.appendChild(row);
    });

    // Displays accumulated totals for the entire recipe
    document.getElementById('recipe-calc-cal').textContent = Math.round(totalCal);
    document.getElementById('recipe-calc-protein').textContent = `${Math.round(totalP * 10) / 10}g`;
    document.getElementById('recipe-calc-carbs').textContent = `${Math.round(totalC * 10) / 10}g`;
    document.getElementById('recipe-calc-fats').textContent = `${Math.round(totalF * 10) / 10}g`;
  }

  window.saveRecipeAsCustomFood = async function(e) {
    e.preventDefault();
    const editId = document.getElementById('recipe-edit-id').value;
    const recipeName = document.getElementById('recipe-name').value.trim();

    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;

    currentRecipeIngredients.forEach(item => {
      const factor = item.weight / 100;
      totalCal += item.food.calories * factor;
      totalP += item.food.protein * factor;
      totalC += item.food.carbs * factor;
      totalF += item.food.fats * factor;
    });

    if (currentRecipeIngredients.length === 0) {
      alert("Please add at least one ingredient to your recipe.");
      return;
    }

    const recipeData = {
      name: `${recipeName.replace(' (Recipe)', '')} (Recipe)`,
      calories: Math.round(totalCal),
      protein: Math.round(totalP * 10) / 10,
      carbs: Math.round(totalC * 10) / 10,
      fats: Math.round(totalF * 10) / 10,
      ingredients: currentRecipeIngredients
    };

    if (editId) {
      if (currentUser) {
        const { error } = await supabaseClient.from('macros_foods').update(recipeData).eq('id', editId);
        if (error) console.error("Error updating recipe:", error);
      }
      const idx = macroFoods.findIndex(f => String(f.id) === String(editId));
      if (idx !== -1) macroFoods[idx] = { ...macroFoods[idx], ...recipeData };
      if (!currentUser) localStorage.setItem('rensa_macro_foods', JSON.stringify(macroFoods));
    } else {
      if (currentUser) {
        recipeData.user_id = currentUser.id;
        const { data, error } = await supabaseClient.from('macros_foods').insert([recipeData]).select();
        if (error) {
          console.error("Supabase Recipe Save Error:", error);
          alert("Failed to save recipe: " + error.message);
          return;
        }
        if (data && data.length > 0) macroFoods.push(data[0]);
      } else {
        recipeData.id = 'f_' + Date.now();
        recipeData.user_id = 'local';
        macroFoods.push(recipeData);
        localStorage.setItem('rensa_macro_foods', JSON.stringify(macroFoods));
      }
    }

    sortMacroFoodsAlphabetically();
    closeRecipeModal();
    renderMacroFoodLibrary();
    alert(`Saved "${recipeName}" recipe!`);
  };

  // Body Weight & Calorie Dual-Axis Chart
  window.openWeightModal = function() {
    const datePicker = document.getElementById('weight-log-date');
    const valInput = document.getElementById('weight-log-val');
    
    if (datePicker) datePicker.value = macroSelectedDate;
    if (valInput) valInput.value = '';
    
    const modal = document.getElementById('modal-log-weight');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeWeightModal = function() {
    const modal = document.getElementById('modal-log-weight');
    if (modal) modal.classList.add('hidden');
  };

  async function fetchWeightHistory() {
    if (currentUser) {
      const { data, error } = await supabaseClient
        .from('macros_weight')
        .select('*')
        .order('date', { ascending: true });
        
      if (error) console.error("Supabase Weight Fetch Error:", error);
      macroWeightLogs = data || [];
    } else {
      macroWeightLogs = JSON.parse(localStorage.getItem('rensa_weight_logs')) || [];
    }

    renderWeightChartAndList();
  }

  window.saveWeightLog = async function(e) {
    e.preventDefault();
    const date = document.getElementById('weight-log-date').value;
    const weight = parseFloat(document.getElementById('weight-log-val').value) || 0;

    if (weight <= 0) {
      alert("Please enter a valid weight value.");
      return;
    }

    if (currentUser) {
      const { error } = await supabaseClient
        .from('macros_weight')
        .upsert([{ 
          user_id: currentUser.id, 
          date: String(date), 
          weight: Number(weight) 
        }], { onConflict: 'user_id, date' });

      if (error) {
        console.error("Supabase Weight Save Error:", error);
        alert("Failed to save weight entry: " + error.message);
        return;
      }
    } else {
      const idx = macroWeightLogs.findIndex(w => w.date === date);
      if (idx !== -1) macroWeightLogs[idx].weight = weight;
      else macroWeightLogs.push({ id: 'w_' + Date.now(), date, weight });
      
      macroWeightLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
      localStorage.setItem('rensa_weight_logs', JSON.stringify(macroWeightLogs));
    }

    closeWeightModal();
    await fetchWeightHistory();
  };

  window.deleteWeightLog = async function(id, date) {
    if (!confirm("Delete this weight entry?")) return;

    if (currentUser && id && id !== 'undefined') {
      await supabaseClient.from('macros_weight').delete().eq('id', id);
    } else {
      macroWeightLogs = macroWeightLogs.filter(w => w.date !== date);
      localStorage.setItem('rensa_weight_logs', JSON.stringify(macroWeightLogs));
    }
    
    await fetchWeightHistory();
  };

  function renderWeightChartAndList() {
    const historyList = document.getElementById('weight-history-list');
    if (!historyList) return;

    historyList.innerHTML = '';

    if (macroWeightLogs.length === 0) {
      historyList.innerHTML = '<div class="empty-state" style="padding: 12px;">No weight entries logged yet.</div>';
      if (weightChartInstance) weightChartInstance.destroy();
      return;
    }

    [...macroWeightLogs].reverse().forEach(entry => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(15,23,42,0.5); padding:8px 12px; border-radius:8px; font-size:0.8rem;';
      item.innerHTML = `
        <span><strong>${entry.weight} kg</strong> on ${entry.date}</span>
        <button class="btn-icon del" style="width:24px; height:24px;" onclick="deleteWeightLog('${entry.id}', '${entry.date}')">✕</button>
      `;
      historyList.appendChild(item);
    });

    const ctx = document.getElementById('weightChart');
    if (!ctx) return;

    if (weightChartInstance) weightChartInstance.destroy();

    const labels = macroWeightLogs.map(w => w.date);
    const weightData = macroWeightLogs.map(w => w.weight);

    weightChartInstance = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Weight (kg)',
          data: weightData,
          borderColor: '#00f0ff',
          backgroundColor: 'rgba(0, 240, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#a855f7'
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
  }

  // Barcode Scanner Integration (Open Food Facts)
  window.startBarcodeScan = function() {
    const container = document.getElementById('barcode-scanner-container');
    container.classList.remove('hidden');

    if (!zxingCodeReader) {
      zxingCodeReader = new ZXing.BrowserMultiFormatReader();
    }

    zxingCodeReader.decodeFromVideoDevice(null, 'barcode-video', (result, err) => {
      if (result) {
        const barcode = result.getText();
        stopBarcodeScan();
        fetchOpenFoodFactsProduct(barcode);
      }
    }).catch(err => {
      console.error("Barcode Scanner Error:", err);
      alert("Unable to access camera for barcode scanning.");
      stopBarcodeScan();
    });
  };

  window.stopBarcodeScan = function() {
    if (zxingCodeReader) {
      zxingCodeReader.reset();
    }
    const container = document.getElementById('barcode-scanner-container');
    if (container) container.classList.add('hidden');
  };

  async function fetchOpenFoodFactsProduct(barcode) {
    const banner = document.getElementById('scan-status-banner');
    const statusText = document.getElementById('scan-status-text');

    banner.classList.remove('hidden');
    statusText.textContent = `Looking up barcode ${barcode}...`;

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      banner.classList.add('hidden');

      if (data.status === 1 && data.product) {
        const p = data.product;
        const name = p.product_name || p.product_name_en || "Scanned Product";
        const nutriments = p.nutriments || {};

        const calories = parseFloat(nutriments['energy-kcal_100g'] || nutriments['energy-kcal_value'] || nutriments['energy-kcal'] || 0);
        const protein = parseFloat(nutriments.proteins_100g || nutriments.proteins_value || 0);
        const carbs = parseFloat(nutriments.carbohydrates_100g || nutriments.carbohydrates_value || 0);
        const fats = parseFloat(nutriments.fat_100g || nutriments.fat_value || 0);

        document.getElementById('modal-food-name').value = name;
        document.getElementById('modal-food-calories').value = Math.round(calories);
        document.getElementById('modal-food-protein').value = Math.round(protein * 10) / 10;
        document.getElementById('modal-food-carbs').value = Math.round(carbs * 10) / 10;
        document.getElementById('modal-food-fats').value = Math.round(fats * 10) / 10;

        alert(`Found Product: "${name}"! Macro values auto-filled per 100g.`);
      } else {
        alert(`Barcode ${barcode} not found in Open Food Facts database. Please enter details manually.`);
      }
    } catch (err) {
      console.error("Open Food Facts API Error:", err);
      banner.classList.add('hidden');
      alert("Failed to connect to Open Food Facts database.");
    }
  }

  // OCR Label Scanning Handlers
  window.triggerCameraScan = function() {
    document.getElementById('scan-camera-input').click();
  };

  function preprocessImageForOCR(file, callback) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const threshold = avg > 120 ? 255 : 0;
        data[i] = threshold;
        data[i + 1] = threshold;
        data[i + 2] = threshold;
      }

      ctx.putImageData(imageData, 0, 0);
      callback(canvas.toDataURL('image/jpeg', 0.9));
    };
  }

  window.processLabelImage = function(inputEl) {
    if (!inputEl.files || !inputEl.files[0]) return;

    const file = inputEl.files[0];
    const banner = document.getElementById('scan-status-banner');
    const statusText = document.getElementById('scan-status-text');

    banner.classList.remove('hidden');
    statusText.textContent = "Enhancing image contrast...";

    preprocessImageForOCR(file, (processedImageData) => {
      statusText.textContent = "Analyzing nutrition label...";

      Tesseract.recognize(processedImageData, 'eng', {
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
        alert("Could not read label. Please ensure clear focus and good lighting.");
      });
    });
  };

  function parseAndAutofillNutrition(ocrText) {
    const cleanedText = ocrText
      .replace(/(\d+),(\d+)/g, '$1.$2')
      .replace(/[|,;]/g, '.')
      .toLowerCase();

    const lines = cleanedText.split('\n');

    let foundCal = null;
    let foundFat = null;
    let foundCarbs = null;
    let foundProtein = null;

    const greekPatterns = {
      cal: /(?:ενέργεια|energy|ενεργεια)\D*(\d+)\s*kj\s*\/\s*(\d+)\s*kcal/i,
      calFallback: /(\d+)\s*kcal/i,
      fat: /(?:λιπαρά|λιπαρα|fat)\D*(\d+(?:\.\d+)?)\s*g?/i,
      carbs: /(?:υδατάνθρακες|υδατανθρακες|carbohydrate|carbs)\D*(\d+(?:\.\d+)?)\s*g?/i,
      protein: /(?:πρωτεΐνες|πρωτεινες|protein)\D*(\d+(?:\.\d+)?)\s*g?/i
    };

    for (let line of lines) {
      if (line.includes('οποίων') || line.includes('opoion') || line.includes('which')) continue;

      if (foundCal === null) {
        const match = line.match(greekPatterns.cal) || line.match(greekPatterns.calFallback);
        if (match) {
          const val = parseFloat(match[2] || match[1]);
          if (val < 1000) foundCal = val;
        }
      }

      if (foundFat === null && (line.includes('λιπαρ') || line.includes('fat'))) {
        const match = line.match(greekPatterns.fat);
        if (match) {
          const val = parseFloat(match[1]);
          if (val <= 100) foundFat = val;
        }
      }

      if (foundCarbs === null && (line.includes('υδατ') || line.includes('carb'))) {
        const match = line.match(greekPatterns.carbs);
        if (match) {
          const val = parseFloat(match[1]);
          if (val <= 100) foundCarbs = val;
        }
      }

      if (foundProtein === null && (line.includes('πρωτ') || line.includes('protein'))) {
        const match = line.match(greekPatterns.protein);
        if (match) {
          const val = parseFloat(match[1]);
          if (val <= 100) foundProtein = val;
        }
      }
    }

    let filledCount = 0;

    if (foundCal !== null) {
      document.getElementById('modal-food-calories').value = foundCal;
      filledCount++;
    }
    if (foundProtein !== null) {
      document.getElementById('modal-food-protein').value = foundProtein;
      filledCount++;
    }
    if (foundCarbs !== null) {
      document.getElementById('modal-food-carbs').value = foundCarbs;
      filledCount++;
    }
    if (foundFat !== null) {
      document.getElementById('modal-food-fats').value = foundFat;
      filledCount++;
    }

    if (filledCount > 0) {
      alert(`Label scanned! Auto-filled ${filledCount} field(s). Please verify extracted numbers before saving.`);
    } else {
      alert("Could not clearly read Greek nutrition table. Please ensure good lighting and crop close to the table.");
    }
  }
});