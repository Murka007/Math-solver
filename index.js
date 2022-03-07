function START(w) {
    const log = w.console.log;
    const error = w.console.error;
    const storage = {
        set(key, value) {
            w.localStorage.setItem(key, w.btoa(w.JSON.stringify(value)));
        },
        get(key) {
            const temp = w.localStorage.getItem(key);
            return temp !== null ? w.JSON.parse(w.atob(temp)) : null;
        }
    };
    function defaultSettings() {
        const edits = {};
        edits.addition = true;
        edits.subtraction = true;
        edits.division = true;
        edits.multiplication = true;
        edits.min = 1;
        edits.max = 9;
        return edits;
    }
    const defaultSets = defaultSettings();
    let sets = storage.get("sets");
    if (!sets) {
        sets = defaultSets;
        storage.set("sets", sets);
    } else {
        sets = {...defaultSets, ...sets};
        const keys = w.Object.keys(sets);
        const defaultKeys = w.Object.keys(defaultSets);
        for (let i=0;i<keys.length;i++) {
            if (defaultKeys.indexOf(keys[i]) < 0) {
                delete sets[keys[i]];
            }
        }
        storage.set("sets", sets);
    }
    const start = w.document.getElementById("solveStart");
    const prevWrap = w.document.getElementsByClassName("prev-wrap");
    const countdownTimer = w.document.getElementById("countdownTimer");
    const solverInput = w.document.getElementById("solver-input");
    const solverTask = w.document.getElementById("solverTask");
    const solvedCount = w.document.getElementById("solvedCount");
    const settingsCheckbox = w.document.getElementsByClassName("settings-checkbox");
    const settingsSlider = w.document.getElementsByClassName("settings-slider");
    const settingsValue = w.document.getElementsByClassName("slider-value");
    const minSlider = w.document.getElementById("min"); 
    const maxSlider = w.document.getElementById("max");
    const playingWrap = w.document.getElementById("playing-wrap");
    function rand(a, b) {
        return ~~(w.Math.random() * (b - a + 1) + a);
    }
    function isObject(a) {
        return a && typeof a === "object" && !w.Array.isArray(a);
    } 
    function isTrusted(e) {
        return e && isObject(e) && e.isTrusted && e instanceof w.Event;
    }
    start.onclick = function(e) {
        if (!isTrusted(e)) return;
        prevWrap[0].classList.remove("hidden");
        prevWrap[1].classList.add("hidden");
        solverInput.value = "";
        playingWrap.classList.add("playing-disable");
        init();
    }
    for (let i=0;i<settingsCheckbox.length;i++) {
        const curr = settingsCheckbox[i];
        if (sets.hasOwnProperty(curr.id)) {
            curr.checked = sets[curr.id];
            curr.onchange = function(e) {
                if (!isTrusted(e)) return;
                const checked = [...settingsCheckbox].filter(a => a.checked);
                if (!checked.length) {
                    e.target.checked = true;
                    return;
                }
                sets[curr.id] = e.target.checked;
                storage.set("sets", sets);
            }
        }
    }
    for (let i=0;i<settingsSlider.length;i++) {
        const curr = settingsSlider[i];
        if (sets.hasOwnProperty(curr.id)) {
            curr.value = sets[curr.id];
            settingsValue[i].textContent = sets[curr.id];
            curr.oninput = function(e) {
                if (!isTrusted(e)) return;
                if (curr == minSlider && w.Number(minSlider.value) > w.Number(maxSlider.value)) {
                    minSlider.value = maxSlider.value;
                    minSlider.textContent = maxSlider.value;
                } else if (curr == maxSlider && w.Number(maxSlider.value) < w.Number(minSlider.value)) {
                    maxSlider.value = minSlider.value;
                    maxSlider.textContent = minSlider.value;
                }
                sets[curr.id] = w.Number(e.target.value);
                settingsValue[i].textContent = e.target.value;
                storage.set("sets", sets);
            }
        }
    }
    function getMinMax() {
        const min = rand(sets.min, sets.max);
        const max = rand(sets.min, sets.max);
        return [min, max];
    }
    const operators = {
        addition: {
            getTask: function() {
                const [min, max] = getMinMax();
                return [min + " + " + max + " =", min + max];
            }
        },
        subtraction: {
            getTask: function() {
                let value = [min, max] = getMinMax();
                while (max - min < 0) {
                    value = [min, max] = getMinMax();
                }
                return [max + " - " + min + " =", max - min];
            }
        },
        division: {
            getTask: function() {
                let value = [min, max] = getMinMax();
                while (max % min != 0) {
                    value = [min, max] = getMinMax();
                }
                return [max + " / " + min + " =", max / min];
            }
        },
        multiplication: {
            getTask: function() {
                const [min, max] = getMinMax();
                return [min + " * " + max + " =", min * max];
            }
        }
    };
    function getAvailableOperators() {
        return w.Object.keys(operators).filter(a => sets[a]);
    }
    function init() {
        let solved = 0;
        let seconds = 60;
        let task, answer;
        const ops = getAvailableOperators();
        function generateTask() {
            const getTask = operators[ops[rand(0, ops.length-1)]].getTask();
            task = getTask[0];
            answer = getTask[1];
            solverTask.textContent = task;
        }
        generateTask();
        function updateTimer() {
            countdownTimer.textContent = seconds;
            seconds--;
            if (!seconds) {
                solvedCount.textContent = "Score: " + solved;
                prevWrap[0].classList.add("hidden");
                prevWrap[1].classList.remove("hidden");
                playingWrap.classList.remove("playing-disable");
                return;
            }
            w.setTimeout(updateTimer, 1000);
        }
        updateTimer();

        solverInput.oninput = function(e) {
            if (isTrusted(e) && seconds) {
                e.target.value = e.target.value.replace(/[^0-9]/, "");
                if (e.target.value === answer+"") {
                    generateTask();
                    solverInput.value = "";
                    solved++;
                }
            }
        }
    }
}
START(window);
