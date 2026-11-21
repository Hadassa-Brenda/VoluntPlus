import {
  ArrowLeft,
  HeartHandshake,
  Info,
  Save,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { SERVICE_CATEGORIES } from "types/enum/Categories";
import { SERVICE_MODALITIES } from "types/enum/Modalities";
import {
  sanitizeServiceForm,
  validateContactRequired,
  validateServiceField,
  validateServiceForm,
} from "./utils/ServiceCreatePageValidator";
import "./ServiceCreatePage.css";
import "react-phone-number-input/style.css";
import WhatsappInput from "../../../components/InputWhatssap/InputWhatssap";
import { useNavigate } from "react-router-dom";
import FieldError from "../../../components/FieldError/FieldError";
import {
  CONTACT_FIELDS,
  PAGE_IMAGES,
  INITIAL_FORM,
} from "./constants/ServiceCreatePageConsts";
import "../../../styles/global.css";

export default function ServiceCreatePage({ onSubmitService }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const navigate = useNavigate();

  function updateField(field, value) {
    const nextValue = value || "";

    const nextForm = {
      ...form,
      [field]: nextValue,
    };

    setForm(nextForm);

    setTouchedFields((currentTouchedFields) => ({
      ...currentTouchedFields,
      [field]: true,
    }));

    const fieldError = validateServiceField(field, nextValue);

    setErrors((currentErrors) => {
      const nextErrors = {
        ...currentErrors,
        [field]: fieldError,
      };

      if (CONTACT_FIELDS.includes(field)) {
        nextErrors.contact = validateContactRequired(nextForm);
      }

      return nextErrors;
    });
  }

  function updateWhatsappCountry(country) {
    const nextForm = {
      ...form,
      whatsappCountry: country,
      whatsapp: "",
    };

    setForm(nextForm);

    setTouchedFields((currentTouchedFields) => ({
      ...currentTouchedFields,
      whatsapp: false,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      whatsapp: "",
      contact: validateContactRequired(nextForm),
    }));
  }

  function handleBlur(field) {
    setTouchedFields((currentTouchedFields) => ({
      ...currentTouchedFields,
      [field]: true,
    }));

    const fieldError = validateServiceField(field, form[field] || "");

    setErrors((currentErrors) => {
      const nextErrors = {
        ...currentErrors,
        [field]: fieldError,
      };

      if (CONTACT_FIELDS.includes(field)) {
        nextErrors.contact = validateContactRequired(form);
      }

      return nextErrors;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateServiceForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      setTouchedFields({
        title: true,
        category: true,
        modality: true,
        city: true,
        neighborhood: true,
        description: true,
        whatsapp: true,
        instagram: true,
        website: true,
      });

      return;
    }

    const now = new Date().toISOString();

    const newService = {
      ...sanitizeServiceForm(form),
      status: "pendente",
      createdAt: now,
      updatedAt: now,
    };

    console.log("Serviço cadastrado:", newService);

    if (onSubmitService) {
      onSubmitService(newService);
    }

    alert("Serviço cadastrado com sucesso!");

    setForm(INITIAL_FORM);
    setErrors({});
    setTouchedFields({});
  }

  function shouldShowError(field) {
    return touchedFields[field] && errors[field];
  }

  return (
    <main className="service-create-page">
      <div className="service-create-page__shape service-create-page__shape--purple" />
      <div className="service-create-page__shape service-create-page__shape--pink" />
      <div className="service-create-page__shape service-create-page__shape--blue" />

      <header className="service-create-page__topbar">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        <a className="header__brand" href="#top" aria-label="Volunt+ início">
          <span className="header__brand-icon">♡</span>
          <strong>Volunt+</strong>
        </a>
      </header>

      <section className="service-create-page__heading">
        <h1>Cadastrar serviço voluntário</h1>

        <p>
          Cadastre um serviço gratuito ou voluntário para ajudar e transformar a
          vida de pessoas na sua comunidade.
        </p>

        <div className="service-create-page__heading-line" />
      </section>

      <section className="service-create-page__stage">
        <div className="service-create-page__left-visual">
          <div className="service-create-page__photo service-create-page__photo--large">
            <img src={PAGE_IMAGES.volunteer} alt="Ação voluntária" />
          </div>

          <div className="service-create-page__impact-card">
            <div>
              <UsersRound size={22} />
            </div>

            <p>
              <strong>Sua ação</strong>
              gera impacto real onde mais importa.
            </p>
          </div>

          <div className="service-create-page__photo service-create-page__photo--small">
            <img src={PAGE_IMAGES.tutor} alt="Aula voluntária" />
          </div>
        </div>

        <form
          className="service-create-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <section className="service-create-form__section">
            <div className="service-create-form__grid">
              <label className="service-create-form__full-field">
                Nome do serviço <strong>*</strong>
                <input
                  style={{ color: "#676767" }}
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  onBlur={() => handleBlur("title")}
                  placeholder="Ex: Reforço escolar voluntário"
                  aria-invalid={Boolean(shouldShowError("title"))}
                  aria-describedby="title-error"
                />
                <FieldError
                  id="title-error"
                  message={shouldShowError("title")}
                />
              </label>

              <label>
                Categoria <strong>*</strong>
                <select
                  style={{ color: "#676767" }}
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  onBlur={() => handleBlur("category")}
                  aria-invalid={Boolean(shouldShowError("category"))}
                  aria-describedby="category-error"
                >
                  <option value="" disabled>
                    Selecione uma categoria
                  </option>

                  {SERVICE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="category-error"
                  message={shouldShowError("category")}
                />
              </label>

              <label>
                Tipo de atendimento <strong>*</strong>
                <select
                  style={{ color: "#676767" }}
                  value={form.modality}
                  onChange={(event) =>
                    updateField("modality", event.target.value)
                  }
                  onBlur={() => handleBlur("modality")}
                  aria-invalid={Boolean(shouldShowError("modality"))}
                  aria-describedby="modality-error"
                >
                  <option value="" disabled>
                    Selecione o tipo de atendimento
                  </option>

                  {SERVICE_MODALITIES.map((modality) => (
                    <option key={modality} value={modality}>
                      {modality}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="modality-error"
                  message={shouldShowError("modality")}
                />
              </label>

              <label>
                Cidade <strong>*</strong>
                <input
                  style={{ color: "#676767" }}
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  onBlur={() => handleBlur("city")}
                  placeholder="Ex: Belo Horizonte, MG"
                  aria-invalid={Boolean(shouldShowError("city"))}
                  aria-describedby="city-error"
                />
                <FieldError id="city-error" message={shouldShowError("city")} />
              </label>

              <label>
                Bairro <strong>*</strong>
                <input
                  style={{ color: "#676767" }}
                  value={form.neighborhood}
                  onChange={(event) =>
                    updateField("neighborhood", event.target.value)
                  }
                  onBlur={() => handleBlur("neighborhood")}
                  placeholder="Ex: São Gabriel"
                  aria-invalid={Boolean(shouldShowError("neighborhood"))}
                  aria-describedby="neighborhood-error"
                />
                <FieldError
                  id="neighborhood-error"
                  message={shouldShowError("neighborhood")}
                />
              </label>

              <label className="service-create-form__full-field">
                Descrição <strong>*</strong>
                <div className="service-create-form__textarea-wrapper">
                  <textarea
                    style={{ color: "#676767" }}
                    value={form.description}
                    maxLength={1000}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    onBlur={() => handleBlur("description")}
                    placeholder="Descreva seu serviço, como funciona, para quem é destinado e quais são os benefícios."
                    rows="5"
                    aria-invalid={Boolean(shouldShowError("description"))}
                    aria-describedby="description-error"
                  />

                  <span>{form.description.length}/1000</span>
                </div>
                <FieldError
                  id="description-error"
                  message={shouldShowError("description")}
                />
              </label>
            </div>
          </section>

          <section className="service-create-form__section">
            <div className="service-create-form__contact-header">
              <p>
                <Info size={16} />
                Informe pelo menos um meio de contato para que as pessoas possam
                falar com você. <strong>*</strong>
              </p>
            </div>

            <FieldError id="contact-error" message={errors.contact} />

            <div className="service-create-form__grid service-create-form__grid--contacts">
              <label>
                WhatsApp
                <WhatsappInput
                  style={{ color: "#676767" }}
                  country={form.whatsappCountry}
                  phone={form.whatsapp}
                  error={shouldShowError("whatsapp")}
                  onCountryChange={updateWhatsappCountry}
                  onPhoneChange={(phone) => updateField("whatsapp", phone)}
                  onBlur={() => handleBlur("whatsapp")}
                />
                <FieldError
                  id="whatsapp-error"
                  message={shouldShowError("whatsapp")}
                />
              </label>

              <label>
                Instagram
                <input
                  style={{ color: "#676767" }}
                  value={form.instagram}
                  onChange={(event) =>
                    updateField("instagram", event.target.value)
                  }
                  onBlur={() => handleBlur("instagram")}
                  placeholder="Ex: @projeto.social"
                  aria-invalid={Boolean(shouldShowError("instagram"))}
                  aria-describedby="instagram-error"
                />
                <FieldError
                  id="instagram-error"
                  message={shouldShowError("instagram")}
                />
              </label>

              <label>
                Site ou outro link
                <input
                  value={form.website}
                  onChange={(event) =>
                    updateField("website", event.target.value)
                  }
                  onBlur={() => handleBlur("website")}
                  placeholder="Ex: www.exemplo.org.br"
                  aria-invalid={Boolean(shouldShowError("website"))}
                  aria-describedby="website-error"
                />
                <FieldError
                  id="website-error"
                  message={shouldShowError("website")}
                />
              </label>
            </div>
          </section>

          <div className="service-create-form__actions">
            <button
              className="service-create-form__cancel"
              type="button"
              onClick={() => navigate("/")}
            >
              Cancelar
            </button>

            <button className="service-create-form__save" type="submit">
              <Save size={18} />
              Salvar serviço
            </button>
          </div>

          <div className="service-create-form__safe-message">
            <ShieldCheck size={17} />
            Suas informações estão seguras conosco.
          </div>
        </form>

        <div className="service-create-page__right-visual">
          <div className="service-create-page__floating-icon">
            <HeartHandshake size={30} />
          </div>

          <div className="service-create-page__photo service-create-page__photo--medium">
            <img src={PAGE_IMAGES.clean} alt="Voluntários em ação" />
          </div>

          <div className="service-create-page__donate-card">
            <div>
              <Sparkles size={22} />
            </div>

            <p>
              <strong>Doe seu tempo.</strong>
              Multiplique esperança e transforme histórias.
            </p>
          </div>

          <div className="service-create-page__photo service-create-page__photo--bottom">
            <img src={PAGE_IMAGES.community} alt="Apoio comunitário" />
          </div>
        </div>
      </section>
    </main>
  );
}
