import { useEffect, useMemo, useState } from "react";

import DashboardNav from "../components/dashboard/DashboardNav";

import WelcomeHeader from "../components/dashboard/WelcomeHeader";

import CheckInCTA from "../components/dashboard/CheckInCTA";

import WellnessTrend from "../components/dashboard/WellnessTrend";

import RecentCheckIns from "../components/dashboard/RecentCheckIns";

import InsightCard from "../components/dashboard/InsightCard";

import ExpressionJourney from "../components/dashboard/ExpressionJourney";

import AdditionalSessionContext from "../components/dashboard/AdditionalSessionContext";

import useDashboardData from "../hooks/useDashboardData";

import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_CONVERSATION_API_URL;

const GLASS_CARD =

"group relative overflow-hidden rounded-3xl border border-white/55 bg-white/20 shadow-[0_18px_55px_-28px_rgba(91,79,207,0.32)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/25 hover:shadow-[0_24px_65px_-28px_rgba(91,79,207,0.42)]";

const GLASS_HIGHLIGHT =

"pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-primary/5 opacity-70";

/* ============================================================

SESSION HELPERS

============================================================ */

function getSessionId(session) {

if (!session || typeof session !== "object") {

return null;

}

return (

session.session_id ||

session.sessionId ||

session.session?.id ||

session.id ||

null

);

}

function getSessionsFromResponse(data) {

if (Array.isArray(data)) {

return data;

}

if (Array.isArray(data?.sessions)) {

return data.sessions;

}

if (Array.isArray(data?.items)) {

return data.items;

}

return [];

}

function getSessionTime(session) {

const candidates = [

session?.created_at,

session?.createdAt,

session?.completed_at,

session?.completedAt,

session?.started_at,

session?.startedAt,

];

for (const candidate of candidates) {

const timestamp = new Date(candidate).getTime();

if (Number.isFinite(timestamp)) {

return timestamp;

}

}

return 0;

}

function getLatestCompletedSessionId(sessions) {

const completed = sessions

.filter(

(session) =>

session?.status === "completed"

)

.filter((session) => getSessionId(session));

if (completed.length === 0) {

return null;

}

completed.sort(

(a, b) =>

getSessionTime(b) -

getSessionTime(a)

);

return getSessionId(completed[0]);

}

/* ============================================================

LATEST SESSION VISUALS

============================================================ */

function LatestSessionVisuals({

currentUser,

recentCheckIns,

}) {

const [ferData, setFerData] =

useState(null);

const [loading, setLoading] =

useState(true);

const [error, setError] =

useState(null);

/*

* RecentCheckIns normally contains the

* session identifier of the latest check-in.

*/

const recentSessionId = useMemo(() => {

const latestCheckIn =

Array.isArray(recentCheckIns)

? recentCheckIns[0]

: null;

return getSessionId(

latestCheckIn

);

}, [recentCheckIns]);

useEffect(() => {

let cancelled = false;

async function loadLatestExpressionData() {

if (!currentUser) {

setFerData(null);

setLoading(false);

setError(null);

return;

}

setLoading(true);

setError(null);

try {

const token =

await currentUser.getIdToken();

let sessionId =

recentSessionId;

/*

* Prefer the latest session already

* supplied by useDashboardData.

*

* If it doesn't expose the session ID,

* fall back to the authenticated

* sessions endpoint.

*/

if (!sessionId) {

const sessionsResponse =

await fetch(

`${API_BASE_URL}/api/v1/sessions`,

{

method: "GET",

headers: {

Authorization: `Bearer ${token}`,

},

}

);

if (!sessionsResponse.ok) {

throw new Error(

"Unable to retrieve your latest completed session."

);

}

const sessionsData =

await sessionsResponse.json();

sessionId =

getLatestCompletedSessionId(

getSessionsFromResponse(

sessionsData

)

);

}

/*

* There is no completed session yet.

*/

if (!sessionId) {

if (!cancelled) {

setFerData(null);

setError(null);

}

return;

}

/*

* Retrieve the private FER data

* through the authenticated backend

* endpoint we already created.

*/

const response =

await fetch(

`${API_BASE_URL}/api/v1/sessions/${sessionId}/emotion-data`,

{

method: "GET",

headers: {

Authorization: `Bearer ${token}`,

},

}

);

if (!response.ok) {

let message =

"Unable to retrieve your latest expression data.";

try {

const errorData =

await response.json();

if (errorData?.detail) {

message =

errorData.detail;

}

} catch {

// Keep the default message.

}

throw new Error(message);

}

const data =

await response.json();

if (!cancelled) {

setFerData(data);

setError(null);

}

} catch (loadError) {

if (!cancelled) {

console.error(

"[DASHBOARD] Latest expression data error:",

loadError

);

setFerData(null);

setError(

loadError?.message ||

"Unable to retrieve your latest expression data."

);

}

} finally {

if (!cancelled) {

setLoading(false);

}

}

}

void loadLatestExpressionData();

return () => {

cancelled = true;

};

}, [

currentUser,

recentSessionId,

]);

const timeline =

Array.isArray(ferData?.timeline)

? ferData.timeline

: [];

const observationCount =

Number.isFinite(

ferData?.observation_count

)

? ferData.observation_count

: timeline.length;

/*

* ----------------------------------------------------------

* LOADING STATE

* ----------------------------------------------------------

*/

if (loading) {

return (

<div className={GLASS_CARD}>

<div

className={GLASS_HIGHLIGHT}

aria-hidden="true"

/>

<div className="relative z-10 p-5 md:p-6">

<div className="mb-4">

<p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary-deep/65">

Latest check-in

</p>

<h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">

Your expression signals

</h2>

</div>

<div className="grid gap-3 lg:grid-cols-[1.55fr_0.9fr]">

<div className="h-[300px] animate-pulse rounded-[22px] border border-white/45 bg-white/[0.12]" />

<div className="h-[300px] animate-pulse rounded-[22px] border border-white/45 bg-white/[0.12]" />

</div>

</div>

</div>

);

}

/*

* ----------------------------------------------------------

* ERROR STATE

* ----------------------------------------------------------

*/

if (error) {

return (

<div className={GLASS_CARD}>

<div

className={GLASS_HIGHLIGHT}

aria-hidden="true"

/>

<div className="relative z-10 p-5 text-center md:p-6">

<p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary-deep/65">

Latest check-in

</p>

<h2 className="mt-1 text-xl font-bold tracking-tight text-ink">

Your expression signals

</h2>

<p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-ink-soft">

Your check-in history is still

available, but the latest

expression data could not be

loaded right now.

</p>

</div>

</div>

);

}

/*

* ----------------------------------------------------------

* EMPTY STATE

* ----------------------------------------------------------

*/

if (timeline.length === 0) {

return (

<div className={GLASS_CARD}>

<div

className={GLASS_HIGHLIGHT}

aria-hidden="true"

/>

<div className="relative z-10 p-5 text-center md:p-6">

<p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary-deep/65">

Latest check-in

</p>

<h2 className="mt-1 text-xl font-bold tracking-tight text-ink">

Your expression signals

</h2>

<p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-ink-soft">

Complete a successful check-in

to see your latest expression

journey and session context here.

</p>

</div>

</div>

);

}

/*

* ----------------------------------------------------------

* ACTUAL LATEST SESSION VISUALS

* ----------------------------------------------------------

*/

return (

<div className={GLASS_CARD}>

<div

className={GLASS_HIGHLIGHT}

aria-hidden="true"

/>

<div className="relative z-10 p-4 md:p-5">

<div className="mb-3 flex items-end justify-between gap-4">

<div>

<p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary-deep/65">

Latest check-in

</p>

<h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">

Your expression signals

</h2>

<p className="mt-0.5 text-[10px] leading-4 text-ink-soft/60">

A quick view of the latest

facial-expression signals

captured during your

check-in.

</p>

</div>

<span className="hidden shrink-0 rounded-full border border-white/45 bg-white/[0.10] px-3 py-1.5 text-[9px] font-medium text-ink-soft sm:inline-flex">

{observationCount} observations

</span>

</div>

<div className="grid gap-3 lg:grid-cols-[1.55fr_0.9fr] lg:items-stretch">

<ExpressionJourney

timeline={timeline}

observationCount={

observationCount

}

/>

<AdditionalSessionContext

timeline={timeline}

emotionSummary={ferData?.emotion_summary}

/>

</div>

</div>

</div>

);

}

/* ============================================================

DASHBOARD

============================================================ */

export default function Dashboard() {
  const { currentUser } = useAuth();

  const {
    hasHistory,
    trend,
    recentCheckIns,
    insight,
  } = useDashboardData();

  return (
    <>
      <DashboardNav />

      <main className="mx-auto w-full max-w-6xl px-5 pb-14 pt-5 sm:px-6 md:pb-18 md:pt-7">
        {/* Welcome + check-in action */}
        <section
          className="mb-4 grid items-center gap-5 lg:grid-cols-5"
          data-mindo-phase="calm"
        >
          <div className="lg:col-span-3">
            <WelcomeHeader
              name={currentUser?.displayName}
              hasHistory={hasHistory}
              index={0}
            />
          </div>

          <div className="lg:col-span-2">
            <CheckInCTA index={1} />
          </div>
        </section>

        {/* First glance — latest session + next steps */}
        <section className="mb-4 grid items-stretch gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LatestSessionVisuals
              currentUser={currentUser}
              recentCheckIns={recentCheckIns}
            />
          </div>

          <div className={GLASS_CARD}>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-white/20 opacity-70"
              aria-hidden="true"
            />

            <div className="relative z-10 p-5 md:p-6">
              <InsightCard
                insight={insight}
                hasHistory={hasHistory}
                index={3}
              />
            </div>
          </div>
        </section>

        {/* History — recent check-ins left, activity right */}
        <section className="grid items-stretch gap-4 lg:grid-cols-2">
          <div className={GLASS_CARD}>
            <div className={GLASS_HIGHLIGHT} aria-hidden="true" />

            <div className="relative z-10 p-5 md:p-6">
              <RecentCheckIns
                checkIns={recentCheckIns}
                hasHistory={hasHistory}
                currentUser={currentUser}
                index={4}
              />
            </div>
          </div>

          <div className={GLASS_CARD}>
            <div className={GLASS_HIGHLIGHT} aria-hidden="true" />

            <div className="relative z-10 p-5 md:p-6">
              <WellnessTrend
                trend={trend}
                hasHistory={hasHistory}
                index={2}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
