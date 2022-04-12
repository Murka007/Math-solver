function START() {
    
    const storage = {
        set(key, value) {
            localStorage.setItem(key, btoa(JSON.stringify(value)));
        },
        get(key) {
            const temp = localStorage.getItem(key);
            return temp !== null ? JSON.parse(atob(temp)) : null;
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
        const keys = Object.keys(sets);
        const defaultKeys = Object.keys(defaultSets);
        for (let i=0;i<keys.length;i++) {
            if (defaultKeys.indexOf(keys[i]) < 0) {
                delete sets[keys[i]];
            }
        }
        storage.set("sets", sets);
    }

    const start = document.getElementById("solveStart");
    const prevWrap = document.getElementsByClassName("prev-wrap");
    const countdownTimer = document.getElementById("countdownTimer");
    const solverInput = document.getElementById("solver-input");
    const solverTask = document.getElementById("solverTask");
    const solvedCount = document.getElementById("solvedCount");
    const settingsCheckbox = document.getElementsByClassName("settings-checkbox");
    const settingsSlider = document.getElementsByClassName("settings-slider");
    const settingsValue = document.getElementsByClassName("slider-value");
    const minSlider = document.getElementById("min"); 
    const maxSlider = document.getElementById("max");
    const playingWrap = document.getElementById("playing-wrap");

    function rand(a, b) {
        return Math.floor(Math.random() * (b - a + 1) + a);
    }

    function isTrusted(e) {
        return e && e.isTrusted && e instanceof Event;
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
                if (curr == minSlider && Number(minSlider.value) > Number(maxSlider.value)) {
                    minSlider.value = maxSlider.value;
                    minSlider.textContent = maxSlider.value;
                } else if (curr == maxSlider && Number(maxSlider.value) < Number(minSlider.value)) {
                    maxSlider.value = minSlider.value;
                    maxSlider.textContent = minSlider.value;
                }
                sets[curr.id] = Number(e.target.value);
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
        addition: function() {
            const [min, max] = getMinMax();
            return [min + " + " + max + " =", min + max];
        },
        subtraction: function() {
            let value = [min, max] = getMinMax();
            while (max - min < 0) {
                value = [min, max] = getMinMax();
            }
            return [max + " - " + min + " =", max - min];
        },
        division: function() {
            let value = [min, max] = getMinMax();
            while (max % min != 0) {
                value = [min, max] = getMinMax();
            }
            return [max + " / " + min + " =", max / min];
        },
        multiplication: function() {
            const [min, max] = getMinMax();
            return [min + " * " + max + " =", min * max];
        }
    };

    function getAvailableOperators() {
        return Object.entries(operators).filter(([key, value]) => sets[key]);
    }

    function init() {
        let solved = 0;
        let seconds = 60;
        let task, answer;
        const ops = getAvailableOperators();

        function generateTask() {
            const getTask = ops[rand(0, ops.length-1)][1]();
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
            setTimeout(updateTimer, 1000);
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
START();
