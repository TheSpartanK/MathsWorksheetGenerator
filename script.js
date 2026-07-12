// Global State Engine Tracker for Iterative Testing
let globalActiveQuestionsList = [];
const activeConfigs = questionTypes.filter(q => q.enabled);

let testState = {
    startTime: null,
    currentAttempt: 1,
    attemptsHistory: [], // Stores { attemptNum: X, correctCount: Y, total: Z, seconds: W }
    masteredIds: new Set(),
    wrongAnswersTelemetry: {} // Maps questionIndex -> Array of typed wrong strings over time
};

// Bulk Control Methods targeting full global runtime array checkbox modifications safely
function setAllCheckboxes(checkState) {
    const checkboxes = document.querySelectorAll('input[id^="type-"]');
    checkboxes.forEach(cb => {
        cb.checked = checkState;
    });

    activeConfigs.forEach(config => {
        const checkbox = document.getElementById(`type-${config.id}`);
        if (checkbox) {
            checkbox.checked = checkState;
        }
    });

    // Only auto-refresh on "Select All". For "Unselect All" (false), we let it stay blank 
    // so the teacher can manually select specific levels without background interference.
    if (checkState) {
        triggerActiveWorkspaceRefresh();
    } else {
        // Clear out old generated sheets cleanly when everything is unchecked
        document.getElementById('worksheetGrid').innerHTML = '';
        document.getElementById('answerKeyContainer').innerHTML = '';
        document.getElementById('interactiveTestWrapper').style.display = 'none';
        document.getElementById('testSummaryPlaceholder').innerHTML = '';
    }
}

function resetToSystemDefaults() {
    activeConfigs.forEach(config => {
        const checkbox = document.getElementById(`type-${config.id}`);
        if (checkbox) {
            checkbox.checked = config.defaultChecked;
        }
    });
    triggerActiveWorkspaceRefresh();
}




function triggerActiveWorkspaceRefresh() {
    if (document.getElementById('interactiveTestWrapper').style.display === 'flex') {
        generateInteractiveTest();
    } else {
        generateWorksheet();
    }
}

// Upgraded Renderer configured to initialize all rows closed by default
function initUI() {
    const container = document.getElementById('checkboxesContainer');
    container.innerHTML = '';

    const processedCategories = new Set();

    activeConfigs.forEach(config => {
        // Case A: Grouped category layout rows (Defaulting to CLOSED)
        if (config.category) {
            if (processedCategories.has(config.category)) return; 
            processedCategories.add(config.category);

            const groupLevels = activeConfigs.filter(c => c.category === config.category);

            const row = document.createElement('div');
            row.className = 'control-row';
            row.style.flexDirection = 'column';
            row.style.alignItems = 'flex-start';
            row.style.gap = '8px';
            row.style.padding = '12px 0';

            const safeGroupId = `category-group-${config.category.replace(/\s+/g, '-')}`;

            // CONTROL CONFIG CHANGE: Initialized arrow indicator text to "▼ Show"
            let categoryHeaderHtml = `
                <div style="display:flex; width:100%; justify-content:space-between; align-items:center; cursor:pointer;" onclick="toggleCategoryCollapse('${safeGroupId}', this)">
                    <strong style="color:#1a73e8; font-size:16px; user-select:none;">📂 ${config.category}</strong>
                    <span class="toggle-arrow" style="font-size:14px; font-weight:600; color:#777; user-select:none;">▼ Show</span>
                </div>
                <!-- CONTROL CONFIG CHANGE: Added display: none inline to default force closed state -->
                <div id="${safeGroupId}" style="display: none; flex-wrap:wrap; gap:15px; margin-top:5px; width:100%;">
            `;

            groupLevels.forEach(lvl => {
                const hoverText = lvl.description || 'No description available.';
                categoryHeaderHtml += `
                    <div class="toggle-group" title="${hoverText}" style="background:#fff; border:1px solid #e0e0e0; padding:6px 10px; border-radius:6px;">
                        <input type="checkbox" id="type-${lvl.id}" ${lvl.defaultChecked ? 'checked' : ''} onchange="triggerActiveWorkspaceRefresh()">
                        <label for="type-${lvl.id}" style="cursor:help; font-size:14px; font-weight:500;">${lvl.label}</label>
                    </div>
                `;
            });

            categoryHeaderHtml += `</div>`;
            row.innerHTML = categoryHeaderHtml;
            container.appendChild(row);

        } else {
            // Case B: Standalone Question Type Fallback row
            const row = document.createElement('div');
            row.className = 'control-row';
            const hoverText = config.description || 'No description available.';
            row.innerHTML = `
                <div class="toggle-group" title="${hoverText}">
                    <input type="checkbox" id="type-${config.id}" ${config.defaultChecked ? 'checked' : ''} onchange="triggerActiveWorkspaceRefresh()">
                    <label for="type-${config.id}" style="cursor: help;">${config.label}</label>
                </div>
            `;
            container.appendChild(row);
        }
    });
}


// Interactive Toggle Handler that collapses or expands the targeted checkbox flex container
function toggleCategoryCollapse(groupId, headerEl) {
    const targetContainer = document.getElementById(groupId);
    const arrowEl = headerEl.querySelector('.toggle-arrow');
    
    if (targetContainer.style.display === 'none') {
        targetContainer.style.display = 'flex';
        arrowEl.innerText = '▲ Hide';
    } else {
        targetContainer.style.display = 'none';
        arrowEl.innerText = '▼ Show';
    }
}





    // Shared generation execution engine that dynamically logs question configurations
function commonGenerationLogic() {
    const totalCount = parseInt(document.getElementById('totalQuestions').value) || 24;
    let selectedConfigs = activeConfigs.filter(config => {
        const cb = document.getElementById(`type-${config.id}`);
        return cb ? cb.checked : false;
    });

    // TARGET RULE: If the button is clicked and nothing is selected, force system defaults
    if (selectedConfigs.length === 0) {
        activeConfigs.forEach(config => {
            const checkbox = document.getElementById(`type-${config.id}`);
            if (checkbox) {
                checkbox.checked = config.defaultChecked;
            }
        });
        // Re-filter now that defaults are safely restored to the DOM
        selectedConfigs = activeConfigs.filter(config => config.defaultChecked);
    }

    globalActiveQuestionsList = [];
    for (let i = 1; i <= totalCount; i++) {
        const randomConfig = selectedConfigs[Math.floor(Math.random() * selectedConfigs.length)];
        const dataObj = randomConfig.generate();
        globalActiveQuestionsList.push({
            index: i,
            answerFormat: randomConfig.answerFormat || '',
            questionHtml: dataObj.question,
            correctAnswerStr: dataObj.answer.trim().toLowerCase(),
            lastSubmittedValue: ''
        });
    }
    return globalActiveQuestionsList;
}


    // Formatter that evaluates conversion layouts solely based on dynamic object configurations
    function formatAnswerByStyleFlag(valueStr, formatFlag = '') {
        const val = parseFloat(valueStr);
        if (isNaN(val)) return valueStr;
        if (val % 1 === 0) return Math.round(val).toString();

        if (formatFlag === 'decimal') {
            return parseFloat(val.toFixed(4)).toString();
        }

        if (formatFlag === 'mixedFraction' || !formatFlag) {
            const Math_gcd = (a, b) => b === 0 ? Math.abs(a) : Math_gcd(b, a % b);
            const whole = Math.trunc(val); 
            const decimalPart = parseFloat((Math.abs(val) - Math.abs(whole)).toFixed(10));

            let tolerance = 1.0e-6;
            let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
            let b = decimalPart;
            
            do {
                let a = Math.floor(b);
                let aux = h1; h1 = a * h1 + h2; h2 = aux;
                aux = k1; k1 = a * k1 + k2; k2 = aux;
                b = 1 / (b - a);
            } while (Math.abs(decimalPart - h1 / k1) > decimalPart * tolerance);

            let finalNum = h1;
            let finalDen = k1;

            if (finalNum === finalDen) return (whole + Math.sign(val)).toString();

            if (whole === 0) {
                return `${val < 0 ? '-' : ''}${finalNum}/${finalDen}`;
            } else {
                return `${whole} ${finalNum}/${finalDen}`;
            }
        }

        return valueStr;
    }

    // Smart math normalizer that converts variations to unified decimal score values for fair mathematical comparison
    function normalizeMathAnswer(inputStr, isStudentInput = false) {
        if (!inputStr) return null;
        let clean = inputStr.replace(/\s+/g, ' ').trim().toLowerCase();
        if (!clean) return null;

        if (isStudentInput && clean.includes('^')) {
            return "REJECT_EXPONENT";
        }

        if (clean.includes('^')) {
            const parts = clean.replace(/\s+/g, '').split('^');
            const base = parseFloat(parts[0]);
            const exponent = parseFloat(parts[1]);
            if (!isNaN(base) && !isNaN(exponent)) {
                return parseFloat(Math.pow(base, exponent).toFixed(10)).toString();
            }
        }

        let mixedPattern = /^([+-]?\d+)[ _](\d+)\/(\d+)$/;
        if (mixedPattern.test(clean)) {
            const match = clean.match(mixedPattern);
            const whole = parseInt(match[1], 10);
            const num = parseInt(match[2], 10);
            const den = parseInt(match[3], 10);
            
            if (den !== 0) {
                if (isStudentInput && num >= den) return "REJECT_IMPROPER";
                const totalVal = whole >= 0 ? whole + (num / den) : whole - (num / den);
                return parseFloat(totalVal.toFixed(10)).toString();
            }
        }

        if (clean.includes('/') && !clean.includes(' ')) {
            const parts = clean.replace(/\s+/g, '').split('/');
            const num = parseInt(parts[0], 10);
            const den = parseInt(parts[1], 10);
            
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
                if (isStudentInput && Math.abs(num) >= Math.abs(den)) {
                    return "REJECT_IMPROPER";
                }
                return parseFloat((num / den).toFixed(10)).toString();
            }
        }

        clean = clean.replace(/\s+/g, '');

        const parsedFloat = parseFloat(clean);
        if (!isNaN(parsedFloat)) {
            return parsedFloat.toString();
        }

        return clean;
    }

    // Build standard grid worksheet view layout panel
    function generateWorksheet() {
        document.getElementById('worksheetHeader').style.display = 'none';
        document.getElementById('worksheetGrid').style.display = 'grid';
        document.getElementById('interactiveTestWrapper').style.display = 'none';
        document.getElementById('testSummaryPlaceholder').innerHTML = '';

        const grid = document.getElementById('worksheetGrid');
        const ansContainer = document.getElementById('answerKeyContainer');
        grid.innerHTML = ''; 
        ansContainer.innerHTML = '';

        const itemsList = commonGenerationLogic();

        itemsList.forEach(item => {
            const card = document.createElement('div');
            card.className = 'question-card';
            card.innerHTML = `<span class="q-num">${item.index})</span> <span>${item.questionHtml} ______</span>`;
            grid.appendChild(card);
        });

        const cutLineDiv = document.createElement('div');
        cutLineDiv.className = 'cut-line';
        let keyHtml = `<h2 class="answer-key-title">Teacher Answer Key</h2><div class="ans-grid">`;
        itemsList.forEach(item => {
            const stylizedAnswerKey = formatAnswerByStyleFlag(item.correctAnswerStr, item.answerFormat);
            keyHtml += `<div class="ans-item"><span style="color:#777;">${item.index})</span> <strong>${stylizedAnswerKey}</strong></div>`;
        });
        keyHtml += `</div>`;
        cutLineDiv.innerHTML = keyHtml;
        ansContainer.appendChild(cutLineDiv);
    }

    // Initialize/Restart loop settings for the live interactive system
    function generateInteractiveTest() {
        document.getElementById('worksheetHeader').style.display = 'none';
        document.getElementById('worksheetGrid').style.display = 'none';
        document.getElementById('answerKeyContainer').innerHTML = '';
        document.getElementById('testSummaryPlaceholder').innerHTML = '';
        
        testState = {
            startTime: Date.now(),
            currentAttempt: 1,
            attemptsHistory: [],
            masteredIds: new Set(),
            wrongAnswersTelemetry: {}
        };

        commonGenerationLogic();

        document.getElementById('interactiveTestWrapper').style.display = 'flex';
        renderActiveTestSessionLayout();

        document.getElementById('interactiveTestWrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

        // Handles split rendering between active retry targets and hidden mastered segments
    function renderActiveTestSessionLayout(isRetryPhase = false) {
        const activeContainer = document.getElementById('testContainer');
        const masteredContainer = document.getElementById('masteredQuestionsContainer');
        const actionsRow = document.getElementById('testActionsRow');

        activeContainer.innerHTML = '';
        masteredContainer.innerHTML = '';
        actionsRow.innerHTML = '';

        // 1. Render Hidden/Mastered Questions segment if items exist
        if (testState.masteredIds.size > 0) {
            masteredContainer.style.display = 'block';
            const titleBox = document.createElement('div');
            titleBox.className = 'mastered-section-title';
            titleBox.innerHTML = `<span>🔒 Mastered Questions (${testState.masteredIds.size} questions moved here)</span> <span id="toggleMasteredArrow">▼ Show</span>`;
            
            const internalList = document.createElement('div');
            internalList.id = 'masteredQuestionsCollapseList';
            internalList.style.display = 'none';
            internalList.className = 'test-list';
            internalList.style.marginTop = '10px';

            titleBox.onclick = () => {
                const isHidden = internalList.style.display === 'none';
                internalList.style.display = isHidden ? 'flex' : 'none';
                document.getElementById('toggleMasteredArrow').innerText = isHidden ? '▲ Hide' : '▼ Show';
            };

            globalActiveQuestionsList.forEach(item => {
                if (testState.masteredIds.has(item.index)) {
                    const row = document.createElement('div');
                    row.className = 'test-row is-correct';
                    row.innerHTML = `
                        <span class="q-num" style="width:40px;">${item.index})</span>
                        <div style="flex-grow:1;">${item.questionHtml}</div>
                        <input type="text" class="test-input" value="${item.lastSubmittedValue}" disabled>
                        <div class="test-feedback"><span class="feedback-correct">👍 Mastered</span></div>
                    `;
                    internalList.appendChild(row);
                }
            });

            masteredContainer.appendChild(titleBox);
            masteredContainer.appendChild(internalList);
        } else {
            masteredContainer.style.display = 'none';
        }

        // 2. Render Remaining Active Question Fields
        globalActiveQuestionsList.forEach(item => {
            if (!testState.masteredIds.has(item.index)) {
                const row = document.createElement('div');
                row.id = `test-row-wrapper-${item.index}`;
                row.className = 'test-row';

                // Pull directly from the persistent array state object cache to preserve text between rounds
                let fieldVal = isRetryPhase ? item.lastSubmittedValue : '';

                row.innerHTML = `
                    <span class="q-num" style="width:40px;">${item.index})</span>
                    <div style="flex-grow:1;">${item.questionHtml}</div>
                    <input type="text" id="test-input-${item.index}" class="test-input" value="${fieldVal}" placeholder="Your Answer">
                    <div id="test-feedback-${item.index}" class="test-feedback"></div>
                `;
                activeContainer.appendChild(row);
            }
        });

        // 3. Render Bottom Button Interface Context Blocks
        const submitBtn = document.createElement('button');
        submitBtn.id = 'submitTestBtn';
        submitBtn.className = 'btn';
        submitBtn.innerHTML = testState.currentAttempt === 1 ? '✔️ Submit Answers' : '🔄 Resubmit Answers';
        submitBtn.onclick = evaluateAttemptSubmissions;
        actionsRow.appendChild(submitBtn);
    }

    function evaluateAttemptSubmissions() {
        const timeTakenSeconds = Math.round((Date.now() - testState.startTime) / 1000);
        let roundCorrectCount = 0;

        globalActiveQuestionsList.forEach(item => {
            if (!testState.masteredIds.has(item.index)) {
                const inputField = document.getElementById(`test-input-${item.index}`);
                const rowWrapper = document.getElementById(`test-row-wrapper-${item.index}`);
                const feedbackContainer = document.getElementById(`test-feedback-${item.index}`);
                
                const rawSubmissionValue = inputField.value.trim();
                
                // Cache input state instantly before turn flush wipes DOM elements
                item.lastSubmittedValue = rawSubmissionValue;

                const studentValue = normalizeMathAnswer(rawSubmissionValue, true);
                const correctValue = normalizeMathAnswer(item.correctAnswerStr, false);

                inputField.disabled = true;

                if (studentValue === "REJECT_EXPONENT") {
                    rowWrapper.className = 'test-row is-wrong';
                    feedbackContainer.innerHTML = `<span class="feedback-wrong">❌ Evaluate exponents</span>`;
                } else if (studentValue === "REJECT_IMPROPER") {
                    rowWrapper.className = 'test-row is-wrong';
                    feedbackContainer.innerHTML = `<span class="feedback-wrong">❌ Use mixed fractions</span>`;
                } else if (studentValue !== null && studentValue === correctValue) {
                    roundCorrectCount++;
                    testState.masteredIds.add(item.index);
                    rowWrapper.className = 'test-row is-correct';
                    feedbackContainer.innerHTML = `<span class="feedback-correct">👍 Correct!</span>`;
                } else {
                    rowWrapper.className = 'test-row is-wrong';
                    feedbackContainer.innerHTML = `<span class="feedback-wrong">❌ Incorrect</span>`;
                    
                    if (!testState.wrongAnswersTelemetry[item.index]) {
                        testState.wrongAnswersTelemetry[item.index] = [];
                    }
                    testState.wrongAnswersTelemetry[item.index].push({
                        attempt: testState.currentAttempt,
                        value: rawSubmissionValue || '[Left Empty]'
                    });
                }
            }
        });

        testState.attemptsHistory.push({
            attemptNum: testState.currentAttempt,
            correctCount: testState.masteredIds.size,
            total: globalActiveQuestionsList.length,
            seconds: timeTakenSeconds
        });

        renderTopSummaryReportBlock();

        const actionsRow = document.getElementById('testActionsRow');
        actionsRow.innerHTML = '';

        if (testState.masteredIds.size < globalActiveQuestionsList.length) {
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn';
            retryBtn.style.backgroundColor = '#ff9900';
            retryBtn.innerHTML = '🔁 Retry Questions';
            retryBtn.onclick = triggerNextAttemptSetupLoop;
            actionsRow.appendChild(retryBtn);
        }

        const showAnswersBtn = document.createElement('button');
        showAnswersBtn.className = 'btn';
        showAnswersBtn.style.backgroundColor = '#777';
        showAnswersBtn.innerHTML = '👁️ Show Answers';
        showAnswersBtn.onclick = forceRevealAllAnswersAndLock;
        actionsRow.appendChild(showAnswersBtn);

        document.getElementById('testSummaryPlaceholder').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function triggerNextAttemptSetupLoop() {
        testState.currentAttempt++;
        testState.startTime = Date.now();
        
        renderActiveTestSessionLayout(true);
        document.getElementById('interactiveTestWrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

        function forceRevealAllAnswersAndLock() {
        const activeContainer = document.getElementById('testContainer');
        const masteredContainer = document.getElementById('masteredQuestionsContainer');
        const actionsRow = document.getElementById('testActionsRow');

        masteredContainer.innerHTML = '';
        masteredContainer.style.display = 'none';
        activeContainer.innerHTML = '';
        actionsRow.innerHTML = '';

        globalActiveQuestionsList.forEach(item => {
            const row = document.createElement('div');
            const wasCorrect = testState.masteredIds.has(item.index);
            row.className = wasCorrect ? 'test-row is-correct' : 'test-row is-wrong';

            let displayExpected = formatAnswerByStyleFlag(item.correctAnswerStr, item.answerFormat);
            if (item.correctAnswerStr.includes('^')) {
                const expParts = item.correctAnswerStr.split('^');
                displayExpected = `${Math.pow(parseFloat(expParts[0]), parseFloat(expParts[1]))} (from ${item.correctAnswerStr})`;
            }

            // Build historical input tracking layout rows
            let telemetryHtml = '';
            if (testState.wrongAnswersTelemetry[item.index]) {
                telemetryHtml = `<div class="attempt-log-list"><strong>Wrong responses log:</strong>`;
                testState.wrongAnswersTelemetry[item.index].forEach(t => {
                    telemetryHtml += `<div class="attempt-log-item">Round ${t.attempt}: "${t.value}"</div>`;
                });
                telemetryHtml += `</div>`;
            }

            row.innerHTML = `
                <span class="q-num" style="width:40px;">${item.index})</span>
                <div style="flex-grow:1;">
                    <div style="font-weight: 500; font-size: 1.05em;">${item.questionHtml}</div>
                    <div style="margin-top: 8px; font-size: 15px; color: #444;">
                        👤 Final Submission: <strong style="color: ${wasCorrect ? '#2b7a78' : '#d93025'};">"${item.lastSubmittedValue || '[Empty]'}"</strong>
                    </div>
                    <div style="margin-top: 4px; font-size: 15px; color: #1a73e8;">
                        🎯 Expected Correct Solution: <strong>${displayExpected}</strong>
                    </div>
                    ${telemetryHtml}
                </div>
                <div class="test-feedback">
                    ${wasCorrect ? '<span class="feedback-correct">👍 Correct</span>' : '<span class="feedback-wrong" style="font-weight:bold;">❌ Incorrect</span>'}
                </div>
            `;
            activeContainer.appendChild(row);
        });

        document.getElementById('testSummaryPlaceholder').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderTopSummaryReportBlock() {
        const summaryBox = document.getElementById('testSummaryPlaceholder');
        
        let attemptsLogsHtml = "";
        testState.attemptsHistory.forEach(log => {
            const minutes = Math.floor(log.seconds / 60);
            const seconds = log.seconds % 60;
            const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
            
            const ordinalStr = log.attemptNum === 1 ? "1st" : (log.attemptNum === 2 ? "2nd" : (log.attemptNum === 3 ? "3rd" : `${log.attemptNum}th`));
            
            attemptsLogsHtml += `
                <div style="font-size:16px; margin-top:8px; font-weight:normal; color:#444; border-bottom:1px solid #d2e3fc; padding-bottom:4px;">
                    🎯 <strong>${ordinalStr} attempt:</strong> ${log.correctCount} / ${log.total} Correct ⏱️ Time Taken: <strong>${timeStr}</strong>
                </div>
            `;
        });

        summaryBox.innerHTML = `
            <div class="test-summary-card" style="margin-top: 0; margin-bottom: 25px; text-align:left;">
                <div style="color:#1a55b0; font-size:22px; margin-bottom:10px; font-weight:bold; border-bottom:2px solid #1a73e8; padding-bottom:5px;">🏁 Test Evaluation Metrics Dashboard</div>
                ${attemptsLogsHtml}
            </div>
        `;
    }

    
    window.onload = () => {
        initUI();
        generateWorksheet();
    };