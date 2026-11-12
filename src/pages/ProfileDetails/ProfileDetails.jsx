
import { useEffect, useMemo, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Pencil,
  Save,
  X,
  Camera,
  CheckCircle2,
  BriefcaseBusiness,
  Globe2,
  LockKeyhole,
} from "lucide-react";
import { Country, State, City } from "country-state-city";
import "./ProfileDetails.css";

const PROFILE_KEY = "wallglow_profile";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null") || {};
  } catch {
    return {};
  }
};

const getSavedProfile = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
};

const createProfile = () => {
  const user = getStoredUser();
  const saved = getSavedProfile() || {};

  return {
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    occupation: "",
    bio: "",
    address: "",
    pincode: "",
    country: "IN",
    state: "",
    city: "",
    photo: "",
    ...saved,
    fullName: saved.fullName || user.name || user.displayName || "",
    email: user.email || saved.email || "",
    photo:
      saved.photo ||
      user.profileImage ||
      user.photoURL ||
      user.picture ||
      "",
  };
};

const inputFields = [
  {
    name: "fullName",
    label: "Full Name",
    icon: UserRound,
    placeholder: "Enter your full name",
  },
  {
    name: "email",
    label: "Email Address",
    icon: Mail,
    placeholder: "Your email address",
  },
  {
    name: "phone",
    label: "Mobile Number",
    icon: Phone,
    placeholder: "10-digit mobile number",
  },
  {
    name: "dob",
    label: "Date of Birth",
    icon: CalendarDays,
    type: "date",
  },
  {
    name: "occupation",
    label: "Occupation",
    icon: BriefcaseBusiness,
    placeholder: "e.g. Interior Designer",
  },
];

export default function ProfileDetails() {
  const [profile, setProfile] = useState(createProfile);
  const [form, setForm] = useState(createProfile);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const countries = useMemo(
    () => Country.getAllCountries(),
    []
  );

  const states = useMemo(
    () => State.getStatesOfCountry(form.country),
    [form.country]
  );

  const cities = useMemo(
    () =>
      form.state
        ? City.getCitiesOfState(form.country, form.state)
        : [],
    [form.country, form.state]
  );

  useEffect(() => {
    const updateProfile = () => {
      const updated = createProfile();
      setProfile(updated);

      if (!editing) {
        setForm(updated);
      }
    };

    window.addEventListener("profileUpdated", updateProfile);
    window.addEventListener("googleLogin", updateProfile);
    window.addEventListener("storage", updateProfile);

    return () => {
      window.removeEventListener("profileUpdated", updateProfile);
      window.removeEventListener("googleLogin", updateProfile);
      window.removeEventListener("storage", updateProfile);
    };
  }, [editing]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      if (name === "country") {
        return {
          ...prev,
          country: value,
          state: "",
          city: "",
        };
      }

      if (name === "state") {
        return {
          ...prev,
          state: value,
          city: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setMessage("");
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setMessage("Please select an image smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        photo: String(reader.result),
      }));

      setMessage("");
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleEdit = () => {
    setForm({ ...profile });
    setEditing(true);
    setErrors({});
    setMessage("");
  };

  const handleCancel = () => {
    setForm({ ...profile });
    setEditing(false);
    setErrors({});
    setMessage("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (
      form.phone &&
      !/^[6-9]\d{9}$/.test(form.phone)
    ) {
      nextErrors.phone =
        "Enter a valid 10-digit Indian mobile number.";
    }

    if (
      form.country === "IN" &&
      form.pincode &&
      !/^\d{6}$/.test(form.pincode)
    ) {
      nextErrors.pincode =
        "Enter a valid 6-digit PIN code.";
    }

    if (
      form.dob &&
      form.dob > new Date().toISOString().slice(0, 10)
    ) {
      nextErrors.dob =
        "Date of birth cannot be in the future.";
    }

    if (!form.country) {
      nextErrors.country = "Please select a country.";
    }

    if (!form.state) {
      nextErrors.state = "Please select a state.";
    }

    if (!form.city) {
      nextErrors.city = "Please select a city.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(form)
      );

      const currentUser = getStoredUser();

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...currentUser,
          name: form.fullName.trim(),
          phone: form.phone,
          profileImage: form.photo,
        })
      );

      setProfile({ ...form });
      setEditing(false);
      setErrors({});

      setMessage(
        "Your profile has been updated successfully."
      );

      window.dispatchEvent(
        new Event("profileUpdated")
      );
    } catch (error) {
      console.error("Profile save error:", error);

      setMessage(
        "Could not save your profile. Please try a smaller photo."
      );
    }
  };

  const countryName =
    Country.getCountryByCode(form.country)?.name ||
    "Not provided";

  const stateName =
    State.getStateByCodeAndCountry(
      form.state,
      form.country
    )?.name || "Not provided";

  const displayName =
    form.fullName || "WallGlow User";

  const renderInput = (field) => {
    const Icon = field.icon;

    return (
      <div className="mp-field" key={field.name}>
        <label htmlFor={`mp-${field.name}`}>
          {field.label}
        </label>

        <div className="mp-input-wrap">
          <Icon size={18} />

          <input
            id={`mp-${field.name}`}
            type={field.type || "text"}
            name={field.name}
            value={form[field.name] || ""}
            placeholder={field.placeholder || ""}
            onChange={handleChange}
            disabled={
              !editing || field.name === "email"
            }
            max={
              field.name === "dob"
                ? new Date().toISOString().slice(0, 10)
                : undefined
            }
            maxLength={
              field.name === "phone"
                ? 10
                : undefined
            }
          />
        </div>

        {field.name === "email" && editing && (
          <small className="mp-helper">
            Email is managed by your login account.
          </small>
        )}

        {errors[field.name] && (
          <small className="mp-error">
            {errors[field.name]}
          </small>
        )}
      </div>
    );
  };

  return (
    <>
    <div className="mp-page">
      <div className="mp-container">

        {/* PAGE HEADER */}
        <div className="mp-page-heading">
          <div>
            <span className="mp-overline">
              MY ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your personal information
              and account details.
            </p>
          </div>

          {!editing ? (
            <button
              type="button"
              className="mp-edit-btn"
              onClick={handleEdit}
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          ) : (
            <div className="mp-header-actions">
              <button
                type="button"
                className="mp-cancel-btn"
                onClick={handleCancel}
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="button"
                className="mp-save-btn"
                onClick={handleSave}
              >
                <Save size={17} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* SUCCESS / ERROR MESSAGE */}
        {message && (
          <div className="mp-message">
            <CheckCircle2 size={19} />
            <span>{message}</span>
          </div>
        )}

        <div className="mp-layout">

          {/* LEFT PROFILE CARD */}
          <aside className="mp-profile-card">
            <div className="mp-profile-banner" />

            <div className="mp-profile-card-content">
              <div className="mp-avatar-container">
                <div className="mp-avatar">
                  {form.photo ? (
                    <img
                      src={form.photo}
                      alt="Profile"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserRound size={52} />
                  )}
                </div>

                {editing && (
                  <label
                    className="mp-camera-btn"
                    title="Change photo"
                  >
                    <Camera size={18} />

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhoto}
                      hidden
                    />
                  </label>
                )}
              </div>

              <h2>{displayName}</h2>

              <p className="mp-profile-email">
                {form.email || "No email"}
              </p>

              <span className="mp-member-badge">
                <CheckCircle2 size={15} />
                WallGlow Member
              </span>

              <div className="mp-profile-separator" />

              <div className="mp-profile-detail">
                <MapPin size={18} />
                <span>
                  {form.city || "City"},{" "}
                  {stateName}
                </span>
              </div>

              <div className="mp-profile-detail">
                <BriefcaseBusiness size={18} />
                <span>
                  {form.occupation ||
                    "Occupation not added"}
                </span>
              </div>

              <div className="mp-profile-detail">
                <CalendarDays size={18} />
                <span>
                  {form.dob
                    ? new Date(
                        `${form.dob}T00:00:00`
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Date of birth not added"}
                </span>
              </div>

              <div className="mp-profile-tip">
                <LockKeyhole size={19} />
                <p>
                  Your profile information is
                  stored in this browser.
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT FORM */}
          <form
            className="mp-form-area"
            onSubmit={handleSave}
          >

            {/* PERSONAL INFORMATION */}
            <section className="mp-section">
              <div className="mp-section-heading">
                <span className="mp-section-icon">
                  <UserRound size={21} />
                </span>

                <div>
                  <h2>Personal Information</h2>
                  <p>Your basic personal details</p>
                </div>
              </div>

              <div className="mp-fields-grid">
                {inputFields.map(renderInput)}

                {/* GENDER */}
                <div className="mp-field">
                  <label htmlFor="mp-gender">
                    Gender
                  </label>

                  <div className="mp-input-wrap">
                    <UserRound size={18} />

                    <select
                      id="mp-gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      disabled={!editing}
                    >
                      <option value="">
                        Select Gender
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">
                        Non-binary
                      </option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BIO */}
              <div className="mp-field mp-full-width">
                <label htmlFor="mp-bio">
                  About Me
                </label>

                <textarea
                  id="mp-bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  disabled={!editing}
                  rows={4}
                  maxLength={500}
                  placeholder="Tell us a little about yourself..."
                />

                <small className="mp-helper">
                  {form.bio.length}/500 characters
                </small>
              </div>
            </section>

            {/* ADDRESS INFORMATION */}
            <section className="mp-section">
              <div className="mp-section-heading">
                <span className="mp-section-icon">
                  <MapPin size={21} />
                </span>

                <div>
                  <h2>Address Information</h2>
                  <p>
                    Manage your location and address
                  </p>
                </div>
              </div>

              <div className="mp-fields-grid">

                {/* COUNTRY */}
                <div className="mp-field">
                  <label htmlFor="mp-country">
                    Country
                  </label>

                  <div className="mp-input-wrap">
                    <Globe2 size={18} />

                    <select
                      id="mp-country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      disabled={!editing}
                    >
                      <option value="">
                        Select Country
                      </option>

                      {countries.map((country) => (
                        <option
                          key={country.isoCode}
                          value={country.isoCode}
                        >
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {errors.country && (
                    <small className="mp-error">
                      {errors.country}
                    </small>
                  )}
                </div>

                {/* STATE */}
                <div className="mp-field">
                  <label htmlFor="mp-state">
                    State / Province
                  </label>

                  <div className="mp-input-wrap">
                    <MapPin size={18} />

                    <select
                      id="mp-state"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      disabled={
                        !editing || !form.country
                      }
                    >
                      <option value="">
                        Select State
                      </option>

                      {states.map((state) => (
                        <option
                          key={state.isoCode}
                          value={state.isoCode}
                        >
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {errors.state && (
                    <small className="mp-error">
                      {errors.state}
                    </small>
                  )}
                </div>

                {/* CITY */}
                <div className="mp-field">
                  <label htmlFor="mp-city">
                    City
                  </label>

                  <div className="mp-input-wrap">
                    <MapPin size={18} />

                    <select
                      id="mp-city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      disabled={
                        !editing || !form.state
                      }
                    >
                      <option value="">
                        Select City
                      </option>

                      {cities.map((city, index) => (
                        <option
                          key={`${city.name}-${index}`}
                          value={city.name}
                        >
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {errors.city && (
                    <small className="mp-error">
                      {errors.city}
                    </small>
                  )}
                </div>

                {/* PINCODE */}
                <div className="mp-field">
                  <label htmlFor="mp-pincode">
                    PIN Code
                  </label>

                  <div className="mp-input-wrap">
                    <MapPin size={18} />

                    <input
                      id="mp-pincode"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Enter PIN code"
                      maxLength={10}
                      inputMode="numeric"
                    />
                  </div>

                  {errors.pincode && (
                    <small className="mp-error">
                      {errors.pincode}
                    </small>
                  )}
                </div>
              </div>

              {/* FULL ADDRESS */}
              <div className="mp-field mp-full-width">
                <label htmlFor="mp-address">
                  Full Address
                </label>

                <textarea
                  id="mp-address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={!editing}
                  rows={3}
                  placeholder="House number, street, locality, landmark..."
                />
              </div>

              {/* LOCATION PREVIEW */}
              <div className="mp-location-preview">
                <MapPin size={19} />

                <div>
                  <strong>
                    Selected Location
                  </strong>

                  <p>
                    {[
                      form.city,
                      stateName,
                      countryName,
                    ]
                      .filter(
                        (value) =>
                          value &&
                          value !== "Not provided"
                      )
                      .join(", ")}
                  </p>
                </div>
              </div>
            </section>

            {/* BOTTOM ACTIONS */}
            {editing && (
              <div className="mp-bottom-actions">
                <button
                  type="button"
                  className="mp-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="mp-save-btn"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
</>
  );
}
