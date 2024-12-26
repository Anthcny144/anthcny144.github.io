import {version, cv} from './version.js';

// HTML elements
const lastUpdated = document.getElementById("lastUpdated");
const cvList = document.getElementById("cvList");
const statsDisplay = document.getElementById("statsDisplay");
const cvName = document.getElementById("cvName");
const logCount = document.getElementById("logCount");
const logsPerDay = document.getElementById("logsPerDay");
const logsPerDayActivity = document.getElementById("logsPerDayActivity");
const lastActivity = document.getElementById("lastActivity");
const firstLog = document.getElementById("firstLog");
const lastLog = document.getElementById("lastLog");
const logList = document.getElementById("logList");

const logConsts = [
    ['✅', 'accepted', 'Accepted'],
    ['☑️', 'accepted with difficulty change', 'ChangedDifficulty'],
    ['❌', 'rejected', 'Rejected'],
    ['🛠️', 'updated', 'Updated'],
    ['🍏', 'reverted the validation of', 'RevertedValidation'],
    ['🍎', 'reverted the rejection of', 'RevertedRejection'],
    ['💀', 'banned', 'BannedMember'],
    ['👼', 'unbanned', 'UnbannedMember'],
    ['🔁', 'revalidated', 'Revalidated']
]

// Last updated text
lastUpdated.textContent = formatTimestamp(version);

// Populate cv box
Object.keys(cv).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    cvList.appendChild(option);
});

// Handle selection
cvList.addEventListener("change", () => {
    const cvSelected = cvList.value;

    if (cvSelected) {
        const stats = cv[cvSelected];
        displayStats(cvSelected, stats);
    }
    else
        statsDisplay.style.display = "none";
});

// Display cv stats
function displayStats(name, stats) {
    // Get log counts
    let counts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const log of stats) {
        const type = log[1];
        counts[type]++;
    }

    // Display log counts
    for (let i in logConsts) {
        const elem = document.getElementById(`log${logConsts[i][2]}`);
        elem.textContent = counts[i];
    }

    const logCountValue = stats.length;
    const firstlogDate = stats[stats.length - 1][0];
    const lastLogDate = stats[0][0];
    const lastActivityDays = Math.floor(((new Date().getTime() / 1000) - lastLogDate) / 86400);
    const glitchedDates = checkGlitchedLogsDates(stats);

    const daysSinceCv = Math.ceil((new Date().getTime() / 1000 - firstlogDate) / 86400);
    const activityDays = Math.ceil((lastLogDate - firstlogDate) / 86400);

    // General info
    cvName.textContent = name;
    logCount.textContent = logCountValue;
    lastActivity.textContent = lastActivityDays == 0 ? "today" : lastActivityDays + " day" + (lastActivityDays > 1 ? "s" : "") + " ago";
    logsPerDay.textContent = glitchedDates ? "-" : (logCountValue / (daysSinceCv === 0 ? 1 : daysSinceCv)).toFixed(3);
    logsPerDayActivity.textContent = glitchedDates ? "-" : (logCountValue / (activityDays === 0 ? 1 : activityDays)).toFixed(3);

    firstLog.textContent = formatTimestamp(firstlogDate);
    lastLog.textContent = formatTimestamp(lastLogDate);

    // Add logs to list
    logList.innerHTML = "";
    stats.forEach(log => {
        const timestamp = log[0];
        const type = log[1];
        const ref = log[2];
        const text = log[3];

        const listItem = document.createElement("p");
        listItem.textContent = logConsts[type][0] + ' ' + formatTimestamp(timestamp);

        listItem.classList.add("hoverItem");
        listItem.setAttribute("data-tooltip", `${logConsts[type][0]} ${name} ${logConsts[type][1]} "${text}"`);

        listItem.addEventListener("click", function() {
            window.open(`https://mkpc.malahieude.net/${ref}`, '_blank');
        });

        logList.appendChild(listItem);
    });
    statsDisplay.style.display = "block";
}

function checkGlitchedLogsDates(logs) {
    for (const log of logs) {
        const timestamp = log[0];
        if (timestamp != 1609604886)
            return false;
    }
    return true;
}

function getDaySuffix(day) {
    if (Math.floor(day / 10) == 1)
        return 'th';

    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

function formatTimestamp(timestamp) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const date = new Date(timestamp * 1000);

    let year = date.getUTCFullYear();
    let month = date.getUTCMonth();
    let day = date.getUTCDate();
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let seconds = date.getUTCSeconds();

    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;

    return `${months[month]} ${day}${getDaySuffix(day)} ${year}, ${hours}:${minutes}:${seconds}`;
}