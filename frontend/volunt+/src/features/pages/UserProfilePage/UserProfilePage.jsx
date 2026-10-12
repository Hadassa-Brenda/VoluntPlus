import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRightLeft,
  Building2,
  CalendarDays,
  Check,
  Edit3,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Plus,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useClerk, useUser as useClerkUser } from "@clerk/react";

import { useCurrentUser } from "../../../context/CurrentUserContext";
import { mapBackendUserToFrontend, persistBackendUser } from "../../../api/userProfileStorage";
import { fetchPublicUserProfile, updateCurrentUserProfile } from "../../../api/usersApi";

import Footer from "../../../layouts/Footer/Footer";
import Header from "../../../layouts/Header/Header";

import { getServices } from "../../../service/serviceService";

import { GENDER_OPTIONS } from "../../../types/enum/Gender";
import { TipoUsuario } from "../../../types/enum/TipoUsuario";
import { PROFILE_TYPES } from "../../../types/enum/ProfileTypes";
import { DiaSemana } from "../../../types/enum/DiaSemana";
import { Turno } from "../../../types/enum/Turno";
import "../../../styles/global.css";
import SingleSelect from "components/SingleSelect.tsx/SingleSelect";
import GenericTextField from "components/TextField/TextField";
import DataPicker from "components/DataPicker/DataPicker";

import "./UserProfilePage.css";
import "./UserProfileEdit.css";

function getOptionLabel(options, value) {
  const normalizedValue = Array.isArray(value) ? value[0] : value;

  if (!normalizedValue) {
    return "";
  }

  const option = options.find(
    (item) =>
      String(item.value).toLowerCase() ===
        String(normalizedValue).toLowerCase() ||
      String(item.label).toLowerCase() ===
        String(normalizedValue).toLowerCase(),
  );

  return option?.label || String(normalizedValue);
}

function createProfileForm(profile, clerkName = "") {
  const isPessoaJuridica = profile?.tipoUsuario === "PJ";
  return {
    accountName: isPessoaJuridica ? profile?.organizationName || "" : profile?.fullName || clerkName || "",
    perfilUsuario: profile?.perfilUsuario ?? PROFILE_TYPES[0]?.value ?? "",
    genero: profile?.genero || "",
    dataNascimento: profile?.dataNascimento
      ? profile.dataNascimento.split("T")[0]
      : "",
    organizationName: profile?.organizationName || "",
    cnpj: isPessoaJuridica ? profile?.cnpj || "" : "",
  };
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { isLoaded: isClerkUserLoaded, user: clerkUser } = useClerkUser();
  const {
    user: currentUser,
    changeRole,
    refreshUser,
    loading: isCurrentUserLoading,
    error: currentUserError,
  } = useCurrentUser();
  const clerkUserId = clerkUser?.id || "";
  const clerkEmail =
    clerkUser?.primaryEmailAddress?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    "";
  const clerkName = clerkUser?.fullName ||
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ");

  const { id } = useParams();

  const profileId = id || null;

  const isOwnProfile =
    !profileId || String(currentUser?.id) === String(profileId);

  const [publicUser, setPublicUser] = useState(null);
  const [publicLoading, setPublicLoading] = useState(Boolean(profileId));
  useEffect(() => {
    if (!profileId || isOwnProfile) { setPublicLoading(false); return; }
    let cancelled = false;
    setPublicLoading(true);
    setPublicUser(null);
    fetchPublicUserProfile(profileId)
      .then((profile) => { if (!cancelled) setPublicUser(profile.currentRole === "OFFERER" ? mapBackendUserToFrontend(profile) : null); })
      .catch(() => { if (!cancelled) setPublicUser(null); })
      .finally(() => { if (!cancelled) setPublicLoading(false); });
    return () => { cancelled = true; };
  }, [profileId, isOwnProfile]);
  const profileUser = useMemo(() => {
    if (isOwnProfile) {
      return currentUser;
    }

    return publicUser;
  }, [currentUser, isOwnProfile, publicUser]);

  const [user, setUser] = useState(profileUser);

  const [editing, setEditing] = useState(false);

  const [changingProfile, setChangingProfile] = useState(false);

  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isSwitchingProfile, setIsSwitchingProfile] = useState(false);

  const [form, setForm] = useState({
    fullName: profileUser?.fullName || "",
    email: profileUser?.email || "",
    perfilUsuario: profileUser?.perfilUsuario ?? PROFILE_TYPES[0]?.value ?? "",
    dataNascimento: profileUser?.dataNascimento
      ? profileUser.dataNascimento.split("T")[0]
      : "",
  });

  useEffect(() => {
    setUser(profileUser);
  }, [profileUser]);

  useEffect(() => {
    if (!profileUser) {
      return;
    }

    setForm(createProfileForm(profileUser, clerkName));
  }, [clerkName, profileUser]);

  const isPessoaJuridica = user?.tipoUsuario === "PJ";
  const isOfertante = isPessoaJuridica || user?.perfilUsuario === "PF";

  const profileOptions = PROFILE_TYPES.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const [allServices, setAllServices] = useState([]);
  useEffect(() => {
    getServices().then(setAllServices).catch(() => setAllServices([]));
  }, []);

  const publishedServices = useMemo(() => {
    if (!user?.id || !isOfertante) {
      return [];
    }

    return allServices.filter(
      (service) => String(service.idUsuario) === String(user.id),
    );
  }, [allServices, user?.id, isOfertante]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setProfileError("");
  }

  async function handleLogout() {
    await signOut({ redirectUrl: "/" });
  }

  async function switchProfile() {
    if (!user || isPessoaJuridica) {
      return;
    }

    try {
      setIsSwitchingProfile(true);
      setProfileError("");

      const role = user.perfilUsuario === "PF" ? "BENEFICIARY" : "OFFERER";
      const updatedUser = await changeRole(role);

      setUser(updatedUser);
      setChangingProfile(false);
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      setProfileError(
        error?.response?.data?.detail ||
          "Não foi possível trocar o perfil. Tente novamente.",
      );
    } finally {
      setIsSwitchingProfile(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (!user || isSavingProfile) {
      return;
    }

    const genderByFormValue = { M: "MALE", F: "FEMALE", O: "OTHER" };
    const roleByProfile = { PF: "OFFERER", BF: "BENEFICIARY" };
    const profilePayload = {
      ...(isPessoaJuridica
        ? {
            organizationName: form.organizationName.trim(),
            cnpj: form.cnpj.replace(/\D/g, "") || null,
          }
        : {
            fullName: form.accountName.trim(),
            birthDate: form.dataNascimento || null,
            ...(form.genero
              ? { gender: genderByFormValue[form.genero] }
              : {}),
          }),
    };

    try {
      setIsSavingProfile(true);
      setProfileError("");

      if (
        !isPessoaJuridica &&
        roleByProfile[form.perfilUsuario] &&
        form.perfilUsuario !== user.perfilUsuario
      ) {
        await changeRole(roleByProfile[form.perfilUsuario]);
      }

      const response = await updateCurrentUserProfile(profilePayload);
      let updatedUser = persistBackendUser(
        { ...profilePayload, ...(response || {}) },
        user,
      );

      if (!isPessoaJuridica && clerkUser?.update && form.accountName.trim() !== clerkName) {
        const [firstName, ...lastNameParts] = form.accountName
          .trim()
          .split(/\s+/);
        await clerkUser.update({
          firstName,
          lastName: lastNameParts.join(" "),
        });
      }

      setUser(updatedUser);
      setEditing(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);

      refreshUser()
        .then((refreshedUser) => {
          if (refreshedUser) {
            updatedUser = refreshedUser;
            setUser(refreshedUser);
          }
        })
        .catch(() => undefined);
    } catch (error) {
      setProfileError(
        error?.response?.data?.detail ||
          error?.message ||
          "Não foi possível salvar o perfil. Tente novamente.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  if (!user) {
    return (
      <main className="profile-page">
        <Header />

        <section className="profile-login-required">
          {(!isOwnProfile && publicLoading) || (isOwnProfile && (isCurrentUserLoading || !isClerkUserLoaded)) ? (
            <p>Carregando perfil...</p>
          ) : isOwnProfile && clerkUser ? (
            <>
              <UserRound size={42} />
              <h1>{clerkName || "Seu perfil"}</h1>
              <p>{clerkEmail}</p>
              <p className="profile-load-error" role="alert">
                {currentUserError?.response?.status === 401
                  ? "Sua sessão está ativa, mas o servidor recusou o acesso aos dados do perfil."
                  : "Não foi possível carregar os dados do perfil no servidor."}
              </p>
              <button
                className="profile-primary-button"
                type="button"
                onClick={() => refreshUser().catch(() => undefined)}
                disabled={isCurrentUserLoading}
              >
                {isCurrentUserLoading ? "Carregando..." : "Tentar novamente"}
              </button>
              {currentUserError?.response?.status === 404 && (
                <Link className="profile-primary-button" to="/completar-perfil">Completar perfil</Link>
              )}
            </>
          ) : (
            <>
              <UserRound size={42} />

              <h1>Usuário não encontrado</h1>

              <p>Não foi possível encontrar este perfil.</p>

              <Link className="profile-primary-button" to="/">
                Voltar para o início
              </Link>
            </>
          )}
        </section>

        <Footer />
      </main>
    );
  }

  const tipoUsuarioLabel =
    TipoUsuario.find((item) => item.value === user.tipoUsuario)?.label ??
    "Não informado";

  const perfilUsuarioLabel =
    PROFILE_TYPES.find((item) => item.value === user.perfilUsuario)?.label ??
    "Não informado";

  const generoLabel =
    GENDER_OPTIONS.find((item) => item.value === user.genero)?.label ??
    "Não informado";

  const name =
    (isPessoaJuridica ? user.organizationName : user.fullName) ||
    "Usuário Voluntá+";

  const avatarUrl = isPessoaJuridica
    ? null
    : isOwnProfile
      ? clerkUser?.imageUrl
      : user.avatarUrl;

  const formattedBirthDate = user.dataNascimento
    ? user.dataNascimento.split("T")[0].split("-").reverse().join("/")
    : "Não informado";

  return (
    <main className="profile-page">
      <Header/>

      <div className="profile-container">
        <button
            className="user-register-page__back-button"
            type="button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        <section className="profile-cover">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={isPessoaJuridica ? `Logo de ${name}` : `Foto de ${name}`} />
            ) : (
              name.slice(0, 2).toUpperCase()
            )}
          </div>

          <div className="profile-identity">
            <span>{perfilUsuarioLabel}</span>

            <h1>{name}</h1>

            <p>{tipoUsuarioLabel}</p>

            <div className="profile-contact">
              {user.email && (
                <span>
                  <Mail size={16} />

                  {user.email}
                </span>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <div className="profile-actions">
              <button
                className="profile-outline-button"
                type="button"
                onClick={() => setEditing(true)}
              >
                <Edit3 size={17} />
                Editar perfil
              </button>

              {!isPessoaJuridica && (
                <button
                  className="profile-switch-button"
                  type="button"
                  onClick={() => {
                    setProfileError("");
                    setChangingProfile(true);
                  }}
                >
                  <ArrowRightLeft size={17} />
                  Trocar perfil
                </button>
              )}

              <button
                className="profile-logout-button"
                type="button"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Sair
              </button>
            </div>
          )}
        </section>
        {isOfertante && (
          <section className="profile-stats">
            <div>
              <strong>{publishedServices.length}</strong>

              <span>Serviços publicados</span>
            </div>

            <div>
              <strong>{tipoUsuarioLabel}</strong>

              <span>Tipo de usuário</span>
            </div>
          </section>
        )}

        <div
          className={
            isOfertante
              ? "profile-content-grid"
              : "profile-content-grid profile-content-grid-single"
          }
        >
          {isOfertante && (
            <section className="profile-panel">
              <div className="profile-panel-title">
                <div>
                  <h2>
                    {isOwnProfile ? "Meus serviços" : "Serviços publicados"}
                  </h2>

                  <p>Serviços cadastrados por este usuário.</p>
                </div>

                {isOwnProfile && (
                  <Link to="/cadastrar-servico">
                    <Plus size={17} />
                    Novo serviço
                  </Link>
                )}
              </div>

              <div className="profile-services">
                {publishedServices.length > 0 ? (
                  publishedServices.map((service) => {
                    const location = service.localizacao
                      ? [
                          service.localizacao.bairro,

                          service.localizacao.cidade,

                          service.localizacao.estado,
                        ]
                          .filter(Boolean)
                          .join(" • ")
                      : "Localização não informada";

                    const schedule = service.agendamentos?.[0];
                    const scheduleLabel = schedule
                      ? [
                          getOptionLabel(DiaSemana, schedule.diaSemana),
                          getOptionLabel(Turno, schedule.turno),
                        ]
                          .filter(Boolean)
                          .join(" • ")
                      : "Horário não informado";

                    return (
                      <article key={service.id}>
                        <div className="profile-service-image">
                          <img
                            src={
                              service.providerImage ||
                              `https://picsum.photos/400/300?random=${service.id}`
                            }
                            alt={service.name}
                          />
                        </div>

                        <div>
                          <span>
                            {service.categoria?.nome ?? "Sem categoria"}
                          </span>

                          <h3>{service.name}</h3>

                          <p>
                            <MapPin size={15} />

                            {location}
                          </p>

                          <p>
                            <CalendarDays size={15} />

                            {scheduleLabel}
                          </p>
                        </div>

                        <Link to={`/detalhes-servico/${service.id}`}>Ver</Link>
                      </article>
                    );
                  })
                ) : (
                  <p className="profile-empty">
                    Nenhum serviço publicado até o momento.
                  </p>
                )}
              </div>
            </section>
          )}

          <aside className="profile-side">
            {isOwnProfile && clerkUser && (
              <section className="profile-account-section">
                <ShieldCheck />
                <h3>Conta e autenticação</h3>
                <p>
                  <strong>Nome da conta:</strong> {name}
                </p>
                <p>
                  <strong>E-mail:</strong> {clerkEmail || "Não informado"}
                </p>
                <small>Gerenciada com segurança pelo Clerk.</small>
              </section>
            )}

            <section>
              {isPessoaJuridica ? <Building2 /> : <Heart />}
              <h3>
                Perfil Voluntá+ · {isPessoaJuridica ? "Organização" : "Pessoa Física"}
              </h3>

              {isPessoaJuridica ? (
                <>
                  {user.cnpj && <p><strong>CNPJ:</strong> {user.cnpj}</p>}
                </>
              ) : (
                <>
                  <p><strong>Tipo:</strong> {tipoUsuarioLabel}</p>
                  <p><strong>Perfil:</strong> {perfilUsuarioLabel}</p>
                  {user.genero && <p><strong>Gênero:</strong> {generoLabel}</p>}
                  {user.dataNascimento && <p><strong>Data de nascimento:</strong> {formattedBirthDate}</p>}
                </>
              )}
            </section>
          </aside>
        </div>

        {saved && (
          <div className="profile-toast">
            <Check size={18} />
            Perfil atualizado com sucesso
          </div>
        )}
      </div>

      <Footer />

      {editing && isOwnProfile && (
        <div
          className="profile-edit-overlay"
          onMouseDown={() => setEditing(false)}
        >
          <section
            className="profile-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>MINHA CONTA</span>

                <h2 id="edit-profile-title">Editar perfil</h2>

                <p>Mantenha suas informações atualizadas.</p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Fechar"
              >
                <X />
              </button>
            </header>

            <form onSubmit={saveProfile}>
              <section className="profile-edit-section profile-edit-full">
                <h3>Conta e autenticação</h3>
                <p>Esses dados são mantidos pelo Clerk.</p>
                <div className="profile-edit-account-data">
                  <span><strong>E-mail:</strong> {clerkEmail || "Não informado"}</span>
                  <span><strong>ID:</strong> {clerkUserId}</span>
                </div>
                {!isPessoaJuridica && <GenericTextField
                  label="Nome completo" value={form.accountName}
                  onChange={(value) => updateField("accountName", value)}
                />}
              </section>

              {isPessoaJuridica ? (
                <>
                  <GenericTextField
                    label="Nome da organização"
                    value={form.organizationName}
                    onChange={(value) => updateField("organizationName", value)}
                    placeholder="Nome público da organização"
                  />
                  <GenericTextField
                    label="CNPJ"
                    value={form.cnpj}
                    onChange={(value) => updateField("cnpj", value)}
                    placeholder="00.000.000/0000-00"
                  />

                </>
              ) : (
                <>
                  <SingleSelect
                    label="Tipo de perfil"
                    value={form.perfilUsuario}
                    onChange={(value) => updateField("perfilUsuario", value)}
                    options={profileOptions}
                  />
                  <SingleSelect
                    label="Gênero"
                    value={form.genero}
                    onChange={(value) => updateField("genero", value)}
                    options={GENDER_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                  />
                  <DataPicker
                    label="Data de nascimento"
                    value={form.dataNascimento}
                    onChange={(value) => updateField("dataNascimento", value)}
                  />
                </>
              )}

              {profileError && (
                <p className="profile-edit-error profile-edit-full" role="alert">
                  {profileError}
                </p>
              )}
              <div className="profile-edit-actions profile-edit-full">
                <button type="button" onClick={() => setEditing(false)}>
                  Cancelar
                </button>

                <button type="submit">
                  <Check size={17} />
                  Salvar alterações
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {changingProfile && isOwnProfile && (
        <div
          className="profile-edit-overlay"
          onMouseDown={() => setChangingProfile(false)}
        >
          <section
            className="profile-edit-modal profile-switch-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="switch-profile-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>CONFIGURAÇÃO DE PERFIL</span>

                <h2 id="switch-profile-title">Trocar perfil</h2>

                <p>
                  Você está trocando de {perfilUsuarioLabel.toLowerCase()} para{" "}
                  {user.perfilUsuario === "PF" ? "beneficiário" : "ofertante"}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setChangingProfile(false)}
                aria-label="Fechar"
              >
                <X />
              </button>
            </header>

            <div className="profile-switch-content">
              <p>Seus dados e sua conta continuarão salvos.</p>

              <ul>
                <li>Seus dados pessoais não serão apagados.</li>
                <li>Suas avaliações continuarão vinculadas à conta.</li>
                <li>Você poderá trocar de perfil novamente depois.</li>
              </ul>

              {profileError && (
                <p className="profile-switch-error" role="alert">
                  {profileError}
                </p>
              )}
            </div>

            <div className="profile-edit-actions profile-edit-full">
              <button
                type="button"
                onClick={() => setChangingProfile(false)}
                disabled={isSwitchingProfile}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={switchProfile}
                disabled={isSwitchingProfile}
              >
                <Check size={17} />
                {isSwitchingProfile ? "Trocando..." : "Confirmar troca"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
