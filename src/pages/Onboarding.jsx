import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api/mockApi";
import { emptyProfile, SCORED_FIELDS } from "../data/mockData";

// -----------------------------------------------------------------------
// WHY A MULTI-STEP WIZARD INSTEAD OF ONE LONG FORM:
// The spec has ~19 questions. One giant form is overwhelming and hides
// progress. Breaking it into steps that mirror the spec's own section
// groupings (Location, Lifestyle, Comfort, Job & Schedule, Priority) means
// each step has a single clear topic, and we can show a progress bar.
//
// WHY CONDITIONAL STEPS INSTEAD OF CONDITIONAL FIELDS ON ONE STEP:
// Work mode / daytime privacy only apply if the user is a working
// professional (spec Section 5). Skipping the whole step (rather than
// hiding two fields on a step) keeps the step count - and therefore the
// progress bar - honest: a student genuinely has fewer steps to do.
// -----------------------------------------------------------------------

const STEPS = ["location", "lifestyle", "comfort", "job", "workDetails", "priority"];

export default function Onboarding() {
  const [answers, setAnswers] = useState(emptyProfile);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const isWorking = answers.jobStatus === "Working Professional" || answers.jobStatus === "Both";

  // Skip the "workDetails" step entirely for students - see comment above.
  const visibleSteps = STEPS.filter((s) => s !== "workDetails" || isWorking);
  const currentStep = visibleSteps[stepIndex];
  const isLastStep = stepIndex === visibleSteps.length - 1;

  const set = (field) => (value) => setAnswers({ ...answers, [field]: value });

  const validateStep = () => {
    if (currentStep === "location") {
      if (!answers.city || !answers.locality || !answers.budget || !answers.gender || !answers.preferredRoommateGender) {
        return "Please fill in every field before continuing.";
      }
    }
    if (currentStep === "lifestyle") {
      if (!answers.food || !answers.guests || !answers.sleep || !answers.noise) {
        return "Please answer every lifestyle question.";
      }
    }
    if (currentStep === "comfort") {
      if (!answers.smokes || !answers.okWithSmoker || !answers.drinks || !answers.okWithDrinker) {
        return "Please answer every comfort question.";
      }
    }
    if (currentStep === "job") {
      if (!answers.jobStatus || !answers.preferredJobStatus || !answers.schedule || !answers.okWithDifferentSchedule) {
        return "Please answer every job & schedule question.";
      }
    }
    if (currentStep === "workDetails") {
      if (!answers.workMode || !answers.preferQuietWorkHours) {
        return "Please answer both work-related questions.";
      }
    }
    return "";
  };

  const handleNext = async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    if (!isLastStep) {
      setStepIndex(stepIndex + 1);
      return;
    }

    setSaving(true);
    try {
      await api.saveProfile(answers);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <ProgressBar current={stepIndex + 1} total={visibleSteps.length} />

      <div className="mt-8">
        {currentStep === "location" && <LocationStep answers={answers} set={set} />}
        {currentStep === "lifestyle" && <LifestyleStep answers={answers} set={set} />}
        {currentStep === "comfort" && <ComfortStep answers={answers} set={set} />}
        {currentStep === "job" && <JobStep answers={answers} set={set} />}
        {currentStep === "workDetails" && <WorkDetailsStep answers={answers} set={set} />}
        {currentStep === "priority" && <PriorityStep answers={answers} set={set} />}
      </div>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          disabled={stepIndex === 0}
          className="px-5 py-2.5 rounded-full font-medium text-muted disabled:opacity-0"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={saving}
          className="px-6 py-2.5 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : isLastStep ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ current, total }) {
  return (
    <div>
      <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">
        Step {current} of {total}
      </p>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

// --- Shared small controls --------------------------------------------------
function StepHeading({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

function TextField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-card focus:border-primary outline-none transition-colors"
      />
    </label>
  );
}

function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <div>
      <span className="block text-sm font-medium text-ink mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              value === opt
                ? "bg-primary text-white border-primary"
                : "border-border text-ink hover:border-primary"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScaleField({ label, value, onChange, lowLabel, highLabel }) {
  return (
    <div>
      <span className="block text-sm font-medium text-ink mb-2">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted w-20">{lowLabel}</span>
        <input
          type="range"
          min={1}
          max={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="text-xs text-muted w-20 text-right">{highLabel}</span>
      </div>
      <p className="text-center font-mono text-sm text-primary mt-1">{value} / 5</p>
    </div>
  );
}

// --- Step components ---------------------------------------------------------
function LocationStep({ answers, set }) {
  return (
    <div className="space-y-5">
      <StepHeading title="Where and how much" subtitle="These are hard filters - candidates must match." />
      <TextField label="City" value={answers.city} onChange={set("city")} placeholder="e.g. Delhi" />
      <TextField
        label="Locality / area"
        value={answers.locality}
        onChange={set("locality")}
        placeholder="e.g. Hauz Khas"
      />
      <TextField
        label="Monthly budget (₹)"
        type="number"
        value={answers.budget}
        onChange={set("budget")}
        placeholder="e.g. 14000"
      />
      <ChoiceGroup
        label="Your gender"
        options={["Male", "Female", "Other"]}
        value={answers.gender}
        onChange={set("gender")}
      />
      <ChoiceGroup
        label="Preferred roommate gender"
        options={["Male", "Female", "Any"]}
        value={answers.preferredRoommateGender}
        onChange={set("preferredRoommateGender")}
      />
    </div>
  );
}

function LifestyleStep({ answers, set }) {
  return (
    <div className="space-y-5">
      <StepHeading
        title="Lifestyle & habits"
        subtitle="These feed directly into your compatibility percentage."
      />
      <ChoiceGroup
        label="Food preference"
        options={["Veg", "Non-veg", "Eggetarian", "Vegan"]}
        value={answers.food}
        onChange={set("food")}
      />
      <ScaleField
        label="Socialising level"
        value={answers.social}
        onChange={set("social")}
        lowLabel="Introvert"
        highLabel="Extrovert"
      />
      <ChoiceGroup
        label="Guest frequency"
        options={["Never", "Occasionally", "Often"]}
        value={answers.guests}
        onChange={set("guests")}
      />
      <ScaleField
        label="Cleanliness"
        value={answers.cleanliness}
        onChange={set("cleanliness")}
        lowLabel="Relaxed"
        highLabel="Spotless"
      />
      <ChoiceGroup
        label="Sleep condition"
        options={["Lights on", "Lights off", "Flexible"]}
        value={answers.sleep}
        onChange={set("sleep")}
      />
      <ChoiceGroup
        label="Noise / study habits"
        options={["Silent", "Music", "Group study"]}
        value={answers.noise}
        onChange={set("noise")}
      />
    </div>
  );
}

function ComfortStep({ answers, set }) {
  return (
    <div className="space-y-5">
      <StepHeading
        title="Comfort with habits"
        subtitle="Bidirectional - a non-smoker fine with a smoker can still match with one."
      />
      <ChoiceGroup
        label="Do you smoke?"
        options={["Yes", "No", "Occasional"]}
        value={answers.smokes}
        onChange={set("smokes")}
      />
      <ChoiceGroup
        label="Okay living with a smoker?"
        options={["Yes", "No"]}
        value={answers.okWithSmoker}
        onChange={set("okWithSmoker")}
      />
      <ChoiceGroup
        label="Do you drink?"
        options={["Yes", "No", "Occasional"]}
        value={answers.drinks}
        onChange={set("drinks")}
      />
      <ChoiceGroup
        label="Okay living with a drinker?"
        options={["Yes", "No"]}
        value={answers.okWithDrinker}
        onChange={set("okWithDrinker")}
      />
    </div>
  );
}

function JobStep({ answers, set }) {
  return (
    <div className="space-y-5">
      <StepHeading title="Job & schedule" />
      <ChoiceGroup
        label="Job status"
        options={["Student", "Working Professional", "Both"]}
        value={answers.jobStatus}
        onChange={set("jobStatus")}
      />
      <ChoiceGroup
        label="Preferred roommate job status"
        options={["Student", "Professional", "Either"]}
        value={answers.preferredJobStatus}
        onChange={set("preferredJobStatus")}
      />
      <ChoiceGroup
        label="Your daily schedule"
        options={["Mostly daytime", "Mostly evening-night", "Varies"]}
        value={answers.schedule}
        onChange={set("schedule")}
      />
      <ChoiceGroup
        label="Okay with a roommate on a different schedule?"
        options={["Yes", "No"]}
        value={answers.okWithDifferentSchedule}
        onChange={set("okWithDifferentSchedule")}
      />
    </div>
  );
}

function WorkDetailsStep({ answers, set }) {
  return (
    <div className="space-y-5">
      <StepHeading
        title="Work-from-home details"
        subtitle="Only asked because you said you work - this affects who can share a place with you during the day."
      />
      <ChoiceGroup
        label="Work mode"
        options={["Work From Home", "Work From Office", "Hybrid"]}
        value={answers.workMode}
        onChange={set("workMode")}
      />
      <ChoiceGroup
        label="Do you need the house quiet/empty during your work hours?"
        options={["Yes, I'd prefer that", "No preference"]}
        value={answers.preferQuietWorkHours}
        onChange={set("preferQuietWorkHours")}
      />
    </div>
  );
}

function PriorityStep({ answers, set }) {
  const toggle = (key) => {
    const current = answers.priorityFields;
    if (current.includes(key)) {
      set("priorityFields")(current.filter((k) => k !== key));
    } else if (current.length < 3) {
      set("priorityFields")([...current, key]);
    }
  };

  return (
    <div className="space-y-5">
      <StepHeading
        title="What matters most to you?"
        subtitle="Choose up to 3. These get extra weight in your compatibility score - and a near-miss on any of them can exclude a candidate entirely."
      />
      <div className="grid grid-cols-2 gap-2">
        {SCORED_FIELDS.map((field) => {
          const selected = answers.priorityFields.includes(field.key);
          const disabled = !selected && answers.priorityFields.length >= 3;
          return (
            <button
              key={field.key}
              type="button"
              disabled={disabled}
              onClick={() => toggle(field.key)}
              className={`px-4 py-3 rounded-xl text-sm font-medium border text-left transition-colors ${
                selected
                  ? "bg-primary text-white border-primary"
                  : disabled
                  ? "border-border text-muted/50 cursor-not-allowed"
                  : "border-border text-ink hover:border-primary"
              }`}
            >
              {field.label}
            </button>
          );
        })}
      </div>
      <p className="font-mono text-xs text-muted">{answers.priorityFields.length} / 3 selected</p>
    </div>
  );
}
