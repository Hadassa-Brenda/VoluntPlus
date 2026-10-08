import { serviceValues } from "../../../../utils/serviceValues";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import Header from "../../../../layouts/Header/Header";
import Footer from "../../../../layouts/Footer/Footer";
import Button from "../../../../components/Button/Button";

import { getServiceById } from "../../../../service/serviceService";
import { updateService } from "../../../../api/servicesApi";
import { useCurrentUser } from "../../../../context/CurrentUserContext";

import {
  initialFormData,
  steps,
} from "../../CadastrarServico/types/CadastrarServicoConst";

import { Stepper } from "features/pages/CadastrarServico/components/Stepper/Stepper";

import { FormStepContent } from "features/pages/CadastrarServico/components/FormStepContent/FormStepContent";
import { SERVICE_MODALITIES } from "../../../../types/enum/Modalities";

import "./EditServicePage.css";
import "../../../../styles/global.css";

export default function EditServicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useCurrentUser();

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadService();
  }, [id]);

  async function loadService() {
    try {
      const service = await getServiceById(id);

      if (!service || String(service.ownerId) !== String(user?.id)) {
        alert("Serviço não encontrado ou sem permissão para editar.");

        navigate("/meus-servicos");

        return;
      }

      setFormData({
        ...initialFormData,

        name: service.name || "",

        descricao: service.descricao || "",

        categorias: [service.categoria?.id ?? service.idCategoria].filter(
          Boolean,
        ),

        modalities: service.modalities ?? "",

        cep: service.localizacao?.cep || service.cep || "",

        estado: service.localizacao?.estado || service.estado || "",

        cidade: service.localizacao?.cidade || service.cidade || "",

        bairro: service.localizacao?.bairro || service.bairro || "",

        tipoLocalizacao: service.tipoLocalizacao || service.localizacao?.tipoLocalizacao || "",
        diaSemana: [...new Set(service.agendamentos?.map((item) => item.diaSemana) || serviceValues(service.diaDaSemana))],
        turno: [...new Set(service.agendamentos?.map((item) => item.turno) || serviceValues(service.turno))],

        whatsapp: service.contato?.telefone || service.whatsapp || "",

        instagram: service.contato?.instagram || "",

        telefone: service.telefone || "",

        site: service.contato?.site || service.site || "",

        image: null,

        imagePreview: service.providerImage || "",

        freeService: true,

        acceptTerms: true,
      });
    } catch (error) {
      console.error("Erro ao carregar serviço:", error);

      alert("Não foi possível carregar o serviço.");

      navigate("/meus-servicos");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,

      [name]: type === "checkbox" ? checked : value,
      ...(name !== "reviewConfirmed" ? { reviewConfirmed: false } : {}),
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function validateCurrentStep() {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.name?.trim()) {
        newErrors.name = "Informe o título.";
      }

      if (!formData.categorias?.length) {
        newErrors.categorias = "Selecione uma categoria.";
      }

      if (
        !formData.descricao?.trim() ||
        formData.descricao.trim().length < 30
      ) {
        newErrors.descricao = "Descrição deve possuir no mínimo 30 caracteres.";
      }
    }

    if (currentStep === 2) {
      if (!formData.modalities) {
        newErrors.modalities = "Selecione uma modalidade.";
      }

      if (
        formData.modalities !== SERVICE_MODALITIES[1].value &&
        !formData.cidade?.trim()
      ) {
        newErrors.cidade = "Informe a cidade.";
      }
    }

    if (currentStep === 2 && formData.modalities !== "ONLINE" && !formData.tipoLocalizacao) newErrors.tipoLocalizacao = "Selecione o tipo de localização.";
    if (currentStep === 3) {
      const hasContact =
        formData.whatsapp ||
        formData.instagram ||
        formData.telefone ||
        formData.site;

      if (!hasContact) {
        newErrors.contact = "Informe pelo menos um contato.";
      }

      ["whatsapp", "telefone"].forEach((field) => {
        const digits = String(formData[field] || "").replace(/\D/g, "");

        if (digits && (digits.length < 10 || digits.length > 11)) {
          newErrors[field] = "Informe um telefone válido com DDD.";
        }
      });
    }

    if (currentStep === 4 && !formData.reviewConfirmed) newErrors.reviewConfirmed = "Confirme a revisão antes de salvar.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (!validateCurrentStep()) {
      return;
    }

    setFormData((current) => ({ ...current, reviewConfirmed: false }));
    setCurrentStep((current) => Math.min(current + 1, steps.length));
  }

  function previousStep() {
    setErrors({});

    setCurrentStep((current) => Math.max(current - 1, 1));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        image: "Selecione um arquivo de imagem válido.",
      }));

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        image: "A imagem deve ter no máximo 5 MB.",
      }));

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        image: file,
        imagePreview: reader.result,
      }));

      setErrors((current) => ({
        ...current,
        image: "",
      }));
    };

    reader.readAsDataURL(file);
  }

  function removeImage() {
    setFormData((current) => ({
      ...current,

      image: null,

      imagePreview: "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (currentStep < steps.length) {
      nextStep();
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    if (saving) return;
    setSaving(true);
    try {
      await updateService(id, {
          name: formData.name,

          descricao: formData.descricao,

          idCategoria: Array.isArray(formData.categorias)
            ? formData.categorias[0]
            : formData.categorias,

          modalities: formData.modalities,

          providerImage: formData.imagePreview,

          cep: formData.cep,

          estado: formData.estado,

          cidade: formData.cidade,

          bairro: formData.bairro,
          tipoLocalizacao: formData.modalities === "ONLINE" ? null : formData.tipoLocalizacao,

          diaDaSemana: formData.diaSemana,

          turno: formData.turno,

          whatsapp: formData.whatsapp,

          instagram: formData.instagram,

          telefone: formData.telefone,

          site: formData.site,

      });

      alert("Serviço atualizado com sucesso!");

      navigate("/meus-servicos");
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);

      alert("Não foi possível salvar as alterações.");
    } finally { setSaving(false); }
  }

  if (loading) {
    return (
      <main className="edit-service-page">
        <Header />

        <section className="edit-service-loading">
          <p>Carregando serviço...</p>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="edit-service-page">
      <Header />

      <div className="edit-service-back">
        <Button
          className="back-button"
          onClick={() => navigate("/meus-servicos")}
          icon={<ArrowLeft size={18} />}
        >
          Voltar
        </Button>
      </div>

      <section className="edit-service-container">
        <header className="edit-service-heading">
          <span>Edição de serviço</span>

          <h1>Edite seu serviço voluntário</h1>

          <p>
            Atualize as informações para manter seu serviço sempre correto e
            atualizado.
          </p>
        </header>

        <Stepper currentStep={currentStep} steps={steps} />

        <form className="edit-service-form" onSubmit={handleSubmit}>
          <div className="edit-service-card">
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

          <div className="edit-service-actions">
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
                {saving ? "Salvando..." : "Confirmar e salvar alterações"}
              </button>
            )}
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}
