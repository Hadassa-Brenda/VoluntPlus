import React from "react";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { useNavigate } from "react-router-dom";

import Header from "../../../layouts/Header/Header";
import Footer from "../../../layouts/Footer/Footer";
import Button from "../../../components/Button/Button";

import { steps } from "./types/CadastrarServicoConst";

import { Stepper } from "./components/Stepper/Stepper";

import { FormStepContent } from "./components/FormStepContent/FormStepContent";

import { SuccessContent } from "./steps/SuccessContent";

import { useCadastrarServico } from "./hook/useCadastrarServico";

import "./CadastrarServico.css";
import "../../../styles/global.css";

export default function CadastrarServico() {
  const navigate = useNavigate();

  const {
    currentStep,
    formData,
    errors,
    submitted,
    saving,

    setCurrentStep,

    handleChange,
    nextStep,
    previousStep,

    handleImageChange,
    removeImage,

    handleSubmit,
    resetForm,
  } = useCadastrarServico();

  return (
    <main className="create-service-page">
      <Header />

      <div className="create-service-back-row">
        <Button
          className="create-service-back-button"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft size={18} />}
        >
          Voltar
        </Button>
      </div>

      <section className="create-service-container">
        {submitted ? (
          <SuccessContent
            serviceTitle={formData.name}
            onCreateAnother={resetForm}
          />
        ) : (
          <>
            <header className="create-service-heading">
              <h1>Cadastre um serviço voluntário</h1>

              <p>
                Compartilhe uma iniciativa gratuita e ajude mais pessoas a
                encontrá-la.
              </p>
            </header>

            <Stepper currentStep={currentStep} steps={steps} />

            <form className="create-service-form" onSubmit={handleSubmit}>
              <div className="create-service-card">
                <FormStepContent
                  currentStep={currentStep}
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                  onImageChange={handleImageChange}
                  onRemoveImage={removeImage}
                  onEditStep={setCurrentStep}
                />
              </div>

              <div className="create-service-actions">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    className="secondary-action-button"
                    onClick={previousStep}
                  >
                    <ArrowLeft size={18} />
                    Voltar
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < steps.length ? (
                  <button
                    key="next-step"
                    type="button"
                    className="primary-action-button"
                    onClick={nextStep}
                  >
                    Próximo
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button key="confirm-service" type="submit" className="primary-action-button" disabled={!formData.reviewConfirmed || saving}>
                    <Check size={18} />
                    {saving ? "Salvando..." : "Confirmar e salvar serviço"}
                  </button>
                )}
              </div>

              {errors.submit && (
                <div className="general-form-error">{errors.submit}</div>
              )}
            </form>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}
