import { serviceValues } from "../../../../../utils/serviceValues";
import { TIPO_LOCALIZACAO } from "../../../../../types/enum/TipoLocalização";
import { ImagePlus, MapPin, Monitor, CalendarDays, Clock3 } from "lucide-react";

import { ReviewItem } from "../../../../../components/ReviewItem/ReviewItem";

import { ReviewSection } from "../../steps/ReviewSection";

import { DiaSemana } from "../../../../../types/enum/DiaSemana";

import { Turno } from "../../../../../types/enum/Turno";
import { SERVICE_MODALITIES } from "../../../../../types/enum/Modalities";
import "./ReviewStep.css";

export function ReviewStep({ formData, onEditStep, onChange, errors = {}, texts }) {
  const getOptionLabel = (options, value) => {
    return serviceValues(value).map((item) => options.find((option) => String(option.value) === String(item))?.label || item).join(", ") || "Não informado";
  };

  const modalidade =
    SERVICE_MODALITIES.find((item) => item.value === formData.modalities)
      ?.label || "Não informado";

  const isOnline = formData.modalities === SERVICE_MODALITIES[1].value;

  const categoria = formData.categorias || "Não informado";

  const diaSemana = getOptionLabel(DiaSemana, formData.diaSemana);

  const turno = getOptionLabel(Turno, formData.turno);

  const endereco = [formData.bairro, formData.cidade, formData.estado]
    .filter(Boolean)
    .join(", ");

  const imageUrl = formData.imagePreview || "";

  return (
    <section className="form-step review-step">
      <div className="form-step-header">
        <span>{texts.step}</span>

        <h2>{texts.title}</h2>

        <p>{texts.description}</p>
      </div>

      <div className="review-layout">
        <article className="review-service-card">
          <div className="review-service-image">
            {imageUrl ? (
              <img src={imageUrl} alt={formData.name || "Imagem do serviço"} />
            ) : (
              <div className="review-image-placeholder">
                <ImagePlus size={34} />

                <span>Sem imagem</span>
              </div>
            )}

            <span className="review-category">{categoria}</span>
          </div>

          <div className="review-service-content">
            <h3>{formData.name || "Nome do serviço"}</h3>

            <p>{formData.descricao || "Nenhuma descrição informada."}</p>

            <div className="review-service-information">
              <span>
                <Monitor size={16} />

                {modalidade}
              </span>

              {!isOnline && endereco && (
                <span>
                  <MapPin size={16} />

                  {endereco}
                </span>
              )}

              {formData.diaSemana && (
                <span>
                  <CalendarDays size={16} />

                  {diaSemana}
                </span>
              )}

              {formData.turno && (
                <span>
                  <Clock3 size={16} />

                  {turno}
                </span>
              )}
            </div>
          </div>
        </article>

        <div className="review-sections">
          <ReviewSection
            title="Informações principais"
            onEdit={() => onEditStep(1)}
          >
            <ReviewItem
              label="Título"
              value={formData.name || "Não informado"}
            />

            <ReviewItem
              label="Categoria"
              value={categoria || "Não informado"}
            />

            <ReviewItem
              label="Descrição"
              value={formData.descricao || "Não informado"}
            />
          </ReviewSection>

          <ReviewSection title="Atendimento" onEdit={() => onEditStep(2)}>
            <ReviewItem label="Modalidade" value={modalidade} />

            {!isOnline && (
              <>
                <ReviewItem
                  label="Tipo de localização"
                  value={getOptionLabel(TIPO_LOCALIZACAO, formData.tipoLocalizacao)}
                />
                <ReviewItem
                  label="CEP"
                  value={formData.cep || "Não informado"}
                />

                <ReviewItem
                  label="Estado"
                  value={formData.estado || "Não informado"}
                />

                <ReviewItem
                  label="Cidade"
                  value={formData.cidade || "Não informado"}
                />

                <ReviewItem
                  label="Bairro"
                  value={formData.bairro || "Não informado"}
                />
              </>
            )}

            <ReviewItem label="Dia da semana" value={diaSemana} />

            <ReviewItem label="Turno" value={turno} />
          </ReviewSection>

          <ReviewSection title="Contato" onEdit={() => onEditStep(3)}>
            <ReviewItem
              label="WhatsApp"
              value={formData.whatsapp || "Não informado"}
            />

            <ReviewItem
              label="Telefone"
              value={formData.telefone || "Não informado"}
            />

            <ReviewItem
              label="Instagram"
              value={formData.instagram || "Não informado"}
            />

            <ReviewItem label="Site" value={formData.site || "Não informado"} />
          </ReviewSection>
        </div>
      </div>
      <label className="review-confirmation">
        <input type="checkbox" name="reviewConfirmed" checked={Boolean(formData.reviewConfirmed)} onChange={onChange} />
        Conferi os dados e quero salvar este serviço.
      </label>
      {errors.reviewConfirmed && <p className="field-error" role="alert">{errors.reviewConfirmed}</p>}
    </section>
  );
}
