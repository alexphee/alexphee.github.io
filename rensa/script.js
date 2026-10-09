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