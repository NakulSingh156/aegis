import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const VENUE_TYPES = [
  { id: "hotel",    label: "Hotel",          emoji: "🏨" },
  { id: "mall",     label: "Shopping Mall",  emoji: "🏬" },
  { id: "hospital", label: "Hospital",       emoji: "🏥" },
  { id: "stadium",  label: "Stadium/Arena",  emoji: "🏟️" },
  { id: "office",   label: "Office Complex", emoji: "🏢" },
  { id: "airport",  label: "Airport",        emoji: "✈️" },
];

export default function VenueSetup({ onComplete }) {
  const { user, saveVenue }     = useAuth();
  const [step, setStep]         = useState(1);
  const [locating, setLocating] = useState(false);
  const [form, setForm]         = useState({
    venueName:   "",
    venueType:   "",
    address:     "",
    city:        "",
    state:       "",
    country:     "India",
    coords:      null,
    floors:      "1",
    zones:       "6",
    staffCount:  "",
  });

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const geocodeAddress = async () => {
    if (!form.address || !form.city) return;
    setLocating(true);

    const fullAddress = `${form.address}, ${form.city}, ${form.state}, ${form.country}`;

    try {
      // 1. Try Venue Name + City
      let query = `${form.venueName}, ${form.city}`;
      let res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      let data = await res.json();
      
      // 2. Fallback to just City if venue is too obscure
      if (!data || data.length === 0) {
        res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.city)}`
        );
        data = await res.json();
      }

      if (data && data.length > 0) {
        update("coords", { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      }
    } catch (e) {
      // Fallback — use city center coords
      update("coords", { lat: 12.9716, lng: 77.5946 }); // Bangalore default
    }
    setLocating(false);
  };

  const handleComplete = async () => {
    const venueData = {
      ...form,
      managedBy: user?.name,
      setupAt:   new Date().toISOString(),
    };
    await saveVenue(venueData);
    onComplete();
  };

  const inputClass = `w-full bg-gray-800 border border-gray-600
    rounded-xl px-4 py-3 text-white placeholder-gray-500
    focus:outline-none focus:border-red-500 transition`;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `linear-gradient(to bottom, rgba(5,5,8,0.8), rgba(5,5,8,0.95)), url('/images/hotel-corridor-2.jpg')`,
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px",
      color: "white",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div className="w-full max-w-2xl bg-gray-900/60 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏢</div>
          <h1 className="text-3xl font-black text-white">
            Configure Your Venue
          </h1>
          <p className="text-gray-400 mt-1">
            Welcome, {user?.name}. Let's set up AEGIS for your venue.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all
              ${step >= s ? "bg-red-500" : "bg-gray-700"}`}/>
          ))}
        </div>

        {/* Step 1 — Venue Type */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">
              What type of venue are you protecting?
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {VENUE_TYPES.map(vt => (
                <button key={vt.id}
                  onClick={() => update("venueType", vt.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition
                    ${form.venueType === vt.id
                      ? "border-red-500 bg-red-900/30"
                      : "border-gray-700 bg-gray-900 hover:border-gray-500"}`}>
                  <div className="text-3xl mb-2">{vt.emoji}</div>
                  <div className="text-white font-semibold text-sm">
                    {vt.label}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.venueType}
              className="w-full bg-red-600 hover:bg-red-500
                disabled:opacity-40 text-white font-black
                py-3 rounded-xl transition">
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Venue Details */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">
              Venue Details
            </h2>
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">
                  Venue Name *
                </label>
                <input
                  placeholder="e.g. Grand Meridian Hotel"
                  value={form.venueName}
                  onChange={e => update("venueName", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">
                  Street Address *
                </label>
                <input
                  placeholder="e.g. 123 MG Road"
                  value={form.address}
                  onChange={e => update("address", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">
                    City *
                  </label>
                  <input
                     placeholder="Bangalore"
                    value={form.city}
                    onChange={e => update("city", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">
                    State
                  </label>
                  <input
                    placeholder="Karnataka"
                    value={form.state}
                    onChange={e => update("state", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">
                    Number of Floors
                  </label>
                  <input
                    type="number" min="1"
                    value={form.floors}
                    onChange={e => update("floors", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">
                    Total Staff
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    value={form.staffCount}
                    onChange={e => update("staffCount", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-gray-400 text-xs mb-1 block">
                  CCTV Camera Zones Connected
                </label>
                <input
                  type="number" min="1"
                  placeholder="6"
                  value={form.zones}
                  onChange={e => update("zones", e.target.value)}
                  className={inputClass}
                />
              </div>


              {/* Geocode button */}
              <button
                onClick={geocodeAddress}
                disabled={locating || !form.address || !form.city}
                className="bg-blue-700 hover:bg-blue-600
                  disabled:opacity-40 text-white font-bold
                  py-3 rounded-xl transition flex items-center
                  justify-center gap-2">
                {locating
                  ? "📍 Locating..."
                  : "📍 Verify Location on Map"}
              </button>

              {form.coords && (
                <div className="flex flex-col gap-2 mt-4">
                  <div className="bg-green-900/40 border border-green-700 rounded-xl p-3 text-green-400 text-sm flex items-center gap-2">
                    ✅ Location locked: {form.city}
                    <span className="text-green-600 text-xs ml-auto">
                      {form.coords.lat.toFixed(4)},
                      {form.coords.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="h-48 w-full relative rounded-xl overflow-hidden border border-gray-600">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.coords.lng - 0.01},${form.coords.lat - 0.01},${form.coords.lng + 0.01},${form.coords.lat + 0.01}&layer=mapnik&marker=${form.coords.lat},${form.coords.lng}`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 bg-gray-800 hover:bg-gray-700
                  text-white font-bold py-3 rounded-xl transition">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.venueName || !form.address || !form.city}
                className="flex-1 bg-red-600 hover:bg-red-500
                  disabled:opacity-40 text-white font-black
                  py-3 rounded-xl transition">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">
              Confirm & Launch AEGIS
            </h2>

            {/* Summary card */}
            <div className="bg-gray-900 border border-gray-700
              rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">
                  {VENUE_TYPES.find(v=>v.id===form.venueType)?.emoji}
                </span>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {form.venueName}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {form.address}, {form.city}, {form.state}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Manager",  value: user?.name  },
                  { label: "Role",     value: user?.role  },
                  { label: "Floors",   value: form.floors },
                  { label: "Staff",    value: form.staffCount || "—" },
                  { label: "Cameras",  value: `${form.zones} zones`   },
                  { label: "AI Model", value: "Gemini 2.0"},
                ].map((item, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-3">
                    <p className="text-gray-400 text-xs">{item.label}</p>
                    <p className="text-white font-semibold text-sm">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {form.coords && (
                <div className="mt-4 bg-green-900/20 border
                  border-green-800 rounded-xl p-3 text-green-400
                  text-sm">
                  📍 Location locked. The system will automatically detect and route to the nearest hospitals and fire stations in case of an emergency.
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 bg-gray-800 hover:bg-gray-700
                  text-white font-bold py-3 rounded-xl transition">
                ← Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 bg-red-600 hover:bg-red-500
                  text-white font-black py-4 rounded-xl transition
                  text-lg shadow-lg shadow-red-500/25">
                ⚡ Launch AEGIS →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
