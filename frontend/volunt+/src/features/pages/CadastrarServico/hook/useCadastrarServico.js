import { useState } from "react";

import { initialFormData, steps } from "../types/CadastrarServicoConst";

import { createService } from "../../../../api/servicesApi";
import { SERVICE_STATUS } from "../../../../types/enum/Status";
import { SERVICE_MODALITIES } from "../../../../types/enum/Modalities";
import { useCurrentUser } from "../../../../context/CurrentUserContext";

export function useCadastrarServico() {
  const { user, loading: currentUserLoading } = useCurrentUser();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    ...initialFormData,
  });

  const [errors, setErrors] = useState({});

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "cep") {
      const cepLimpo = value.replace(/\D/g, "").slice(0, 8);

      const cepFormatado = cepLimpo.replace(/^(\d{5})(\d{0,3})$/, "$1-$2");

      setFormData((current) => ({
        ...current,
        cep: cepFormatado,
      }));

      setErrors((current) => ({
        ...current,
        cep: "",
      }));

      if (cepLimpo.length < 8) {
        setFormData((current) => ({
          ...current,
          cep: cepFormatado,
          estado: "",
          cidade: "",
          bairro: "",
        }));

        return;
      }

      buscarCep(cepLimpo);

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name !== "reviewConfirmed" ? { reviewConfirmed: false } : {}),
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );

      if (!response.ok) {
        throw new Error("Erro na consulta do CEP.");
      }

      const data = await response.json();

      if (data.erro) {
        setErrors((current) => ({
          ...current,
          cep: "CEP não encontrado.",
        }));

        setFormData((current) => ({
          ...current,
          estado: "",
          cidade: "",
          bairro: "",
        }));

        return;
      }

      setFormData((current) => ({
        ...current,

        cep: cepLimpo.replace(/^(\d{5})(\d{3})$/, "$1-$2"),

        estado: data.uf || "",

        cidade: data.localidade || "",

        bairro: data.bairro || "",
      }));

      setErrors((current) => ({
        ...current,
        cep: "",
        estado: "",
        cidade: "",
        bairro: "",
      }));
    } catch (error) {
      console.error("Erro ao consultar CEP:", error);

      setErrors((current) => ({
        ...current,
        cep: "Não foi possível consultar o CEP.",
      }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      const name = formData.name || "";

      const descricao = formData.descricao || "";

      if (!name.trim()) {
        newErrors.name = "Informe o título.";
      }

      if (!formData.categorias?.length) {
        newErrors.categorias = "Selecione uma categoria.";
      }

      if (descricao.trim().length < 30) {
        newErrors.descricao = "Descrição deve possuir no mínimo 30 caracteres.";
      }
    }

    if (currentStep === 2) {
      if (!formData.modalities) {
        newErrors.modalities = "Selecione uma modalidade.";
      }

      const isOnline = formData.modalities === SERVICE_MODALITIES[1].value;

      if (!isOnline) {
        if (!formData.tipoLocalizacao) newErrors.tipoLocalizacao = "Selecione o tipo de localização.";
        const cep = (formData.cep || "").trim();

        const estado = (formData.estado || "").trim();

        const cidade = (formData.cidade || "").trim();

        const bairro = (formData.bairro || "").trim();

        if (!cep) {
          newErrors.cep = "Informe o CEP.";
        }

        if (!estado) {
          newErrors.estado = "Informe o CEP para preencher o estado.";
        }

        if (!cidade) {
          newErrors.cidade = "Informe o CEP para preencher a cidade.";
        }

        if (!bairro) {
          newErrors.bairro = "Informe o CEP para preencher o bairro.";
        }
      }

      if (!formData.diaSemana?.length) {
        newErrors.diaSemana = "Selecione o dia da semana.";
      }

      if (!formData.turno?.length) {
        newErrors.turno = "Selecione o turno.";
      }
    }

    if (currentStep === 3) {
      const whatsapp = (formData.whatsapp || "").trim();

      const instagram = (formData.instagram || "").trim();

      const telefone = (formData.telefone || "").trim();

      const site = (formData.site || "").trim();

      const hasContact = whatsapp || instagram || telefone || site;

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

    if (currentStep === steps.length && !formData.reviewConfirmed) newErrors.reviewConfirmed = "Confirme a revisão antes de salvar.";
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    const isValid = validateStep();

    if (!isValid) {
      return;
    }

    setFormData((current) => ({ ...current, reviewConfirmed: false }));
    setCurrentStep((step) => Math.min(step + 1, steps.length));
  };

  const previousStep = () => {
    setErrors({});

    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const handleImageChange = (event) => {
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
  };

  const removeImage = () => {
    setFormData((current) => ({
      ...current,
      image: "",
      imagePreview: "",
    }));

    setErrors((current) => ({
      ...current,
      image: "",
    }));
  };

  const salvarServico = async () => {
    try {
      if (currentUserLoading) {
        setErrors((current) => ({
          ...current,
          submit: "Aguarde enquanto seu perfil é carregado.",
        }));

        return null;
      }

      const idUsuario = user?.id;

      if (!idUsuario) {
        setErrors((current) => ({
          ...current,
          submit: "Usuário não identificado. Faça login novamente.",
        }));

        console.error("Nenhum usuário encontrado em volunt-user.");

        return null;
      }

      const novoServico = {
        name: formData.name,

        descricao: formData.descricao,

        modalities: formData.modalities,

        idCategoria: Array.isArray(formData.categorias)
          ? formData.categorias[0]
          : formData.categorias,

        status: SERVICE_STATUS[0].value,

        providerImage: formData.imagePreview || "",

        diaDaSemana: formData.diaSemana,

        turno: formData.turno,

        cep: formData.cep || "",

        estado: formData.estado || "",

        cidade: formData.cidade || "",

        bairro: formData.bairro || "",
        tipoLocalizacao: formData.modalities === "ONLINE" ? null : formData.tipoLocalizacao,

        whatsapp: formData.whatsapp || "",

        telefone: formData.telefone || "",

        instagram: formData.instagram || "",

        site: formData.site || "",
      };

      return await createService(novoServico);
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);

      setErrors((current) => ({
        ...current,
        submit: "Não foi possível salvar o serviço.",
      }));

      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (currentStep < steps.length) {
      nextStep();
      return;
    }

    const isValid = validateStep();

    if (!isValid) {
      return;
    }

    if (saving) return;
    setSaving(true);
    const novoServico = await salvarServico();
    setSaving(false);

    if (!novoServico) {
      return;
    }

    setSubmitted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const resetForm = () => {
    setFormData({
      ...initialFormData,
    });

    setErrors({});

    setCurrentStep(1);

    setSubmitted(false);
  };

  return {
    currentStep,

    formData,

    errors,

    submitted,
    saving,

    setSubmitted,

    setFormData,

    setCurrentStep,

    setErrors,

    handleChange,

    buscarCep,

    validateStep,

    nextStep,

    previousStep,

    handleImageChange,

    removeImage,

    handleSubmit,

    resetForm,

    salvarServico,
  };
}
