import { TIPO_LOCALIZACAO } from "../../../../types/enum/TipoLocalização";
import React from "react";

import { MapPin, Monitor, MessageCircle } from "lucide-react";

import { ModalityOption } from "components/ModalityOption/ModalityOption";

import { FormField } from "../../../../components/FormField/FormField";

import MultiSelect from "../../../../components/MultiSelect/MultiSelect";

import { Turno } from "../../../../types/enum/Turno";

import { DiaSemana } from "../../../../types/enum/DiaSemana";
import { SERVICE_MODALITIES } from "../../../../types/enum/Modalities";

export function AttendanceStep({ formData, errors, onChange }) {
  const isOnline = formData.modalities === "ONLINE";

  return (
    <section className="form-step">
      {/* CABEÇALHO */}

      <div className="form-step-header">
        <span>Etapa 2 de 4</span>

        <h2>Como será o atendimento?</h2>

        <p>Informe a modalidade, localização e horários disponíveis.</p>
      </div>

      {/* MODALIDADE */}

      <div className="form-field form-field--full">
        <span>
          Modalidade <strong>*</strong>
        </span>

        <div className="modality-options">
          <ModalityOption
            name="modalities"
            value={SERVICE_MODALITIES[1].value}
            checked={formData.modalities === SERVICE_MODALITIES[1].value}
            onChange={onChange}
            icon={<Monitor size={23} />}
            title="Online"
            description="O atendimento acontece pela internet."
          />

          <ModalityOption
            name="modalities"
            value={SERVICE_MODALITIES[0].value}
            checked={formData.modalities === SERVICE_MODALITIES[0].value}
            onChange={onChange}
            icon={<MapPin size={23} />}
            title="Presencial"
            description="O atendimento acontece em um local físico."
          />

          <ModalityOption
            name="modalities"
            value={SERVICE_MODALITIES[2].value}
            checked={formData.modalities === SERVICE_MODALITIES[2].value}
            onChange={onChange}
            icon={<MessageCircle size={23} />}
            title="Ambos"
            description="Disponível online e presencialmente."
          />
        </div>

        {errors.modalities && (
          <small className="field-error">{errors.modalities}</small>
        )}
      </div>

      {/* LOCALIZAÇÃO */}

      {!isOnline && (
        <div className="form-fields-grid">
          <label className="form-field">
            <span>Tipo de localização *</span>
            <select name="tipoLocalizacao" value={formData.tipoLocalizacao || ""} onChange={onChange}>
              <option value="">Selecione onde acontece o atendimento</option>
              {TIPO_LOCALIZACAO.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {errors.tipoLocalizacao && <small className="field-error">{errors.tipoLocalizacao}</small>}
          </label>
          {/* CEP */}

          <FormField
            label="CEP"
            name="cep"
            value={formData.cep || ""}
            onChange={onChange}
            placeholder="Ex.: 30130-010"
            error={errors.cep}
            required
            maxLength={9}
          />

          {/* ESTADO */}

          <FormField
            label="Estado"
            name="estado"
            value={formData.estado || ""}
            onChange={() => {}}
            placeholder="Preenchido automaticamente"
            error={errors.estado}
            required
            disabled
          />

          {/* CIDADE */}

          <FormField
            label="Cidade"
            name="cidade"
            value={formData.cidade || ""}
            onChange={() => {}}
            placeholder="Preenchida automaticamente"
            error={errors.cidade}
            required
            disabled
          />

          {/* BAIRRO */}

          <FormField
            label="Bairro"
            name="bairro"
            value={formData.bairro || ""}
            onChange={() => {}}
            placeholder="Preenchido automaticamente"
            error={errors.bairro}
            required
            disabled
          />
        </div>
      )}

      <div className="form-fields-grid schedule-fields-grid">
        <MultiSelect
          label="Dia da semana"
          name="diaSemana"
          value={formData.diaSemana || []}
          onChange={onChange}
          options={DiaSemana}
          width="100%"
        />

        <MultiSelect
          label="Turno"
          name="turno"
          value={formData.turno || []}
          onChange={onChange}
          options={Turno}
          width="100%"
        />
      </div>

      {/* ERRO DIA DA SEMANA */}

      {errors.diaSemana && (
        <small className="field-error">{errors.diaSemana}</small>
      )}

      {/* ERRO TURNO */}

      {errors.turno && <small className="field-error">{errors.turno}</small>}

      {/* AVISO ONLINE */}

      {isOnline && (
        <div className="form-information-box">
          <Monitor size={20} />

          <p>
            Como o serviço é online, cidade, estado, CEP e bairro não são
            obrigatórios.
          </p>
        </div>
      )}
    </section>
  );
}
