'use client';

import { useState } from 'react';

type Exercise = {
  id: number;
  title: string;
  description: string;
  reps: string;
  duration: string;
  image: string;
  status: string;
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        defaultValue={value}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80';
const INITIAL_PROMPT = 'Erstelle mir 5 Mobilisierung Übungen für den Rücken.';
const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 1,
    title: 'Katzen-Kuh Mobilisierung',
    description: 'Sanfte Mobilisierung für die Wirbelsäule und den unteren Rücken.',
    reps: '2 x 10 Wiederholungen',
    duration: '4 Minuten',
    status: 'Entwurf',
    image: FALLBACK_IMAGE
  },
  {
    id: 2,
    title: 'Becken kippen im Stand',
    description: 'Löst Spannung im unteren Rücken und verbessert die Beweglichkeit.',
    reps: '2 x 12 Wiederholungen',
    duration: '3 Minuten',
    status: 'Entwurf',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80'
  }
];

function mapApiResponseToExercises(response: unknown): Exercise[] {
  const source =
    response && typeof response === 'object' && Array.isArray((response as { exercises?: unknown }).exercises)
      ? (response as { exercises: unknown[] }).exercises
      : Array.isArray(response)
        ? response
        : [];

  return source.map((item, index) => {
    const value = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

    return {
      id: index + 1,
      title: typeof value.title === 'string' && value.title.trim() ? value.title : 'Ohne Titel',
      description: typeof value.description === 'string' ? value.description : '',
      reps: typeof value.reps === 'string' && value.reps.trim() ? value.reps : '–',
      duration: typeof value.duration === 'string' && value.duration.trim() ? value.duration : '–',
      image: typeof value.image === 'string' && value.image.trim() ? value.image : FALLBACK_IMAGE,
      status: 'Entwurf'
    };
  });
}

export default function SportuebungenFrontend() {
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usedPrompt, setUsedPrompt] = useState(INITIAL_PROMPT);
  const [draftExercises, setDraftExercises] = useState<Exercise[]>(INITIAL_EXERCISES);

  const steps = ['Eingabe', 'Generierung', 'Prüfung', 'Freigabe', '3Place'];

  const generateExercises = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        tenantId: 'kunde-a',
        userId: 'u123',
        prompt,
        sprache: 'de',
        bildstil: 'neutral, professionell'
      };

      const response = await fetch('/api/generate-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data && typeof data.error === 'string'
            ? data.error
            : 'Fehler beim Generieren der Übungen. Bitte erneut versuchen.';
        throw new Error(message);
      }

      const mapped = mapApiResponseToExercises(data);
      setDraftExercises(mapped.length > 0 ? mapped : INITIAL_EXERCISES);
      setUsedPrompt(prompt);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Fehler beim Generieren der Übungen. Bitte erneut versuchen.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Klickdummy</p>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Frontend für Sportübungen-Workflow</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
                Der User beschreibt per Prompt, was erstellt werden soll. Danach erzeugt n8n passende
                Übungsentwürfe zur Prüfung und Freigabe.
              </p>
            </div>
            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:w-56">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Mandant</p>
              <p className="mt-1 text-base font-semibold text-slate-900">kunde-a</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step) => {
            const isActive = step === 'Freigabe';
            const isInactive = step === '3Place';

            return (
              <div
                key={step}
                className={`rounded-2xl border p-4 shadow-sm ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : isInactive
                      ? 'border-slate-200 bg-slate-100 text-slate-400'
                      : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <p className="text-sm font-semibold">{step}</p>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <h2 className="text-xl font-semibold text-slate-900">1. Eingabe per Prompt</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Statt vieler einzelner Felder beschreibt der User direkt, welche Übungen erzeugt werden sollen.
              </p>

              <div className="mt-6 space-y-4">
                <Field label="Mandant" value="kunde-a" />
                <Field label="User-ID" value="u123" />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Prompt</label>
                  <textarea
                    rows={5}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                  />
                  <p className="text-xs text-slate-500">Beispiel: Erstelle mir 5 Mobilisierung Übungen für den Rücken.</p>
                </div>

                <Field label="Sprache" value="Deutsch" />
                <Field label="Bildstil" value="Neutral, professionell" />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">n8n Request Payload</p>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-4 text-xs leading-relaxed text-slate-700">{`{
  "tenantId": "kunde-a",
  "userId": "u123",
  "prompt": "${prompt}",
  "sprache": "de",
  "bildstil": "neutral, professionell"
}`}</pre>
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={generateExercises}
                  disabled={loading}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Übungen werden generiert...' : 'Entwurf mit Prompt erzeugen'}
                </button>
                <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                  Entwurf laden
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">2. Generierter Entwurf</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Ergebnis aus n8n inklusive Bildern. Der User prüft, korrigiert und gibt frei.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Draft-ID: dr_001</Badge>
                  <Badge>pending_review</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Verwendeter Prompt</p>
              <p className="mt-2 text-sm text-slate-800">{usedPrompt}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {draftExercises.map((exercise) => (
                <article
                  key={exercise.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <img src={exercise.image} alt={exercise.title} className="h-52 w-full object-cover" />
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{exercise.title}</h3>
                      <Badge>{exercise.status}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">{exercise.description}</p>

                    <div className="grid grid-cols-2 gap-3">
                      <InfoBox label="Wiederholungen" value={exercise.reps} />
                      <InfoBox label="Dauer" value={exercise.duration} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Beschreibung bearbeiten</label>
                      <textarea
                        rows={4}
                        defaultValue={exercise.description}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                        Bild neu erzeugen
                      </button>
                      <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                        Übung ablehnen
                      </button>
                      <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
                        Übung übernehmen
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">3. Finalisierung &amp; Versand</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Nach der Plausibilisierung werden die Daten final gespeichert und an 3Place gesendet.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoBox label="Status" value="approved" />
                <InfoBox label="Storage" value="/mandanten/kunde-a/uebungen" />
                <InfoBox label="3Place" value="ready_to_send" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 xl:justify-end">
              <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                Als Draft speichern
              </button>
              <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
                Final an 3Place senden
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
