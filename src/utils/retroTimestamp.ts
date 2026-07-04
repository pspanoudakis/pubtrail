/**
 * Builds a "retro camcorder" timestamp string, e.g. "APR 26 2026  08:32 PM".
 * The format mimics the date/time stamp burnt into early-90s camcorder footage.
 */
export function buildRetroTimestamp(date: Date = new Date()): string {
    const months = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const meridiem = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) {
        hours = 12;
    }
    const hoursDisplay = String(hours).padStart(2, "0");

    return `${month} ${day} ${year}  ${hoursDisplay}:${minutes} ${meridiem}`;
}
