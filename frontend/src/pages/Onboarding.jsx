import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api/mockApi";
import { emptyProfile, SCORED_FIELDS } from "../data/mockData";
import { useApp } from "../context/AppContext";
import { AVATAR_OPTIONS } from "../data/avatarOptions";

const STEPS = [
  "avatar",
  "location",
  "lifestyle",
  "comfort",
  "job",
  "workDetails",
  "priority",
];

export default function Onboarding() {
  const [answers, setAnswers] = useState({
    ...emptyProfile,
    avatarId: emptyProfile.avatarId || "",
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { profile, refreshProfile } = useApp();

  const isWorking =
    answers.jobStatus === "Working Professional" ||
    answers.jobStatus === "Both";

  /*
   * Work details are only shown to people who selected
   * Working Professional or Both.
   */
  const visibleSteps = STEPS.filter(
    (step) => step !== "workDetails" || isWorking
  );

  const currentStep = visibleSteps[stepIndex];
  const isLastStep = stepIndex === visibleSteps.length - 1;

  const set = (field) => (value) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateStep = () => {
    if (currentStep === "avatar") {
      if (!answers.avatarId) {
        return "Please choose an avatar before continuing.";
      }
    }

    if (currentStep === "location") {
      if (
        !answers.city ||
        !answers.locality ||
        !answers.budget ||
        !answers.gender ||
        !answers.preferredRoommateGender
      ) {
        return "Please fill in every field before continuing.";
      }

      if (Number(answers.budget) <= 0) {
        return "Please enter a valid monthly budget.";
      }
    }

    if (currentStep === "lifestyle") {
      if (
        !answers.food ||
        !answers.guests ||
        !answers.sleep ||
        !answers.noise
      ) {
        return "Please answer every lifestyle question.";
      }
    }

    if (currentStep === "comfort") {
      if (
        !answers.smokes ||
        !answers.okWithSmoker ||
        !answers.drinks ||
        !answers.okWithDrinker
      ) {
        return "Please answer every comfort question.";
      }
    }

    if (currentStep === "job") {
      if (
        !answers.jobStatus ||
        !answers.preferredJobStatus ||
        !answers.schedule ||
        !answers.okWithDifferentSchedule
      ) {
        return "Please answer every job and schedule question.";
      }
    }

    if (currentStep === "workDetails") {
      if (!answers.workMode || !answers.preferQuietWorkHours) {
        return "Please answer all work-related questions.";
      }

      const needsWorkingHours =
        answers.workMode === "Work From Home" ||
        answers.workMode === "Hybrid";

      if (
        needsWorkingHours &&
        (!answers.workStartTime || !answers.workEndTime)
      ) {
        return "Please enter your usual working hours.";
      }

      if (
        needsWorkingHours &&
        answers.workStartTime >= answers.workEndTime
      ) {
        return "End time must be later than start time.";
      }
    }

    if (currentStep === "priority") {
      const priorityFields = answers.priorityFields || [];

      if (priorityFields.length === 0) {
        return "Please choose at least one priority.";
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
      setStepIndex((previousStep) => previousStep + 1);
      return;
    }

    setSaving(true);

    try {
      await api.saveProfile({
        ...answers,
        name: profile?.name || answers.name,
        email: profile?.email || answers.email,
        budget: Number(answers.budget),
      });

      await refreshProfile();

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message ||
          "We couldn't save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0 && !saving) {
      setError("");
      setStepIndex((previousStep) => previousStep - 1);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <ProgressBar
        current={stepIndex + 1}
        total={visibleSteps.length}
      />

      <div className="mt-8">
        {currentStep === "avatar" && (
          <AvatarStep answers={answers} set={set} />
        )}

        {currentStep === "location" && (
          <LocationStep answers={answers} set={set} />
        )}

        {currentStep === "lifestyle" && (
          <LifestyleStep answers={answers} set={set} />
        )}

        {currentStep === "comfort" && (
          <ComfortStep answers={answers} set={set} />
        )}

        {currentStep === "job" && (
          <JobStep answers={answers} set={set} />
        )}

        {currentStep === "workDetails" && (
          <WorkDetailsStep answers={answers} set={set} />
        )}

        {currentStep === "priority" && (
          <PriorityStep answers={answers} set={set} />
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-accent/30 bg-card px-4 py-3 text-sm text-accent"
        >
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={stepIndex === 0 || saving}
          className="rounded-full px-5 py-2.5 font-medium text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-0"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={saving}
          className="rounded-full bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving…"
            : isLastStep
            ? "Finish"
            : "Next"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Avatar Step                                                                */
/* -------------------------------------------------------------------------- */

function AvatarStep({ answers, set }) {
  return (
    <div className="space-y-6">
      <StepHeading
        title="Choose your avatar"
        subtitle="Pick an avatar that represents your vibe."
      />

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {AVATAR_OPTIONS.map((avatar) => {
          const selected = answers.avatarId === avatar.id;

          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => set("avatarId")(avatar.id)}
              aria-label={avatar.label}
              aria-pressed={selected}
              className={`aspect-square overflow-hidden rounded-full border-2 p-1 transition-all ${
                selected
                  ? "border-primary ring-4 ring-primary-light"
                  : "border-transparent hover:border-primary"
              }`}
            >
              <img
                src={avatar.image}
                alt={avatar.label}
                className="h-full w-full rounded-full object-cover"
              />
            </button>
          );
        })}
      </div>

      {answers.avatarId && (
        <p className="text-center text-sm text-muted">
          Avatar selected
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress Bar                                                               */
/* -------------------------------------------------------------------------- */

function ProgressBar({ current, total }) {
  const progress = Math.min((current / total) * 100, 100);

  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted">
        Step {current} of {total}
      </p>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label={`Onboarding step ${current} of ${total}`}
        aria-valuemin="1"
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared Components                                                          */
/* -------------------------------------------------------------------------- */

function StepHeading({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {title}
      </h1>

      {subtitle && (
        <p className="mt-1 text-sm text-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">
        {label}
      </span>

      <input
        type={type}
        value={value || ""}
        min={type === "number" ? "1" : undefined}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-ink outline-none transition-colors placeholder:text-muted focus:border-primary"
      />
    </label>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}) {
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-ink">
        {label}
      </legend>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-border text-ink hover:border-primary"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ScaleField({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">
        {label}
      </span>

      <div className="flex items-center gap-3">
        <span className="w-20 text-xs text-muted">
          {lowLabel}
        </span>

        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value || 3}
          onChange={(event) =>
            onChange(Number(event.target.value))
          }
          className="min-w-0 flex-1 accent-primary"
        />

        <span className="w-20 text-right text-xs text-muted">
          {highLabel}
        </span>
      </div>

      <p className="mt-1 text-center font-mono text-sm text-primary">
        {value || 3} / 5
      </p>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Location Step                                                              */
/* -------------------------------------------------------------------------- */

function LocationStep({ answers, set }) {
  return (
    <div className="space-y-5">
      <StepHeading
        title="Where and how much"
        subtitle="These details help us find roommates in the right area and budget."
      />

      <TextField
        label="City"
        value={answers.city}
        onChange={set("city")}
        placeholder="e.g. Delhi"
      />

      <TextField
        label="Locality or area"
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

/* -------------------------------------------------------------------------- */
/* Lifestyle Step                                                             */
/* -------------------------------------------------------------------------- */

function LifestyleStep({ answers, set }) {
  return (
    <div className="space-y-5">
      <StepHeading
        title="Lifestyle and habits"
        subtitle="These answers contribute to your compatibility percentage."
      />

      <ChoiceGroup
        label="Food preference"
        options={[
          "Veg",
          "Non-veg",
          "Eggetarian",
          "Vegan",
        ]}
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
        options={[
          "Never",
          "Occasionally",
          "Often",
        ]}
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
        options={[
          "Lights on",
          "Lights off",
          "Flexible",
        ]}
        value={answers.sleep}
        onChange={set("sleep")}
      />

      <ChoiceGroup
        label="Noise / study habits"
        options={[
          "Silent",
          "Music",
          "Group study",
        ]}
        value={answers.noise}
        onChange={set("noise")}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Comfort Step                                                               */
/* -------------------------------------------------------------------------- */

function ComfortStep({ answers, set }) {
  return (
    <div className="space-y-5">
      <StepHeading
        title="Comfort with habits"
        subtitle="Tell us which habits you are personally comfortable living with."
      />

      <ChoiceGroup
        label="Do you smoke?"
        options={[
          "Yes",
          "No",
          "Occasional",
        ]}
        value={answers.smokes}
        onChange={set("smokes")}
      />

      <ChoiceGroup
        label="Are you okay living with a smoker?"
        options={["Yes", "No"]}
        value={answers.okWithSmoker}
        onChange={set("okWithSmoker")}
      />

      <ChoiceGroup
        label="Do you drink?"
        options={[
          "Yes",
          "No",
          "Occasional",
        ]}
        value={answers.drinks}
        onChange={set("drinks")}
      />

      <ChoiceGroup
        label="Are you okay living with a drinker?"
        options={["Yes", "No"]}
        value={answers.okWithDrinker}
        onChange={set("okWithDrinker")}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Job Step                                                                   */
/* -------------------------------------------------------------------------- */

function JobStep({ answers, set }) {
  return (
    <div className="space-y-5">
      <StepHeading
        title="Job and schedule"
        subtitle="Your routine helps us find someone with compatible timings."
      />

      <ChoiceGroup
        label="Job status"
        options={[
          "Student",
          "Working Professional",
          "Both",
        ]}
        value={answers.jobStatus}
        onChange={set("jobStatus")}
      />

      <ChoiceGroup
        label="Preferred roommate job status"
        options={[
          "Student",
          "Professional",
          "Either",
        ]}
        value={answers.preferredJobStatus}
        onChange={set("preferredJobStatus")}
      />

      <ChoiceGroup
        label="Your daily schedule"
        options={[
          "Mostly daytime",
          "Mostly evening-night",
          "Varies",
        ]}
        value={answers.schedule}
        onChange={set("schedule")}
      />

      <ChoiceGroup
        label="Are you okay with a roommate on a different schedule?"
        options={["Yes", "No"]}
        value={answers.okWithDifferentSchedule}
        onChange={set("okWithDifferentSchedule")}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Work Details Step                                                          */
/* -------------------------------------------------------------------------- */

function WorkDetailsStep({ answers, set }) {
  const needsWorkingHours =
    answers.workMode === "Work From Home" ||
    answers.workMode === "Hybrid";

  const handleWorkModeChange = (value) => {
    set("workMode")(value);

    if (value === "Work From Office") {
      set("workStartTime")("");
      set("workEndTime")("");
    }
  };

  return (
    <div className="space-y-5">
      <StepHeading
        title="Work details"
        subtitle="Tell us when and how you usually work so we can find a compatible roommate."
      />

      <ChoiceGroup
        label="Work mode"
        options={[
          "Work From Home",
          "Work From Office",
          "Hybrid",
        ]}
        value={answers.workMode}
        onChange={handleWorkModeChange}
      />

      {needsWorkingHours && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <p className="text-sm font-medium text-ink">
            What are your usual working hours?
          </p>

          <p className="mt-1 text-xs text-muted">
            Add the approximate time when you normally start and finish work.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">
                Start time
              </span>

              <input
                type="time"
                value={answers.workStartTime || ""}
                onChange={(event) =>
                  set("workStartTime")(event.target.value)
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-ink outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">
                End time
              </span>

              <input
                type="time"
                value={answers.workEndTime || ""}
                onChange={(event) =>
                  set("workEndTime")(event.target.value)
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-ink outline-none transition-colors focus:border-primary"
              />
            </label>
          </div>
        </div>
      )}

      <ChoiceGroup
        label="Do you need the house quiet during your working hours?"
        options={[
          "Yes, I'd prefer that",
          "No preference",
        ]}
        value={answers.preferQuietWorkHours}
        onChange={set("preferQuietWorkHours")}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Priority Step                                                              */
/* -------------------------------------------------------------------------- */

function PriorityStep({ answers, set }) {
  const priorityFields = answers.priorityFields || [];

  const toggle = (key) => {
    if (priorityFields.includes(key)) {
      set("priorityFields")(
        priorityFields.filter((field) => field !== key)
      );
      return;
    }

    if (priorityFields.length < 3) {
      set("priorityFields")([
        ...priorityFields,
        key,
      ]);
    }
  };

  return (
    <div className="space-y-5">
      <StepHeading
        title="What matters most to you?"
        subtitle="Choose up to three preferences that should receive extra weight."
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SCORED_FIELDS.map((field) => {
          const selected = priorityFields.includes(field.key);

          const disabled =
            !selected && priorityFields.length >= 3;

          return (
            <button
              key={field.key}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => toggle(field.key)}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                selected
                  ? "border-primary bg-primary text-white"
                  : disabled
                  ? "cursor-not-allowed border-border text-muted/50"
                  : "border-border text-ink hover:border-primary"
              }`}
            >
              {field.label}
            </button>
          );
        })}
      </div>

      <p className="font-mono text-xs text-muted">
        {priorityFields.length} / 3 selected
      </p>
    </div>
  );
}