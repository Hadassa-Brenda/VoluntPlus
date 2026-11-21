import React from "react";

import { ImagePlus, X, Upload } from "lucide-react";

import { FormField } from "../../../../components/FormField/FormField";

import MultiSelect from "components/MultiSelect/MultiSelect";

import { CATEGORIAS } from "types/enum/Categories";

export function BasicInformationStep({
  formData,
  errors,
  onChange,
  onImageChange,
  onRemoveImage,
}) {
  return (
    <section className="form-step">
      <div className="form-step-header">
        <span>Etapa 1 de 4</span>

        <h2>Informações principais</h2>

        <p>Explique de forma clara qual serviço será oferecido.</p>
      </div>

      <div className="form-fields-grid">
        {/* TÍTULO */}

        <FormField
          label="Título do serviço"
          name="name"
          value={formData.name || ""}
          onChange={onChange}
          placeholder="Ex.: Reforço escolar gratuito"
          error={errors.name}
          required
          fullWidth
        />

        {/* CATEGORIA */}

        <MultiSelect
          label="Categoria"
          name="categorias"
          width="100%"
          value={formData.categorias || []}
          onChange={onChange}
          error={errors.categorias}
          options={CATEGORIAS}
        />

        {/* DESCRIÇÃO */}

        <label className="form-field form-field--full">
          <span>
            Descrição <strong>*</strong>
          </span>

          <textarea
            name="descricao"
            value={formData.descricao || ""}
            onChange={onChange}
            placeholder="Explique o objetivo do serviço, quem pode participar e como funciona o atendimento."
            rows={7}
            className={errors.descricao ? "input-error" : ""}
          />

          <div className="textarea-information">
            <small>Mínimo recomendado: 30 caracteres</small>

            <small>{(formData.descricao || "").length} caracteres</small>
          </div>

          {errors.descricao && (
            <small className="field-error">{errors.descricao}</small>
          )}
        </label>

        {/* IMAGEM */}

        <div className="form-field form-field--full">
          <span>Foto do serviço</span>

          {!formData.imagePreview ? (
            <label className="image-upload-area">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onImageChange}
              />

              <div className="image-upload-icon">
                <ImagePlus size={28} />
              </div>

              <strong>Adicione uma imagem</strong>

              <p>Clique para selecionar ou arraste uma imagem até aqui.</p>

              <small>PNG, JPG ou WEBP, com até 5 MB</small>
            </label>
          ) : (
            <div className="image-preview">
              <img
                src={formData.imagePreview}
                alt="Pré-visualização do serviço"
              />

              <button
                type="button"
                onClick={onRemoveImage}
                aria-label="Remover imagem"
              >
                <X size={19} />
              </button>

              <div className="image-preview-information">
                <Upload size={17} />

                <div>
                  <strong>{formData.image?.name || "Imagem do serviço"}</strong>

                  <span>Imagem selecionada</span>
                </div>
              </div>
            </div>
          )}

          {errors.image && (
            <small className="field-error">{errors.image}</small>
          )}
        </div>
      </div>
    </section>
  );
}
