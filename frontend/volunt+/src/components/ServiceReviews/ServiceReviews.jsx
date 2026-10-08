import { useMemo, useState } from "react";
import { MessageSquare, Send, Star, UserRound } from "lucide-react";

import "./ServiceReview.css";

export function ServiceReviews({
  reviews = [],
  onSubmitReview,
  canReview = false,
  submitting = false,
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const average = useMemo(() => {
    if (!reviews.length) return 0;

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.nota || 0),
      0,
    );

    return total / reviews.length;
  }, [reviews]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!rating || !comment.trim()) return;

    try {
      await onSubmitReview?.({
        nota: rating,
        comentario: comment.trim(),
      });
      setRating(0);
      setComment("");
    } catch {
      // O formulário mantém o texto e a nota para uma nova tentativa.
    }
  };

  return (
    <section className="service-reviews">
      <header className="service-reviews__header">
        <div>
          <h2>Avaliações do serviço</h2>

          <p>Veja a experiência de outras pessoas ou deixe sua avaliação.</p>
        </div>

        <div className="service-reviews__summary">
          <Star size={21} fill="currentColor" />

          <strong>{reviews.length ? average.toFixed(1) : "Novo"}</strong>

          <span>
            {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
          </span>
        </div>
      </header>

      {canReview ? (
        <form className="review-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Qual é a sua nota?</legend>

            <div className="review-form__stars">
              {[1, 2, 3, 4, 5].map((value) => {
                const selected = value <= (hoveredRating || rating);

                return (
                  <button
                    key={value}
                    type="button"
                    className={selected ? "is-selected" : ""}
                    aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(value)}
                  >
                    <Star size={25} fill={selected ? "currentColor" : "none"} />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label htmlFor="review-comment">Comentário</label>

          <textarea
            id="review-comment"
            value={comment}
            maxLength={500}
            placeholder="Conte como foi sua experiência com este serviço..."
            onChange={(event) => setComment(event.target.value)}
          />

          <div className="review-form__footer">
            <span>{comment.length}/500</span>

            <button
              type="submit"
              disabled={!rating || !comment.trim() || submitting}
            >
              <Send size={17} />

              {submitting ? "Publicando..." : "Publicar avaliação"}
            </button>
          </div>
        </form>
      ) : (
        <p className="review-form__restricted">
          Apenas beneficiários podem avaliar e comentar serviços de outras pessoas. O responsável pelo serviço não pode avaliar o próprio serviço.
        </p>
      )}

      <div className="reviews-list">
        {reviews.length ? (
          reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-card__avatar">
                <UserRound size={20} />
              </div>

              <div className="review-card__content">
                <header>
                  <div>
                    <strong>
                      {review.nomeAutor ??
                        review.usuario?.fullName ??
                        review.nomeUsuario ??
                        "Usuário"}
                    </strong>

                    <div
                      className="review-card__stars"
                      aria-label={`${review.nota} de 5 estrelas`}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={14}
                          fill={
                            value <= Number(review.nota)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {review.dataCriacao && (
                    <time>
                      {new Intl.DateTimeFormat("pt-BR").format(
                        new Date(review.dataCriacao),
                      )}
                    </time>
                  )}
                </header>

                <p>{review.comentario}</p>
              </div>
            </article>
          ))
        ) : (
          <div className="reviews-empty">
            <MessageSquare size={28} />

            <strong>Ainda não há avaliações</strong>

            <p>Seja a primeira pessoa a avaliar este serviço.</p>
          </div>
        )}
      </div>
    </section>
  );
}
