import { Heart, Search, Users } from "lucide-react";

import { heroImages } from "../../assets/imgs/heroImages";
import { HERO_CONTENT } from "../../constants/content";
import { useCurrentUser } from "../../context/CurrentUserContext";
import "./Hero.css";
import { useNavigate } from "react-router-dom";
import Button from "components/Button/Button";

export default function Hero() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const isBeneficiary = user?.currentRole === "BENEFICIARY";

  return (
    <section className="hero" id="top">
      <div className="hero__text">
        <h1>
          Conectando pessoas que{" "}
          <span style={{ color: "#2563eb" }}>querem</span> <span>ajudar</span>{" "}
          <span style={{ color: "#f97316" }}>com</span> quem{" "}
          <span style={{ color: "#16a34a" }}>precisa</span>
        </h1>

        <p>
          Encontre ou ofereça serviços voluntários na sua comunidade. Juntos,
          podemos transformar vidas!
        </p>

        <div
          className="hero__buttons"
          style={{ gap: "10px", paddingBottom: "20px" }}
        >
          <Button
            onClick={() => navigate("catalogo-servicos")}
            className="hero__button hero__button--primary"
            icon={<Search size={18}></Search>}
            children={HERO_CONTENT.findHelpButton}
          />

          {!isBeneficiary && (
            <button
              className="hero__button hero__button--primary"
              type="button"
              onClick={() => navigate("cadastrar-servico")}
            >
              <Heart size={18} />
              {HERO_CONTENT.offerHelpButton}
            </button>
          )}
        </div>
      </div>

      <div className="hero__art" aria-label="Ilustração da plataforma">
        <div className="hero__blob hero__blob--blue" />
        <div className="hero__blob hero__blob--pink" />

        <div
          className="hero__small-photo hero__small-photo--tutor"
          style={{ backgroundImage: `url(${heroImages.tutor})` }}
        />
        <div
          className="hero__small-photo hero__small-photo--clean"
          style={{ backgroundImage: `url(${heroImages.clean})` }}
        />

        <div className="hero__main-volunteer">
          <img src={heroImages.volunteer} alt="Pessoa voluntária sorrindo" />
          <span>VOLUNTÁRIO</span>
        </div>

        <div
          className="hero__small-photo hero__small-photo--guitar"
          style={{ backgroundImage: `url(${heroImages.guitar})` }}
        />

        <div className="hero__spark hero__spark--one">✦</div>
        <div className="hero__spark hero__spark--two">✧</div>
      </div>
    </section>
  );
}
