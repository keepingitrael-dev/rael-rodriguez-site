// Controls the "LIVE NOW" badge and platform highlight on live.html.
//
// live: "auto" | true | false
//   "auto"  — go by the recurring schedule below (this is the normal setting).
//   true    — force LIVE regardless of the schedule (e.g. an extra/unplanned stream).
//   false   — force OFFLINE regardless of the schedule (e.g. skipping a scheduled day).
//   Set it back to "auto" once the one-off is over.
//
// platform: which entry gets highlighted while live — "twitch", "youtube", or "instagram".
//   Only matters while live is true or a scheduled window is active.
//
// schedule: recurring windows, checked only when live is "auto".
//   day: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
//   start / end: 24-hour "HH:MM", in Eastern Time (America/New_York) —
//   this is fixed regardless of where a visitor is viewing the page from.
window.SITE_LIVE_STATUS = {
  live: "auto",
  platform: "twitch",
  schedule: [
    { day: 1, start: "19:45", end: "21:30" }, // Monday, 7:45–9:30 PM ET
    { day: 4, start: "19:45", end: "21:30" }  // Thursday, 7:45–9:30 PM ET
  ]
};
